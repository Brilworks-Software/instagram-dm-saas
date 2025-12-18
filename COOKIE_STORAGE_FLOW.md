# Instagram Cookie Storage & Verification Flow

## Overview
This document explains how Instagram cookies are extracted, verified, stored, and retrieved in the BulkDM application.

## Current Flow

### 1. **Extension Cookie Extraction** (`extension/popup.js`)

**Location**: Lines 114-131

**Process**:
- Extension uses `chrome.cookies.getAll({ domain: 'instagram.com' })` to extract all Instagram cookies
- Extracts these specific cookies:
  - `sessionid` → `sessionId`
  - `csrftoken` → `csrfToken`
  - `ds_user_id` → `dsUserId`
  - `mid` → `mid`
  - `ig_did` → `igDid`
  - `rur` → `rur`

**Code**:
```javascript
async function getInstagramCookies() {
  const cookies = await chrome.cookies.getAll({ domain: 'instagram.com' });
  const cookieMap = {};
  cookies.forEach(cookie => {
    cookieMap[cookie.name] = cookie.value;
  });
  return {
    sessionId: cookieMap['sessionid'] || '',
    csrfToken: cookieMap['csrftoken'] || '',
    dsUserId: cookieMap['ds_user_id'] || '',
    mid: cookieMap['mid'] || '',
    igDid: cookieMap['ig_did'] || '',
    rur: cookieMap['rur'] || ''
  };
}
```

### 2. **Cookie Verification** (`/api/instagram/cookie/verify`)

**Location**: `src/app/api/instagram/cookie/verify/route.ts`

**Process**:
1. Extension sends cookies to `/api/instagram/cookie/verify`
2. Backend validates cookies have `sessionId` and `dsUserId`
3. Backend creates Instagram client using `instagramCookieService.verifySession(cookies)`
4. Instagram client calls `ig.account.currentUser()` to verify session is valid
5. Returns user info (pk, username, fullName, profilePicUrl, etc.)

**Verification Method** (`src/lib/backend/instagram/cookie-service.ts:95-111`):
```typescript
async verifySession(cookies: InstagramCookies): Promise<InstagramUserInfo> {
  const ig = await this.createClientFromCookies(cookies);
  const currentUser = await ig.account.currentUser();
  return {
    pk: currentUser.pk.toString(),
    username: currentUser.username,
    fullName: currentUser.full_name || currentUser.username,
    profilePicUrl: currentUser.profile_pic_url,
    // ... more fields
  };
}
```

### 3. **Cookie Storage** (`/api/instagram/cookie/connect`)

**Location**: `src/app/api/instagram/cookie/connect/route.ts`

**Current Process**:
1. Extension calls `/api/instagram/cookie/connect` with cookies
2. Backend verifies session (same as step 2)
3. **ISSUE**: Uses default workspace ID `'11111111-1111-1111-1111-111111111111'` instead of user's workspace
4. Encrypts cookies using AES-256-CBC encryption
5. Saves to database in `instagram_accounts` table:
   - `accessToken` field: Encrypted cookies (AES-256-CBC)
   - `cookies` field: Raw cookies as JSONB

**Storage Method** (`src/lib/backend/instagram/cookie-service.ts:137-177`):
```typescript
async saveAccountWithCookies(
  workspaceId: string,
  cookies: InstagramCookies,
  userInfo: InstagramUserInfo
): Promise<{ id: string; igUsername: string }> {
  const encryptedCookies = this.encryptCookies(cookies);
  
  const account = await prisma.instagramAccount.upsert({
    where: {
      igUserId_workspaceId: {
        igUserId: userInfo.pk,
        workspaceId,
      },
    },
    update: {
      igUsername: userInfo.username,
      accessToken: encryptedCookies,  // Encrypted
      cookies: cookies as any,       // Raw JSONB
      // ... other fields
    },
    create: {
      workspaceId,
      igUserId: userInfo.pk,
      accessToken: encryptedCookies,
      cookies: cookies as any,
      // ... other fields
    },
  });
}
```

**Encryption Method** (`src/lib/backend/instagram/cookie-service.ts:116-132`):
```typescript
private encryptCookies(cookies: InstagramCookies): string {
  try {
    const key = getEncryptionKey(); // From ENCRYPTION_KEY env var
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
    
    let encrypted = cipher.update(JSON.stringify(cookies), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted; // Format: "iv:encrypted"
  } catch (error) {
    // Fallback to base64 if encryption fails
    return Buffer.from(JSON.stringify(cookies)).toString('base64');
  }
}
```

### 4. **Frontend Cookie Storage** (`settings/instagram/page.tsx`)

**Location**: `src/app/(dashboard)/settings/instagram/page.tsx:178-314`

**Process**:
1. Extension redirects to `/settings/instagram?connected={base64_account_data}`
2. Frontend decodes account data from URL
3. Gets user's workspace ID using `getOrCreateUserWorkspaceId()`
4. Saves account to Supabase with correct workspace ID
5. **Also saves cookies to localStorage**: `bulkdm_cookies_{igUserId}`

**Code**:
```typescript
// Save cookies to localStorage for quick DM sending
localStorage.setItem(`bulkdm_cookies_${accountData.pk}`, JSON.stringify(accountData.cookies));

// Save account to Supabase
await supabase.from('instagram_accounts').upsert({
  workspace_id: workspaceId,  // ✅ Correct workspace ID
  ig_user_id: String(accountData.pk),
  cookies: accountData.cookies, // Raw cookies in JSONB column
  // ... other fields
});
```

### 5. **Cookie Retrieval**

**Multiple Storage Locations**:
1. **Database `cookies` column (JSONB)**: Raw cookies stored as JSON
2. **Database `accessToken` column**: Encrypted cookies (AES-256-CBC)
3. **localStorage**: `bulkdm_cookies_{igUserId}` - Raw cookies as JSON string

**Retrieval Methods**:

**A. From Supabase (Frontend)**:
```typescript
// In settings/instagram/page.tsx:137-157
const { data } = await supabase
  .from('instagram_accounts')
  .select('*');

for (const acc of data || []) {
  if (acc.cookies && typeof acc.cookies === 'object') {
    // Restore cookies to localStorage
    localStorage.setItem(
      `bulkdm_cookies_${acc.ig_user_id}`,
      JSON.stringify(acc.cookies)
    );
  }
}
```

**B. From Database (Backend)**:
```typescript
// In campaign-service.ts:233-250
const account = await prisma.instagramAccount.findUnique({
  where: { id: accountId },
});

// ❌ ISSUE: decryptCookies method doesn't exist!
const decryptedCookies = instagramCookieService.decryptCookies(account.accessToken);
```

## Issues Identified

### 🔴 Issue 1: Missing `decryptCookies` Method
**Location**: `src/lib/backend/instagram/cookie-service.ts`

**Problem**: 
- `campaign-service.ts` calls `instagramCookieService.decryptCookies()` but the method doesn't exist
- Cookies are encrypted but cannot be decrypted for use

**Impact**: Campaign service cannot retrieve cookies from database

### 🔴 Issue 2: Wrong Workspace ID in `/connect` Route
**Location**: `src/app/api/instagram/cookie/connect/route.ts:27`

**Problem**:
- Uses hardcoded default workspace: `'11111111-1111-1111-1111-111111111111'`
- Extension doesn't send workspace ID
- Cookies saved to wrong workspace (or workspace that doesn't exist)

**Impact**: Cookies not saved to user's actual workspace in database

### 🟡 Issue 3: Dual Storage System
**Problem**:
- Cookies stored in 3 places: database `cookies` column, `accessToken` (encrypted), and localStorage
- No clear single source of truth
- Frontend relies on localStorage, backend relies on database

**Impact**: Potential sync issues between storage locations

### 🟡 Issue 4: No Cookie Validation on Retrieval
**Problem**:
- No check if cookies are expired or invalid when retrieved
- Could lead to errors when trying to use expired cookies

**Impact**: Runtime errors when using expired cookies

## Recommendations

### 1. Add `decryptCookies` Method
```typescript
decryptCookies(encrypted: string): InstagramCookies {
  try {
    // Check if it's encrypted format (iv:encrypted) or base64
    if (encrypted.includes(':')) {
      const [ivHex, encryptedHex] = encrypted.split(':');
      const key = getEncryptionKey();
      const algorithm = 'aes-256-cbc';
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } else {
      // Fallback: base64 decode
      return JSON.parse(Buffer.from(encrypted, 'base64').toString('utf8'));
    }
  } catch (error) {
    throw new Error(`Failed to decrypt cookies: ${error.message}`);
  }
}
```

### 2. Fix Workspace ID in `/connect` Route
- Try to get workspace from authenticated user
- If not authenticated, don't save to database (let frontend handle it)
- Return workspace ID in response so frontend knows which one to use

### 3. Consolidate Cookie Storage
- Use database `cookies` column as primary storage
- Use `accessToken` for encrypted backup
- localStorage as cache only (not primary storage)

### 4. Add Cookie Validation
- Check cookie expiration before use
- Verify session is still valid
- Refresh cookies if expired

## Current Cookie Usage

### Where Cookies Are Used:
1. **DM Sending** (`/api/instagram/cookie/send-dm`): Uses cookies from request body
2. **Campaign Processing** (`campaign-service.ts`): Needs to retrieve cookies from database
3. **Frontend DM Sending**: Uses cookies from localStorage

### Cookie Format:
```typescript
interface InstagramCookies {
  sessionId: string;    // Required
  csrfToken: string;    // Required
  dsUserId: string;     // Required
  mid?: string;
  igDid?: string;
  rur?: string;
}
```


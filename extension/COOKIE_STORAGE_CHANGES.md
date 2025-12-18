# Cookie Storage Changes - localStorage Only

## Overview
Cookies are now stored **ONLY in localStorage** and are **NOT saved to Supabase or any database**.

## Changes Made

### 1. Extension (`popup.js`)
- ✅ **Removed** `/api/instagram/cookie/connect` API call (which saved cookies to database)
- ✅ Cookies are now **only verified** via `/api/instagram/cookie/verify`
- ✅ After verification, cookies are passed to frontend via URL parameter
- ✅ Frontend saves cookies to localStorage only

### 2. Frontend (`settings/instagram/page.tsx`)
- ✅ **Removed** saving cookies to Supabase `cookies` column
- ✅ Cookies are saved **only to localStorage** with key: `bulkdm_cookies_{igUserId}`
- ✅ Account metadata (username, profile pic, etc.) is still saved to Supabase (without cookies)
- ✅ Cookie validation now checks **only localStorage** (not Supabase)

## Cookie Storage Location

**localStorage Key Format**: `bulkdm_cookies_{igUserId}`

**Example**: `bulkdm_cookies_123456789`

**Storage Format**: JSON string of cookie object
```json
{
  "sessionId": "...",
  "csrfToken": "...",
  "dsUserId": "...",
  "mid": "...",
  "igDid": "...",
  "rur": "..."
}
```

## Flow

1. **Extension extracts cookies** from Instagram
2. **Extension verifies cookies** via `/api/instagram/cookie/verify`
3. **Extension passes cookies** to frontend via URL parameter
4. **Frontend saves cookies** to localStorage only
5. **Frontend saves account metadata** to Supabase (without cookies)
6. **Frontend reads cookies** from localStorage when needed

## Benefits

- ✅ **Privacy**: Cookies never leave the user's browser
- ✅ **Security**: No cookies stored in database
- ✅ **Simplicity**: Single source of truth (localStorage)
- ✅ **Performance**: Faster access (no database queries)

## Migration Notes

- Existing cookies in Supabase will not be migrated automatically
- Users will need to reconnect their accounts to store cookies in localStorage
- The extension will work seamlessly with the new localStorage-only approach

## Version

- Extension version updated to `1.0.2`
- Manifest version: `1.0.2`


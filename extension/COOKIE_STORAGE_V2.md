# Cookie Storage v2 - localStorage with User ID Only

## Overview
Cookies are now stored **ONLY in localStorage** using Instagram user ID as the key. Only the user ID is passed via URL (not cookies), and the extension directly saves cookies to the page's localStorage.

## Key Changes

### 1. **Extension (`popup.js`)**
- ✅ Saves cookies to `chrome.storage.local` with key: `bulkdm_cookies_{igUserId}`
- ✅ Passes **ONLY Instagram user ID** in URL parameter (no cookies in URL)
- ✅ Injects script into page to save cookies directly to page's localStorage
- ✅ No cookies sent via URL - much more secure

### 2. **Frontend (`settings/instagram/page.tsx`)**
- ✅ Reads Instagram user ID from URL parameter: `?ig_user_id={userId}`
- ✅ Fetches cookies from localStorage using key: `bulkdm_cookies_{igUserId}`
- ✅ Saves account metadata (username, profile pic, etc.) to Supabase
- ✅ Stores Instagram user ID in database (not cookies)
- ✅ On page load, checks database for accounts and validates cookies in localStorage

## localStorage Structure

**Key Format**: `bulkdm_cookies_{igUserId}`

**Example**: `bulkdm_cookies_123456789`

**Value Format**: JSON string of cookie object
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
3. **Extension saves cookies** to `chrome.storage.local` with key `bulkdm_cookies_{igUserId}`
4. **Extension opens page** with URL: `/settings/instagram?ig_user_id={userId}&account={metadata}`
5. **Extension injects script** into page to transfer cookies from `chrome.storage.local` to page's `localStorage`
6. **Frontend reads user ID** from URL parameter
7. **Frontend reads cookies** from localStorage using key `bulkdm_cookies_{igUserId}`
8. **Frontend saves account metadata** to Supabase (with `ig_user_id`, but no cookies)
9. **On page reload**, frontend fetches accounts from database and checks localStorage for cookies

## Benefits

- ✅ **Security**: No cookies in URL (only user ID)
- ✅ **Privacy**: Cookies never leave browser localStorage
- ✅ **Performance**: Fast access from localStorage
- ✅ **Simplicity**: Single source of truth (localStorage)
- ✅ **Clean URLs**: Only user ID in URL, not sensitive data

## Database Storage

**What's stored in Supabase:**
- ✅ Instagram user ID (`ig_user_id`)
- ✅ Username (`ig_username`)
- ✅ Profile picture URL
- ✅ Account metadata
- ❌ **NO cookies** (cookies are in localStorage only)

## Version

- Extension version: `1.0.3`
- Manifest version: `1.0.3`

## Migration

- Existing cookies in Supabase will not be migrated
- Users need to reconnect accounts to use new localStorage approach
- Legacy URL format (`?connected={data}`) is still supported for backward compatibility


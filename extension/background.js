// BulkDM Background Service Worker
// Handles cookie access and communication

// Production URLs
const PRODUCTION_BACKEND_URL = 'https://bulkdm-saas.netlify.app'; // Update this when backend is deployed
const DEV_BACKEND_URL = 'http://localhost:3001';

// Get backend URL from storage or use smart default
let BACKEND_URL = PRODUCTION_BACKEND_URL;

// Load config from storage on startup
chrome.storage.sync.get(['backendUrl', 'useProduction'], (result) => {
  if (result.backendUrl) {
    BACKEND_URL = result.backendUrl;
  } else if (result.useProduction === false) {
    // Use localhost if explicitly set to false
    BACKEND_URL = DEV_BACKEND_URL;
  }
});

// Listen for config updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.backendUrl) {
    BACKEND_URL = changes.backendUrl.newValue;
  }
  if (changes.useProduction !== undefined) {
    if (changes.useProduction.newValue === false) {
      BACKEND_URL = DEV_BACKEND_URL;
    } else {
      BACKEND_URL = PRODUCTION_BACKEND_URL;
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COOKIES') {
    getInstagramCookies().then(sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'VERIFY_SESSION') {
    verifySession(message.cookies).then(sendResponse);
    return true;
  }
});

// Get all Instagram cookies
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

// Verify session with backend
async function verifySession(cookies) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies })
    });
    return response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Extension installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('BulkDM Instagram Session Grabber installed');
});


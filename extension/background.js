// BulkDM Background Service Worker
// Handles cookie access and communication

// Import config (inline for service worker compatibility)
importScripts('config.js');

// Load configuration
let BACKEND_URL = '';

// Initialize configuration
async function initConfig() {
  const env = await CONFIG.getCurrent();
  BACKEND_URL = env.BACKEND_URL;
  console.log('BulkDM Background initialized:', { mode: env.mode, backend: BACKEND_URL });
}

// Initialize on startup
initConfig();

// Listen for config updates
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.envMode || changes.appUrl || changes.backendUrl) {
    await initConfig();
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
  
  if (message.type === 'GET_BACKEND_URL') {
    sendResponse({ url: BACKEND_URL });
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
    // Ensure config is loaded
    if (!BACKEND_URL) {
      await initConfig();
    }
    
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
  initConfig();
});

// DMflow Background Service Worker
// Handles cookie access and communication

const BACKEND_URL = 'http://localhost:3001';

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
  console.log('DMflow Instagram Session Grabber installed');
});


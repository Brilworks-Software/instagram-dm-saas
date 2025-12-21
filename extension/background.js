// Socialora Background Service Worker

// Relay messages from popup to content scripts if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward SAVE_COOKIES messages from popup to content script
  if (message.type === 'FORWARD_SAVE_COOKIES' && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'SAVE_COOKIES',
      userId: message.userId,
      cookies: message.cookies
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Background: Failed to forward message:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response);
      }
    });
    return true; // Keep channel open
  }
  return false;
});
// Handles cookie access and communication

// Import config
importScripts('config.js');

// Helper function to build API URL safely (removes trailing slashes)
function buildApiUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COOKIES') {
    getInstagramCookies().then(sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'VERIFY_SESSION') {
    verifySession(message.cookies).then(sendResponse);
    return true;
  }
  
  // Handle request for cookies from page (fallback mechanism)
  if (message.type === 'GET_STORED_COOKIES') {
    const userId = message.userId;
    const storageKey = `socialora_cookies_${userId}`;
    chrome.storage.local.get([storageKey], (result) => {
      sendResponse({ success: true, cookies: result[storageKey] || null });
    });
    return true;
  }
  
  // Content script ready signal
  if (message.type === 'CONTENT_SCRIPT_READY' && sender.tab) {
    console.log('Background: Content script ready for tab', sender.tab.id);
    // Store ready state (could be used by popup if needed)
    sendResponse({ success: true });
    return false;
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
    // Get current backend URL from config
    const config = await CONFIG.getCurrent();
    const url = buildApiUrl(config.BACKEND_URL, 'api/instagram/cookie/verify');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies })
    });
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    if (!isJson) {
      // Server returned HTML (likely an error page)
      const text = await response.text();
      console.error('Server returned non-JSON response:', text.substring(0, 200));
      return {
        success: false,
        error: `Server error (${response.status}). The backend may be experiencing issues.`
      };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Server error: ${response.status}`
      };
    }
    
    return data;
  } catch (error) {
    console.error('Verify session error:', error);
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Server returned invalid response. The backend may be down or experiencing issues.'
      };
    }
    
    return { success: false, error: error.message || 'Failed to connect to backend' };
  }
}

// Extension installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Socialora Instagram Session Grabber installed');
});


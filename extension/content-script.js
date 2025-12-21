// Content script to receive cookies from extension and save to localStorage
// This runs in the page context and can access localStorage directly

console.log('Socialora content script loaded');

// Signal that content script is ready (send to background, which can notify popup)
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY', tabId: null }, (response) => {
  if (chrome.runtime.lastError) {
    // Ignore errors - background might not be listening
  } else {
    console.log('Content script ready signal sent');
  }
});

// Listen for messages from page (window.postMessage)
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.origin !== window.location.origin) {
    return;
  }
  
  // Handle cookie request from page
  if (event.data && event.data.type === 'SOCIALORA_REQUEST_COOKIES') {
    const { userId, storageKey } = event.data;
    console.log('Content script: Received cookie request from page:', { userId, storageKey });
    
    // Get cookies from chrome.storage.local
    const key = storageKey || `socialora_cookies_${userId}`;
    chrome.storage.local.get([key], (result) => {
      const cookies = result[key];
      if (cookies) {
        console.log('Content script: Found cookies in chrome.storage.local, sending to page');
        // Save to localStorage
        try {
          const cookiesJson = JSON.stringify(cookies);
          localStorage.setItem(key, cookiesJson);
          sessionStorage.setItem(key, cookiesJson);
          
          // Send response to page
          window.postMessage({
            type: 'SOCIALORA_COOKIES_RESPONSE',
            userId: userId,
            cookies: cookies,
            storageKey: key
          }, window.location.origin);
          
          // Also dispatch event
          window.dispatchEvent(new CustomEvent('socialora_cookies_saved', {
            detail: { userId, storageKey: key, cookies }
          }));
          
          console.log('✓ Cookies transferred from chrome.storage.local to localStorage');
        } catch (e) {
          console.error('Failed to transfer cookies:', e);
        }
      } else {
        console.warn('Content script: Cookies not found in chrome.storage.local for key:', key);
      }
    });
  }
});

// Listen for messages from extension (background/popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message.type);
  
  if (message.type === 'SAVE_COOKIES') {
    const { userId, cookies } = message;
    const storageKey = `socialora_cookies_${userId}`;
    
    console.log('Saving cookies for userId:', userId);
    console.log('Storage key:', storageKey);
    console.log('Cookies structure:', cookies ? Object.keys(cookies) : 'null');
    
    try {
      // Save to localStorage
      const cookiesJson = JSON.stringify(cookies);
      localStorage.setItem(storageKey, cookiesJson);
      console.log(`✓ Cookies saved to localStorage via content script (key: ${storageKey})`);
      console.log('Cookies JSON length:', cookiesJson.length);
      
      // Verify it was saved
      const verify = localStorage.getItem(storageKey);
      if (verify) {
        console.log('✓ Verified: Cookies are in localStorage');
        console.log('Verification length:', verify.length);
      } else {
        console.error('✗ ERROR: Cookies not found after saving!');
      }
      
      // Also save to sessionStorage as backup
      try {
        sessionStorage.setItem(storageKey, cookiesJson);
        console.log('✓ Cookies also saved to sessionStorage');
      } catch (sessionErr) {
        console.warn('Failed to save to sessionStorage:', sessionErr);
      }
      
      // Trigger events to notify the page
      try {
        window.dispatchEvent(new CustomEvent('socialora_cookies_saved', { 
          detail: { userId, storageKey, cookies } 
        }));
        console.log('✓ Custom event dispatched');
      } catch (eventErr) {
        console.warn('Failed to dispatch custom event:', eventErr);
      }
      
      try {
        window.postMessage({
          type: 'SOCIALORA_COOKIES_SAVED',
          userId: userId,
          cookies: cookies,
          storageKey: storageKey
        }, window.location.origin);
        console.log('✓ PostMessage sent');
      } catch (postErr) {
        console.warn('Failed to send postMessage:', postErr);
      }
      
      // Also trigger a storage event manually (for cross-tab communication)
      try {
        // Create a storage event manually
        const storageEvent = new Event('storage');
        Object.defineProperty(storageEvent, 'key', { value: storageKey });
        Object.defineProperty(storageEvent, 'newValue', { value: cookiesJson });
        Object.defineProperty(storageEvent, 'storageArea', { value: localStorage });
        window.dispatchEvent(storageEvent);
        console.log('✓ Storage event dispatched');
      } catch (storageErr) {
        console.warn('Failed to dispatch storage event:', storageErr);
      }
      
      sendResponse({ success: true, storageKey: storageKey });
      return true; // Keep channel open for async response
    } catch (e) {
      console.error('Failed to save cookies via content script:', e);
      console.error('Error details:', e.message, e.stack);
      sendResponse({ success: false, error: e.message });
      return true;
    }
  }
  
  return false;
});

// Log when content script is ready
console.log('Content script message listener registered');

// Also listen for page load to check if we need to inject cookies
window.addEventListener('load', () => {
  console.log('Page loaded, content script ready');
  
  // Check if page is requesting cookies (from URL params)
  const urlParams = new URLSearchParams(window.location.search);
  const igUserId = urlParams.get('ig_user_id');
  if (igUserId) {
    console.log('Page loaded with ig_user_id, checking for cookies in chrome.storage.local');
    const storageKey = `socialora_cookies_${igUserId}`;
    chrome.storage.local.get([storageKey], (result) => {
      const cookies = result[storageKey];
      if (cookies) {
        console.log('Found cookies in chrome.storage.local, transferring to localStorage');
        try {
          const cookiesJson = JSON.stringify(cookies);
          localStorage.setItem(storageKey, cookiesJson);
          sessionStorage.setItem(storageKey, cookiesJson);
          
          // Notify page
          window.postMessage({
            type: 'SOCIALORA_COOKIES_SAVED',
            userId: igUserId,
            cookies: cookies,
            storageKey: storageKey
          }, window.location.origin);
          
          window.dispatchEvent(new CustomEvent('socialora_cookies_saved', {
            detail: { userId: igUserId, storageKey, cookies }
          }));
          
          console.log('✓ Cookies auto-transferred on page load');
        } catch (e) {
          console.error('Failed to transfer cookies on page load:', e);
        }
      }
    });
  }
});


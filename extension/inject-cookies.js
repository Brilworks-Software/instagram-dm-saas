// This script is injected into the page to save cookies
// It's loaded as a file to avoid CSP eval() restrictions

(function() {
  // Get data from window object (set by extension)
  const data = window.__SOCIALORA_COOKIE_DATA__;
  if (!data) {
    console.error('No cookie data found in window.__SOCIALORA_COOKIE_DATA__');
    return;
  }
  
  const { userId, cookies } = data;
  const storageKey = `socialora_cookies_${userId}`;
  
  try {
    // Save to localStorage
    const cookiesJson = JSON.stringify(cookies);
    localStorage.setItem(storageKey, cookiesJson);
    console.log(`✓ Cookies saved to page localStorage via injected script (key: ${storageKey})`);
    
    // Also save to sessionStorage as backup
    sessionStorage.setItem(storageKey, cookiesJson);
    
    // Trigger multiple events to ensure page catches it
    window.dispatchEvent(new CustomEvent('socialora_cookies_saved', { 
      detail: { userId, storageKey, cookies } 
    }));
    
    window.postMessage({
      type: 'SOCIALORA_COOKIES_SAVED',
      userId: userId,
      cookies: cookies,
      storageKey: storageKey
    }, window.location.origin);
    
    // Double-check it was saved
    const verify = localStorage.getItem(storageKey);
    if (verify) {
      console.log('✓ Verified: Cookies are in localStorage');
    } else {
      console.error('✗ Warning: Cookies not found after saving!');
    }
    
    // Clean up
    delete window.__SOCIALORA_COOKIE_DATA__;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
})();


// Socialora Instagram Session Grabber
// This extension extracts Instagram cookies and sends them to Socialora

// Config is loaded via script tag in popup.html
// CONFIG is available globally from config.js

// Load config on startup and update indicator
CONFIG.getCurrent().then((config) => {
  updateEnvIndicator(config.isProduction, config.APP_URL);
});

// Auto-detect environment if in auto mode
chrome.storage.sync.get(['envMode'], (result) => {
  const envMode = result.envMode || CONFIG.ENV_MODE;
  if (envMode === 'auto') {
    detectEnvironment();
  }
});

// Auto-detect environment (production vs localhost)
async function detectEnvironment() {
  try {
    // Try to fetch from production
    const prodConfig = CONFIG.PRODUCTION;
    const response = await fetch(`${prodConfig.APP_URL}/api/instagram/cookie/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies: { sessionId: 'test' } }),
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    // If we can reach production, use it
    CONFIG.setMode('production');
    updateEnvIndicator(true, prodConfig.APP_URL);
  } catch (error) {
    // Production not available, try localhost
    try {
      const localConfig = CONFIG.LOCAL;
      const localResponse = await fetch(`${localConfig.APP_URL}/api/instagram/cookie/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: { sessionId: 'test' } }),
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      CONFIG.setMode('local');
      updateEnvIndicator(false, localConfig.APP_URL);
    } catch (localError) {
      // Neither available, default to production
      const prodConfig = CONFIG.PRODUCTION;
      updateEnvIndicator(true, prodConfig.APP_URL);
    }
  }
}

// Update environment indicator
function updateEnvIndicator(isProduction, url) {
  if (envText) {
    if (isProduction) {
      envText.textContent = `🌐 Connected to: ${url}`;
      envText.style.color = '#22c55e';
    } else {
      envText.textContent = `💻 Connected to: ${url} (Local)`;
      envText.style.color = '#eab308';
    }
  }
}

// Listen for config updates
chrome.storage.onChanged.addListener(() => {
  CONFIG.getCurrent().then((config) => {
    updateEnvIndicator(config.isProduction, config.APP_URL);
  });
});

// DOM Elements
const grabBtn = document.getElementById('grab-btn');
const openInstagramBtn = document.getElementById('open-instagram-btn');
const openAppBtn = document.getElementById('open-app-btn');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userFullname = document.getElementById('user-fullname');
const userUsername = document.getElementById('user-username');
const instructions = document.getElementById('instructions');

const statusNotInstagram = document.getElementById('status-not-instagram');
const statusNotLoggedIn = document.getElementById('status-not-logged-in');
const statusSuccess = document.getElementById('status-success');
const statusError = document.getElementById('status-error');
const statusConnecting = document.getElementById('status-connecting');
const errorMessage = document.getElementById('error-message');
const envIndicator = document.getElementById('env-indicator');
const envText = document.getElementById('env-text');

// Consent dialog elements
const consentDialog = document.getElementById('consent-dialog');
const consentAccept = document.getElementById('consent-accept');
const consentDecline = document.getElementById('consent-decline');

// Hide all status messages
function hideAllStatus() {
  statusNotInstagram.classList.add('hidden');
  statusNotLoggedIn.classList.add('hidden');
  statusSuccess.classList.add('hidden');
  statusError.classList.add('hidden');
  statusConnecting.classList.add('hidden');
}

// Show a specific status
function showStatus(element) {
  hideAllStatus();
  element.classList.remove('hidden');
}

// Check if current tab is Instagram
async function checkCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url?.includes('instagram.com');
}

// Get Instagram cookies
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

// Helper function to build API URL safely (removes trailing slashes)
function buildApiUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

// Verify session with backend
async function verifySession(cookies) {
  // Get current backend URL from config
  const config = await CONFIG.getCurrent();
  const url = buildApiUrl(config.BACKEND_URL, 'api/instagram/cookie/verify');
  
  console.log('Verifying session with backend:', url);
  console.log('Backend URL from config:', config.BACKEND_URL);
  console.log('Environment mode:', config.mode || 'unknown');
  
  try {
    let response;
    let responseText;
    
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
    } catch (fetchError) {
      // Network error or timeout
      console.error('Fetch error:', fetchError);
      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        return {
          success: false,
          message: 'Request timed out. The backend may be slow or unreachable. Please try again.'
        };
      }
      if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'Cannot connect to backend. Make sure the server is running and accessible.'
        };
      }
      return {
        success: false,
        message: `Network error: ${fetchError.message || 'Failed to connect'}`
      };
    }
    
    // Get response text first (before checking content-type)
    try {
      responseText = await response.text();
    } catch (textError) {
      console.error('Failed to read response text:', textError);
      return {
        success: false,
        message: `Server error (${response.status}). Failed to read response.`
      };
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    if (!isJson) {
      // Server returned HTML (likely an error page)
      console.error('Server returned non-JSON response:', responseText.substring(0, 300));
      console.error('Response status:', response.status);
      console.error('Content-Type:', contentType);
      
      // Try to extract error message from HTML if possible
      let errorMsg = `Server error (${response.status})`;
      if (responseText.includes('500') || responseText.includes('Internal Server Error')) {
        errorMsg = 'Server internal error. The backend may be experiencing issues.';
      } else if (responseText.includes('404')) {
        errorMsg = 'API endpoint not found. Please check the backend URL configuration.';
      } else if (responseText.includes('503') || responseText.includes('Service Unavailable')) {
        errorMsg = 'Service unavailable. The backend may be down for maintenance.';
      }
      
      return {
        success: false,
        message: errorMsg
      };
    }
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText.substring(0, 300));
      return {
        success: false,
        message: 'Server returned invalid JSON. The backend may be experiencing issues.'
      };
    }
    
    // Handle error responses
    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Server error: ${response.status}`
      };
    }
    
    return data;
  } catch (error) {
    console.error('Verify session error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return {
        success: false,
        message: 'Server returned invalid response format. The backend may be experiencing issues.'
      };
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Cannot connect to backend. Check your internet connection and make sure the server is running.'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to verify session. Please try again.'
    };
  }
}

// Note: connectAccount function removed - cookies are now stored in localStorage only
// No database storage is performed. Cookies are verified and passed to frontend
// which saves them to localStorage.

// Check if user has given consent
async function hasConsent() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['socialora_consent'], (result) => {
      resolve(result.socialora_consent === true);
    });
  });
}

// Save consent
async function saveConsent() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ socialora_consent: true }, () => {
      resolve();
    });
  });
}

// Show consent dialog
function showConsentDialog() {
  return new Promise((resolve) => {
    consentDialog.style.display = 'flex';
    
    consentAccept.onclick = async () => {
      await saveConsent();
      consentDialog.style.display = 'none';
      resolve(true);
    };
    
    consentDecline.onclick = () => {
      consentDialog.style.display = 'none';
      resolve(false);
    };
  });
}

// Main grab session function
async function grabSession() {
  try {
    // Save consent when user clicks grab (they've already seen the privacy policy notice)
    await saveConsent();
    
    // Check if on Instagram
    const isInstagram = await checkCurrentTab();
    if (!isInstagram) {
      showStatus(statusNotInstagram);
      openInstagramBtn.classList.remove('hidden');
      grabBtn.disabled = false; // Keep button enabled so they can try again
      return;
    }

    // Get cookies
    showStatus(statusConnecting);
    grabBtn.disabled = true;
    instructions.classList.add('hidden');

    const cookies = await getInstagramCookies();

    // Check if logged in
    if (!cookies.sessionId || !cookies.dsUserId) {
      showStatus(statusNotLoggedIn);
      grabBtn.disabled = false; // Keep enabled
      instructions.classList.remove('hidden');
      return;
    }

    // Verify with backend
    let verifyResult;
    try {
      verifyResult = await verifySession(cookies);
      
      // If verification failed but returned a result (not an exception)
      if (!verifyResult.success) {
        showStatus(statusError);
        errorMessage.textContent = verifyResult.message || verifyResult.error || 'Session verification failed';
        grabBtn.disabled = false; // Keep enabled for retry
        instructions.classList.remove('hidden');
        return;
      }
    } catch (fetchError) {
      // This catch block handles exceptions (network errors, timeouts, etc.)
      console.error('Exception during verifySession:', fetchError);
      showStatus(statusError);
      const currentConfig = await CONFIG.getCurrent();
      
      // Try to switch to localhost if production fails
      if (currentConfig.isProduction) {
        console.log('Production backend failed, trying localhost...');
        CONFIG.setMode('local');
        const localConfig = await CONFIG.getCurrent();
        updateEnvIndicator(false, localConfig.APP_URL);
        
        // Retry with localhost
        try {
          verifyResult = await verifySession(cookies);
          
          // Check if retry was successful
          if (!verifyResult || !verifyResult.success) {
            errorMessage.textContent = verifyResult?.message || verifyResult?.error || `Cannot connect to backend. Tried both production (${CONFIG.PRODUCTION.BACKEND_URL}) and localhost (${CONFIG.LOCAL.BACKEND_URL}). Make sure backend is running.`;
            grabBtn.disabled = false;
            instructions.classList.remove('hidden');
            return;
          }
        } catch (localError) {
          console.error('Localhost retry also failed:', localError);
          errorMessage.textContent = `Cannot connect to backend. Tried both production (${CONFIG.PRODUCTION.BACKEND_URL}) and localhost (${CONFIG.LOCAL.BACKEND_URL}). Make sure backend is running.`;
          grabBtn.disabled = false; // Keep enabled for retry
          instructions.classList.remove('hidden');
          return;
        }
      } else {
        const config = await CONFIG.getCurrent();
        errorMessage.textContent = `Cannot connect to backend at ${config.BACKEND_URL}. Make sure it is running. Error: ${fetchError.message || 'Unknown error'}`;
        grabBtn.disabled = false; // Keep enabled for retry
        instructions.classList.remove('hidden');
        return;
      }
    }
    
    // Final check - make sure we have a successful result
    if (!verifyResult || !verifyResult.success) {
      showStatus(statusError);
      errorMessage.textContent = verifyResult?.message || verifyResult?.error || 'Session verification failed';
      grabBtn.disabled = false; // Keep enabled for retry
      instructions.classList.remove('hidden');
      return;
    }

    // Show user info
    const user = verifyResult.user;
    userInfo.classList.remove('hidden');
    userFullname.textContent = user.fullName || user.username;
    userUsername.textContent = `@${user.username}`;
    
    if (user.profilePicUrl) {
      userAvatar.innerHTML = `<img src="${user.profilePicUrl}" alt="${user.username}">`;
    } else {
      userAvatar.textContent = user.username.charAt(0).toUpperCase();
    }

    // Cookies verified successfully - save to localStorage and pass only user ID
    if (user) {
      showStatus(statusSuccess);
      openAppBtn.classList.remove('hidden');
      grabBtn.textContent = '✅ Connected!';
      grabBtn.disabled = true;
      
      // Save cookies to chrome.storage.local FIRST (backup storage)
      const storageKey = `socialora_cookies_${user.pk}`;
      await chrome.storage.local.set({ [storageKey]: cookies });
      console.log(`✓ Cookies saved to chrome.storage.local (key: ${storageKey})`);
      
        // Open Socialora app with ONLY Instagram user ID in URL
      // Frontend will read cookies from localStorage based on this ID
      setTimeout(async () => {
        const config = await CONFIG.getCurrent();
        const cleanAppUrl = config.APP_URL.replace(/\/+$/, '');
        // Pass only user ID and account metadata (no cookies in URL)
        const accountMetadata = {
          igUserId: user.pk,
          username: user.username,
          fullName: user.fullName,
          profilePicUrl: user.profilePicUrl,
        };
        const encodedMetadata = btoa(JSON.stringify(accountMetadata));
        const redirectUrl = `${cleanAppUrl}/settings/instagram?ig_user_id=${user.pk}&account=${encodedMetadata}`;
        console.log('Opening Socialora with user ID:', user.pk);
        console.log('Cookies stored in chrome.storage.local, will be transferred to page localStorage');
        
        // Create tab and send cookies via content script (more reliable)
        chrome.tabs.create({ url: redirectUrl }, (tab) => {
          console.log('Tab created, waiting for content script to be ready...');
          
          // Function to send cookies via content script message
          const sendCookiesToPage = (tabId, retryCount = 0) => {
            const maxRetries = 10;
            const retryDelay = 300;
            
            console.log(`Attempting to send cookies to tab ${tabId} (attempt ${retryCount + 1}/${maxRetries})`);
            console.log('User ID:', user.pk);
            console.log('Cookies keys:', Object.keys(cookies));
            
            // Try sending message to content script first (most reliable)
            chrome.tabs.sendMessage(tabId, {
              type: 'SAVE_COOKIES',
              userId: user.pk,
              cookies: cookies
            }, (response) => {
              if (chrome.runtime.lastError) {
                const errorMsg = chrome.runtime.lastError.message;
                console.warn(`Content script not ready (attempt ${retryCount + 1}):`, errorMsg);
                
                if (retryCount < maxRetries) {
                  // Retry after a delay
                  setTimeout(() => {
                    sendCookiesToPage(tabId, retryCount + 1);
                  }, retryDelay);
                } else {
                  console.warn('Max retries reached, trying script injection');
                  injectCookiesViaScript(tabId);
                }
              } else if (response && response.success) {
                console.log('✓ Cookies sent via content script successfully');
                console.log('Response:', response);
              } else {
                console.warn('Content script responded but failed, trying script injection');
                console.log('Response:', response);
                injectCookiesViaScript(tabId);
              }
            });
          };
          
          // Fallback: Inject script directly (avoids CSP by using func, not eval)
          const injectCookiesViaScript = (tabId) => {
            console.log('Attempting script injection for tab:', tabId);
            
            // Use func parameter (serialized, doesn't trigger CSP eval)
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: (userId, cookieData) => {
                const storageKey = 'socialora_cookies_' + userId;
                try {
                  // Save to localStorage
                  const cookiesJson = JSON.stringify(cookieData);
                  localStorage.setItem(storageKey, cookiesJson);
                  console.log('✓ Cookies saved via script injection (key: ' + storageKey + ')');
                  
                  // Also save to sessionStorage as backup
                  sessionStorage.setItem(storageKey, cookiesJson);
                  
                  // Trigger multiple events
                  window.dispatchEvent(new CustomEvent('socialora_cookies_saved', { 
                    detail: { userId: userId, storageKey: storageKey, cookies: cookieData } 
                  }));
                  
                  window.postMessage({
                    type: 'SOCIALORA_COOKIES_SAVED',
                    userId: userId,
                    cookies: cookieData,
                    storageKey: storageKey
                  }, window.location.origin);
                  
                  // Verify it was saved
                  const verify = localStorage.getItem(storageKey);
                  if (verify) {
                    console.log('✓ Verified: Cookies are in localStorage');
                  } else {
                    console.error('✗ ERROR: Cookies not found after saving!');
                  }
                  
                  return { success: true, storageKey: storageKey };
                } catch (e) {
                  console.error('Script injection failed:', e);
                  return { success: false, error: e.message };
                }
              },
              args: [user.pk, cookies]
            }).then((results) => {
              if (results && results[0] && results[0].result && results[0].result.success) {
                console.log('✓ Script injection successful');
                console.log('Result:', results[0].result);
              } else {
                console.warn('Script injection completed but result unclear:', results);
              }
            }).catch(err => {
              console.error('Script injection failed:', err);
              // Last resort: try with MAIN world
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                world: 'MAIN',
                func: (userId, cookieData) => {
                  const storageKey = 'socialora_cookies_' + userId;
                  localStorage.setItem(storageKey, JSON.stringify(cookieData));
                  sessionStorage.setItem(storageKey, JSON.stringify(cookieData));
                  window.postMessage({
                    type: 'SOCIALORA_COOKIES_SAVED',
                    userId: userId,
                    cookies: cookieData,
                    storageKey: storageKey
                  }, window.location.origin);
                },
                args: [user.pk, cookies]
              }).catch(finalErr => {
                console.error('All injection methods failed:', finalErr);
              });
            });
          };
          
          // Note: Content script ready signal goes through background
          // We'll rely on retries and tab status instead
          
          // Listen for tab updates
          let attempts = 0;
          const maxAttempts = 15;
          const listener = (tabId, changeInfo, tabInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              attempts++;
              // Wait longer for content script to initialize
              setTimeout(() => {
                sendCookiesToPage(tab.id);
              }, 1000 + (attempts * 300)); // Longer delay for retries
              
              if (attempts >= maxAttempts) {
                chrome.tabs.onUpdated.removeListener(listener);
              }
            }
          };
          
          chrome.tabs.onUpdated.addListener(listener);
          
          // Also try immediately if tab is already loaded
          chrome.tabs.get(tab.id, (tabInfo) => {
            if (tabInfo && tabInfo.status === 'complete') {
              setTimeout(() => {
                sendCookiesToPage(tab.id);
              }, 1500);
            }
          });
          
          // Clean up listeners after 30 seconds
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.runtime.onMessage.removeListener(messageListener);
          }, 30000);
        });
      }, 1500);
    } else {
      showStatus(statusError);
      errorMessage.textContent = 'Failed to verify session';
      grabBtn.disabled = false;
    }

  } catch (error) {
    console.error('Error:', error);
    showStatus(statusError);
    errorMessage.textContent = 'Network error. Make sure Socialora backend is running.';
    grabBtn.disabled = false; // Keep enabled for retry
    instructions.classList.remove('hidden');
  }
}

// Event listeners
grabBtn.addEventListener('click', grabSession);

openInstagramBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.instagram.com/' });
  window.close();
});

openAppBtn.addEventListener('click', async () => {
  const config = await CONFIG.getCurrent();
  const cleanAppUrl = config.APP_URL.replace(/\/+$/, '');
  chrome.tabs.create({ url: `${cleanAppUrl}/settings/instagram` });
  window.close();
});

// Check current tab on popup open
(async () => {
  const isInstagram = await checkCurrentTab();
  if (!isInstagram) {
    showStatus(statusNotInstagram);
    openInstagramBtn.classList.remove('hidden');
    grabBtn.disabled = false; // Keep enabled - user can still click to see instructions
  } else {
    // Check if already logged in
    const cookies = await getInstagramCookies();
    if (!cookies.sessionId) {
      showStatus(statusNotLoggedIn);
    }
    grabBtn.disabled = false; // Ensure button is enabled
  }
})();


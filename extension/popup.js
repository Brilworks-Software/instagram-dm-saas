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
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies })
    });
    
    const data = await response.json();
    
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
    return {
      success: false,
      message: error.message || 'Failed to connect to backend'
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
    } catch (fetchError) {
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
        } catch (localError) {
          errorMessage.textContent = `Cannot connect to backend. Tried both production (${CONFIG.PRODUCTION.BACKEND_URL}) and localhost (${CONFIG.LOCAL.BACKEND_URL}). Make sure backend is running.`;
          grabBtn.disabled = false; // Keep enabled for retry
          instructions.classList.remove('hidden');
          return;
        }
      } else {
        const config = await CONFIG.getCurrent();
        errorMessage.textContent = `Cannot connect to backend at ${config.BACKEND_URL}. Make sure it is running.`;
        grabBtn.disabled = false; // Keep enabled for retry
        instructions.classList.remove('hidden');
        return;
      }
    }
    
    if (!verifyResult.success) {
      showStatus(statusError);
      errorMessage.textContent = verifyResult.message || verifyResult.error || 'Session verification failed';
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
          const sendCookiesToPage = (tabId) => {
            // Try sending message to content script first (most reliable)
            chrome.tabs.sendMessage(tabId, {
              type: 'SAVE_COOKIES',
              userId: user.pk,
              cookies: cookies
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn('Content script not ready yet:', chrome.runtime.lastError.message);
                // Fallback to script injection
                injectCookiesViaScript(tabId);
              } else if (response && response.success) {
                console.log('✓ Cookies sent via content script successfully');
              } else {
                console.warn('Content script responded but failed, trying script injection');
                injectCookiesViaScript(tabId);
              }
            });
          };
          
          // Fallback: Inject script directly
          const injectCookiesViaScript = (tabId) => {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: (userId, cookieData, storageKeyFromExtension) => {
                const storageKey = `socialora_cookies_${userId}`;
                try {
                  // Save to localStorage
                  localStorage.setItem(storageKey, JSON.stringify(cookieData));
                  console.log(`✓ Cookies saved to page localStorage via script injection (key: ${storageKey})`);
                  
                  // Also save to sessionStorage as backup
                  sessionStorage.setItem(storageKey, JSON.stringify(cookieData));
                  
                  // Trigger multiple events to ensure page catches it
                  window.dispatchEvent(new CustomEvent('socialora_cookies_saved', { 
                    detail: { userId, storageKey, cookies: cookieData } 
                  }));
                  
                  // Also dispatch a storage event (for cross-tab communication)
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: storageKey,
                    newValue: JSON.stringify(cookieData),
                    storageArea: localStorage
                  }));
                  
                  window.postMessage({
                    type: 'SOCIALORA_COOKIES_SAVED',
                    userId: userId,
                    cookies: cookieData,
                    storageKey: storageKey
                  }, window.location.origin);
                  
                  // Double-check it was saved
                  const verify = localStorage.getItem(storageKey);
                  if (verify) {
                    console.log('✓ Verified: Cookies are in localStorage');
                  } else {
                    console.error('✗ Warning: Cookies not found after saving!');
                  }
                  
                  return true;
                } catch (e) {
                  console.error('Failed to save to localStorage:', e);
                  return false;
                }
              },
              args: [user.pk, cookies, storageKey]
            }).then(() => {
              console.log('✓ Script injection successful');
            }).catch(err => {
              console.error('Failed to inject script:', err);
            });
          };
          
          // Listen for tab updates
          let attempts = 0;
          const maxAttempts = 10;
          const listener = (tabId, changeInfo, tabInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              attempts++;
              // Wait a bit for content script to initialize
              setTimeout(() => {
                sendCookiesToPage(tab.id);
              }, 500 + (attempts * 200)); // Increasing delay for retries
              
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
              }, 1000);
            }
          });
          
          // Clean up listener after 30 seconds
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
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


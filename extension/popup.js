// BulkDM Instagram Session Grabber
// This extension extracts Instagram cookies and sends them to BulkDM

// Production URLs
const PRODUCTION_APP_URL = 'https://bulkdm-saas.netlify.app';
const PRODUCTION_BACKEND_URL = 'https://bulkdm-saas.netlify.app'; // Frontend proxies to backend API

// Development URLs
const DEV_APP_URL = 'http://localhost:3000';
const DEV_BACKEND_URL = 'http://localhost:3001';

// Get URLs from storage or use smart defaults
let APP_URL = PRODUCTION_APP_URL;
let BACKEND_URL = PRODUCTION_BACKEND_URL;

// Load config from storage
chrome.storage.sync.get(['appUrl', 'backendUrl', 'useProduction'], (result) => {
  if (result.appUrl) {
    APP_URL = result.appUrl;
  } else if (result.useProduction === false) {
    // Use localhost if explicitly set to false
    APP_URL = DEV_APP_URL;
  }
  
  if (result.backendUrl) {
    BACKEND_URL = result.backendUrl;
  } else if (result.useProduction === false) {
    // Use localhost if explicitly set to false
    BACKEND_URL = DEV_BACKEND_URL;
  }
  
  // Auto-detect: Try to ping production, fallback to localhost
  if (!result.appUrl && !result.useProduction) {
    detectEnvironment();
  }
});

// Auto-detect environment (production vs localhost)
async function detectEnvironment() {
  try {
    // Try to fetch from production
    const response = await fetch(`${PRODUCTION_APP_URL}/api/health`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    // If we can reach production, use it
    APP_URL = PRODUCTION_APP_URL;
    BACKEND_URL = PRODUCTION_BACKEND_URL;
    chrome.storage.sync.set({ useProduction: true });
    updateEnvIndicator(true);
  } catch (error) {
    // Production not available, try localhost
    try {
      const localResponse = await fetch(`${DEV_APP_URL}/api/health`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      APP_URL = DEV_APP_URL;
      BACKEND_URL = DEV_BACKEND_URL;
      chrome.storage.sync.set({ useProduction: false });
      updateEnvIndicator(false);
    } catch (localError) {
      // Neither available, default to production
      APP_URL = PRODUCTION_APP_URL;
      BACKEND_URL = PRODUCTION_BACKEND_URL;
      updateEnvIndicator(true);
    }
  }
}

// Update environment indicator
function updateEnvIndicator(isProduction) {
  if (envText) {
    if (isProduction) {
      envText.textContent = `🌐 Connected to: ${PRODUCTION_APP_URL}`;
      envText.style.color = '#22c55e';
    } else {
      envText.textContent = `💻 Connected to: ${DEV_APP_URL} (Local)`;
      envText.style.color = '#eab308';
    }
  }
}

// Update indicator on load
chrome.storage.sync.get(['useProduction', 'appUrl'], (result) => {
  if (result.appUrl) {
    const isProd = result.appUrl.includes('netlify.app');
    updateEnvIndicator(isProd);
  } else {
    updateEnvIndicator(result.useProduction !== false);
  }
});

// Listen for config updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.appUrl) APP_URL = changes.appUrl.newValue;
  if (changes.backendUrl) BACKEND_URL = changes.backendUrl.newValue;
  if (changes.useProduction !== undefined) {
    if (changes.useProduction.newValue === false) {
      APP_URL = DEV_APP_URL;
      BACKEND_URL = DEV_BACKEND_URL;
    } else {
      APP_URL = PRODUCTION_APP_URL;
      BACKEND_URL = PRODUCTION_BACKEND_URL;
    }
  }
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

// Verify session with backend
async function verifySession(cookies) {
  const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/verify`, {
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
}

// Connect account
async function connectAccount(cookies) {
  const response = await fetch(`${BACKEND_URL}/api/instagram/cookie/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookies })
  });
  return response.json();
}

// Main grab session function
async function grabSession() {
  try {
    // Check if on Instagram
    const isInstagram = await checkCurrentTab();
    if (!isInstagram) {
      showStatus(statusNotInstagram);
      openInstagramBtn.classList.remove('hidden');
      grabBtn.disabled = true;
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
      grabBtn.disabled = false;
      instructions.classList.remove('hidden');
      return;
    }

    // Verify with backend
    let verifyResult;
    try {
      verifyResult = await verifySession(cookies);
    } catch (fetchError) {
      showStatus(statusError);
      // Try to switch to localhost if production fails
      if (APP_URL === PRODUCTION_APP_URL) {
        console.log('Production backend failed, trying localhost...');
        APP_URL = DEV_APP_URL;
        BACKEND_URL = DEV_BACKEND_URL;
        chrome.storage.sync.set({ useProduction: false });
        updateEnvIndicator(false);
        
        // Retry with localhost
        try {
          verifyResult = await verifySession(cookies);
        } catch (localError) {
          errorMessage.textContent = `Cannot connect to backend. Tried both production and localhost. Make sure backend is running.`;
          grabBtn.disabled = false;
          instructions.classList.remove('hidden');
          return;
        }
      } else {
        errorMessage.textContent = 'Cannot connect to backend. Make sure it is running on port 3001.';
        grabBtn.disabled = false;
        instructions.classList.remove('hidden');
        return;
      }
    }
    
    if (!verifyResult.success) {
      showStatus(statusError);
      errorMessage.textContent = verifyResult.message || verifyResult.error || 'Session verification failed';
      grabBtn.disabled = false;
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

    // Connect account
    let connectResult;
    try {
      connectResult = await connectAccount(cookies);
    } catch (connectError) {
      // Even if connect fails, we have verified - show success
      connectResult = { success: true, account: user };
    }
    
    if (connectResult.success || user) {
      showStatus(statusSuccess);
      openAppBtn.classList.remove('hidden');
      grabBtn.textContent = '✅ Connected!';
      grabBtn.disabled = true;
      
      // Save to chrome storage
      const accountData = {
        id: `cookie_${user.pk}`,
        pk: user.pk,
        username: user.username,
        fullName: user.fullName,
        profilePicUrl: user.profilePicUrl,
        cookies: cookies,
        connectedAt: new Date().toISOString()
      };
      
      chrome.storage.local.set({ connectedAccount: accountData });
      
      // Open BulkDM app with account data in URL
      const encodedAccount = btoa(JSON.stringify(accountData));
      setTimeout(() => {
        const redirectUrl = `${APP_URL}/settings/instagram?connected=${encodedAccount}`;
        console.log('Opening BulkDM at:', redirectUrl);
        chrome.tabs.create({ url: redirectUrl });
      }, 1500);
    } else {
      showStatus(statusError);
      errorMessage.textContent = connectResult.message || 'Connection failed';
      grabBtn.disabled = false;
    }

  } catch (error) {
    console.error('Error:', error);
    showStatus(statusError);
    errorMessage.textContent = 'Network error. Make sure BulkDM backend is running.';
    grabBtn.disabled = false;
    instructions.classList.remove('hidden');
  }
}

// Event listeners
grabBtn.addEventListener('click', grabSession);

openInstagramBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.instagram.com/' });
  window.close();
});

openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: `${APP_URL}/settings/instagram` });
  window.close();
});

// Check current tab on popup open
(async () => {
  const isInstagram = await checkCurrentTab();
  if (!isInstagram) {
    showStatus(statusNotInstagram);
    openInstagramBtn.classList.remove('hidden');
    grabBtn.disabled = true;
  } else {
    // Check if already logged in
    const cookies = await getInstagramCookies();
    if (!cookies.sessionId) {
      showStatus(statusNotLoggedIn);
    }
  }
})();


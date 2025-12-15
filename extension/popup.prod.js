// BulkDM Instagram Session Grabber - PRODUCTION VERSION
// This extension extracts Instagram cookies and sends them to BulkDM

// PRODUCTION URLs - Hardcoded for Production
const APP_URL = 'https://bulkdm-saas.netlify.app';
const BACKEND_URL = 'https://bulkdm-saas.netlify.app'; // Frontend proxies to backend API

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

// Update environment indicator for production
if (envText) {
  envText.textContent = `🌐 PRODUCTION: ${APP_URL}`;
  envText.style.color = '#22c55e';
}

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
  const response = await fetch(`${BACKEND_URL}/api/proxy/instagram/cookie/verify`, {
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
  const response = await fetch(`${BACKEND_URL}/api/proxy/instagram/cookie/connect`, {
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
      errorMessage.textContent = `Cannot connect to backend at ${BACKEND_URL}. Please check your internet connection.`;
      grabBtn.disabled = false;
      instructions.classList.remove('hidden');
      return;
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
    errorMessage.textContent = `Network error. Make sure BulkDM backend is running at ${BACKEND_URL}.`;
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

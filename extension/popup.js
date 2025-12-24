// Socialora Instagram Session Orchestrator
// Popup provides Start/Stop UX; background service worker owns Instagram tab
// lifecycle, cookie polling and connection completion.
//
// CONFIG is loaded via script tag in popup.html.

// ---------------------------------------------------------------------------
// Environment indicator
// ---------------------------------------------------------------------------

const envText = document.getElementById('env-text');

function updateEnvIndicator(isProduction, url) {
  if (!envText) return;
  if (isProduction) {
    envText.textContent = `🌐 Connected to: ${url}`;
    envText.style.color = '#22c55e';
  } else {
    envText.textContent = `💻 Connected to: ${url} (Local)`;
    envText.style.color = '#eab308';
  }
}

CONFIG.getCurrent().then((config) => {
  updateEnvIndicator(config.isProduction, config.APP_URL);
});

chrome.storage.sync.get(['envMode'], (result) => {
  const envMode = result.envMode || CONFIG.ENV_MODE;
  if (envMode === 'auto') {
    detectEnvironment();
  }
});

async function detectEnvironment() {
  try {
    const prodConfig = CONFIG.PRODUCTION;
    await fetch(`${prodConfig.APP_URL}/api/instagram/cookie/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies: { sessionId: 'test' } }),
      signal: AbortSignal.timeout(3000),
    });
    CONFIG.setMode('production');
    updateEnvIndicator(true, prodConfig.APP_URL);
  } catch {
    try {
      const localConfig = CONFIG.LOCAL;
      await fetch(`${localConfig.APP_URL}/api/instagram/cookie/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: { sessionId: 'test' } }),
        signal: AbortSignal.timeout(3000),
      });
      CONFIG.setMode('local');
      updateEnvIndicator(false, localConfig.APP_URL);
    } catch {
      const prodConfig = CONFIG.PRODUCTION;
      updateEnvIndicator(true, prodConfig.APP_URL);
    }
  }
}

// Keep env indicator in sync if config changes
chrome.storage.onChanged.addListener(() => {
  CONFIG.getCurrent().then((config) => {
    updateEnvIndicator(config.isProduction, config.APP_URL);
  });
});

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------

const grabBtn = document.getElementById('grab-btn');
const stopBtn = document.getElementById('stop-btn');
const openAppBtn = document.getElementById('open-app-btn');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userFullname = document.getElementById('user-fullname');
const userUsername = document.getElementById('user-username');
const instructions = document.getElementById("instructions");
const messagesTodayEl = document.getElementById("messages-today");
const totalMessagesEl = document.getElementById("total-messages");
const messagesTodaySkeleton = document.getElementById("messages-today-skeleton");
const totalMessagesSkeleton = document.getElementById("total-messages-skeleton");

const statusNotInstagram = document.getElementById("status-not-instagram");
const statusNotLoggedIn = document.getElementById("status-not-logged-in");
const statusSuccess = document.getElementById("status-success");
const statusError = document.getElementById("status-error");
const statusConnecting = document.getElementById("status-connecting");
const errorMessage = document.getElementById("error-message");

// Consent dialog
const consentDialog = document.getElementById("consent-dialog");
const consentAccept = document.getElementById("consent-accept");
const consentDecline = document.getElementById("consent-decline");

// ---------------------------------------------------------------------------
// UI helpers & state
// ---------------------------------------------------------------------------

const STATE_IDLE = "idle";
const STATE_CONNECTING = "connecting";
const STATE_CONNECTED = "connected";

function hideAllStatus() {
  statusNotInstagram.classList.add("hidden");
  statusNotLoggedIn.classList.add("hidden");
  statusSuccess.classList.add("hidden");
  statusError.classList.add("hidden");
  statusConnecting.classList.add("hidden");
}

function showStatus(element) {
  hideAllStatus();
  element.classList.remove("hidden");
}

function setButtonsDisabled(disabled) {
  grabBtn.disabled = disabled;
  if (stopBtn) stopBtn.disabled = disabled;
}

function applyStateToUI(state, user, error) {
  hideAllStatus();

  if (state === STATE_IDLE) {
    grabBtn.classList.remove("hidden");
    if (stopBtn) stopBtn.classList.add("hidden");
    grabBtn.textContent = "PRESS TO START";
    setButtonsDisabled(false);
    instructions.classList.add("hidden");
    userInfo.classList.add("hidden");
    openAppBtn.classList.add("hidden");
  } else if (state === STATE_CONNECTING) {
    grabBtn.classList.add("hidden");
    if (stopBtn) stopBtn.classList.remove("hidden");
    stopBtn.textContent = "PRESS TO STOP";
    setButtonsDisabled(false);
    showStatus(statusConnecting);
    instructions.classList.add("hidden");
  } else if (state === STATE_CONNECTED) {
    grabBtn.classList.remove("hidden");
    if (stopBtn) stopBtn.classList.add("hidden");
    grabBtn.textContent = "✅ Connected (Reconnect)";
    setButtonsDisabled(false);
    instructions.classList.add("hidden");
    openAppBtn.classList.remove("hidden");

    if (user) {
      userInfo.classList.remove("hidden");
      userFullname.textContent = user.fullName || user.username;
      userUsername.textContent = `@${user.username}`;
      if (user.profilePicUrl) {
        // Use proxy endpoint to avoid CORS issues with Instagram images
        loadProfilePicture(user.profilePicUrl, user.username);
      } else {
        userAvatar.textContent = getInitials(user.fullName || user.username);
      }
    }
    showStatus(statusSuccess);
  }

  if (error) {
    showStatus(statusError);
    errorMessage.textContent = error;
  }
}

function loadStateAndRender() {
  chrome.storage.local.get(
    ["socialora_connection_state", "socialora_connected_user"],
    (result) => {
      const state = result.socialora_connection_state || STATE_IDLE;
      const user = result.socialora_connected_user || null;
      applyStateToUI(state, user, null);

      // Load profile picture if user is connected
      if (user && user.profilePicUrl) {
        loadProfilePicture(user.profilePicUrl, user.username);
      } else if (user) {
        // Show initials if no profile picture
        if (userAvatar) {
          userAvatar.textContent = getInitials(user.fullName || user.username);
        }
      }
    }
  );
}

// ---------------------------------------------------------------------------
// Consent helpers
// ---------------------------------------------------------------------------

async function saveConsent() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ socialora_consent: true }, () => resolve());
  });
}

function showConsentDialog() {
  return new Promise((resolve) => {
    if (!consentDialog) {
      resolve(true);
      return;
    }

    // Make sure dialog is actually visible (override .hidden class)
    consentDialog.classList.remove("hidden");
    consentDialog.style.display = "flex";

    consentAccept.onclick = async () => {
      await saveConsent();
      consentDialog.style.display = "none";
      consentDialog.classList.add("hidden");
      resolve(true);
    };

    consentDecline.onclick = () => {
      consentDialog.style.display = "none";
      consentDialog.classList.add("hidden");
      resolve(false);
    };
  });
}

async function ensureConsent() {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(["socialora_consent"], (data) => {
      resolve(data.socialora_consent === true);
    });
  });
  if (result) return true;
  return showConsentDialog();
}

// ---------------------------------------------------------------------------
// Start / Stop orchestration (delegates to background.js)
// ---------------------------------------------------------------------------

async function startConnection() {
  const ok = await ensureConsent();
  if (!ok) return;

  setButtonsDisabled(true);
  applyStateToUI(STATE_CONNECTING, null, null);

  chrome.runtime.sendMessage({ type: "START_CONNECTION" }, (response) => {
    setButtonsDisabled(false);
    if (chrome.runtime.lastError) {
      applyStateToUI(STATE_IDLE, null, chrome.runtime.lastError.message);
      return;
    }
    if (!response || !response.success) {
      applyStateToUI(
        STATE_IDLE,
        null,
        response?.error || "Failed to start Instagram connection"
      );
      return;
    }
    chrome.storage.local.set({ socialora_connection_state: STATE_CONNECTING });
    applyStateToUI(STATE_CONNECTING, null, null);
  });
}

function stopConnection() {
  setButtonsDisabled(true);
  chrome.runtime.sendMessage({ type: "STOP_CONNECTION" }, (response) => {
    setButtonsDisabled(false);
    if (chrome.runtime.lastError) {
      applyStateToUI(STATE_IDLE, null, chrome.runtime.lastError.message);
      return;
    }
    const state = response?.state || STATE_IDLE;
    const user = response?.user || null;
    chrome.storage.local.set(
      {
        socialora_connection_state: state,
        socialora_connected_user: user || null,
      },
      () => {
        applyStateToUI(state, user, response?.error || null);
      }
    );
  });
}

// Background pushes connection updates as it progresses
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONNECTION_STATUS") {
    applyStateToUI(
      message.state || STATE_IDLE,
      message.user || null,
      message.error || null
    );
  }
  if (message.type === "CONNECTION_COMPLETE") {
    const user = message.user || null;
    chrome.storage.local.set(
      {
        socialora_connection_state: STATE_CONNECTED,
        socialora_connected_user: user,
      },
      () => {
        applyStateToUI(STATE_CONNECTED, user, null);
        // Load profile picture after connection
        if (user && user.profilePicUrl) {
          loadProfilePicture(user.profilePicUrl, user.username);
        } else if (user) {
          if (userAvatar) {
            userAvatar.textContent = getInitials(
              user.fullName || user.username
            );
          }
        }
      }
    );
  }
});

// ---------------------------------------------------------------------------
// Misc UI actions
// ---------------------------------------------------------------------------

if (grabBtn) {
  grabBtn.addEventListener("click", startConnection);
}
if (stopBtn) {
  stopBtn.addEventListener("click", stopConnection);
}

if (openAppBtn) {
  openAppBtn.addEventListener("click", async () => {
    const config = await CONFIG.getCurrent();
    const cleanAppUrl = config.APP_URL.replace(/\/+$/, "");
    chrome.tabs.create({ url: `${cleanAppUrl}/settings/instagram` });
    window.close();
  });
}

// ---------------------------------------------------------------------------
// Statistics fetching
// ---------------------------------------------------------------------------

async function fetchStatistics() {
  // Show skeleton loading state
  showStatisticsSkeleton(true);
  
  try {
    // Get connected Instagram account cookies
    const storageData = await new Promise((resolve) => {
      chrome.storage.local.get(null, resolve);
    });

    // Find the most recent connected account
    let cookies = null;
    let userId = null;

    // Check for connected user first
    if (storageData.socialora_connected_user) {
      userId =
        storageData.socialora_connected_user.pk ||
        storageData.socialora_connected_user.id;
      const storageKey = `socialora_cookies_${userId}`;
      cookies = storageData[storageKey];
    }

    // If no connected user, try to find any stored cookies
    if (!cookies) {
      for (const key in storageData) {
        if (key.startsWith("socialora_cookies_")) {
          cookies = storageData[key];
          userId = key.replace("socialora_cookies_", "");
          break;
        }
      }
    }

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      // No cookies available, show 0
      updateStatisticsDisplay(0, 0);
      return;
    }

    // Get config for API URL
    const config = await CONFIG.getCurrent();
    const apiUrl = `${config.BACKEND_URL}/api/extension/stats`;

    // Fetch statistics
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cookies }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      updateStatisticsDisplay(data.messagesToday || 0, data.totalMessages || 0);
    } else {
      // API returned error, show 0
      updateStatisticsDisplay(0, 0);
    }
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    // On error, show 0
    updateStatisticsDisplay(0, 0);
  }
}

function showStatisticsSkeleton(show) {
  if (messagesTodaySkeleton) {
    if (show) {
      messagesTodaySkeleton.classList.remove("hidden");
    } else {
      messagesTodaySkeleton.classList.add("hidden");
    }
  }
  if (totalMessagesSkeleton) {
    if (show) {
      totalMessagesSkeleton.classList.remove("hidden");
    } else {
      totalMessagesSkeleton.classList.add("hidden");
    }
  }
  if (messagesTodayEl) {
    if (show) {
      messagesTodayEl.classList.add("hidden");
    } else {
      messagesTodayEl.classList.remove("hidden");
    }
  }
  if (totalMessagesEl) {
    if (show) {
      totalMessagesEl.classList.add("hidden");
    } else {
      totalMessagesEl.classList.remove("hidden");
    }
  }
}

function updateStatisticsDisplay(messagesToday, totalMessages) {
  // Hide skeleton and show actual values
  showStatisticsSkeleton(false);
  
  if (messagesTodayEl) {
    messagesTodayEl.textContent = messagesToday.toString();
  }
  if (totalMessagesEl) {
    totalMessagesEl.textContent = totalMessages.toString();
  }
}

// ---------------------------------------------------------------------------
// Profile picture loading with proxy
// ---------------------------------------------------------------------------

async function loadProfilePicture(profilePicUrl, username) {
  if (!userAvatar || !profilePicUrl) return;

  // Check if it's an Instagram CDN URL
  const isInstagramUrl =
    profilePicUrl.includes("instagram.com") ||
    profilePicUrl.includes("cdninstagram.com") ||
    profilePicUrl.includes("fbcdn.net");

  let imageUrl = profilePicUrl;

  // Use proxy for Instagram images to avoid CORS issues
  if (isInstagramUrl) {
    try {
      const config = await CONFIG.getCurrent();
      imageUrl = `${
        config.BACKEND_URL
      }/api/instagram/image-proxy?url=${encodeURIComponent(profilePicUrl)}`;
    } catch (error) {
      console.error("Failed to get config for image proxy:", error);
      // Fall back to direct URL
    }
  }

  // Create image element with error handling
  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = username;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.borderRadius = "50%";
  img.style.objectFit = "cover";

  img.onerror = () => {
    // If image fails to load, show initials
    userAvatar.innerHTML = "";
    userAvatar.textContent = getInitials(username);
  };

  img.onload = () => {
    // Image loaded successfully, ensure it's displayed
    if (userAvatar.firstChild !== img) {
      userAvatar.innerHTML = "";
      userAvatar.appendChild(img);
    }
  };

  // Clear and set the image element
  userAvatar.innerHTML = "";
  userAvatar.appendChild(img);
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

loadStateAndRender();
fetchStatistics();

// Refresh statistics periodically (every 30 seconds)
setInterval(() => {
  fetchStatistics();
}, 30000);



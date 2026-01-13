// Socialora Background Service Worker
// Owns Instagram tab lifecycle, cookie polling and session verification.
// Also exposes legacy helpers used by popup/content scripts.

// Import config
importScripts('config.js');

// ---------------------------------------------------------------------------
// Helper: build API URL
// ---------------------------------------------------------------------------

function buildApiUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

async function getInstagramCookies() {
  const cookies = await chrome.cookies.getAll({ domain: 'instagram.com' });

  const cookieMap = {};
  cookies.forEach((cookie) => {
    cookieMap[cookie.name] = cookie.value;
  });

  return {
    sessionId: cookieMap.sessionid || '',
    csrfToken: cookieMap.csrftoken || '',
    dsUserId: cookieMap.ds_user_id || '',
    mid: cookieMap.mid || '',
    igDid: cookieMap.ig_did || '',
    rur: cookieMap.rur || '',
  };
}

async function verifySession(cookies) {
  try {
    const config = await CONFIG.getCurrent();
    const url = buildApiUrl(config.BACKEND_URL, 'api/instagram/cookie/verify');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies }),
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      const text = await response.text();
      console.error('Server returned non-JSON response:', text.substring(0, 200));
      return {
        success: false,
        error: `Server error (${response.status}). The backend may be experiencing issues.`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Server error: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('Verify session error:', error);

    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Server returned invalid response. The backend may be down or experiencing issues.',
      };
    }

    return { success: false, error: error.message || 'Failed to connect to backend' };
  }
}

// ---------------------------------------------------------------------------
// Instagram connection orchestration
// ---------------------------------------------------------------------------

async function startInstagramConnection() {
  try {
    // Check if there's already a stored Instagram tab
    const storedState = await new Promise((resolve) => {
      chrome.storage.local.get(["socialora_instagram_tab_id"], (data) =>
        resolve(data)
      );
    });

    let instagramTabId = null;
    let tab = null;

    // If there's a stored tab ID, try to reuse it
    if (storedState.socialora_instagram_tab_id) {
      try {
        const existingTab = await chrome.tabs.get(
          storedState.socialora_instagram_tab_id
        );
        // Check if the tab is still valid and is an Instagram tab
        if (
          existingTab &&
          existingTab.url &&
          (existingTab.url.includes("instagram.com") ||
            existingTab.url.includes("www.instagram.com"))
        ) {
          // Reuse the existing tab
          tab = existingTab;
          instagramTabId = existingTab.id;
          // Optionally activate the tab
          await chrome.tabs.update(instagramTabId, { active: false });
        }
      } catch (e) {
        // Tab doesn't exist or is invalid, will create a new one
        console.log("Stored tab no longer exists, creating new tab");
      }
    }

    // If no valid tab was found, create a new one
    if (!tab) {
      tab = await chrome.tabs.create({
        url: "https://www.instagram.com/",
        // Open login tab in the background to avoid stealing focus
        active: false,
      });
      instagramTabId = tab.id;
    }

    chrome.storage.local.set({
      socialora_instagram_tab_id: instagramTabId,
      socialora_connection_state: "connecting",
    });

    chrome.runtime.sendMessage(
      {
        type: "CONNECTION_STATUS",
        state: "connecting",
      },
      () => {
        if (chrome.runtime.lastError) {
          // Popup might not be open, ignore the error
          console.log(
            "No receiver for CONNECTION_STATUS message (popup may be closed)"
          );
        }
      }
    );

    pollForInstagramLogin(instagramTabId);

    return { success: true };
  } catch (error) {
    console.error("Failed to start Instagram connection:", error);
    return {
      success: false,
      error: error.message || "Failed to open Instagram tab",
    };
  }
}

async function stopInstagramConnection() {
  const state = await new Promise((resolve) => {
    chrome.storage.local.get(
      [
        "socialora_instagram_tab_id",
        "socialora_connection_state",
        "socialora_connected_user",
      ],
      (data) => resolve(data)
    );
  });

  const tabId = state.socialora_instagram_tab_id;
  const connectedUser = state.socialora_connected_user || null;

  // Close only the associated Instagram tab if it exists
  if (tabId) {
    try {
      await chrome.tabs.remove(tabId);
    } catch (e) {
      // Tab may already be closed; ignore
    }
  }

  // Keep connection state if user was connected - don't reset to idle
  const newState = connectedUser ? "connected" : "idle";

  chrome.storage.local.set({
    socialora_instagram_tab_id: null, // Clear tab ID but keep connection
    socialora_connection_state: newState,
    // Keep socialora_connected_user unchanged
  });

  chrome.runtime.sendMessage(
    {
      type: "CONNECTION_STATUS",
      state: newState,
      user: connectedUser,
      tabClosed: true, // Indicate tab was closed
    },
    () => {
      if (chrome.runtime.lastError) {
        // Popup might not be open, ignore the error
        console.log(
          "No receiver for CONNECTION_STATUS message (popup may be closed)"
        );
      }
    }
  );

  return { success: true, state: newState, user: connectedUser };
}

function pollForInstagramLogin(instagramTabId) {
  const maxAttempts = 150; // ~5 minutes at 2s
  let attempts = 0;

  const intervalId = setInterval(async () => {
    attempts += 1;

    try {
      const tab = await chrome.tabs.get(instagramTabId);
      if (!tab) {
        clearInterval(intervalId);
        return;
      }
    } catch {
      clearInterval(intervalId);
      return;
    }

    const cookies = await getInstagramCookies();

    if (cookies.sessionId && cookies.dsUserId) {
      clearInterval(intervalId);
      handleCookiesReady(cookies).catch((err) => {
        console.error("Failed to handle cookies:", err);
        chrome.runtime.sendMessage(
          {
            type: "CONNECTION_STATUS",
            state: "idle",
            error: err.message || "Failed to verify Instagram session",
          },
          () => {
            if (chrome.runtime.lastError) {
              // Popup might not be open, ignore the error
              console.log(
                "No receiver for CONNECTION_STATUS message (popup may be closed)"
              );
            }
          }
        );
        chrome.storage.local.set({
          socialora_connection_state: "idle",
        });
      });
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      chrome.runtime.sendMessage(
        {
          type: "CONNECTION_STATUS",
          state: "idle",
          error: "Login timeout. Please try again.",
        },
        () => {
          if (chrome.runtime.lastError) {
            // Popup might not be open, ignore the error
            console.log(
              "No receiver for CONNECTION_STATUS message (popup may be closed)"
            );
          }
        }
      );
      chrome.storage.local.set({
        socialora_connection_state: "idle",
      });
    }
  }, 2000);
}

async function handleCookiesReady(cookies) {
  const verifyResult = await verifySession(cookies);
  if (!verifyResult || !verifyResult.success) {
    throw new Error(
      verifyResult?.error ||
        verifyResult?.message ||
        "Session verification failed"
    );
  }

  const user = verifyResult.user;
  const storageKey = `socialora_cookies_${user.pk}`;

  await new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey]: cookies }, resolve);
  });

  // Check if Instagram tab is still open
  const storedState = await new Promise((resolve) => {
    chrome.storage.local.get(["socialora_instagram_tab_id"], (data) =>
      resolve(data)
    );
  });

  let tabOpen = false;
  let tabId = storedState.socialora_instagram_tab_id || null;

  if (tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (
        tab &&
        tab.url &&
        (tab.url.includes("instagram.com") ||
          tab.url.includes("www.instagram.com"))
      ) {
        tabOpen = true;
      }
    } catch (e) {
      // Tab doesn't exist or is invalid
      tabId = null;
    }
  }

  chrome.storage.local.set({
    socialora_connection_state: "connected",
    socialora_connected_user: user,
    socialora_instagram_tab_id: tabId, // Keep tab ID if tab is open
  });

  chrome.runtime.sendMessage(
    {
      type: "CONNECTION_COMPLETE",
      user,
      tabOpen,
      tabId,
    },
    () => {
      if (chrome.runtime.lastError) {
        // Popup might not be open, ignore the error
        console.log(
          "No receiver for CONNECTION_COMPLETE message (popup may be closed)"
        );
      }
    }
  );

  // Open Socialora app and transfer cookies using existing content-script flow
  const config = await CONFIG.getCurrent();
  const cleanAppUrl = config.APP_URL.replace(/\/+$/, "");
  const accountMetadata = {
    igUserId: user.pk,
    username: user.username,
    fullName: user.fullName,
    profilePicUrl: user.profilePicUrl,
  };
  const encodedMetadata = btoa(JSON.stringify(accountMetadata));
  const redirectUrl = `${cleanAppUrl}/settings/instagram?ig_user_id=${user.pk}&account=${encodedMetadata}`;

  // Prefer reusing an existing app tab if one is already open
  chrome.tabs.query({ url: [`${cleanAppUrl}/*`] }, (tabs) => {
    const targetTab = tabs && tabs.length > 0 ? tabs[0] : null;

    const openOrUpdate = (cb) => {
      if (targetTab && targetTab.id != null) {
        chrome.tabs.update(
          targetTab.id,
          { url: redirectUrl, active: true },
          (updated) => {
            cb(updated);
          }
        );
      } else {
        chrome.tabs.create({ url: redirectUrl, active: true }, (created) => {
          cb(created);
        });
      }
    };

    openOrUpdate((tab) => {
      if (!tab || !tab.id) return;
      const tabId = tab.id;

      const sendCookiesToPage = (tabId, retryCount = 0) => {
        const maxRetries = 10;
        const retryDelay = 300;

        chrome.tabs.sendMessage(
          tabId,
          {
            type: "SAVE_COOKIES",
            userId: user.pk,
            cookies,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              if (retryCount < maxRetries) {
                setTimeout(
                  () => sendCookiesToPage(tabId, retryCount + 1),
                  retryDelay
                );
              } else {
                injectCookiesViaScript(tabId);
              }
            } else if (!response || !response.success) {
              injectCookiesViaScript(tabId);
            }
          }
        );
      };

      const injectCookiesViaScript = (tabId) => {
        chrome.scripting
          .executeScript({
            target: { tabId },
            func: (userId, cookieData) => {
              const storageKey = "socialora_cookies_" + userId;
              try {
                const cookiesJson = JSON.stringify(cookieData);
                localStorage.setItem(storageKey, cookiesJson);
                sessionStorage.setItem(storageKey, cookiesJson);
                window.dispatchEvent(
                  new CustomEvent("socialora_cookies_saved", {
                    detail: { userId, storageKey, cookies: cookieData },
                  })
                );
                window.postMessage(
                  {
                    type: "SOCIALORA_COOKIES_SAVED",
                    userId,
                    cookies: cookieData,
                    storageKey,
                  },
                  window.location.origin
                );
                return { success: true, storageKey };
              } catch (e) {
                return { success: false, error: e.message };
              }
            },
            args: [user.pk, cookies],
          })
          .catch(() => {
            // Best-effort; if this fails the page can still request cookies via content script.
          });
      };

      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          sendCookiesToPage(tabId);
          chrome.tabs.onUpdated.removeListener(listener);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

// ---------------------------------------------------------------------------
// Message router
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Legacy helpers used by content script / popup
  if (message.type === 'GET_COOKIES') {
    getInstagramCookies().then(sendResponse);
    return true;
  }

  if (message.type === 'VERIFY_SESSION') {
    verifySession(message.cookies).then(sendResponse);
    return true;
  }

  if (message.type === 'GET_STORED_COOKIES') {
    const userId = message.userId;
    const storageKey = `socialora_cookies_${userId}`;
    chrome.storage.local.get([storageKey], (result) => {
      sendResponse({ success: true, cookies: result[storageKey] || null });
    });
    return true;
  }

  if (message.type === 'CONTENT_SCRIPT_READY' && sender.tab) {
    console.log('Background: Content script ready for tab', sender.tab.id);
    sendResponse({ success: true });
    return false;
  }

  // New orchestration messages from popup
  if (message.type === 'START_CONNECTION') {
    startInstagramConnection().then(sendResponse);
    return true;
  }

  if (message.type === 'STOP_CONNECTION') {
    stopInstagramConnection().then(sendResponse);
    return true;
  }

  // Forward SAVE_COOKIES messages from popup to content script (legacy path)
  if (message.type === 'FORWARD_SAVE_COOKIES' && sender.tab) {
    chrome.tabs.sendMessage(
      sender.tab.id,
      {
        type: 'SAVE_COOKIES',
        userId: message.userId,
        cookies: message.cookies,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Background: Failed to forward message:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse(response);
        }
      },
    );
    return true;
  }

  // Run the cold-DM automation script on the Instagram tab.
  // Expects: { type: 'RUN_COLD_DM', username: string, message: string }
  if (message.type === 'RUN_COLD_DM') {
    (async () => {
      console.log('Background: RUN_COLD_DM received', { username: message.username, jobId: message.jobId, dmMessageLen: (message.dmMessage || message.message || '').length });
      try {
        // Get stored Instagram tab id (if any)
        const stored = await new Promise((resolve) => {
          chrome.storage.local.get(['socialora_instagram_tab_id'], resolve);
        });

        let tabId = stored.socialora_instagram_tab_id;

        // If no tab exists, create a background Instagram tab
        if (!tabId) {
          const tab = await chrome.tabs.create({ url: 'https://www.instagram.com/', active: false });
          tabId = tab.id;
          chrome.storage.local.set({ socialora_instagram_tab_id: tabId });
        }

        // If a username was provided, navigate the Instagram tab to that profile
        if (message.username) {
          try {
            // Notify listeners that navigation is starting
            try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'navigating', username: message.username }); } catch (_) {}
            const profileUrl = `https://www.instagram.com/${encodeURIComponent(message.username)}/`;
            await chrome.tabs.update(tabId, { url: profileUrl, active: false });

            // Wait for navigation to complete (best-effort, timeout after ~8s)
            await new Promise((resolve) => {
              const timeout = setTimeout(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
              }, 8000);

              const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                  clearTimeout(timeout);
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve();
                }
              };

              chrome.tabs.onUpdated.addListener(listener);
            });
          } catch (e) {
            // Non-fatal; proceed to inject script anyway
            console.warn('Failed to navigate to profile:', e && e.message);
            try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'navigation_failed', error: e && e.message }); } catch (_) {}
          }
        }

        // Inject the automation script into the Instagram page
        try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'injecting' }); } catch (_) {}
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['automation-script.js'],
        });

        // Small delay to allow the injected script to register its message listener
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Send the execution command to the injected script
        try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'executing' }); } catch (_) {}
        chrome.tabs.sendMessage(
          tabId,
          {
            action: 'EXECUTE_COLD_DM',
            username: message.username,
            message: message.dmMessage || message.message || '',
            jobId: message.jobId || null,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              const errMsg = chrome.runtime.lastError.message || '';
              // In some cases the receiver doesn't call sendResponse and the port closes
              // with this message. Treat that as a non-fatal warning (message was
              // likely delivered) but surface other errors.
              console.error('Background: chrome.tabs.sendMessage error:', errMsg);
              if (errMsg.includes('closed before a response')) {
                try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'warning', warning: errMsg }); } catch (_) {}
                sendResponse({ success: true, warning: errMsg });
              } else if (errMsg.includes('Could not establish connection')) {
                try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'failed', error: errMsg }); } catch (_) {}
                // No receiver at all — likely injection failed or content script
                // couldn't run in time.
                sendResponse({ success: false, error: errMsg });
              } else {
                try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'failed', error: errMsg }); } catch (_) {}
                sendResponse({ success: false, error: errMsg });
              }
            } else {
              try { chrome.runtime.sendMessage({ type: 'RUN_COLD_DM_STATUS', jobId: message.jobId, status: 'script_response', response }); } catch (_) {}
              console.log('Background: automation script response', { response });
              sendResponse(response || { success: true });
            }
          }
        );
      } catch (err) {
        console.error('Background: RUN_COLD_DM top-level error', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // keep channel open for async sendResponse
  }

  return false;
});

// ---------------------------------------------------------------------------
// Install hook
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  console.log('Socialora Instagram Session Grabber installed');
});



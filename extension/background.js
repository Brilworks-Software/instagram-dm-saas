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

  // Stop job polling when user clicks STOP (regardless of connection state)
  console.log('🛑 Stopping job polling system (user clicked STOP)');
  stopJobPolling();

  chrome.storage.local.set({
    socialora_instagram_tab_id: null, // Clear tab ID but keep connection
    socialora_connection_state: newState,
    isDMQueueActive: false, // Deactivate queue when user stops
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

  // Job polling will be started manually when user clicks "PRESS TO START"
  // Do not start automatically here

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

  // ===== DM QUEUE SYSTEM HANDLERS =====
  
  // Get DM queue status
  if (message.type === "DM_QUEUE_STATUS") {
    getDMQueueStatus()
      .then(status => {
        sendResponse({ 
          success: true, 
          isProcessing: status.isProcessing, 
          remainingJobs: status.remainingJobs,
          processedJobs: status.processedJobs,
          totalJobs: status.totalJobs
        });
      })
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      });
    return true;
  }
  
  // Handle DM result from content script
  if (message.type === "DM_QUEUE_RESULT") {
    console.log('📊 DM Queue Result:', message.data);
    sendResponse({ success: true, status: 'received' });
    return false;
  }

  // Manual trigger to poll for jobs immediately (for testing/debugging)
  if (message.type === "POLL_JOBS_NOW") {
    pollForPendingJobs()
      .then(() => {
        sendResponse({ success: true, message: 'Poll triggered' });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  // Start/stop job polling on user request
  if (message.type === "START_JOB_POLLING") {
    (async () => {
      const { socialora_connected_user: connectedUser } = 
        await chrome.storage.local.get(['socialora_connected_user']);
      
      if (!connectedUser || !connectedUser.pk) {
        sendResponse({ success: false, error: 'No connected user found' });
        return;
      }
      
      startJobPolling();
      sendResponse({ success: true, message: 'Job polling started' });
    })();
    return true;
  }

  if (message.type === "STOP_JOB_POLLING") {
    stopJobPolling();
    sendResponse({ success: true, message: 'Job polling stopped' });
    return true;
  }

  return false;
});

// ---------------------------------------------------------------------------
// JOB QUEUE SYSTEM FOR AUTOMATED DM SENDING
// Auto-polls every 5 minutes for pending jobs
// ---------------------------------------------------------------------------

// Configuration (in minutes for chrome.alarms API)
const JOB_POLL_INTERVAL_MINS = 5; // Poll for new jobs every 5 minutes
const MIN_DELAY_MINS = 5; // 5 minutes base delay between DMs
const JITTER_MINS = 5; // Up to 5 minutes of extra randomness
const RETRY_DELAY_MINS = 1; // 1 minute retry delay on failure

// Instagram DM URL (will be used to find/create background tab)
const INSTAGRAM_DM_URL = 'https://www.instagram.com/direct/inbox/';

// DUMMY DATA REMOVED - Now using API calls to fetch jobs


// ---------------------------------------------------------------------------
// Alarm-based Queue Processor
// ---------------------------------------------------------------------------

/**
 * Listen for alarms to wake up the service worker
 * This is the heart of background processing in Manifest V3
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('⏰ Alarm triggered:', alarm.name);
  
  if (alarm.name === 'pollForJobs') {
    pollForPendingJobs();
  } else if (alarm.name === 'processNextDMJob') {
    processNextDMJob();
  }
});

/**
 * Start the job polling system (called when user clicks PRESS TO START)
 */
function startJobPolling() {
  // Set isDMQueueActive to true first
  chrome.storage.local.set({ isDMQueueActive: true }, () => {
    // Notify popup that polling started
    try {
      chrome.runtime.sendMessage({ type: "JOB_POLLING_STARTED" }, () => {
        if (chrome.runtime.lastError) {
          // Popup might not be open, ignore
        }
      });
    } catch (e) {
      // Ignore errors
    }
    
    // Clear any existing alarm first
    chrome.alarms.clear('pollForJobs', (wasCleared) => {
      console.log('Cleared existing pollForJobs alarm:', wasCleared);
      
      // Set up recurring alarm to poll for jobs every 5 minutes
      chrome.alarms.create('pollForJobs', {
        delayInMinutes: 1, // Start first poll after 1 minute
        periodInMinutes: JOB_POLL_INTERVAL_MINS
      });
      
      console.log(`🔧 DM Queue auto-polling started (every ${JOB_POLL_INTERVAL_MINS} minutes)`);
      console.log(`⚙️ Job processing config: MIN_DELAY=${MIN_DELAY_MINS} min, MAX_JITTER=${JITTER_MINS} min`);
      
      // Run initial poll after a short delay
      setTimeout(() => pollForPendingJobs(), 5000);
    });
  });
}

/**
 * Stop the job polling system (called when user disconnects)
 */
function stopJobPolling() {
  // Clear the recurring poll alarm
  chrome.alarms.clear('pollForJobs', (wasCleared) => {
    console.log('Stopped pollForJobs alarm:', wasCleared);
  });
  
  // Clear any pending job processing alarm
  chrome.alarms.clear('processNextDMJob', (wasCleared) => {
    console.log('Stopped processNextDMJob alarm:', wasCleared);
  });
  
  // Clear queue state
  chrome.storage.local.set({
    isDMQueueActive: false,
    dmJobQueue: [],
    dmProcessedCount: 0
  }, () => {
    // Notify popup that polling stopped
    try {
      chrome.runtime.sendMessage({ type: "JOB_POLLING_STOPPED" }, () => {
        if (chrome.runtime.lastError) {
          // Popup might not be open, ignore
        }
      });
    } catch (e) {
      // Ignore errors
    }
  });
  
  console.log('🛑 Job polling system stopped and queue cleared');
}

/**
 * Poll for pending jobs (runs every 5 minutes)
 * In production, this would call your backend API
 */
async function pollForPendingJobs() {
  console.log('\n🔍 Polling for pending jobs...');
  
  try {
    // Check if queue is active - if not, don't poll
    const { isDMQueueActive = false, dmJobQueue = [] } = 
      await chrome.storage.local.get(['isDMQueueActive', 'dmJobQueue']);
    
    if (!isDMQueueActive) {
      console.log('⏸️ Queue is not active (user must click PRESS TO START). Skipping poll.');
      return;
    }
    
    if (isDMQueueActive && dmJobQueue.length > 0) {
      console.log('⏭️ Queue already active with', dmJobQueue.length, 'jobs. Skipping poll.');
      return;
    }
    
    // Get connected user's ig_user_id
    const { socialora_connected_user: connectedUser } = 
      await chrome.storage.local.get(['socialora_connected_user']);
    
    if (!connectedUser || !connectedUser.pk) {
      console.log('⚠️ No connected user found. Cannot poll for jobs.');
      return;
    }
    
    const igUserId = connectedUser.pk;
    console.log(`📡 Fetching jobs for ig_user_id: ${igUserId}`);
    
    // Fetch jobs from API
    const config = await CONFIG.getCurrent();
    const apiUrl = buildApiUrl(config.BACKEND_URL, `api/campaigns/jobs?ig_user_id=${encodeURIComponent(igUserId)}`);
    
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      console.error('❌ Network error fetching jobs:', fetchError);
      return;
    }
    
    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Error details:', errorText);
      return;
    }
    
    const apiData = await response.json();
    
    if (!apiData.success || !apiData.jobs) {
      console.log('📭 No pending jobs found (API returned empty or error)');
      if (apiData.error) {
        console.error('API error:', apiData.error);
      }
      return;
    }
    
    // Map API response format to internal job format
    const jobs = apiData.jobs.map((job) => ({
      id: job.id,
      recipient: job.recipientUsername,
      message: job.message || '',
      campaignId: job.campaignId,
      campaignName: job.campaignName,
      leadId: job.leadId,
      recipientUserId: job.recipientUserId,
      scheduledAt: job.scheduledAt,
    }));
    
    if (jobs.length === 0) {
      console.log('📭 No pending jobs found');
      return;
    }
    
    console.log(`📬 Found ${jobs.length} pending jobs. Starting queue processor...`);
    
    // Initialize queue with fetched jobs
    await chrome.storage.local.set({
      dmJobQueue: jobs,
      dmProcessedCount: 0,
      isDMQueueActive: true
    });
    
    // Start processing immediately
    scheduleNextJob(0.1); // 6 seconds delay to set up tab
    
  } catch (error) {
    console.error('❌ Error polling for jobs:', error);
  }
}

/**
 * Process the next job in the queue
 * This function is called by the alarm and handles one job at a time
 */
async function processNextDMJob() {
  console.log('\n🔄 Processing next DM job...');
  
  try {
    // Get current queue state from storage (persists across service worker restarts)
    const { dmJobQueue = [], dmProcessedCount = 0, isDMQueueActive = false } = 
      await chrome.storage.local.get(['dmJobQueue', 'dmProcessedCount', 'isDMQueueActive']);
    
    // Check if queue is still active - if not, stop processing
    if (!isDMQueueActive) {
      console.log('⏸️ Queue is not active (user must click PRESS TO START)');
      // Clear any pending alarms
      chrome.alarms.clear('processNextDMJob');
      return;
    }
    
    // Check if queue is empty
    if (dmJobQueue.length === 0) {
      console.log('✨ Queue empty. All jobs completed!');
      console.log(`📊 Total jobs processed: ${dmProcessedCount}`);
      
      // Mark queue as inactive
      await chrome.storage.local.set({ 
        dmProcessedCount: 0 
      });
      
      // Poll for more jobs immediately (don't wait for next scheduled poll)
      console.log('🔄 Queue empty, polling for more jobs...');
      setTimeout(() => pollForPendingJobs(), 5000); // Poll after 5 seconds
      return;
    }
    
    const currentJob = dmJobQueue[0];
    console.log(`📋 Processing job ${currentJob.id} (${dmProcessedCount + 1}/${dmProcessedCount + dmJobQueue.length})`);
    console.log(`📝 Recipient: ${currentJob.recipient}`);
    console.log(`💬 Message: ${currentJob.message}`);
    
    // Find or create Instagram DM tab
    const tab = await getOrCreateInstagramTab();
    
    if (!tab) {
      console.error('❌ Failed to get Instagram tab. Retrying...');
      scheduleNextJob(RETRY_DELAY_MINS);
      return;
    }
    
    console.log(`📱 Using tab ID: ${tab.id} (${tab.url})`);
    
    // Activate the tab temporarily to ensure Instagram's React app is fully initialized
    // This is necessary because background tabs may have throttled JavaScript execution
    try {
      await chrome.tabs.update(tab.id, { active: true });
      console.log('   Tab activated for processing');
      // Wait a bit for the tab to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      console.warn('   Could not activate tab, continuing anyway:', e);
    }
    
    // Send EXECUTE_COLD_DM to automation-script.js
    const messageSuccess = await sendMessageWithRetry(
      tab.id,
      { 
        action: 'EXECUTE_COLD_DM',
        username: currentJob.recipient,
        message: currentJob.message,
        jobId: currentJob.id
      },
      3, // max retries
      1000 // 1 second between retries
    );
    
    if (!messageSuccess) {
      console.error('❌ Content script not responding after retries');
      // Ensure tab is deactivated
      try {
        await chrome.tabs.update(tab.id, { active: false });
      } catch (e) {
        // Ignore errors
      }
      console.log('🔁 Retrying job in', RETRY_DELAY_MINS, 'minute(s)...');
      scheduleNextJob(RETRY_DELAY_MINS);
      return;
    }
    
    // Message sent successfully, response handled in sendMessageWithRetry
    
  } catch (error) {
    console.error('❌ Error in processNextDMJob:', error);
    scheduleNextJob(RETRY_DELAY_MINS);
  }
}

/**
 * Mark job as completed by calling the status endpoint
 * @param {string} jobId - Job ID to mark as completed
 * @param {string} igMessageId - Optional Instagram message ID
 * @param {Date} sentAt - Optional timestamp when message was sent
 * @returns {Promise<boolean>} - true if status update succeeded
 */
async function markJobAsCompleted(jobId, igMessageId = null, sentAt = null) {
  try {
    const config = await CONFIG.getCurrent();
    const apiUrl = buildApiUrl(config.BACKEND_URL, 'api/campaigns/jobs/status');
    
    const payload = {
      jobId: jobId,
    };
    
    if (igMessageId) {
      payload.igMessageId = igMessageId;
    }
    
    if (sentAt) {
      payload.sentAt = sentAt instanceof Date ? sentAt.toISOString() : sentAt;
    }
    
    console.log(`📤 Marking job ${jobId} as completed...`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Status endpoint error: ${response.status} ${response.statusText}`, errorText);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error(`❌ Status endpoint returned error:`, data.error || 'Unknown error');
      return false;
    }
    
    if (data.alreadyProcessed) {
      console.log(`ℹ️ Job ${jobId} was already marked as completed`);
    } else {
      console.log(`✅ Job ${jobId} marked as completed successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error calling status endpoint for job ${jobId}:`, error);
    return false;
  }
}

/**
 * Mark job as failed by calling the failed endpoint
 * @param {string} jobId - Job ID to mark as failed
 * @param {string} errorMessage - Failure reason
 * @param {Date|string|null} failedAt - Optional timestamp when failure occurred
 * @returns {Promise<boolean>} - true if status update succeeded
 */
async function markJobAsFailed(jobId, errorMessage = null, failedAt = null) {
  try {
    const config = await CONFIG.getCurrent();
    const apiUrl = buildApiUrl(config.BACKEND_URL, 'api/campaigns/jobs/failed');

    const payload = {
      jobId: jobId,
    };

    if (errorMessage) {
      payload.errorMessage = String(errorMessage);
    }

    if (failedAt) {
      payload.failedAt = failedAt instanceof Date ? failedAt.toISOString() : failedAt;
    }

    console.log(`📤 Marking job ${jobId} as FAILED...`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Failed endpoint error: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      console.error(`❌ Failed endpoint returned error:`, data.error || 'Unknown error');
      return false;
    }

    if (data.alreadyProcessed) {
      console.log(`ℹ️ Job ${jobId} was already marked as failed (or completed)`);
    } else {
      console.log(`✅ Job ${jobId} marked as FAILED successfully`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error calling failed endpoint for job ${jobId}:`, error);
    return false;
  }
}

/**
 * Send message to tab with retry logic
 * @param {number} tabId - Tab ID to send message to
 * @param {object} message - Message to send
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<boolean>} - true if message sent successfully
 */
async function sendMessageWithRetry(tabId, message, maxRetries, retryDelay) {
  const jobId = message?.jobId || message?.job?.id;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
      
      // Handle the response
      if (!response) {
        console.warn(`⚠️ No response from content script (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return false;
      }
      
      if (response.status === 'success') {
        // Success: Mark job as completed in backend, then remove from queue
        console.log('✅ Job completed successfully!');
        
        const igMessageId = response.igMessageId || null;
        const sentAt = new Date();
        
        // Mark job as completed in the backend
        if (jobId) {
          const statusUpdated = await markJobAsCompleted(jobId, igMessageId, sentAt);
          if (!statusUpdated) {
            console.warn(`⚠️ Failed to update job status in backend, but DM was sent. Job ID: ${jobId}`);
            // Continue anyway - the job was sent, we just couldn't update the status
            // The job will be retried on next poll if it's still in the queue
          }
        } else {
          console.warn('⚠️ No jobId found in message, cannot update job status');
        }
        
        const { dmJobQueue = [], dmProcessedCount = 0 } = 
          await chrome.storage.local.get(['dmJobQueue', 'dmProcessedCount']);
        
        const newQueue = dmJobQueue.slice(1); // Remove first job
        const newProcessedCount = dmProcessedCount + 1;
        
        await chrome.storage.local.set({ 
          dmJobQueue: newQueue,
          dmProcessedCount: newProcessedCount
        });
        
        // Deactivate the tab after processing to keep it in background
        try {
          await chrome.tabs.update(tabId, { active: false });
          console.log('   Tab deactivated after processing');
        } catch (e) {
          // Ignore errors when deactivating
        }
        
        // Calculate random delay for next job (human-like behavior)
        const randomDelay = MIN_DELAY_MINS + (Math.random() * JITTER_MINS);
        console.log(`⏰ Next job scheduled in ${randomDelay.toFixed(2)} minutes`);
        console.log(`📊 Progress: ${newProcessedCount} completed, ${newQueue.length} remaining\n`);
        
        scheduleNextJob(randomDelay);
        return true;
      } else {
        // Error from content script - deactivate tab before retrying
        try {
          await chrome.tabs.update(tabId, { active: false });
        } catch (e) {
          // Ignore errors
        }
        
        console.error('❌ Content script reported error:', response.message || 'Unknown error');
        console.log('🔁 Retrying in', RETRY_DELAY_MINS, 'minute(s)...');
        scheduleNextJob(RETRY_DELAY_MINS);
        return true; // Message was delivered, but job failed
      }
      
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`   Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('❌ All retry attempts exhausted');

        // Mark job as FAILED in backend so it doesn't stay stuck as QUEUED forever
        if (jobId) {
          const failureReason = `Extension retries exhausted: ${error?.message || 'Unknown error'}`;
          const failedUpdated = await markJobAsFailed(jobId, failureReason, new Date());
          if (!failedUpdated) {
            console.warn(`⚠️ Failed to mark job as FAILED in backend. Job ID: ${jobId}`);
          }

          // Remove job from local queue so we can continue processing the rest
          const { dmJobQueue = [], dmProcessedCount = 0 } =
            await chrome.storage.local.get(['dmJobQueue', 'dmProcessedCount']);

          await chrome.storage.local.set({
            dmJobQueue: dmJobQueue.slice(1),
            dmProcessedCount: dmProcessedCount + 1,
          });

          // Deactivate tab before continuing
          try {
            await chrome.tabs.update(tabId, { active: false });
          } catch (e) {
            // Ignore errors
          }

          console.log('⏭️ Skipping failed job and continuing to next one...');
          scheduleNextJob(RETRY_DELAY_MINS);
          return true;
        }
        
        // Deactivate tab before returning
        try {
          await chrome.tabs.update(tabId, { active: false });
        } catch (e) {
          // Ignore errors
        }
        return false;
      }
    }
  }
  
  // If we get here, all retries failed - deactivate tab
  try {
    await chrome.tabs.update(tabId, { active: false });
  } catch (e) {
    // Ignore errors
  }
  
  return false;
}

/**
 * Find existing Instagram tab or create new one
 * Tab will be activated when needed for processing
 */
async function getOrCreateInstagramTab() {
  try {
    // First, try to find existing Instagram DM tab
    const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });
    
    if (tabs.length > 0) {
      console.log('📱 Found existing Instagram tab');
      const tab = tabs[0];
      
      // Check if tab is on the inbox URL
      if (!tab.url || !tab.url.includes('/direct/inbox/')) {
        console.log('   Tab not on inbox URL, redirecting to:', INSTAGRAM_DM_URL);
        await chrome.tabs.update(tab.id, { url: INSTAGRAM_DM_URL, pinned: true });
        await waitForTabLoad(tab.id);
      } else if (tab.status !== 'complete') {
        console.log('   Tab still loading, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return tab;
    }
    
    // No Instagram tab found, create one
    console.log('📱 Creating new Instagram tab...');
    const tab = await chrome.tabs.create({
      url: INSTAGRAM_DM_URL,
      pinned: true   // Pin it to keep it persistent
    });
    
    // Wait for the tab to fully load and content script to inject
    console.log('   Waiting for tab to load and content script to inject...');
    await waitForTabLoad(tab.id);
    
    return tab;
    
  } catch (error) {
    console.error('❌ Error in getOrCreateInstagramTab:', error);
    return null;
  }
}

/**
 * Wait for a tab to finish loading
 * @param {number} tabId - Tab ID to wait for
 * @returns {Promise<void>}
 */
async function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const checkStatus = async () => {
      try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.status === 'complete') {
          // Tab loaded, wait a bit more for content script injection
          setTimeout(resolve, 2000);
        } else {
          setTimeout(checkStatus, 500);
        }
      } catch (error) {
        // Tab might have been closed
        resolve();
      }
    };
    checkStatus();
  });
}

/**
 * Schedule the next job processing alarm
 * @param {number} delayInMinutes - Delay in minutes before next alarm
 */
function scheduleNextJob(delayInMinutes) {
  chrome.alarms.create('processNextDMJob', { 
    delayInMinutes: delayInMinutes 
  });
  console.log(`⏰ Job alarm set for ${delayInMinutes.toFixed(2)} minutes from now`);
}

/**
 * Get current queue status
 */
async function getDMQueueStatus() {
  const { dmJobQueue = [], dmProcessedCount = 0, isDMQueueActive = false } = 
    await chrome.storage.local.get(['dmJobQueue', 'dmProcessedCount', 'isDMQueueActive']);
  
  return {
    isProcessing: isDMQueueActive,
    remainingJobs: dmJobQueue.length,
    processedJobs: dmProcessedCount,
    totalJobs: dmProcessedCount + dmJobQueue.length
  };
}

// ---------------------------------------------------------------------------
// Install hook
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  console.log('Socialora Instagram Session Grabber installed');
  console.log('⏳ Job polling will start after user connects Instagram account');
  console.log(`⚙️ Job processing config: MIN_DELAY=${MIN_DELAY_MINS} min, MAX_JITTER=${JITTER_MINS} min`);
});

// Set isDMQueueActive to false when browser closes
chrome.runtime.onSuspend.addListener(() => {
  console.log('Browser closing, deactivating DM queue...');
  chrome.storage.local.set({ isDMQueueActive: false }, () => {
    console.log('DM queue deactivated');
  });
});

// Also set up polling on service worker startup (in case it was terminated)
chrome.runtime.onStartup.addListener(async () => {
  console.log('Socialora service worker started');
  
  // Always set isDMQueueActive to false on startup - user must click PRESS TO START
  chrome.storage.local.set({ isDMQueueActive: false }, () => {
    console.log('DM queue deactivated on startup (user must click PRESS TO START)');
  });
  
  // Check if user is already connected
  const state = await new Promise((resolve) => {
    chrome.storage.local.get(['socialora_connection_state', 'socialora_connected_user'], (data) => resolve(data));
  });
  
  const isConnected = state.socialora_connection_state === 'connected' && state.socialora_connected_user;
  
  if (isConnected) {
    console.log('User is already connected, but job polling will not start until user clicks PRESS TO START');
  } else {
    console.log('User not connected, job polling will start after connection');
  }
});



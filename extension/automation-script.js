// // automation-script.js

// // 1. Listen for commands from background.js
// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     if (request.action === "EXECUTE_COLD_DM") {
//         const jobId = request.jobId || null;
//         try {
//             // Prevent duplicate sends for the same jobId
//             if (jobId && globalThis.__socialora_last_sent_job_id === jobId) {
//                 console.log('automation-script: job already processed, skipping', jobId);
//                 sendResponse({ status: 'skipped', reason: 'duplicate', jobId });
//                 return true;
//             }

//             // Also avoid sending the same message repeatedly (safety window)
//             const lastMsg = globalThis.__socialora_last_sent_message || null;
//             const lastTs = globalThis.__socialora_last_sent_ts || 0;
//             const now = Date.now();
//             if (lastMsg === request.message && now - lastTs < 60_000) {
//                 console.log('automation-script: same message sent recently, skipping to avoid duplicate');
//                 sendResponse({ status: 'skipped', reason: 'recent_duplicate', jobId });
//                 return true;
//             }

//             console.log("🤖 Starting Cold DM Sequence for:", request.username, { jobId });
//             await performColdDmSequence(request.message, request.username || null);

//             // Mark as processed
//             try {
//                 if (jobId) globalThis.__socialora_last_sent_job_id = jobId;
//                 globalThis.__socialora_last_sent_message = request.message;
//                 globalThis.__socialora_last_sent_ts = Date.now();
//             } catch (e) {}

//             sendResponse({ status: "success", jobId });
//         } catch (error) {
//             console.error("❌ DM Failed:", error);
//             sendResponse({ status: "error", message: error.toString(), jobId });
//         }
//     }
//     return true; // Keeps the message channel open for async response
// });

// async function performColdDmSequence(messageText, targetUsername = null) {
//     // Prevent concurrent runs from sending duplicates
//     if (globalThis.__socialora_sending_in_progress) {
//         console.log('performColdDmSequence: sending already in progress, skipping to avoid duplicate');
//         return;
//     }
//     globalThis.__socialora_sending_in_progress = true;
//     // ensure flag cleared after a safety window
//     const clearFlagTimeout = setTimeout(() => { try { globalThis.__socialora_sending_in_progress = false; } catch (e) {} }, 10000);
//     // Phase 1: We are on the Profile Page. Find and click "Message"
//     if (isProfilePage()) {
//         console.log("📍 Detected Profile Page");
//         const msgBtn = await waitForElement('div[role="button"], button', (el) => (el.innerText || '').trim() === "Message");
        
//         if (!msgBtn) throw new Error("Could not find Message button (User might be private or already follows you)");
        
//         msgBtn.click();
//         console.log("🖱️ Clicked Message button");
        
//         // Wait for redirection to Inbox
//         await sleep(3000); 
//     } else {
//         // Not on profile page; attempt to extract username from URL if not provided
//         if (!targetUsername) {
//             try {
//                 const p = (globalThis.location && globalThis.location.pathname) || window.location.pathname;
//                 const parts = p.split('/').filter(Boolean);
//                 if (parts.length > 0) targetUsername = parts[0];
//             } catch (e) {}
//         }
//     }

//     // Phase 2: We are (hopefully) in the Inbox. If we arrived via profile "Message" click, we're in chat.
//     // If not, and there was no Message button (private / disabled), try opening the DM inbox and search for the user.
//     // If chatBox isn't found, try the direct/inbox search flow.
//     // Instagram chat input is a contenteditable div
//     console.log("📍 Looking for Chat Box...");
//     const chatBoxSelector = 'div[contenteditable="true"][role="textbox"]';
//     const chatBox = await waitForElement(chatBoxSelector);
    
//     if (!chatBox) {
//         console.log('Chat box not found after profile navigation — attempting direct/inbox search flow');
//         // Use username or user id to search in inbox
//         const uname = targetUsername || '';
//         const opened = await openDmAndSelectUser(uname);
//         if (!opened) throw new Error('Failed to open DM chat via inbox search');
//         // Wait for chat box again
//         await sleep(800);
//     }

//     // Re-query chat box
//     const chatBox2 = await waitForElement(chatBoxSelector, null, 5000);
//     if (!chatBox2) throw new Error("Chat box not found");
//     const chatBoxFinal = chatBox2;

//     // Phase 3: Human-like Typing (The "React Bypass")
//         console.log("⌨️ Setting message into chat box (exact)");
//         try {
//             // Clear existing content first to avoid duplicates
//             try {
//                 const nativeClear = Object.getOwnPropertyDescriptor(window.HTMLDivElement.prototype, 'innerText')?.set || Object.getOwnPropertyDescriptor(Element.prototype, 'textContent')?.set;
//                 if (nativeClear) nativeClear.call(chatBox, '');
//                 else chatBox.innerText = '';
//                 chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
//             } catch (e) {
//                 console.warn('Failed to clear chat box before set:', e);
//             }

//                 const placedOk = await setChatBoxText(chatBoxFinal, messageText);

//                     // Verify what was placed
//                     await sleep(60);
//                     const placed = (chatBoxFinal.innerText || chatBoxFinal.textContent || '').trim();
//                     console.log('Chat box content after set:', placed.slice(0, 500), { placedOk });
//         } catch (err) {
//             console.error('Failed to place exact text into chat box, falling back to simple typing', err);
//             // As a last resort, do a simple single-pass character typing (no aggressive humanization)
//             for (const ch of messageText) {
//                 try { document.execCommand('insertText', false, ch); } catch (_) { }
//             }
//             await sleep(60);
//             console.log('Chat box content after fallback typing:', (chatBoxFinal.innerText || chatBoxFinal.textContent || '').slice(0, 500));
//         }

//     // Phase 4: Click Send
//     console.log("🚀 Sending...");
//     await sleep(1000); // Pause before sending like a human
    
//     // The "Send" button usually appears only after text is typed.
//     // It often has the text "Send" or is an SVG icon. 
//     // We look for a button that is distinct from the "Voice Clip" mic icon.
//     const sendButton = await waitForElement('div[role="button"]', (el) => {
//         return el.innerText === "Send" || el.querySelector('svg[aria-label="Send"]');
//     });

//     if (sendButton) {
//         try {
//             // Click only once
//             sendButton.click();
//             console.log("✅ Message Sent! (button click)");
//         } catch (e) {
//             console.warn('Send button click failed, will try Enter key', e);
//         }
//     } else {
//         // Fallback: Press "Enter" key
//         const enterEvent = new KeyboardEvent('keydown', {
//             bubbles: true, cancelable: true, keyCode: 13
//         });
//         chatBox.dispatchEvent(enterEvent);
//         console.log("✅ Sent via Enter Key");
//     }

//     // Clear in-progress flag now that we attempted send
//     try { globalThis.__socialora_sending_in_progress = false; } catch (e) {}
//     clearTimeout(clearFlagTimeout);
// }

// // Open direct/inbox and search for username, click first result. Returns true if chat opened.
// async function openDmAndSelectUser(username) {
//     try {
//         if (!username) {
//             console.warn('openDmAndSelectUser: no username provided');
//             return false;
//         }
//         const base = (globalThis.location && globalThis.location.origin) || window.location.origin;
//         const inboxUrl = `${base}/direct/inbox/`;
//         try { globalThis.location.href = inboxUrl; } catch (e) { window.location.href = inboxUrl; }

//         // Wait for inbox to load and search input to appear
//         const searchSelector = 'input[placeholder]';
//         const searchInput = await waitForElement(searchSelector, (el) => (el.placeholder || '').toLowerCase().includes('search'));
//         if (!searchInput) {
//             console.warn('openDmAndSelectUser: search input not found');
//             return false;
//         }

//         // Enter username into search input
//         try {
//             searchInput.focus();
//             searchInput.value = username;
//             searchInput.dispatchEvent(new Event('input', { bubbles: true }));
//         } catch (e) {
//             console.warn('openDmAndSelectUser: failed to set search input', e);
//             try { document.execCommand('insertText', false, username); } catch (_) {}
//         }

//         // Wait for results list — look for any element containing username text
//         const result = await waitForElement('div[role="button"]', (el) => (el.innerText || '').toLowerCase().includes(username.toLowerCase()), 8000);
//         if (!result) {
//             console.warn('openDmAndSelectUser: no search result matched username');
//             return false;
//         }

//         // Click the matched result to open chat
//         try {
//             result.click();
//             console.log('openDmAndSelectUser: clicked search result for', username);
//             return true;
//         } catch (e) {
//             console.warn('openDmAndSelectUser: failed to click result', e);
//             return false;
//         }
//     } catch (e) {
//         console.error('openDmAndSelectUser error', e);
//         return false;
//     }
// }

// // 1. Human Typing Simulation
// // This is crucial. If you just set innerText, React won't detect the change.
// // We use 'insertText' command which triggers all necessary browser events.
// async function simulateHumanTyping(element, text) {
//     element.focus();

//     // Type character by character as a last-resort fallback
//     for (const char of text) {
//         try {
//             document.execCommand('insertText', false, char);
//         } catch (e) {
//             // If execCommand fails, append to innerText and dispatch input
//             try {
//                 const current = element.innerText || '';
//                 const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLDivElement.prototype, 'innerText')?.set || Object.getOwnPropertyDescriptor(Element.prototype, 'textContent')?.set;
//                 if (nativeSet) nativeSet.call(element, current + char);
//                 else element.innerText = current + char;
//                 element.dispatchEvent(new InputEvent('input', { bubbles: true }));
//             } catch (_) {}
//         }

//         // Random delay between keystrokes (30ms to 90ms)
//         const delay = Math.floor(Math.random() * 60) + 30;
//         await sleep(delay);
//     }
// }

// // Robust setter: try several approaches to place the exact text into the contenteditable
// async function setChatBoxText(element, text) {
//     element.focus();

//     // 1) Try insert entire text in one operation (document.execCommand)
//     try {
//         const ok = document.execCommand('insertText', false, text);
//         // execCommand may return false even if it worked; verify content
//         await sleep(50);
//         const placed = (element.innerText || element.textContent || '').trim();
//         if (placed && placed.length >= Math.max(1, Math.min(placed.length, text.length))) {
//             console.log('setChatBoxText: insertText placed text (len)', placed.length);
//             element.dispatchEvent(new InputEvent('input', { bubbles: true }));
//             return true;
//         }
//     } catch (e) {
//         console.debug('setChatBoxText: execCommand insertText failed', e);
//     }

//     // 2) Try Clipboard API -> paste event (best-effort)
//     try {
//         if (navigator.clipboard && navigator.clipboard.writeText) {
//             await navigator.clipboard.writeText(text);
//             // create a paste event with clipboardData if supported
//             try {
//                 const pasteEvent = new ClipboardEvent('paste', {
//                     bubbles: true,
//                     cancelable: true,
//                     clipboardData: new DataTransfer(),
//                 });
//                 pasteEvent.clipboardData.setData('text/plain', text);
//                 element.dispatchEvent(pasteEvent);
//                 await sleep(50);
//                 element.dispatchEvent(new InputEvent('input', { bubbles: true }));
//                 const after = (element.innerText || element.textContent || '');
//                 if (after.includes(text.slice(0, Math.min(10, text.length)))) {
//                     console.log('setChatBoxText: pasted via clipboard');
//                     return true;
//                 }
//             } catch (e) {
//                 // some browsers disallow constructing ClipboardEvent — ignore
//                 console.debug('setChatBoxText: paste event failed', e);
//             }
//         }
//     } catch (e) {
//         console.debug('setChatBoxText: clipboard write failed', e);
//     }

//     // 3) Fallback: directly set innerText/textContent and dispatch input events
//     try {
//         const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLDivElement.prototype, 'innerText')?.set || Object.getOwnPropertyDescriptor(Element.prototype, 'textContent')?.set;
//         if (nativeSet) nativeSet.call(element, text);
//         else element.innerText = text;
//         // Move caret to end
//         const range = document.createRange();
//         range.selectNodeContents(element);
//         range.collapse(false);
//         const sel = window.getSelection();
//         if (sel) {
//             sel.removeAllRanges();
//             sel.addRange(range);
//         }
//         element.dispatchEvent(new InputEvent('input', { bubbles: true }));
//         await sleep(30);
//         console.log('setChatBoxText: set innerText and dispatched input');
//         return true;
//     } catch (e) {
//         console.warn('setChatBoxText: direct set failed', e);
//     }

//     // If everything fails, throw so caller can fallback to char-typing
//     throw new Error('Failed to set chat box text via all methods');
// }

// // 2. Smart Wait Function
// // Waits for an element to appear in the DOM (up to timeout)
// function waitForElement(selector, predicate = null, timeout = 10000) {
//     return new Promise((resolve) => {
//         const startTime = Date.now();
        
//         const check = () => {
//             const elements = document.querySelectorAll(selector);
//             for (const el of elements) {
//                 if (!predicate || predicate(el)) {
//                     resolve(el);
//                     return;
//                 }
//             }
            
//             if (Date.now() - startTime > timeout) {
//                 resolve(null);
//             } else {
//                 requestAnimationFrame(check);
//             }
//         };
        
//         check();
//     });
// }

// function isProfilePage() {
//     return !window.location.href.includes('/direct/');
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// automation-script.js

// 1. Listen for commands from background.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "EXECUTE_COLD_DM") {
        const jobId = request.jobId || null;
        try {
            // Prevent duplicate sends for the same jobId
            if (jobId && globalThis.__socialora_last_sent_job_id === jobId) {
                console.log('automation-script: job already processed, skipping', jobId);
                sendResponse({ status: 'skipped', reason: 'duplicate', jobId });
                return true;
            }

            // Safety window check
            const lastMsg = globalThis.__socialora_last_sent_message || null;
            const lastTs = globalThis.__socialora_last_sent_ts || 0;
            const now = Date.now();
            if (lastMsg === request.message && now - lastTs < 60_000) {
                console.log('automation-script: same message sent recently, skipping');
                sendResponse({ status: 'skipped', reason: 'recent_duplicate', jobId });
                return true;
            }

            console.log("🤖 Starting Cold DM Sequence for:", request.username, { jobId });
            
            // PASS USERNAME HERE so we can use it for the fallback search
            await performColdDmSequence(request.message, request.username);

            // Mark as processed
            try {
                if (jobId) globalThis.__socialora_last_sent_job_id = jobId;
                globalThis.__socialora_last_sent_message = request.message;
                globalThis.__socialora_last_sent_ts = Date.now();
            } catch (e) {}

            sendResponse({ status: "success", jobId });
        } catch (error) {
            console.error("❌ DM Failed:", error);
            sendResponse({ status: "error", message: error.toString(), jobId });
        }
    }
    return true; 
});

async function performColdDmSequence(messageText, targetUsername) {
    // Prevent concurrent runs
    if (globalThis.__socialora_sending_in_progress) {
        console.log('performColdDmSequence: sending already in progress, skipping');
        return;
    }
    globalThis.__socialora_sending_in_progress = true;
    
    // Safety timeout to clear flag
    const clearFlagTimeout = setTimeout(() => { try { globalThis.__socialora_sending_in_progress = false; } catch (e) {} }, 15000);

    try {
        let chatOpened = false;

        // ============================================================
        // PHASE 1: Try Standard Profile "Message" Button
        // ============================================================
        if (isProfilePage()) {
            console.log("📍 Detected Profile Page. Looking for Message button...");
            
            // Short timeout (3s) to find button - if not found quickly, we switch to fallback
            const msgBtn = await waitForElement('div[role="button"], button', (el) => el.innerText === "Message", 3000);
            
            if (msgBtn) {
                msgBtn.click();
                console.log("🖱️ Clicked Profile Message button");
                chatOpened = true;
                await sleep(3000); // Wait for redirection
            } else {
                console.warn("⚠️ 'Message' button not found (Private/Not Followed). Switching to Inbox Search Fallback.");
            }
        }

        // ============================================================
        // PHASE 1.5: Fallback - Search via Inbox
        // ============================================================
        if (!chatOpened) {
            console.log("🔄 Executing Inbox Search Fallback...");

            // 1. Navigate to Inbox (Click Link to preserve SPA state, avoid full reload)
            // Look for the Messenger icon in the sidebar
            const inboxLink = await waitForElement('a[href^="/direct/inbox/"]', null, 2000);
            if (inboxLink) {
                inboxLink.click();
            } else {
                // If link not found, force location (might kill script, but last resort)
                if (!window.location.href.includes('/direct/inbox/')) {
                    window.location.href = 'https://www.instagram.com/direct/inbox/';
                    await sleep(3000); 
                }
            }
            
            // Wait until we are definitely on the inbox page
            await waitForElement('svg[aria-label="New message"]', null, 5000);
            console.log("📍 Arrived at Inbox");

            // 2. Click "New Message" (Pencil Icon)
            const newMsgBtn = await waitForElement('div[role="button"] svg[aria-label="New message"]');
            if (!newMsgBtn) throw new Error("Could not find 'New Message' pencil icon");
            
            // Click the button wrapping the SVG
            newMsgBtn.closest('div[role="button"]').click();
            console.log("🖱️ Clicked New Message Icon");

            // 3. Wait for Modal & Search Input
            // Instagram search box usually has name="queryBox" or placeholder "Search..."
            const searchInput = await waitForElement('input[name="queryBox"], input[placeholder="Search..."]');
            if (!searchInput) throw new Error("Could not find Search input in New Message modal");

            // 4. Type the Username
            console.log(`⌨️ Searching for user: ${targetUsername}`);
            await simulateHumanTyping(searchInput, targetUsername);
            await sleep(2000); // Wait for results

            // 5. Select the User from Results
            // We look for a list item that contains the exact username
            // The result usually has a circle selection div or the username text
            const userResult = await waitForElement('div[role="button"]', (el) => {
                // Check if this button contains the username text visually
                return el.innerText.includes(targetUsername);
            });

            if (!userResult) throw new Error(`User ${targetUsername} not found in search results`);
            
            userResult.click();
            console.log("🖱️ Selected user from list");
            await sleep(1000);

            // 6. Click "Chat" / "Next" (Top right of modal)
            // It is usually a div with role="button" containing "Chat" or "Next"
            const nextBtn = await waitForElement('div[role="button"]', (el) => {
                const txt = el.innerText;
                return txt === "Chat" || txt === "Next";
            });

            if (!nextBtn) throw new Error("Could not find 'Chat/Next' button to open conversation");
            
            nextBtn.click();
            console.log("🖱️ Entered Chat");
            await sleep(3000); // Wait for chat to load
        }

        // ============================================================
        // PHASE 2: Find Chat Box
        // ============================================================
        console.log("📍 Looking for Chat Box...");
        const chatBoxSelector = 'div[contenteditable="true"][role="textbox"]';
        const chatBox = await waitForElement(chatBoxSelector);
        
        if (!chatBox) throw new Error("Chat box not found (Privacy settings might restrict DMs)");

        // ============================================================
        // PHASE 3: Human-like Typing
        // ============================================================
        console.log("⌨️ Setting message into chat box...");
        
        // Clear box first
        try {
            const nativeClear = Object.getOwnPropertyDescriptor(window.HTMLDivElement.prototype, 'innerText')?.set || Object.getOwnPropertyDescriptor(Element.prototype, 'textContent')?.set;
            if (nativeClear) nativeClear.call(chatBox, '');
            else chatBox.innerText = '';
            chatBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
        } catch (e) {}

        // Type Message
        try {
            await setChatBoxText(chatBox, messageText);
            await sleep(60);
        } catch (err) {
            console.error('Text set failed, using fallback typing', err);
            for (const ch of messageText) {
                try { document.execCommand('insertText', false, ch); } catch (_) { }
            }
        }

        // ============================================================
        // PHASE 4: Click Send
        // ============================================================
        console.log("🚀 Sending...");
        await sleep(Math.random() * 1000 + 500); // Human pause

        const sendButton = await waitForElement('div[role="button"]', (el) => {
            return el.innerText === "Send" || el.querySelector('svg[aria-label="Send"]');
        }, 3000);

        if (sendButton) {
            sendButton.click();
            console.log("✅ Message Sent! (button click)");
        } else {
            // Fallback: Enter Key
            const enterEvent = new KeyboardEvent('keydown', {
                bubbles: true, cancelable: true, keyCode: 13
            });
            chatBox.dispatchEvent(enterEvent);
            console.log("✅ Sent via Enter Key");
        }

    } catch (e) {
        throw e; // Propagate to main handler
    } finally {
        // Always cleanup
        globalThis.__socialora_sending_in_progress = false;
        clearTimeout(clearFlagTimeout);
    }
}

// ---------------------------------------------------
// HELPERS
// ---------------------------------------------------

async function simulateHumanTyping(element, text) {
    element.focus();
    for (const char of text) {
        document.execCommand('insertText', false, char);
        await sleep(Math.floor(Math.random() * 50) + 30);
    }
}

async function setChatBoxText(element, text) {
    element.focus();
    // 1. Try insertText
    try {
        if (document.execCommand('insertText', false, text)) {
            element.dispatchEvent(new InputEvent('input', { bubbles: true }));
            return true;
        }
    } catch (e) {}

    // 2. Try Clipboard (Best for complex text/emojis)
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true, cancelable: true, clipboardData: new DataTransfer()
            });
            pasteEvent.clipboardData.setData('text/plain', text);
            element.dispatchEvent(pasteEvent);
            element.dispatchEvent(new InputEvent('input', { bubbles: true }));
            return true;
        }
    } catch (e) {}

    // 3. Direct Set
    const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLDivElement.prototype, 'innerText')?.set;
    if (nativeSet) nativeSet.call(element, text);
    else element.innerText = text;
    element.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function waitForElement(selector, predicate = null, timeout = 10000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const check = () => {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                if (!predicate || predicate(el)) {
                    resolve(el);
                    return;
                }
            }
            if (Date.now() - startTime > timeout) resolve(null);
            else requestAnimationFrame(check);
        };
        check();
    });
}

function isProfilePage() {
    return !window.location.href.includes('/direct/');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
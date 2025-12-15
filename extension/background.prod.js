// BulkDM Background Service Worker - PRODUCTION VERSION
// Handles cookie access and communication

// PRODUCTION URL - Hardcoded for Production
const BACKEND_URL = 'https://bulkdm-saas.netlify.app'; // Frontend proxies to backend API

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('BulkDM Instagram Session Grabber (PRODUCTION) installed');
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBackendUrl') {
    sendResponse({ url: BACKEND_URL });
  }
});


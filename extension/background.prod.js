// BulkDM Background Service Worker - PRODUCTION VERSION
// Handles cookie access and communication

// PRODUCTION URL - Hardcoded for Production
const APP_URL = 'https://bulkdm-saas.netlify.app';
// Extension uses Netlify proxy routes which forward to Railway backend

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('BulkDM Instagram Session Grabber (PRODUCTION) installed');
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBackendUrl') {
    sendResponse({ url: APP_URL });
  }
});


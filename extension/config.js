// BulkDM Extension Configuration
// Single source of truth for all URLs and settings

const CONFIG = {
  // Environment detection: 'auto', 'production', or 'local'
  ENV_MODE: 'local', // 'auto' detects automatically, 'production' or 'local' forces a mode
  
  // Production URLs (Vercel deployment)
  PRODUCTION: {
    APP_URL: 'https://instagram-dm-saas-h94m.vercel.app',
    // Since we're using Next.js API routes, backend is on the same domain
    BACKEND_URL: 'https://instagram-dm-saas-h94m.vercel.app',
  },
  
  // Development URLs (localhost)
  LOCAL: {
    APP_URL: 'http://localhost:3003',
    // Since we're using Next.js API routes, backend is on the same domain
    BACKEND_URL: 'http://localhost:3003',
  },
  
  // Version
  VERSION: '1.0.1',
  
  // Get current environment configuration
  getCurrent() {
    return new Promise((resolve) => {
      // Check chrome storage for manual override
      chrome.storage.sync.get(['envMode', 'appUrl', 'backendUrl'], (result) => {
        // Manual URL override takes precedence
        if (result.appUrl && result.backendUrl) {
          resolve({
            APP_URL: result.appUrl,
            BACKEND_URL: result.backendUrl,
            mode: 'custom',
            isProduction: false
          });
          return;
        }
        
        // Check for forced mode
        const envMode = result.envMode || this.ENV_MODE;
        
        if (envMode === 'production') {
          resolve({
            ...this.PRODUCTION,
            mode: 'production',
            isProduction: true
          });
          return;
        }
        
        if (envMode === 'local') {
          resolve({
            ...this.LOCAL,
            mode: 'local',
            isProduction: false
          });
          return;
        }
        
        // Auto-detect (default)
        // Default to production for extension context
        // Users can manually switch to local via chrome.storage
        resolve({
          ...this.PRODUCTION,
          mode: 'production',
          isProduction: true
        });
      });
    });
  },
  
  // Set environment mode
  setMode(mode) {
    chrome.storage.sync.set({ envMode: mode });
  },
  
  // Set custom URLs
  setCustomUrls(appUrl, backendUrl) {
    chrome.storage.sync.set({ appUrl, backendUrl });
  },
  
  // Clear custom URLs (use auto-detect)
  clearCustomUrls() {
    chrome.storage.sync.remove(['appUrl', 'backendUrl']);
  }
};

// Export for use in other files
// Support both popup (window) and service worker (self) contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
} else if (typeof self !== 'undefined') {
  self.CONFIG = CONFIG;
}

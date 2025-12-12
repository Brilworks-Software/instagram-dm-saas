// DMflow Extension Configuration
// Update these URLs when deploying to production

const CONFIG = {
  // Frontend URL (Netlify deployment)
  APP_URL: process.env.EXTENSION_APP_URL || 'https://your-app.netlify.app',
  
  // Backend URL (Netlify serverless functions or separate backend)
  BACKEND_URL: process.env.EXTENSION_BACKEND_URL || 'https://your-backend.netlify.app',
  
  // Version
  VERSION: '1.0.0'
};

// For development, check if we're in localhost context
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  CONFIG.APP_URL = 'http://localhost:3000';
  CONFIG.BACKEND_URL = 'http://localhost:3001';
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}


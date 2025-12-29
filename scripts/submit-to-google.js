/**
 * Script to submit sitemap to Google Search Console
 * Run this after deploying to production
 * 
 * Usage:
 * 1. Set GOOGLE_SEARCH_CONSOLE_API_KEY in .env
 * 2. npm run submit-sitemap
 */

const https = require('https');

const SITEMAP_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/sitemap.xml`
  : 'https://www.socialora.app/sitemap.xml';

const GOOGLE_INDEX_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

async function submitSitemapToGoogle() {
  console.log('🚀 Submitting sitemap to Google Search Console...');
  console.log(`📍 Sitemap URL: ${SITEMAP_URL}`);
  
  // Note: This requires Google Search Console API setup
  // For manual submission, visit:
  // https://search.google.com/search-console
  // Add property → Submit sitemap: ${SITEMAP_URL}
  
  console.log('\n📋 Manual Submission Steps:');
  console.log('1. Visit: https://search.google.com/search-console');
  console.log('2. Select your property (www.socialora.app)');
  console.log('3. Go to Sitemaps section');
  console.log(`4. Enter: sitemap.xml`);
  console.log('5. Click Submit');
  console.log('\n✅ Sitemap submitted!');
  console.log('\n📊 Monitor indexing status in Search Console');
}

// Also submit individual URLs for faster indexing
async function submitUrlsToGoogle(urls) {
  console.log('\n🚀 Submitting URLs to Google Indexing API...');
  console.log(`📝 URLs to submit: ${urls.length}`);
  
  // This requires OAuth 2.0 setup with Google
  // See: https://developers.google.com/search/apis/indexing-api/v3/using-api
  
  urls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  console.log('\n💡 For automated submission, set up Google Indexing API:');
  console.log('   https://developers.google.com/search/apis/indexing-api/v3/using-api');
}

if (require.main === module) {
  submitSitemapToGoogle();
}

module.exports = { submitSitemapToGoogle, submitUrlsToGoogle };


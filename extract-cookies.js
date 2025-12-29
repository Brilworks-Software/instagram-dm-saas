// Helper script to extract Instagram cookies from JSON format
// Usage: node extract-cookies.js < cookies.json

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = '';

rl.on('line', (line) => {
  input += line + '\n';
});

rl.on('close', () => {
  try {
    const cookies = JSON.parse(input);
    
    // Extract required cookies
    const sessionid = cookies.find(c => c.name === 'sessionid')?.value;
    const dsUserId = cookies.find(c => c.name === 'ds_user_id')?.value;
    const csrfToken = cookies.find(c => c.name === 'csrftoken')?.value;
    const igDid = cookies.find(c => c.name === 'ig_did')?.value;
    const mid = cookies.find(c => c.name === 'mid')?.value;
    const rur = cookies.find(c => c.name === 'rur')?.value;
    
    console.log('\n✅ Extracted Instagram Service Cookies:\n');
    console.log('Add these to your .env.local file:\n');
    console.log('# Instagram Service Account Cookies');
    console.log(`INSTAGRAM_SERVICE_SESSION_ID=${sessionid || 'NOT_FOUND'}`);
    console.log(`INSTAGRAM_SERVICE_DS_USER_ID=${dsUserId || 'NOT_FOUND'}`);
    console.log(`INSTAGRAM_SERVICE_CSRF_TOKEN=${csrfToken || 'NOT_FOUND'}`);
    
    if (igDid) {
      console.log(`INSTAGRAM_SERVICE_IG_DID=${igDid}`);
    }
    if (mid) {
      console.log(`INSTAGRAM_SERVICE_MID=${mid}`);
    }
    if (rur) {
      // Remove quotes and escape sequences from rur
      const cleanRur = rur.replace(/^"|"$/g, '').replace(/\\054/g, ',');
      console.log(`INSTAGRAM_SERVICE_RUR=${cleanRur}`);
    }
    
    console.log('\n');
    
    if (!sessionid || !dsUserId || !csrfToken) {
      console.error('❌ Missing required cookies!');
      process.exit(1);
    } else {
      console.log('✅ All required cookies found!');
    }
  } catch (error) {
    console.error('❌ Error parsing JSON:', error.message);
    process.exit(1);
  }
});


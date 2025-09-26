// Test script to validate API keys
const API_KEYS = [
  'AIzaSyAhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX4',
  'AIzaSyCl2g6J6ej6wcwYPOhBLxc-GeQ7AErUnZ4', 
  'AIzaSyCB8JiHaioipkdk00nhaDsHyUfN2NBNQCw',
  'AIzaSyB95K-gGGH-c_lGHI2EU9ljsl8JqpIn5mY',
  'AIzaSyC_pDan2-XthBfRgGodPuVW-d-8EUCSB6o',
  'AIzaSyC5-My71aQR6K2HRXhZcAE7sUhXhZcFU0Q'
];

async function testApiKey(key, index) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'API key test successful'"
          }]
        }]
      })
    });

    if (response.ok) {
      console.log(`✅ API Key ${index + 1}: VALID`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ API Key ${index + 1}: FAILED - ${response.status} - ${error.substring(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Key ${index + 1}: ERROR - ${error.message}`);
    return false;
  }
}

async function testAllKeys() {
  console.log('🔍 Testing all 6 API keys...\n');
  
  const results = [];
  for (let i = 0; i < API_KEYS.length; i++) {
    const isValid = await testApiKey(API_KEYS[i], i);
    results.push({ index: i + 1, key: API_KEYS[i], valid: isValid });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n📊 SUMMARY:');
  const validKeys = results.filter(r => r.valid);
  const invalidKeys = results.filter(r => !r.valid);
  
  console.log(`✅ Valid keys: ${validKeys.length}/6`);
  validKeys.forEach(r => console.log(`   Key ${r.index}: ${r.key.substring(0, 20)}...`));
  
  console.log(`❌ Invalid keys: ${invalidKeys.length}/6`);
  invalidKeys.forEach(r => console.log(`   Key ${r.index}: ${r.key.substring(0, 20)}...`));
  
  if (validKeys.length === 0) {
    console.log('\n🚨 CRITICAL: No valid API keys found!');
  } else if (validKeys.length < 3) {
    console.log('\n⚠️ WARNING: Only a few valid keys. Consider getting more API keys.');
  } else {
    console.log('\n✅ Good: Multiple valid API keys available.');
  }
}

testAllKeys();

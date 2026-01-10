
const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('gemini_test_output.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function(d) {
  logFile.write(util.format(d) + '\n');
  logStdout.write(util.format(d) + '\n');
};
console.error = function(d) {
  logFile.write(util.format(d) + '\n');
  logStdout.write(util.format(d) + '\n');
};

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables.');
    return;
  }

  // Mask key in logs
  const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
  console.log('✅ Found GEMINI_API_KEY: ' + maskedKey);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test listing models first to see what's available
    // Note: older SDKs might not support listModels directly or easy usage.
    // We will stick to trying a generation with the standard recommended model.
    // If this fails with 404, we know the key might be invalid or project issue.
    
    // Trying gemini-pro as fallback
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Testing generateContent with gemini-pro...');
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Test Successful!');
    console.log('Response: ' + text);
  } catch (error) {
    console.error('❌ API Test Failed: ' + error.toString());
    if (error.response) console.error('Response: ' + JSON.stringify(error.response, null, 2));
  }
}

testGemini();

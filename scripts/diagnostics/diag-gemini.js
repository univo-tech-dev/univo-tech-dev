
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function diagnose() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('API Key missing');
    return;
  }

  console.log('Testing with key: ' + apiKey.substring(0, 8) + '...');

  try {
    // Attempting to fetch model list using direct fetch (since SDK listing varies)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      fs.writeFileSync('diag_models.json', JSON.stringify(data.error, null, 2));
      console.error('❌ API Error written to diag_models.json');
    } else {
      fs.writeFileSync('diag_models.json', JSON.stringify(data.models, null, 2));
      console.log('✅ Found ' + data.models.length + ' models. List written to diag_models.json');
    }
  } catch (e) {
    console.error('❌ Network/System Error: ' + e.message);
  }
}

diagnose();

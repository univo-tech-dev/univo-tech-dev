
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testPollGeneration() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ API Key missing in .env.local');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    Sen ODTÜ kampüs gazetesinin yapay zeka editörüsün.
    Şu anki tarih: ${new Date().toLocaleDateString('tr-TR')}.
    Bugün ODTÜ'de ne konuşuluyor olabilir? Tek bir anket sorusu oluştur.
    
    Çıktı Formatı (JSON):
    {
      "question": "Metin",
      "options": ["A", "B", "C"]
    }
  `;

  console.log('🚀 Sending request to Gemini (1.5-flash)...');

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('✅ API Response Received:');
    console.log(text);
    
    // Test JSON parseable
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    JSON.parse(cleanedText);
    console.log('✅ JSON is valid!');
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) console.error('Response details:', JSON.stringify(error.response, null, 2));
  }
}

testPollGeneration();

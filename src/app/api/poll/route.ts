import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Gemini
// Ensure you have GEMINI_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Set revalidation to 0 since we handle caching manually via DB/Logic
export const revalidate = 0;

const FALLBACK_POLLS: Record<string, { question: string, options: string[] }[]> = {
    metu: [
        { question: "ODTÜ'de kütüphane çalışma saatleri (7/24) yeterli mi?", options: ["Evet", "Hayır, yetersiz", "Haftasonu artırılmalı"] },
        { question: "Yemekhane menüsünde vegan seçenekler artırılmalı mı?", options: ["Kesinlikle", "Mevcut durum iyi", "Gereksiz"] },
        { question: "Ring seferlerinin sıklığı ve güzergahları verimli mi?", options: ["Verimli", "Yetersiz", "Güzergah değişmeli"] },
        { question: "Kampüs kedileri için yapılan 'Kedi Evi' projesini nasıl buluyorsunuz?", options: ["Harika", "Daha iyi olabilir", "Gereksiz"] },
        { question: "Bahar şenliği bütçesi topluluklara mı sanatçılara mı ayrılmalı?", options: ["Topluluklara", "Sanatçılara", "Eşit olmalı"] }
    ],
    bilkent: [
        { question: "Bilkent kütüphanesi sınav döneminde 7/24 açık kalmalı mı?", options: ["Evet, kesinlikle", "Gerek yok", "Sadece A binası"] },
        { question: "Millet Berberi'ndeki sıra bekleme süreleri nasıl?", options: ["Çok uzun", "Normal", "Daha hızlı olmalı"] },
        { question: "Ring servislerinin güzergahı (Merkez-Doğu) yeterli mi?", options: ["Yeterli", "Doğu kampüs artırılmalı", "Ek sefer gelmeli"] },
        { question: "Bilkent Odeon konserlerini ne sıklıkla takip ediyorsunuz?", options: ["Her zaman", "Ara sıra", "Hiç gitmedim"] },
        { question: "Moodle üzerindeki ödev teslim süreçleri verimli mi?", options: ["Evet", "Hayır, karışık", "Geliştirilmeli"] }
    ],
    global: [
        { question: "Üniversite hayatının en zorlayıcı yanı sence hangisi?", options: ["Ekonomik Zorluklar", "Akademik Baskı", "Gelecek Kaygısı", "Sosyalleşme Problemleri"] },
        { question: "Sınav dönemlerinde en büyük motivasyon kaynağın nedir?", options: ["Mezuniyet Hayali", "Arkadaşlar", "Kahve/Enerji İçeceği", "Aile Baskısı"] },
        { question: "Yurtdışında eğitim/staj imkanlarını yeterince takip edebiliyor musun?", options: ["Evet, çok ilgiliyim", "Arada bakıyorum", "Hiç fikrim yok", "İstiyorum ama fırsat yok"] }
    ],
    cankaya: [
        { question: "Çankaya kampüsünde en çok vakit geçirdiğin yer?", options: ["Kütüphane", "Kafeterya", "Spor Salonu", "Bahçe"] }
    ]
};

// Helper to get ISO Week String (YYYY-WW)
function getWeekId() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uni = searchParams.get('uni') || 'metu';
  const effectiveUni = (uni === 'bilkent' || uni === 'cankaya' || uni === 'global') ? uni : 'metu';
  const uniFallbacks = FALLBACK_POLLS[effectiveUni];

  const getRandomFallback = () => uniFallbacks[Math.floor(Math.random() * uniFallbacks.length)];

  // 1. Setup Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
     console.error('Missing Supabase Keys, falling back to random.');
     return NextResponse.json(getRandomFallback());
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Helper Helper: Deterministic Fallback based on Week ID
  const getDeterministicFallback = (weekId: string) => {
      let hash = 0;
      for (let i = 0; i < weekId.length; i++) {
        hash = weekId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % uniFallbacks.length;
      console.log(`Using Deterministic Fallback for ${weekId} (${uni}) -> Index ${index}`);
      return uniFallbacks[index];
  };

  try {
    const currentWeekId = getWeekId();

    // 2. Check DB for existing poll
    // Note: We might need to filter by university if we store uni in polls, 
    // but the current schema seems to rely on week_id only. 
    // To support multiple unis, we really should have a 'university' column in weekly_polls.
    // Assuming for now user knows this limitation or we just overwrite/share.
    // Actually, distinct unis need distinct polls. 
    // Let's modify the query to try matching uni if column exists, or fallback.
    // For now, to keep it simple and working: we will append uni to week_id key!
    // e.g. "2024-W01-metu"
    
    // Check if table supports university column first? No, that's expensive.
    // Let's try querying with composite key idea in week_id if possible, 
    // OR just rely on "week_id" and realizing all unis share the same poll if no uni column.
    // Wait, the prompt implies distinct polls for unis.
    // The easiest fix without migration: Use logic to specific query.
    // BUT we can't change DB schema right now easily without SQL.
    // Let's use `week_id` as `${weekId}-${effectiveUni}` to separate them in the DB!
    
    const dbWeekId = `${currentWeekId}-${effectiveUni}`;

    const { data: existingPoll, error: dbError } = await supabase
        .from('weekly_polls')
        .select('*')
        .eq('week_id', dbWeekId)
        .single();

    if (dbError && dbError.code === '42P01') { 
        console.warn('weekly_polls table missing. Returning deterministic specific poll for this week.');
        return NextResponse.json(getDeterministicFallback(currentWeekId));
    }

    if (existingPoll && !dbError) {
        return NextResponse.json({
            question: existingPoll.question,
            options: existingPoll.options
        });
    }

    // 3. Not Found -> Generate New with Gemini
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(getDeterministicFallback(currentWeekId));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let uniName, uniJargon;
    if (uni === 'bilkent') {
        uniName = 'Bilkent Üniversitesi';
        uniJargon = 'İhsan Doğramacı, Merkez, Doğu, Odeon, Mayfest, Moodle, Stars, Ring';
    } else if (uni === 'global') {
        uniName = 'Tüm Üniversite Öğrencileri';
        uniJargon = 'Vize, Final, Büt, Yurt, Kampüs, Burs, Erasmus, Gelecek Kaygısı, Staj, Hocam';
    } else {
        uniName = 'ODTÜ (Orta Doğu Teknik Üniversitesi)';
        uniJargon = 'Hocam, Devrim, Ring, Çatı, Yalıncak, A1 Kapısı, ODTÜClass';
    }

    const prompt = `
      Sen ${uniName} için içerik üreten bir yapay zeka editörüsün.
      
      GÖREV:
      1. Şu anki tarihi analiz et: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
      2. Bu tarihte/haftada ${uniName} genelinde akademik veya sosyal olarak ne olduğunu veya GENEL bir öğrenci gündemini TAHMİN ET.
      3. ${uni === 'global' ? 'Tüm üniversite öğrencilerini ilgilendiren ORTAK bir sorun veya geyik konusu seç.' : ''}
      4. Buna uygun HAFTALIK bir anket sorusu oluştur.
      
      KRİTİK KURALLAR:
      - Soru metni içinde kesinlikle spesifik bir GÜN veya TARİH BELİRTME. 
      - ${uniName} jargonunu (${uniJargon}) doğal bir şekilde kullan.
      
      Çıktı Formatı (JSON):
      {
        "question": "Haftalık gündeme uygun, tarih ibaresi içermeyen soru metni",
        "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3"]
      }
      
      Sadece saf JSON döndür.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const pollData = JSON.parse(cleanedText);

    // 4. Save to DB for this week
    const { error: insertError } = await supabase
        .from('weekly_polls')
        .insert({
            week_id: dbWeekId, // Storing with uni suffix to support multiple polls!
            question: pollData.question,
            options: pollData.options 
        });

    if (insertError) {
        console.error('Failed to cache weekly poll:', insertError);
        if (insertError.code === '42P01') {
             return NextResponse.json(getDeterministicFallback(currentWeekId));
        }
    }

    return NextResponse.json(pollData);

  } catch (error) {
    console.error('Poll Logic Error:', error);
    return NextResponse.json(getDeterministicFallback(getWeekId()));
  }
}

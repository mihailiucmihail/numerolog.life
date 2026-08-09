export const runtime = 'nodejs';

// CORS: разрешаем вызовы с numerolog.life (и с любого поддомена/превью Vercel того же проекта).
// Если хочешь ограничить строго одним доменом — замени '*' на 'https://numerolog.life'.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

const VOICE_ID = 'pjcYQlDFKMbcOUp6F5GD';

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return Response.json({ error: 'Нет текста для озвучивания.' }, { status: 400, headers: CORS_HEADERS });
    }
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY не настроен в переменных окружения этого проекта на Vercel.' }, { status: 500, headers: CORS_HEADERS });
    }

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'xi-api-key': apiKey,
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 2000), // limită de siguranță per cerere
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return Response.json({ error: 'Ошибка ElevenLabs: ' + errText }, { status: 502, headers: CORS_HEADERS });
    }

    const audioBuffer = await r.arrayBuffer();
    return new Response(audioBuffer, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return Response.json({ error: String((e && e.message) || e) }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET() {
  return Response.json({ ok: true, note: 'POST { text } сюда → возвращает audio/mpeg.' }, { headers: CORS_HEADERS });
}

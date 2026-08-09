export const runtime = 'nodejs';

// CORS: разрешаем вызовы с numerolog.life (и с любого поддомена/превью Vercel того же проекта).
// Если хочешь ограничить строго одним доменом — замени '*' на 'https://numerolog.life'.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

const SYSTEM_PREFIX = `Ты — опытный, тёплый нумеролог. Ты лично объясняешь клиенту его нумерологический отчёт «Кристалл Судьбы». Клиент почти ничего не знает о нумерологии — не используй жаргон без объяснения, говори простыми словами, как в живом разговоре. Это первое сообщение после того, как рассчитан отчёт — дай тёплое, живое устное вступление, затем коротко объясни самое важное из его результатов ниже, опираясь СТРОГО на данные. Никогда не выдумывай факты, которых нет в данных. Отвечай по-русски, тепло, 3-6 предложений за раз, разговорным тоном — это будет озвучено вслух, поэтому избегай списков, звёздочек и сложного форматирования — только живая речь.

Данные отчёта клиента (JSON):
`;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { report, question, history, mode } = body || {};
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY не настроен на сервере.' }, { status: 500, headers: CORS_HEADERS });
    }
    const effectiveQuestion = mode === 'intro'
      ? 'Начни сейчас устное вступление и объясни клиенту самое важное из его отчёта.'
      : question;
    if (!effectiveQuestion || typeof effectiveQuestion !== 'string' || !effectiveQuestion.trim()) {
      return Response.json({ error: 'Нет вопроса.' }, { status: 400, headers: CORS_HEADERS });
    }
    const system = SYSTEM_PREFIX + JSON.stringify(report || {}, null, 2);
    const messages = Array.isArray(history) ? history.slice(-10) : [];
    messages.push({ role: 'user', content: effectiveQuestion });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system,
        messages,
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      return Response.json({ error: 'Ошибка Claude API: ' + errText }, { status: 502, headers: CORS_HEADERS });
    }
    const data = await r.json();
    const answer = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return Response.json({ answer }, { headers: CORS_HEADERS });
  } catch (e) {
    return Response.json({ error: String((e && e.message) || e) }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET() {
  return Response.json({ ok: true, note: 'POST { report, question, history?, mode? } сюда. mode:"intro" для автозапуска без вопроса.' }, { headers: CORS_HEADERS });
}

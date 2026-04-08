const DEFAULT_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(204)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing Gemini API key on server' });
    return;
  }

  const body = req.body || {};
  const model = body.model || DEFAULT_MODEL;
  const payload = body.contents && Array.isArray(body.contents)
    ? {
        contents: body.contents,
        generationConfig: body.generationConfig || { temperature: 0.7, maxOutputTokens: 900 },
      }
    : {
        contents: [
          { role: 'user', parts: [{ text: `SYSTEM: ${body.systemPrompt || 'Eres un asistente útil.'}` }] },
          { role: 'user', parts: [{ text: String(body.prompt || '') }] },
        ],
        generationConfig: body.generationConfig || { temperature: 0.7, maxOutputTokens: 900 },
      };

  const upstream = await fetch(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(text);
};

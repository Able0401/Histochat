import { CallGPTBaseline } from './_lib/gptBaseline.js';
import { CallGPTAdvanced } from './_lib/gptAdvanced.js';

// Prompts live here so the browser never sees the OpenAI key or can send arbitrary prompts.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { variant, persona, prompt, pastchatlog = [], user_name, learning_objective, language } = req.body || {};
  if (typeof persona !== 'string' || typeof prompt !== 'string' || typeof user_name !== 'string'
      || !Array.isArray(pastchatlog) || persona.length > 80 || user_name.length > 80
      || prompt.length > 2000 || pastchatlog.length > 60) {
    return res.status(400).json({ error: 'bad request' });
  }
  const lang = language === 'ko' ? 'ko' : 'en';
  try {
    const message = variant === 'experimental'
      ? await CallGPTAdvanced({ input_persona: persona, prompt, pastchatlog, user_name, input_learning_obejctive: String(learning_objective || '').slice(0, 500), language: lang })
      : await CallGPTBaseline({ input_persona: persona, prompt, pastchatlog, user_name, language: lang });
    res.status(200).json({ message });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'upstream error' });
  }
}

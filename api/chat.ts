import Anthropic from '@anthropic-ai/sdk';

const DAILY_LIMIT = 50;
const dailyCounts = new Map<string, { count: number; date: string }>();

function checkRateLimit(ip: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const record = dailyCounts.get(ip);
  if (!record || record.date !== today) {
    dailyCounts.set(ip, { count: 1, date: today });
    return true;
  }
  if (record.count >= DAILY_LIMIT) return false;
  record.count++;
  return true;
}

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Лимит вопросов на сегодня исчерпан (50/день). Попробуй завтра!' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API ключ не настроен' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, context } = await req.json();

    const systemPrompt = `Ты — персональный репетитор китайского языка для русскоязычного ученика-нулёвки.

Правила:
- Объясняй ПРОСТО, через аналогии с русским языком
- Уровень ученика: полный ноль, HSK-1
- Отвечай кратко (2-5 предложений), если не просят подробнее
- Используй примеры с пиньинь и русским переводом
- Если спрашивают про иероглиф — объясни его компоненты (радикалы), этимологию, мнемонику
- Не используй сложные лингвистические термины без пояснения

${context?.itemChar ? `Сейчас ученик изучает: ${context.itemChar} (${context.itemType || 'иероглиф'})` : ''}
${context?.screen ? `Ученик находится на экране: ${context.screen}` : ''}`;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return new Response(
      JSON.stringify({ content: text }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Ошибка AI: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

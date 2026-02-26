/**
 * HanziFlow — Claude AI chat client
 *
 * Sends messages to a backend edge function (/api/chat) which proxies
 * the Anthropic API. Handles offline state and error recovery.
 */

import type { ChatMessage, ChatContext } from '@/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_ENDPOINT = '/api/chat';

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

function buildSystemPrompt(context: ChatContext): string {
  const parts: string[] = [
    'You are a Chinese language tutor embedded in HanziFlow, a personal Chinese learning app.',
    'The student is a Russian speaker learning Mandarin Chinese at HSK 1-2 level.',
    'Respond in Russian by default. Use Chinese characters with pinyin when teaching.',
    'Keep answers concise and practical — the student is learning on a tablet during study sessions.',
  ];

  if (context.screen) {
    parts.push(`The student is currently on the "${context.screen}" screen.`);
  }

  if (context.itemChar && context.itemType) {
    parts.push(
      `They are looking at the ${context.itemType}: ${context.itemChar}.`,
      'If they ask about this item, provide detailed information: etymology, radicals, stroke order tips, usage examples, mnemonics.',
    );
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// API types
// ---------------------------------------------------------------------------

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system: string;
}

interface ChatResponse {
  content: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends a conversation to the /api/chat edge function and returns
 * the assistant's response as a ChatMessage.
 *
 * @param messages  Full conversation history (user + assistant turns)
 * @param context   Current screen and item context for the system prompt
 * @returns         The assistant's reply as a ChatMessage
 * @throws          Error with user-friendly message on failure
 */
export async function sendMessage(
  messages: ChatMessage[],
  context: ChatContext,
): Promise<ChatMessage> {
  // Offline check
  if (!navigator.onLine) {
    throw new Error('Нет подключения к интернету. Попробуйте позже.');
  }

  const systemPrompt = buildSystemPrompt(context);

  const payload: ChatRequest = {
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  let response: Response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте соединение.');
  }

  if (!response.ok) {
    const status = response.status;
    if (status === 429) {
      throw new Error('Слишком много запросов. Подождите минуту.');
    }
    if (status >= 500) {
      throw new Error('Ошибка сервера. Попробуйте позже.');
    }
    throw new Error(`Ошибка запроса (${status}).`);
  }

  let data: ChatResponse;
  try {
    data = (await response.json()) as ChatResponse;
  } catch {
    throw new Error('Некорректный ответ от сервера.');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    role: 'assistant',
    content: data.content,
    context,
    timestamp: new Date(),
  };
}

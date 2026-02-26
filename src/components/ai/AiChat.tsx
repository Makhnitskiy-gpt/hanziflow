import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { ChatMessage } from '@/types';
import { AiMessage } from './AiMessage';
import { AiInput } from './AiInput';

interface AiChatProps {
  contextChar?: string;
  onClose: () => void;
}

export function AiChat({ contextChar, onClose }: AiChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useLiveQuery(
    () => db.chatMessages.orderBy('timestamp').toArray(),
    [],
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Save user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      context: contextChar
        ? { screen: 'chat', itemChar: contextChar, itemType: 'character' }
        : { screen: 'chat' },
      timestamp: new Date(),
    };
    await db.chatMessages.add(userMsg);

    setIsLoading(true);

    try {
      const chatContext = contextChar
        ? { screen: 'chat', itemChar: contextChar, itemType: 'character' }
        : { screen: 'chat' };

      // Gather recent messages for conversation history
      const recentMessages = (messages ?? []).slice(-10);
      const allMessages: ChatMessage[] = [...recentMessages, userMsg];

      // Try to call AI (graceful fallback if not available)
      let assistantMsg: ChatMessage;
      try {
        const { sendMessage } = await import('@/lib/ai');
        assistantMsg = await sendMessage(allMessages, chatContext);
      } catch {
        // Fallback: provide helpful static response
        assistantMsg = {
          role: 'assistant',
          content: getOfflineResponse(text, contextChar),
          timestamp: new Date(),
        };
      }

      await db.chatMessages.add(assistantMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Произошла ошибка. Попробуйте позже или проверьте подключение.',
        timestamp: new Date(),
      };
      await db.chatMessages.add(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[360px] z-50 flex flex-col bg-ink-surface border-l border-ink-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-rice">AI-ассистент</span>
          {contextChar && (
            <span className="px-2 py-0.5 text-xs rounded bg-ink-elevated text-gold border border-gold-dim">
              Контекст: {contextChar}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-rice-muted hover:text-rice transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-rice-dim">
            <span className="font-hanzi text-4xl opacity-20">問</span>
            <p className="text-sm text-center">
              Задайте вопрос про иероглифы,<br />грамматику или произношение
            </p>
          </div>
        )}
        {messages?.map((msg) => (
          <AiMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-rice-dim text-sm">
            <span className="animate-pulse">Думаю...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <AiInput
        onSend={handleSend}
        disabled={isLoading}
        contextChar={contextChar}
      />
    </div>
  );
}

function getOfflineResponse(question: string, contextChar?: string): string {
  if (contextChar) {
    return `К сожалению, AI недоступен в оффлайн-режиме. Вы можете изучить иероглиф "${contextChar}" через разделы "Радикалы" и "Логика" в боковой панели.`;
  }
  return 'AI-ассистент недоступен в оффлайн-режиме. Попробуйте позже при наличии интернета.';
}

import { useState, useRef, useEffect } from 'react';

interface AiInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  contextChar?: string;
}

const quickQuestions: Record<string, string[]> = {
  default: [
    'Как начать учить иероглифы?',
    'Объясни порядок штрихов',
    'Что такое тоны?',
  ],
  withChar: [
    'Как запомнить этот иероглиф?',
    'Какие слова с ним?',
    'Разбери по составу',
    'Как произносится?',
  ],
};

export function AiInput({ onSend, disabled, contextChar }: AiInputProps) {
  const [text, setText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = contextChar ? quickQuestions.withChar : quickQuestions.default;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (q: string) => {
    const fullQuestion = contextChar
      ? `${q} (${contextChar})`
      : q;
    onSend(fullQuestion);
    setShowSuggestions(false);
  };

  return (
    <div className="border-t border-ink-border">
      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-3 py-2 border-b border-ink-border bg-ink-elevated/50">
          <p className="text-xs text-rice-dim mb-1.5">Быстрые вопросы:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestionClick(q)}
                disabled={disabled}
                className="px-3 py-2 text-sm rounded-lg min-h-[44px] bg-ink-elevated text-rice-muted border border-ink-border hover:text-rice hover:border-gold-dim transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">
        {/* Suggestions toggle */}
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className={`flex-shrink-0 p-2.5 min-w-[44px] min-h-[44px] rounded-lg transition-colors ${
            showSuggestions ? 'text-gold' : 'text-rice-dim hover:text-rice-muted'
          }`}
          title="Быстрые вопросы"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Спроси про иероглиф..."
          className="flex-1 bg-ink-elevated text-rice text-sm rounded-md px-3 py-2 border border-ink-border placeholder:text-rice-dim focus:outline-none focus:border-gold-dim disabled:opacity-50 transition-colors"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 p-2 rounded-md bg-cinnabar text-rice hover:bg-cinnabar-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}

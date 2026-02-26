import { useState, useCallback, useRef } from 'react';

interface PronounceButtonProps {
  text: string;
  lang?: string;
  rate?: number;
  size?: 'sm' | 'md';
}

export function PronounceButton({
  text,
  lang = 'zh-CN',
  rate = 0.8,
  size = 'md',
}: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
  }, [text, lang, rate]);

  // Hide if Web Speech API is not available
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const px = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      onClick={speak}
      aria-label={`Произнести ${text}`}
      className={`${px} inline-flex items-center justify-center rounded-lg text-rice-muted hover:text-cinnabar hover:bg-ink-elevated transition-colors flex-shrink-0 ${
        speaking ? 'text-cinnabar animate-pulse' : ''
      }`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        {size === 'md' && (
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        )}
      </svg>
    </button>
  );
}

/** Programmatic pronunciation (for auto-play on character change) */
export function pronounce(text: string, lang = 'zh-CN', rate = 0.8) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

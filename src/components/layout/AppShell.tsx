import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CanvasPanel } from './CanvasPanel';
import { SessionTimer } from './SessionTimer';
import { AiChat } from '@/components/ai/AiChat';

export function AppShell() {
  const [currentChar, setCurrentChar] = useState<string | undefined>();
  const [canvasMode, setCanvasMode] = useState<'stroke' | 'draw'>('stroke');
  const [canvasHighlight, setCanvasHighlight] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPhase, setSessionPhase] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [sessionProgress, setSessionProgress] = useState({ done: 0, total: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('hanziflow-theme') === 'dark';
    }
    return false;
  });
  const [isPortrait, setIsPortrait] = useState(false);

  // Apply theme to document + persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('hanziflow-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Detect portrait orientation
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isPortrait) {
    return (
      <div className="flex items-center justify-center h-dvh bg-ink p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-hanzi text-6xl text-rice-dim">横</span>
          <p className="text-rice-muted text-lg">
            Поверните устройство горизонтально
          </p>
          <p className="text-rice-dim text-sm">
            HanziFlow оптимизирован для ландшафтного режима
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-ink">
      {/* Left sidebar */}
      <Sidebar
        onAiChatToggle={() => setAiOpen((v) => !v)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {sessionActive && (
          <SessionTimer
            phase={sessionPhase}
            timeLeft={sessionTimeLeft}
            cardsDone={sessionProgress.done}
            cardsTotal={sessionProgress.total}
          />
        )}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet
            context={{
              setCurrentChar,
              setCanvasMode,
              setCanvasHighlight,
              setSessionActive,
              setSessionPhase,
              setSessionTimeLeft,
              setSessionProgress,
              currentChar,
            }}
          />
        </main>
      </div>

      {/* Right canvas panel */}
      <CanvasPanel
        currentChar={currentChar}
        mode={canvasMode}
        onModeChange={setCanvasMode}
        highlight={canvasHighlight}
        onHighlightDone={() => setCanvasHighlight(false)}
      />

      {/* AI Chat overlay */}
      {aiOpen && (
        <AiChat
          contextChar={currentChar}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

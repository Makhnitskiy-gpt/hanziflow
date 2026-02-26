import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CanvasPanel } from './CanvasPanel';
import { SessionTimer } from './SessionTimer';
import { AiChat } from '@/components/ai/AiChat';

export function AppShell() {
  const [currentChar, setCurrentChar] = useState<string | undefined>();
  const [aiOpen, setAiOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPhase, setSessionPhase] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [sessionProgress, setSessionProgress] = useState({ done: 0, total: 0 });
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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
      <CanvasPanel currentChar={currentChar} />

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

import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onAiChatToggle: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: '家', label: 'Главная' },
  { to: '/radicals', icon: '部', label: 'Радикалы' },
  { to: '/characters', icon: '字', label: 'Иероглифы' },
  { to: '/logic', icon: '邏', label: 'Логика' },
  { to: '/review', icon: '復', label: 'Повторение' },
  { to: '/practice', icon: '練', label: 'Практика' },
  { to: '/progress', icon: '進', label: 'Прогресс' },
];

export function Sidebar({ onAiChatToggle, darkMode, onToggleDarkMode }: SidebarProps) {
  return (
    <nav className="flex h-full w-[72px] flex-col items-center bg-ink-surface border-r border-ink-border">
      {/* Logo area */}
      <div className="flex items-center justify-center h-14 w-full">
        <span className="font-hanzi text-cinnabar text-lg font-bold">漢</span>
      </div>

      {/* Navigation items */}
      <div className="flex flex-1 flex-col items-center gap-0.5 py-2 overflow-y-auto w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-full h-[56px] transition-colors group ${
                isActive
                  ? 'bg-ink-elevated text-rice'
                  : 'text-rice-muted hover:text-rice hover:bg-ink-elevated/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-cinnabar" />
                )}
                <span className="font-hanzi text-xl leading-none">
                  {item.icon}
                </span>
                <span className="text-[10px] mt-1 leading-tight">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1 pb-3 w-full">
        {/* AI Chat button */}
        <button
          onClick={onAiChatToggle}
          className="flex items-center justify-center w-11 h-11 rounded-xl text-rice-muted hover:text-cinnabar hover:bg-ink-elevated transition-colors"
          title="AI-репетитор"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="flex items-center justify-center w-11 h-11 rounded-xl text-rice-muted hover:text-gold hover:bg-ink-elevated transition-colors"
          title={darkMode ? 'Светлая тема' : 'Тёмная тема'}
        >
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}

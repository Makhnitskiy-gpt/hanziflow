import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onAiChatToggle: () => void;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: '家', label: 'Главная' },
  { to: '/radicals', icon: '部首', label: 'Радикалы' },
  { to: '/characters', icon: '字', label: 'Иероглифы' },
  { to: '/logic', icon: '邏輯', label: 'Логика' },
  { to: '/review', icon: '復習', label: 'Повторение' },
  { to: '/practice', icon: '練習', label: 'Практика' },
  { to: '/progress', icon: '進度', label: 'Прогресс' },
];

export function Sidebar({ onAiChatToggle }: SidebarProps) {
  return (
    <nav className="flex h-full w-16 flex-col items-center bg-ink-surface border-r border-ink-border">
      {/* Top scroll decoration */}
      <div className="w-10 h-1 mt-3 mb-2 rounded-full bg-ink-border" />

      {/* Navigation items */}
      <div className="flex flex-1 flex-col items-center gap-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-14 h-14 rounded-r-md transition-colors group ${
                isActive
                  ? 'bg-ink-elevated text-rice'
                  : 'text-rice-muted hover:text-rice hover:bg-ink-elevated/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator — cinnabar left border */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-cinnabar" />
                )}
                <span className="font-hanzi text-base leading-tight">
                  {item.icon.length > 1 ? item.icon[0] : item.icon}
                </span>
                <span className="text-[9px] mt-0.5 leading-tight truncate max-w-[52px]">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-2 pb-3">
        {/* AI Chat button */}
        <button
          onClick={onAiChatToggle}
          className="flex items-center justify-center w-10 h-10 rounded-md text-rice-muted hover:text-gold hover:bg-ink-elevated transition-colors"
          title="AI-ассистент"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Settings button */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-md text-rice-muted hover:text-rice hover:bg-ink-elevated transition-colors"
          title="Настройки"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Bottom scroll decoration */}
      <div className="w-10 h-1 mb-3 rounded-full bg-ink-border" />
    </nav>
  );
}

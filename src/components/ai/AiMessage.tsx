import type { ChatMessage } from '@/types';

interface AiMessageProps {
  message: ChatMessage;
}

export function AiMessage({ message }: AiMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-cinnabar/20 text-rice border border-cinnabar/30'
            : 'bg-ink-elevated text-rice border border-ink-border'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {isUser ? (
            message.content
          ) : (
            <MarkdownLite text={message.content} />
          )}
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-cinnabar/50' : 'text-rice-dim'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/** Simple markdown: **bold**, `code`, - lists */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-rice-dim select-none">--</span>
              <span>{processInline(line.slice(2))}</span>
            </div>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }

        return <div key={i}>{processInline(line)}</div>;
      })}
    </>
  );
}

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.index;

    // Text before match
    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-rice">
          {first.match![1]}
        </strong>,
      );
      remaining = remaining.slice(idx + first.match![0].length);
    } else {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-ink text-gold text-xs font-mono">
          {first.match![1]}
        </code>,
      );
      remaining = remaining.slice(idx + first.match![0].length);
    }
  }

  return <>{parts}</>;
}

function formatTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

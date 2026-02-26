interface PinyinDisplayProps {
  pinyin: string;
  tone: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export function PinyinDisplay({ pinyin, tone, size = 'sm' }: PinyinDisplayProps) {
  const toneClass = `tone-${Math.min(Math.max(tone, 1), 5)}`;
  const sizeClass = sizeClasses[size];

  return (
    <span className={`${toneClass} ${sizeClass} font-medium`}>
      {pinyin}
    </span>
  );
}

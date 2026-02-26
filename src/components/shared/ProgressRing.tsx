interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  label?: string;
}

export function ProgressRing({ progress, size = 40, label }: ProgressRingProps) {
  const strokeWidth = size < 48 ? 3 : 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-ink-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? 'var(--color-jade)' : 'var(--color-cinnabar)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {/* Center label */}
      {label && (
        <span className="absolute text-[10px] text-rice-muted font-medium">
          {label}
        </span>
      )}
      {!label && size >= 40 && (
        <span className="absolute text-[10px] text-rice-muted font-mono">
          {Math.round(progress * 100)}
        </span>
      )}
    </div>
  );
}

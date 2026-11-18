interface Props {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export function StarRating({ value, max = 3, size = 'md', animate = false, className }: Props) {
  return (
    <span className={['stars', `stars-${size}`, className].filter(Boolean).join(' ')} aria-label={`${value} trên ${max} sao`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`star${i < value ? ' on' : ''}${animate && i < value ? ' pop' : ''}`}
          style={animate ? { animationDelay: `${0.4 + i * 0.45}s` } : undefined}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

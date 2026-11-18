import { useMemo } from 'react';
import type { AmbientKind } from '../../data/types';
import { rng } from '../art/paint';

const COUNTS: Record<Exclude<AmbientKind, 'none'>, number> = { leaves: 14, petals: 24, motes: 28, fireflies: 16 };

/** Hạt môi trường nhẹ nhàng (cánh hoa, lá, bụi nắng, đom đóm). Tắt khi người dùng chọn giảm chuyển động. */
export function AmbientLayer({ kind, seed = 1 }: { kind: AmbientKind; seed?: number }) {
  const items = useMemo(() => {
    if (kind === 'none') return [];
    const r = rng(seed * 31 + kind.length);
    return Array.from({ length: COUNTS[kind] }, (_, i) => ({
      id: i,
      x: r() * 100,
      y: r() * 100,
      size: 0.6 + r() * 0.9,
      dur: 9 + r() * 10,
      delay: -r() * 18,
      drift: (r() - 0.5) * 240,
      hue: r(),
    }));
  }, [kind, seed]);
  if (kind === 'none') return null;
  return (
    <div className={`ambient ambient-${kind}`} aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="amb"
          style={
            {
              left: `${p.x}%`,
              top: kind === 'petals' || kind === 'leaves' ? '-6%' : `${20 + p.y * 0.7}%`,
              '--size': p.size,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--hue': p.hue,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

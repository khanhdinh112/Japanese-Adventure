import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { AmbientKind } from '../../data/types';
import { rng } from '../art/paint';
import { hasWebGL } from '../fx/webgl';

const ThreeAmbient = lazy(() => import('../fx/ThreeAmbient'));

const COUNTS: Record<Exclude<AmbientKind, 'none'>, number> = { leaves: 14, petals: 24, motes: 28, fireflies: 16, rain: 70 };

/**
 * Hạt môi trường nhẹ nhàng (cánh hoa, lá, bụi nắng, đom đóm, mưa).
 * Dùng three.js (tải động) khi có WebGL; nếu không thì rơi về hiệu ứng CSS. Đứng yên khi người dùng chọn giảm chuyển động.
 */
export function AmbientLayer({ kind, seed = 1 }: { kind: AmbientKind; seed?: number }) {
  const [mode, setMode] = useState<'pending' | '3d' | 'css'>('pending');
  useEffect(() => {
    setMode(hasWebGL() ? '3d' : 'css');
  }, []);
  const items = useMemo(() => {
    if (kind === 'none' || mode !== 'css') return [];
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
  }, [kind, seed, mode]);
  if (kind === 'none') return null;
  return (
    <div className={`ambient ambient-${kind}${mode === '3d' ? ' is-3d' : ''}`} aria-hidden>
      {mode === '3d' && (
        <Suspense fallback={null}>
          <ThreeAmbient kind={kind} seed={seed} onFail={() => setMode('css')} />
        </Suspense>
      )}
      {items.map((p) => (
        <span
          key={p.id}
          className="amb"
          style={
            {
              left: `${p.x}%`,
              top: kind === 'petals' || kind === 'leaves' || kind === 'rain' ? '-6%' : `${20 + p.y * 0.7}%`,
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

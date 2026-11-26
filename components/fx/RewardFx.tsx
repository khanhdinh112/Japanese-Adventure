'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { hasWebGL } from './webgl';

const ThreeStars = lazy(() => import('./ThreeStars'));
const ThreeCoin = lazy(() => import('./ThreeCoin'));

type Mode = 'pending' | '3d' | 'css';
function useMode() {
  const [mode, setMode] = useState<Mode>('pending');
  useEffect(() => setMode(hasWebGL() ? '3d' : 'css'), []);
  return [mode, setMode] as const;
}

/** Sao kết quả: 3D khi có WebGL, nếu không thì dùng sao chữ như cũ. */
export function ResultStars({ value, max = 3 }: { value: number; max?: number }) {
  const [mode, setMode] = useMode();
  if (mode === 'css') return <StarRating value={value} max={max} size="xl" animate />;
  return (
    <span className="stars3d" role="img" aria-label={`${value} trên ${max} sao`}>
      {mode === '3d' && (
        <Suspense fallback={null}>
          <ThreeStars value={value} max={max} onFail={() => setMode('css')} />
        </Suspense>
      )}
    </span>
  );
}

/** Đồng xu huy hiệu: 3D khi có WebGL, nếu không thì hiện biểu tượng emoji. */
export function BadgeCoin({ icon }: { icon: string }) {
  const [mode, setMode] = useMode();
  if (mode === 'css') {
    return (
      <span className="badge-ic" aria-hidden>
        {icon}
      </span>
    );
  }
  return (
    <span className="badge-coin" aria-hidden>
      {mode === '3d' && (
        <Suspense fallback={null}>
          <ThreeCoin emoji={icon} onFail={() => setMode('css')} />
        </Suspense>
      )}
    </span>
  );
}

'use client';

import { useState } from 'react';
import { AmbientLayer } from '../../components/ui/AmbientLayer';
import type { AmbientKind } from '../../data/types';

const KINDS: Exclude<AmbientKind, 'none'>[] = ['petals', 'leaves', 'motes', 'fireflies', 'rain'];
const BG: Record<string, string> = {
  petals: 'linear-gradient(#9ccfd8, #f8e6bd)',
  leaves: 'linear-gradient(#cfe6dc, #a9c9b4)',
  motes: 'linear-gradient(#f8e6bd, #f3b98f)',
  fireflies: 'linear-gradient(#2c3e5c, #1c2a44)',
  rain: 'linear-gradient(#8aa4b4, #5f7686)',
};

/** Trang xem thử các hiệu ứng nền 3D (dành cho phát triển). */
export default function FxPreview() {
  const [kind, setKind] = useState<Exclude<AmbientKind, 'none'>>('petals');
  return (
    <main style={{ position: 'fixed', inset: 0, background: BG[kind] }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <AmbientLayer kind={kind} seed={3} />
      </div>
      <nav style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, zIndex: 10 }}>
        {KINDS.map((k) => (
          <button key={k} onClick={() => setKind(k)} data-kind={k} style={{ padding: '6px 14px', fontWeight: 800, opacity: k === kind ? 1 : 0.6 }}>
            {k}
          </button>
        ))}
      </nav>
    </main>
  );
}

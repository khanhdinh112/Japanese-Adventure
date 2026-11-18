'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { playSfx } from '../../lib/sfx';

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

/**
 * Khung game cố định 1920×1080, tự co giãn để vừa cửa sổ (letterbox).
 * Toàn bộ bố cục dùng toạ độ của khung này nên ở 1920×1080 hiển thị đúng 1:1.
 */
export function GameStage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H));
    fit();
    setReady(true);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div className="stage-viewport" data-ready={ready}>
      <div
        className="stage-canvas"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `translate(-50%, -50%) scale(${scale})` }}
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest('button:not(:disabled)')) playSfx('tap');
        }}
      >
        {children}
      </div>
    </div>
  );
}

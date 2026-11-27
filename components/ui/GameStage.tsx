'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isCoarsePointer, isPhone } from '../../lib/device';
import { playSfx } from '../../lib/sfx';
import { RotatePrompt } from './RotatePrompt';

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

interface Fit {
  scale: number;
  dx: number;
  dy: number;
}

/**
 * Khung game cố định 1920×1080, tự co giãn để vừa cửa sổ (letterbox).
 * Toàn bộ bố cục dùng toạ độ của khung này nên ở 1920×1080 hiển thị đúng 1:1.
 * Trên điện thoại: tránh tai thỏ/thanh điều hướng (safe-area), nhắc xoay ngang khi cầm dọc.
 */
export function GameStage({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>({ scale: 1, dx: 0, dy: 0 });
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(false);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const measure = () => {
      const host = hostRef.current;
      const vv = window.visualViewport;
      const W = vv?.width ?? window.innerWidth;
      const H = vv?.height ?? window.innerHeight;
      let pl = 0;
      let pr = 0;
      let pt = 0;
      let pb = 0;
      if (host) {
        const cs = getComputedStyle(host);
        pl = parseFloat(cs.paddingLeft) || 0;
        pr = parseFloat(cs.paddingRight) || 0;
        pt = parseFloat(cs.paddingTop) || 0;
        pb = parseFloat(cs.paddingBottom) || 0;
      }
      const availW = Math.max(1, W - pl - pr);
      const availH = Math.max(1, H - pt - pb);
      setFit({ scale: Math.min(availW / CANVAS_W, availH / CANVAS_H), dx: (pl - pr) / 2, dy: (pt - pb) / 2 });
      const ph = isPhone();
      setPhone(ph);
      setPortrait(ph && H > W);
    };
    measure();
    setReady(true);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  // Điện thoại: mở rộng vùng chạm của nút. Chỉ gắn nhãn và đặt position khi nút đang "static" nên không đổi bố cục.
  useEffect(() => {
    if (!phone) return;
    const root = hostRef.current?.querySelector('.stage-canvas');
    if (!root) return;
    const mark = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLButtonElement>('button:not([data-hit])').forEach((b) => {
        if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
        b.setAttribute('data-hit', '');
      });
    };
    mark(root);
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => mark(root));
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [phone]);

  return (
    <div ref={hostRef} className={`stage-viewport${phone ? ' is-phone' : ''}${isCoarsePointer() ? ' is-touch' : ''}`} data-ready={ready}>
      <div
        className="stage-canvas"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `translate(calc(-50% + ${fit.dx}px), calc(-50% + ${fit.dy}px)) scale(${fit.scale})` }}
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest('button:not(:disabled)')) playSfx('tap');
        }}
      >
        {children}
      </div>
      {portrait && <RotatePrompt />}
    </div>
  );
}

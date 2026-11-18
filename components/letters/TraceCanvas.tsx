'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SIZE = 460;
type Pt = { x: number; y: number };

interface Props {
  ch: string;
  /** Gọi khi bé bấm "Kiểm tra" */
  onChecked?: (good: boolean) => void;
}

function fontFor(el: HTMLElement, size: number): string {
  return `500 ${size}px ${getComputedStyle(el).fontFamily}`;
}

/**
 * Khung tập viết: chữ mờ làm mẫu, bé dùng ngón tay hoặc chuột để tô lại.
 * "Kiểm tra" so khớp bằng cách đếm phần chữ mẫu được phủ và phần nét tô lệch ra ngoài (khá rộng rãi cho bé).
 */
export function TraceCanvas({ ch, onChecked }: Props) {
  const ghostRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const current = useRef<Pt[] | null>(null);
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const paintGhost = useCallback(() => {
    const c = ghostRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    // ô giấy tập viết kiểu 米
    ctx.strokeStyle = 'rgba(217, 83, 58, 0.22)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(SIZE / 2, 8);
    ctx.lineTo(SIZE / 2, SIZE - 8);
    ctx.moveTo(8, SIZE / 2);
    ctx.lineTo(SIZE - 8, SIZE / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = fontFor(c, 340);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(58, 42, 44, 0.16)';
    ctx.fillText(ch, SIZE / 2, SIZE / 2 + 14);
  }, [ch]);

  const redraw = useCallback(() => {
    const c = drawRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#d9533a';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokes.current) {
      ctx.beginPath();
      s.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (s.length === 1) ctx.lineTo(s[0].x + 0.1, s[0].y + 0.1);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    strokes.current = [];
    setCount(0);
    setMsg(null);
    redraw();
    void document.fonts?.ready.then(paintGhost);
    paintGhost();
  }, [ch, paintGhost, redraw]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const check = () => {
    const ghost = ghostRef.current;
    if (!ghost || strokes.current.length === 0) return;
    // mặt nạ chữ mẫu
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = SIZE;
      c.height = SIZE;
      return c;
    };
    const maskC = mk();
    const m = maskC.getContext('2d')!;
    m.font = fontFor(ghost, 340);
    m.textAlign = 'center';
    m.textBaseline = 'middle';
    m.fillStyle = '#000';
    m.fillText(ch, SIZE / 2, SIZE / 2 + 14);
    const dilC = mk();
    const d = dilC.getContext('2d')!;
    d.font = m.font;
    d.textAlign = 'center';
    d.textBaseline = 'middle';
    d.fillStyle = '#000';
    d.strokeStyle = '#000';
    d.lineWidth = 56;
    d.lineJoin = 'round';
    d.strokeText(ch, SIZE / 2, SIZE / 2 + 14);
    d.fillText(ch, SIZE / 2, SIZE / 2 + 14);
    const thickC = mk();
    const t = thickC.getContext('2d')!;
    t.strokeStyle = '#000';
    t.lineWidth = 52;
    t.lineCap = 'round';
    t.lineJoin = 'round';
    for (const s of strokes.current) {
      t.beginPath();
      s.forEach((p, i) => (i === 0 ? t.moveTo(p.x, p.y) : t.lineTo(p.x, p.y)));
      if (s.length === 1) t.lineTo(s[0].x + 0.1, s[0].y + 0.1);
      t.stroke();
    }
    const thinC = mk();
    const th = thinC.getContext('2d')!;
    th.strokeStyle = '#000';
    th.lineWidth = 10;
    th.lineCap = 'round';
    th.lineJoin = 'round';
    for (const s of strokes.current) {
      th.beginPath();
      s.forEach((p, i) => (i === 0 ? th.moveTo(p.x, p.y) : th.lineTo(p.x, p.y)));
      if (s.length === 1) th.lineTo(s[0].x + 0.1, s[0].y + 0.1);
      th.stroke();
    }
    const A = m.getImageData(0, 0, SIZE, SIZE).data;
    const D = d.getImageData(0, 0, SIZE, SIZE).data;
    const T = t.getImageData(0, 0, SIZE, SIZE).data;
    const U = th.getImageData(0, 0, SIZE, SIZE).data;
    let ghostPx = 0;
    let covered = 0;
    let userPx = 0;
    let outside = 0;
    for (let i = 3; i < A.length; i += 4) {
      if (A[i] > 128) {
        ghostPx++;
        if (T[i] > 0) covered++;
      }
      if (U[i] > 0) {
        userPx++;
        if (D[i] === 0) outside++;
      }
    }
    const coverage = ghostPx ? covered / ghostPx : 0;
    const spill = userPx ? outside / userPx : 1;
    const good = coverage >= 0.5 && spill <= 0.4 && userPx > 250;
    setMsg(
      good
        ? { ok: true, text: 'Tuyệt vời! Nét chữ rất đẹp.' }
        : coverage < 0.5
          ? { ok: false, text: 'Chưa phủ hết chữ mờ. Thử tô theo từng nét nhé.' }
          : { ok: false, text: 'Có nét đi ra ngoài chữ mẫu. Xoá và thử lại chậm hơn nhé.' },
    );
    onChecked?.(good);
  };

  return (
    <div className="trace">
      <div className="trace-board" style={{ width: SIZE, height: SIZE }}>
        <canvas ref={ghostRef} width={SIZE} height={SIZE} className="trace-ghost" aria-hidden />
        <canvas
          ref={drawRef}
          width={SIZE}
          height={SIZE}
          className="trace-draw"
          aria-label={`Khung tập viết chữ ${ch}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            current.current = [pos(e)];
            strokes.current.push(current.current);
            setMsg(null);
            redraw();
          }}
          onPointerMove={(e) => {
            if (!current.current) return;
            current.current.push(pos(e));
            redraw();
          }}
          onPointerUp={() => {
            current.current = null;
            setCount(strokes.current.length);
          }}
          onPointerCancel={() => {
            current.current = null;
          }}
        />
      </div>
      <div className="trace-actions">
        <button
          type="button"
          className="btn btn-pill"
          onClick={() => {
            strokes.current.pop();
            setCount(strokes.current.length);
            setMsg(null);
            redraw();
          }}
          disabled={count === 0}
        >
          ↩ Xoá nét cuối
        </button>
        <button
          type="button"
          className="btn btn-pill"
          onClick={() => {
            strokes.current = [];
            setCount(0);
            setMsg(null);
            redraw();
          }}
          disabled={count === 0}
        >
          🗑 Viết lại
        </button>
        <button type="button" className="btn btn-primary" onClick={check} disabled={count === 0}>
          ✔ Kiểm tra
        </button>
      </div>
      {msg && (
        <p className={`trace-msg ${msg.ok ? 'ok' : 'no'}`} role="status">
          {msg.ok ? '🌟 ' : '💡 '}
          {msg.text}
        </p>
      )}
    </div>
  );
}

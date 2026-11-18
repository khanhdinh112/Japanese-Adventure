'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const COLORS = ['#3a2a2c', '#d9533a', '#e6b84a', '#3f8f86', '#6f8fd0', '#d77aa6'];

interface Props {
  width?: number;
  height?: number;
  /** Nhận ảnh (data URL JPEG) sau mỗi nét vẽ; null khi xoá hết */
  onChange: (dataUrl: string | null) => void;
  /** Dòng gợi ý nhạt trên giấy */
  placeholder?: string;
}

/** Bảng vẽ đơn giản (chuột / bút / ngón tay) để bé vẽ kết quả nhiệm vụ khi không có ảnh chụp. */
export function DrawingPad({ width = 760, height = 440, onChange, placeholder }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brush, setBrush] = useState(6);
  const [eraser, setEraser] = useState(false);
  const [dirty, setDirty] = useState(false);

  const paintBackground = useCallback(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  useEffect(() => {
    paintBackground();
  }, [paintBackground]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!;
    const rect = c.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * c.width, y: ((e.clientY - rect.top) / rect.height) * c.height };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = eraser ? '#fffdf6' : color;
    ctx.lineWidth = eraser ? brush * 3 : brush;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const emit = () => {
    const c = ref.current;
    if (c) onChange(c.toDataURL('image/jpeg', 0.7));
  };

  return (
    <div className="drawpad">
      <div className="drawpad-tools">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${!eraser && color === c ? ' on' : ''}`}
            style={{ background: c }}
            aria-label={`Màu ${c}`}
            onClick={() => {
              setColor(c);
              setEraser(false);
            }}
          />
        ))}
        <span className="drawpad-sep" />
        {[4, 8, 14].map((b) => (
          <button key={b} type="button" className={`brush${brush === b ? ' on' : ''}`} aria-label={`Nét ${b}`} onClick={() => setBrush(b)}>
            <i style={{ width: b + 4, height: b + 4 }} />
          </button>
        ))}
        <button type="button" className={`btn btn-ghost btn-sm${eraser ? ' on' : ''}`} onClick={() => setEraser((v) => !v)}>
          🧽 Tẩy
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            paintBackground();
            setDirty(false);
            onChange(null);
          }}
        >
          🗑 Xoá hết
        </button>
      </div>
      <div className="drawpad-paper">
        <canvas
          ref={ref}
          width={width}
          height={height}
          className="drawpad-canvas"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            const p = pos(e);
            last.current = p;
            stroke(p, { x: p.x + 0.01, y: p.y });
            setDirty(true);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const p = pos(e);
            stroke(last.current, p);
            last.current = p;
          }}
          onPointerUp={() => {
            if (!drawing.current) return;
            drawing.current = false;
            last.current = null;
            emit();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
        {!dirty && placeholder && <span className="drawpad-ph">{placeholder}</span>}
      </div>
    </div>
  );
}

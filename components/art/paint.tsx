import type { CSSProperties, ReactNode } from 'react';

/**
 * Bộ "cọ" SVG dùng chung để vẽ tranh màu nước placeholder.
 * Mọi hình đều là SVG thuần, nên tranh nhẹ, sắc nét ở 1920×1080 và dễ thay bằng ảnh thật
 * (xem docs/ASSETS.md).
 */

/* ------------------------------------------------------------------ */
/* Bảng màu                                                             */
/* ------------------------------------------------------------------ */

export const PAL = {
  skyTop: '#9ccfd8',
  skyMid: '#cfe6dc',
  skyLow: '#f8e6bd',
  dusk: '#f3b98f',
  cloud: '#fffaf0',
  hillFar: '#a9c9b4',
  hillMid: '#8cb497',
  hillNear: '#6f9f7e',
  hillDark: '#527f65',
  grass: '#8fbc6e',
  grassLight: '#b6d98a',
  grassDark: '#5e944f',
  leaf: '#6fae62',
  leafLight: '#9ccf7c',
  leafDark: '#477f4f',
  pine: '#3f7a5a',
  sakura: '#f4bccb',
  sakuraDeep: '#e996ae',
  trunk: '#7a5738',
  trunkDark: '#563a25',
  wood: '#b17d4f',
  woodLight: '#d3a574',
  woodDark: '#7a5030',
  plaster: '#f7ecd4',
  plasterShade: '#e7d6b2',
  roof: '#59707e',
  roofLight: '#7d95a2',
  roofDark: '#3f5360',
  stone: '#b9b3a4',
  stoneDark: '#8c8678',
  water: '#8cc5cf',
  waterDeep: '#5e9fb0',
  sand: '#f1deb4',
  tatami: '#d8cc8a',
  tatamiDark: '#bfb36f',
  tatamiEdge: '#5f6b47',
  shoji: '#fff7e0',
  ink: '#33403f',
  warm: '#ffd88a',
  vermilion: '#d9533a',
  indigo: '#34527c',
};

/* ------------------------------------------------------------------ */
/* Bộ lọc dùng chung (đặt một lần ở gốc DOM)                            */
/* ------------------------------------------------------------------ */

export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* Nét loang màu nước: viền gợn, vệt màu không đều, viền pigment đậm hơn */}
        <filter id="wc-paint" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="3" seed="4" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="16" xChannelSelector="R" yChannelSelector="G" result="w" />
          <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="4" seed="11" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0.5 0 0 0 0.66  0.5 0 0 0 0.66  0.5 0 0 0 0.66  0 0 0 0 1"
            result="blot"
          />
          <feBlend in="w" in2="blot" mode="multiply" result="b" />
          <feComposite in="b" in2="w" operator="in" result="painted" />
          <feMorphology in="w" operator="erode" radius="2.2" result="er" />
          <feComposite in="w" in2="er" operator="out" result="rim" />
          <feColorMatrix
            in="rim"
            type="matrix"
            values="0 0 0 0 0.25  0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0.2 0"
            result="rimDark"
          />
          <feMerge>
            <feMergeNode in="painted" />
            <feMergeNode in="rimDark" />
          </feMerge>
        </filter>
        {/* Loang nhẹ hơn cho vật nhỏ */}
        <filter id="wc-soft" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="8" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="w" />
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="2" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0.4 0 0 0 0.72  0.4 0 0 0 0.72  0.4 0 0 0 0.72  0 0 0 0 1"
            result="blot"
          />
          <feBlend in="w" in2="blot" mode="multiply" result="b" />
          <feComposite in="b" in2="w" operator="in" />
        </filter>
        <filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="blur-lg" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <radialGradient id="glow-warm">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffe29a" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffe29a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="puff">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#fffaf0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Tiện ích                                                             */
/* ------------------------------------------------------------------ */

/** Bộ sinh số giả ngẫu nhiên có hạt giống: cùng seed luôn ra cùng một bức tranh. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function ridgePath(y: number, amp: number, seed: number, bottom = 1100, step = 170): string {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let x = -120; x <= 2040; x += step) pts.push([x, y + (r() - 0.5) * 2 * amp]);
  let d = `M ${pts[0][0]} ${bottom} L ${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1].toFixed(1)} L ${last[0]} ${bottom} Z`;
  return d;
}

export function SceneSvg({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <svg
      className="art-svg"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

export function Wash({ children, soft = false }: { children: ReactNode; soft?: boolean }) {
  return <g filter={soft ? 'url(#wc-soft)' : 'url(#wc-paint)'}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* Bầu trời, mây, núi đồi                                              */
/* ------------------------------------------------------------------ */

export function Sky({
  id,
  stops,
  height = 1080,
}: {
  id: string;
  stops: [string, string, string?];
  height?: number;
}) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          {stops[2] && <stop offset="0.55" stopColor={stops[2]} />}
          <stop offset="1" stopColor={stops[1]} />
        </linearGradient>
      </defs>
      <rect x="-40" y="-40" width="2000" height={height + 80} fill={`url(#${id})`} />
    </>
  );
}

export function Sun({ cx, cy, r, color = '#ffe3a1' }: { cx: number; cy: number; r: number; color?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 3.4} fill="url(#glow-warm)" />
      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.95" />
    </g>
  );
}

export function Cloud({
  x,
  y,
  s = 1,
  drift,
  delay = 0,
  opacity = 0.92,
}: {
  x: number;
  y: number;
  s?: number;
  /** Thời gian (giây) trôi qua màn hình; bỏ trống = đứng yên */
  drift?: number;
  delay?: number;
  opacity?: number;
}) {
  const style: CSSProperties | undefined = drift
    ? { animation: `cloud-drift ${drift}s linear ${-delay}s infinite` }
    : undefined;
  return (
    <g style={style} className={drift ? 'art-anim' : undefined}>
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
        <ellipse cx="0" cy="0" rx="150" ry="52" fill="url(#puff)" />
        <ellipse cx="-90" cy="14" rx="100" ry="40" fill="url(#puff)" />
        <ellipse cx="95" cy="12" rx="110" ry="44" fill="url(#puff)" />
        <ellipse cx="20" cy="-34" rx="90" ry="46" fill="url(#puff)" />
        <ellipse cx="10" cy="30" rx="170" ry="26" fill="#e9eef0" opacity="0.35" />
      </g>
    </g>
  );
}

export function Ridge({
  y,
  amp,
  seed,
  top,
  bottom,
  id,
  opacity = 1,
  step,
}: {
  y: number;
  amp: number;
  seed: number;
  top: string;
  bottom: string;
  id: string;
  opacity?: number;
  step?: number;
}) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <path d={ridgePath(y, amp, seed, 1100, step)} fill={`url(#${id})`} opacity={opacity} />
    </>
  );
}

export function Mountain({
  x,
  y,
  w,
  h,
  color,
  shade,
  snow,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  shade?: string;
  snow?: boolean;
}) {
  const left = x - w / 2;
  const right = x + w / 2;
  const topY = y - h;
  return (
    <g>
      <path
        d={`M ${left} ${y} C ${x - w * 0.28} ${y - h * 0.25} ${x - w * 0.12} ${topY + h * 0.08} ${x} ${topY} C ${x + w * 0.12} ${topY + h * 0.08} ${x + w * 0.28} ${y - h * 0.25} ${right} ${y} Z`}
        fill={color}
      />
      {shade && (
        <path
          d={`M ${x} ${topY} C ${x + w * 0.12} ${topY + h * 0.08} ${x + w * 0.28} ${y - h * 0.25} ${right} ${y} L ${x + w * 0.1} ${y} C ${x + w * 0.08} ${y - h * 0.35} ${x + w * 0.04} ${topY + h * 0.3} ${x} ${topY} Z`}
          fill={shade}
          opacity="0.55"
        />
      )}
      {snow && (
        <path
          d={`M ${x - w * 0.115} ${topY + h * 0.26} Q ${x - w * 0.06} ${topY + h * 0.2} ${x - w * 0.035} ${topY + h * 0.3} Q ${x} ${topY + h * 0.2} ${x + w * 0.04} ${topY + h * 0.31} Q ${x + w * 0.07} ${topY + h * 0.22} ${x + w * 0.118} ${topY + h * 0.27} C ${x + w * 0.1} ${topY + h * 0.14} ${x + w * 0.06} ${topY + h * 0.05} ${x} ${topY} C ${x - w * 0.06} ${topY + h * 0.05} ${x - w * 0.1} ${topY + h * 0.14} ${x - w * 0.115} ${topY + h * 0.26} Z`}
          fill="#fffdf6"
        />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Cây cối                                                              */
/* ------------------------------------------------------------------ */

export function RoundTree({
  x,
  y,
  s = 1,
  leaf = PAL.leaf,
  light = PAL.leafLight,
  dark = PAL.leafDark,
  trunk = PAL.trunk,
  sway,
  delay = 0,
}: {
  x: number;
  y: number;
  s?: number;
  leaf?: string;
  light?: string;
  dark?: string;
  trunk?: string;
  sway?: number;
  delay?: number;
}) {
  const style: CSSProperties | undefined = sway
    ? { animation: `sway ${sway}s ease-in-out ${-delay}s infinite`, transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' }
    : undefined;
  return (
    <g style={style} className={sway ? 'art-anim' : undefined}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -16 0 C -14 -70 -10 -120 -6 -170 L 10 -170 C 12 -120 16 -60 20 0 Z" fill={trunk} />
        <path d="M 4 0 C 6 -60 8 -120 10 -170 L 10 -170 C 12 -120 16 -60 20 0 Z" fill={PAL.trunkDark} opacity="0.35" />
        <circle cx="-62" cy="-210" r="78" fill={dark} />
        <circle cx="70" cy="-205" r="82" fill={dark} />
        <circle cx="0" cy="-262" r="96" fill={leaf} />
        <circle cx="-58" cy="-228" r="74" fill={leaf} />
        <circle cx="62" cy="-226" r="76" fill={leaf} />
        <circle cx="-28" cy="-290" r="52" fill={light} />
        <circle cx="38" cy="-276" r="38" fill={light} opacity="0.8" />
        <circle cx="-72" cy="-246" r="30" fill={light} opacity="0.7" />
      </g>
    </g>
  );
}

export function Pine({ x, y, s = 1, color = PAL.pine, light = '#5f9b73' }: { x: number; y: number; s?: number; color?: string; light?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="-40" width="18" height="44" fill={PAL.trunkDark} />
      <path d="M 0 -300 L 70 -170 L 28 -178 L 90 -76 L 34 -88 L 100 -22 L -100 -22 L -34 -88 L -90 -76 L -28 -178 L -70 -170 Z" fill={color} />
      <path d="M 0 -300 L 70 -170 L 28 -178 L 90 -76 L 34 -88 L 100 -22 L 20 -22 Z" fill="#2d5f46" opacity="0.4" />
      <path d="M 0 -300 L -70 -170 L -28 -178 L -60 -120 Z" fill={light} opacity="0.5" />
    </g>
  );
}

export function SakuraTree({ x, y, s = 1, petals = true }: { x: number; y: number; s?: number; petals?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -20 0 C -18 -90 -30 -150 -60 -220 L -40 -230 C -10 -170 0 -130 6 -90 C 14 -140 30 -190 70 -240 L 88 -226 C 50 -170 36 -110 28 0 Z" fill={PAL.trunk} />
      <circle cx="-90" cy="-250" r="92" fill={PAL.sakuraDeep} opacity="0.85" />
      <circle cx="90" cy="-262" r="100" fill={PAL.sakuraDeep} opacity="0.85" />
      <circle cx="0" cy="-310" r="110" fill={PAL.sakura} />
      <circle cx="-86" cy="-278" r="80" fill={PAL.sakura} />
      <circle cx="94" cy="-286" r="84" fill={PAL.sakura} />
      <circle cx="-30" cy="-350" r="58" fill="#fbd9e1" />
      <circle cx="50" cy="-330" r="42" fill="#fbd9e1" opacity="0.9" />
      {petals && (
        <>
          <circle cx="-120" cy="-190" r="7" fill="#fbd9e1" />
          <circle cx="150" cy="-200" r="6" fill="#fbd9e1" />
          <circle cx="30" cy="-150" r="6" fill="#f4bccb" />
        </>
      )}
    </g>
  );
}

export function Bamboo({ x, y, h, s = 1 }: { x: number; y: number; h: number; s?: number }) {
  const segs = Math.floor(h / 90);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y={-h} width="18" height={h} rx="8" fill="#8fbf7a" />
      <rect x="1" y={-h} width="7" height={h} rx="3" fill="#6fa25f" opacity="0.7" />
      {Array.from({ length: segs }, (_, i) => (
        <rect key={i} x="-11" y={-h + (i + 1) * 90 - 4} width="22" height="8" rx="3" fill="#5f9150" />
      ))}
      <path d={`M 9 ${-h + 120} q 70 -20 110 20 q -60 4 -110 -2 Z`} fill="#6fae62" />
      <path d={`M -9 ${-h + 230} q -70 -20 -110 20 q 60 4 110 -2 Z`} fill="#8bc275" />
    </g>
  );
}

export function Bush({ x, y, s = 1, color = PAL.leaf, light = PAL.leafLight, dark = PAL.leafDark }: { x: number; y: number; s?: number; color?: string; light?: string; dark?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-4" rx="130" ry="22" fill={dark} opacity="0.35" />
      <circle cx="-60" cy="-40" r="52" fill={dark} />
      <circle cx="56" cy="-44" r="56" fill={dark} />
      <circle cx="0" cy="-62" r="64" fill={color} />
      <circle cx="-62" cy="-48" r="46" fill={color} />
      <circle cx="58" cy="-50" r="48" fill={color} />
      <circle cx="-16" cy="-84" r="34" fill={light} opacity="0.85" />
    </g>
  );
}

export function Hydrangea({ x, y, s = 1, color = '#8fb2e8', color2 = '#b5a1e0' }: { x: number; y: number; s?: number; color?: string; color2?: string }) {
  const r = rng(Math.round(x * 3 + y));
  const blobs = Array.from({ length: 12 }, () => ({ dx: (r() - 0.5) * 120, dy: -r() * 70, rr: 16 + r() * 14, c: r() > 0.5 ? color : color2 }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-20" rx="110" ry="46" fill={PAL.leafDark} />
      <ellipse cx="-30" cy="-30" rx="80" ry="38" fill={PAL.leaf} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.dx} cy={-50 + b.dy} r={b.rr} fill={b.c} opacity="0.95" />
      ))}
    </g>
  );
}

export function Flowers({ x, y, w, seed = 3, colors = ['#f6a7b8', '#fff2c2', '#f48aa0', '#ffffff'] }: { x: number; y: number; w: number; seed?: number; colors?: string[] }) {
  const r = rng(seed);
  const n = Math.floor(w / 22);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const fx = x + r() * w;
        const fy = y + (r() - 0.5) * 36;
        const c = colors[Math.floor(r() * colors.length)];
        const sz = 7 + r() * 8;
        return (
          <g key={i}>
            <path d={`M ${fx} ${fy} q ${(r() - 0.5) * 8} ${-18} ${(r() - 0.5) * 10} ${-34 - r() * 20}`} stroke={PAL.leafDark} strokeWidth="3" fill="none" />
            <circle cx={fx} cy={fy - 40} r={sz} fill={c} />
            <circle cx={fx} cy={fy - 40} r={sz * 0.38} fill="#f4c542" />
          </g>
        );
      })}
    </g>
  );
}

export function GrassTufts({ x, y, w, seed = 5, color = PAL.grassDark }: { x: number; y: number; w: number; seed?: number; color?: string }) {
  const r = rng(seed);
  const n = Math.floor(w / 28);
  return (
    <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75">
      {Array.from({ length: n }, (_, i) => {
        const gx = x + r() * w;
        const gy = y + (r() - 0.5) * 30;
        const h = 18 + r() * 24;
        return <path key={i} d={`M ${gx - 8} ${gy} Q ${gx - 6} ${gy - h * 0.6} ${gx - 12} ${gy - h} M ${gx} ${gy} Q ${gx} ${gy - h * 0.7} ${gx + 2} ${gy - h * 1.2} M ${gx + 8} ${gy} Q ${gx + 8} ${gy - h * 0.5} ${gx + 14} ${gy - h * 0.9}`} />;
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Kiến trúc Nhật                                                       */
/* ------------------------------------------------------------------ */

/** Ngôi nhà nông thôn mái ngói. Gốc toạ độ ở góc dưới trái; rộng ~600, cao ~400. */
export function FarmHouse({ x, y, s = 1, glow = true }: { x: number; y: number; s?: number; glow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="300" cy="8" rx="340" ry="26" fill="#3f5a3d" opacity="0.28" />
      {/* nền đá */}
      <rect x="20" y="-40" width="560" height="44" rx="6" fill={PAL.stone} />
      <rect x="20" y="-40" width="560" height="12" fill={PAL.stoneDark} opacity="0.35" />
      {/* tường vữa */}
      <rect x="40" y="-190" width="520" height="152" fill={PAL.plaster} />
      <rect x="40" y="-190" width="520" height="22" fill={PAL.plasterShade} opacity="0.6" />
      {/* cột & xà gỗ */}
      {[40, 150, 260, 380, 490, 552].map((px) => (
        <rect key={px} x={px} y="-192" width="10" height="156" fill={PAL.woodDark} />
      ))}
      <rect x="38" y="-196" width="524" height="12" fill={PAL.woodDark} />
      <rect x="38" y="-46" width="524" height="10" fill={PAL.woodDark} />
      {/* cửa shoji */}
      {[
        [62, 84],
        [168, 84],
        [400, 84],
      ].map(([wx, ww], i) => (
        <g key={i}>
          <rect x={wx} y="-170" width={ww} height="118" fill={glow ? '#ffeab0' : PAL.shoji} />
          {[1, 2, 3].map((k) => (
            <rect key={k} x={wx + (ww / 4) * k - 1.5} y="-170" width="3" height="118" fill={PAL.woodDark} opacity="0.8" />
          ))}
          {[1, 2].map((k) => (
            <rect key={k} x={wx} y={-170 + 39.5 * k - 1.5} width={ww} height="3" fill={PAL.woodDark} opacity="0.8" />
          ))}
          <rect x={wx - 2} y="-172" width={ww + 4} height="122" fill="none" stroke={PAL.woodDark} strokeWidth="5" />
        </g>
      ))}
      {/* cửa chính + rèm noren */}
      <rect x="276" y="-170" width="100" height="130" fill={PAL.woodLight} />
      <rect x="276" y="-170" width="100" height="130" fill="none" stroke={PAL.woodDark} strokeWidth="5" />
      <rect x="288" y="-182" width="76" height="62" fill={PAL.indigo} />
      <rect x="288" y="-182" width="76" height="8" fill="#243a5c" />
      <path d="M 326 -182 V -120 M 300 -182 V -126 M 352 -182 V -126" stroke="#243a5c" strokeWidth="2" />
      <circle cx="326" cy="-150" r="11" fill="#f1e6c7" opacity="0.9" />
      {/* hiên engawa */}
      <rect x="0" y="-18" width="600" height="14" fill={PAL.woodLight} />
      <rect x="0" y="-6" width="600" height="8" fill={PAL.woodDark} />
      {[30, 570].map((px) => (
        <rect key={px} x={px - 6} y="-190" width="12" height="190" fill={PAL.woodDark} />
      ))}
      {/* mái ngói tầng dưới */}
      <path d="M -50 -176 C 20 -196 60 -214 90 -250 L 510 -250 C 540 -214 580 -196 650 -176 C 600 -168 560 -168 540 -172 L 60 -172 C 40 -168 0 -168 -50 -176 Z" fill={PAL.roof} />
      <path d="M -50 -176 C 20 -196 60 -214 90 -250 L 510 -250 C 540 -214 580 -196 650 -176 C 600 -168 560 -168 540 -172 L 60 -172 C 40 -168 0 -168 -50 -176 Z" fill="url(#beam)" opacity="0.25" />
      <path d="M -30 -186 C 30 -204 70 -224 100 -258 M -10 -176 C 50 -194 90 -214 120 -246 M 640 -186 C 580 -204 540 -224 510 -258" stroke={PAL.roofLight} strokeWidth="3" fill="none" opacity="0.7" />
      {[-216, -198, -184].map((ty, i) => (
        <path key={i} d={`M ${40 + i * 10} ${ty} H ${560 - i * 10}`} stroke={PAL.roofDark} strokeWidth="3" opacity="0.5" />
      ))}
      {/* mái tầng trên (đầu hồi) */}
      <path d="M 120 -246 L 300 -360 L 480 -246 Z" fill={PAL.plaster} />
      <path d="M 100 -240 C 180 -296 250 -340 300 -382 C 350 -340 420 -296 500 -240 C 450 -250 400 -300 300 -350 C 200 -300 150 -250 100 -240 Z" fill={PAL.roofDark} />
      <path d="M 100 -240 C 180 -296 250 -340 300 -382 C 350 -340 420 -296 500 -240 L 480 -240 C 410 -290 350 -330 300 -366 C 250 -330 190 -290 120 -240 Z" fill={PAL.roof} />
      <circle cx="300" cy="-296" r="16" fill={PAL.woodDark} opacity="0.85" />
      <circle cx="300" cy="-296" r="9" fill={PAL.plaster} />
    </g>
  );
}

export function StoneLantern({ x, y, s = 1, lit = false }: { x: number; y: number; s?: number; lit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="64" ry="12" fill="#2f4a37" opacity="0.28" />
      <path d="M -44 0 L 44 0 L 36 -20 L -36 -20 Z" fill={PAL.stoneDark} />
      <rect x="-18" y="-130" width="36" height="112" rx="6" fill={PAL.stone} />
      <path d="M -50 -130 L 50 -130 L 38 -150 L -38 -150 Z" fill={PAL.stoneDark} />
      <rect x="-40" y="-214" width="80" height="66" rx="4" fill={PAL.stone} />
      <rect x="-24" y="-200" width="48" height="38" rx="3" fill={lit ? '#ffe9a6' : '#6b6a60'} />
      {lit && <circle cx="0" cy="-181" r="70" fill="url(#glow-warm)" />}
      <path d="M -70 -214 Q 0 -250 70 -214 L 58 -226 Q 0 -262 -58 -226 Z" fill={PAL.stoneDark} />
      <path d="M -74 -214 Q 0 -262 74 -214 Q 0 -232 -74 -214 Z" fill={PAL.stone} />
      <circle cx="0" cy="-252" r="12" fill={PAL.stoneDark} />
      <path d="M -20 -126 q 6 -8 12 0" stroke="#7da36c" strokeWidth="5" fill="none" opacity="0.7" />
    </g>
  );
}

export function Torii({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-110" y="-250" width="26" height="250" fill={PAL.vermilion} />
      <rect x="84" y="-250" width="26" height="250" fill={PAL.vermilion} />
      <rect x="-110" y="-180" width="220" height="16" fill={PAL.vermilion} />
      <path d="M -150 -262 Q 0 -240 150 -262 L 140 -290 Q 0 -266 -140 -290 Z" fill="#252a30" />
      <path d="M -150 -262 Q 0 -240 150 -262 L 146 -276 Q 0 -254 -146 -276 Z" fill={PAL.vermilion} opacity="0.9" />
    </g>
  );
}

export function Fence({ x, y, w, color = PAL.woodLight }: { x: number; y: number; w: number; color?: string }) {
  const n = Math.floor(w / 46);
  return (
    <g>
      <rect x={x} y={y - 70} width={w} height="10" fill={PAL.woodDark} />
      <rect x={x} y={y - 34} width={w} height="10" fill={PAL.woodDark} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M ${x + i * 46} ${y} V ${y - 98} L ${x + i * 46 + 18} ${y - 112} V ${y} Z`} fill={color} stroke={PAL.woodDark} strokeWidth="2" />
      ))}
    </g>
  );
}

export function Lantern({ x, y, s = 1, color = PAL.vermilion, glow = true }: { x: number; y: number; s?: number; color?: string; glow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow && <circle cx="0" cy="30" r="64" fill="url(#glow-warm)" />}
      <path d="M 0 -50 V 0" stroke="#4b3a2b" strokeWidth="3" />
      <rect x="-14" y="-6" width="28" height="8" rx="2" fill="#3b2b21" />
      <ellipse cx="0" cy="30" rx="30" ry="38" fill={color} />
      <ellipse cx="0" cy="30" rx="30" ry="38" fill="url(#glow-warm)" opacity="0.5" />
      <path d="M -26 14 Q 0 22 26 14 M -30 30 Q 0 40 30 30 M -26 46 Q 0 56 26 46" stroke="#a63a26" strokeWidth="2" fill="none" />
      <rect x="-14" y="64" width="28" height="8" rx="2" fill="#3b2b21" />
      <path d="M 0 72 v 18" stroke="#e7b34b" strokeWidth="3" />
    </g>
  );
}

export function Pond({ cx, cy, rx, ry, children }: { cx: number; cy: number; rx: number; ry: number; children?: ReactNode }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 8} rx={rx + 26} ry={ry + 16} fill={PAL.stoneDark} opacity="0.55" />
      <ellipse cx={cx} cy={cy} rx={rx + 20} ry={ry + 10} fill={PAL.stone} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={PAL.waterDeep} />
      <ellipse cx={cx} cy={cy - 6} rx={rx - 14} ry={ry - 12} fill={PAL.water} />
      <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.35} rx={rx * 0.45} ry={ry * 0.18} fill="#ffffff" opacity="0.28" />
      {children}
    </g>
  );
}

export function Koi({ x, y, s = 1, flip = false, color = '#f08a4b', delay = 0 }: { x: number; y: number; s?: number; flip?: boolean; color?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="art-anim" style={{ animation: `koi-swim 5s ease-in-out ${-delay}s infinite` }}>
        <path d="M -44 0 C -36 -16 12 -18 34 -4 C 44 0 44 4 34 8 C 12 20 -36 16 -44 0 Z" fill={color} />
        <path d="M -44 0 Q -66 -16 -70 -26 Q -56 -4 -70 22 Q -56 14 -44 0 Z" fill={color} opacity="0.85" />
        <circle cx="24" cy="-2" r="3" fill="#2b2430" />
        <path d="M -10 -10 q 14 -4 20 2 q -10 8 -22 6 Z" fill="#fff6ea" opacity="0.9" />
        <path d="M -20 8 q 8 8 20 6" stroke="#fff6ea" strokeWidth="3" fill="none" opacity="0.6" />
      </g>
    </g>
  );
}

/** Tia nắng xuyên kẽ lá (komorebi). */
export function LightBeams({ beams }: { beams: { x: number; w: number; tilt?: number; delay?: number }[] }) {
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      {beams.map((b, i) => (
        <path
          key={i}
          className="art-anim"
          style={{ animation: `beam-pulse 6s ease-in-out ${-(b.delay ?? i * 1.3)}s infinite` }}
          d={`M ${b.x} -40 L ${b.x + b.w} -40 L ${b.x + b.w + (b.tilt ?? 260)} 1100 L ${b.x + (b.tilt ?? 260) - b.w * 0.3} 1100 Z`}
          fill="url(#beam)"
        />
      ))}
    </g>
  );
}

/** Cánh đồng lúa: các luống xếp theo phối cảnh. */
export function RiceField({ x, y, w, h, rows = 6, seed = 4 }: { x: number; y: number; w: number; h: number; rows?: number; seed?: number }) {
  const r = rng(seed);
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w + 80} ${y + h} L ${x - 80} ${y + h} Z`} fill="#8bbf6a" />
      {Array.from({ length: rows }, (_, i) => {
        const t = (i + 1) / (rows + 1);
        const yy = y + h * t;
        const half = w / 2 + 80 * t;
        const cx = x + w / 2;
        return (
          <g key={i}>
            <path d={`M ${cx - half} ${yy} Q ${cx} ${yy - 14 - r() * 8} ${cx + half} ${yy}`} stroke={i % 2 ? '#a8d17f' : '#6fa65b'} strokeWidth={8 + t * 14} fill="none" opacity="0.8" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

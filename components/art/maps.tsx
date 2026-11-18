import type { ReactNode } from 'react';
import { REGIONS } from '../../data/regions';
import type { RegionTheme } from '../../data/types';
import {
  Cloud,
  FarmHouse,
  Flowers,
  Lantern,
  Mountain,
  PAL,
  Pine,
  RiceField,
  Ridge,
  RoundTree,
  SakuraTree,
  SceneSvg,
  Sky,
  Torii,
  Wash,
  rng,
} from './paint';
import { SagaVillageScene } from './sagaVillage';

/* ================================================================== */
/* Đường cong mượt qua các điểm                                        */
/* ================================================================== */

export type Pt = readonly [number, number];

/** Catmull-Rom → đường Bezier, dùng chung cho bản đồ và lớp nút bấm. */
export function smoothPath(points: readonly Pt[], closed = false): string {
  const p = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
  let d = `M ${p[1][0]} ${p[1][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x2} ${y2}`;
  }
  return closed ? `${d} Z` : d;
}

/* ================================================================== */
/* Tranh nhỏ cho từng vùng (vignette) — gốc toạ độ ở tâm               */
/* ================================================================== */

function Ground({ color, dark, rx = 190, ry = 54, y = 70 }: { color: string; dark: string; rx?: number; ry?: number; y?: number }) {
  return (
    <g>
      <ellipse cx="0" cy={y + 12} rx={rx + 10} ry={ry + 6} fill={dark} opacity="0.4" />
      <ellipse cx="0" cy={y} rx={rx} ry={ry} fill={color} />
      <ellipse cx="-30" cy={y - 12} rx={rx * 0.72} ry={ry * 0.5} fill="#ffffff" opacity="0.14" />
    </g>
  );
}

function SagaVignette() {
  return (
    <g>
      <Ground color="#8fc56e" dark="#4f7d44" />
      <g opacity="0.9">
        <path d="M -190 70 Q -100 40 -10 70 Q -100 100 -190 70 Z" fill="#a7d57c" />
        <path d="M -150 84 Q -60 60 30 84 Q -60 108 -150 84 Z" fill="#7fb65f" />
      </g>
      <FarmHouse x={-150} y={74} s={0.42} />
      <SakuraTree x={120} y={86} s={0.5} />
      <g transform="translate(40 90)">
        <rect x="-3" y="-34" width="6" height="34" fill={PAL.woodDark} />
        <rect x="-22" y="-34" width="44" height="5" fill={PAL.woodDark} />
      </g>
    </g>
  );
}

function LightForestVignette() {
  return (
    <g>
      <Ground color="#6aa56a" dark="#35603f" />
      <path d="M -60 -110 L -10 -110 L 60 80 L -30 80 Z" fill="url(#beam)" opacity="0.8" />
      <path d="M 40 -120 L 80 -120 L 150 70 L 90 70 Z" fill="url(#beam)" opacity="0.6" />
      <Pine x={-130} y={86} s={0.55} />
      <Pine x={-60} y={96} s={0.42} color="#2f6a52" />
      <Pine x={110} y={90} s={0.6} />
      <RoundTree x={20} y={92} s={0.42} leaf="#4f9a5d" light="#85c479" dark="#2f6a46" />
      <Pine x={165} y={80} s={0.4} color="#2f6a52" />
      {[[-90, -20], [-20, -50], [60, -10], [130, -60], [10, 10]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#fff3a8" className="art-anim" style={{ animation: `firefly ${3 + i * 0.7}s ease-in-out ${-i}s infinite` }} />
      ))}
    </g>
  );
}

function CatTownVignette() {
  const house = (x: number, w: number, h: number, wall: string, roof: string) => (
    <g transform={`translate(${x} 80)`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} />
      <path d={`M ${-w / 2 - 10} ${-h} L ${-w / 2 + 6} ${-h - 34} L ${-w / 4} ${-h - 16} L 0 ${-h - 40} L ${w / 4} ${-h - 16} L ${w / 2 - 6} ${-h - 34} L ${w / 2 + 10} ${-h} Z`} fill={roof} />
      <rect x="-12" y={-h * 0.65} width="24" height={h * 0.65} fill={PAL.woodDark} opacity="0.8" />
      <rect x={-w / 2 + 10} y={-h + 14} width="20" height="22" fill="#ffeab0" />
    </g>
  );
  return (
    <g>
      <Ground color="#e6cf9c" dark="#9b7f4f" />
      {house(-120, 76, 62, '#f7e4d1', '#d9786a')}
      {house(120, 80, 70, '#e9f0e0', '#6f9fb8')}
      {house(-10, 60, 50, '#f9efd0', '#c9a24d')}
      {/* tượng mèo may mắn */}
      <g transform="translate(-10 4)">
        <ellipse cx="0" cy="-30" rx="26" ry="32" fill="#fffaf0" />
        <circle cx="0" cy="-70" r="24" fill="#fffaf0" />
        <path d="M -22 -82 L -18 -104 L -4 -90 Z M 22 -82 L 18 -104 L 4 -90 Z" fill="#fffaf0" />
        <path d="M -22 -82 L -18 -104 L -10 -94 Z M 22 -82 L 18 -104 L 10 -94 Z" fill="#f4bccb" />
        <circle cx="-8" cy="-72" r="3" fill="#33403f" />
        <circle cx="8" cy="-72" r="3" fill="#33403f" />
        <path d="M -4 -64 q 4 4 8 0" stroke="#d9533a" strokeWidth="2" fill="none" />
        <circle cx="0" cy="-48" r="5" fill="#e8b04a" />
        <path d="M 24 -40 q 18 -16 6 -34" stroke="#fffaf0" strokeWidth="9" strokeLinecap="round" fill="none" />
      </g>
      <Lantern x={168} y={-30} s={0.5} />
    </g>
  );
}

function SchoolVignette() {
  return (
    <g>
      <Ground color="#eadcb8" dark="#a38e5d" />
      <rect x="-170" y="-40" width="250" height="110" fill="#f6ecd2" />
      <rect x="-176" y="-52" width="262" height="18" fill="#58697a" />
      {[-150, -110, -70, -30, 10, 50].map((x) => (
        <rect key={x} x={x} y="-20" width="26" height="30" fill="#bde0ea" stroke={PAL.woodDark} strokeWidth="2" />
      ))}
      <rect x="-60" y="30" width="40" height="40" fill={PAL.woodLight} />
      <rect x="-10" y="-110" width="64" height="70" fill="#f6ecd2" />
      <path d="M -18 -110 L 22 -140 L 62 -110 Z" fill="#58697a" />
      <circle cx="22" cy="-80" r="20" fill="#fffaf0" stroke={PAL.woodDark} strokeWidth="4" />
      <path d="M 22 -80 V -92 M 22 -80 L 32 -74" stroke={PAL.woodDark} strokeWidth="3" />
      <g transform="translate(120 70)">
        <SakuraTree x={0} y={10} s={0.42} />
      </g>
      <g transform="translate(-186 70)">
        <rect x="-2" y="-90" width="4" height="90" fill="#6a6f73" />
        <rect x="2" y="-90" width="34" height="22" fill="#fffaf0" stroke="#ddd" />
        <circle cx="19" cy="-79" r="7" fill={PAL.vermilion} />
      </g>
    </g>
  );
}

function RailwayVignette() {
  return (
    <g>
      <Ground color="#9ccb78" dark="#56804a" />
      <path d="M -190 78 Q 0 30 190 78" stroke="#6a6f73" strokeWidth="10" fill="none" />
      <path d="M -190 90 Q 0 42 190 90" stroke="#6a6f73" strokeWidth="10" fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 11;
        const x = -180 + t * 360;
        const y = 82 - Math.sin(t * Math.PI) * 38;
        return <rect key={i} x={x - 3} y={y - 4} width="6" height="18" fill={PAL.woodDark} opacity="0.7" />;
      })}
      {/* tàu */}
      <g transform="translate(-30 12)">
        <rect x="-70" y="-36" width="72" height="44" rx="8" fill="#d9533a" />
        <rect x="-60" y="-28" width="22" height="18" rx="3" fill="#bde0ea" />
        <rect x="-32" y="-28" width="22" height="18" rx="3" fill="#bde0ea" />
        <rect x="8" y="-30" width="80" height="38" rx="8" fill="#f6ecd2" />
        <rect x="16" y="-22" width="20" height="16" rx="3" fill="#bde0ea" />
        <rect x="44" y="-22" width="20" height="16" rx="3" fill="#bde0ea" />
        <circle cx="-48" cy="12" r="9" fill="#33403f" />
        <circle cx="-14" cy="12" r="9" fill="#33403f" />
        <circle cx="30" cy="12" r="9" fill="#33403f" />
        <circle cx="70" cy="12" r="9" fill="#33403f" />
        <circle cx="-56" cy="-52" r="13" fill="#fffaf0" opacity="0.85" className="art-anim" style={{ animation: 'steam-rise 3s ease-in-out infinite' }} />
        <circle cx="-44" cy="-68" r="17" fill="#fffaf0" opacity="0.7" className="art-anim" style={{ animation: 'steam-rise 3s ease-in-out -1s infinite' }} />
      </g>
      <g transform="translate(130 30)">
        <rect x="-36" y="-40" width="72" height="50" fill="#f7e4d1" />
        <path d="M -46 -40 L 0 -72 L 46 -40 Z" fill="#58697a" />
        <rect x="-10" y="-20" width="20" height="30" fill={PAL.woodDark} opacity="0.8" />
      </g>
    </g>
  );
}

function MarketVignette() {
  const stall = (x: number, color: string) => (
    <g transform={`translate(${x} 70)`}>
      <rect x="-42" y="-50" width="84" height="50" fill={PAL.woodLight} />
      <path d="M -52 -50 L -44 -86 H 44 L 52 -50 Z" fill={color} />
      {[-30, -10, 10, 30].map((sx) => (
        <path key={sx} d={`M ${sx - 6} -86 L ${sx - 8} -50 H ${sx + 8} L ${sx + 6} -86 Z`} fill="#fffaf0" opacity="0.85" />
      ))}
      <circle cx="-18" cy="-22" r="9" fill="#f4a33d" />
      <circle cx="4" cy="-22" r="9" fill="#e86a3d" />
      <circle cx="24" cy="-22" r="9" fill="#9acf6a" />
    </g>
  );
  return (
    <g>
      <Ground color="#e8d5a8" dark="#a3865a" />
      {stall(-110, '#d9533a')}
      {stall(0, '#3f8f86')}
      {stall(110, '#e6b84a')}
      <path d="M -150 -80 Q -75 -48 0 -80 Q 75 -48 150 -80" stroke="#4b3a2b" strokeWidth="3" fill="none" />
      {[-130, -80, -30, 30, 80, 130].map((x, i) => (
        <g key={x}>
          <Lantern x={x} y={-76 + (i % 2) * 14 + 6} s={0.3} color={i % 2 ? '#e6b84a' : PAL.vermilion} />
        </g>
      ))}
    </g>
  );
}

function FestivalVignette() {
  return (
    <g>
      <Ground color="#c9a9c8" dark="#6d5278" />
      {/* pháo hoa */}
      <g className="art-anim" style={{ animation: 'firework 3.6s ease-out infinite' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M 0 0 L 0 -42" stroke={i % 2 ? '#ffd86a' : '#ff9ab4'} strokeWidth="5" strokeLinecap="round" transform={`translate(70 -80) rotate(${i * 30})`} />
        ))}
      </g>
      {/* tháp yagura */}
      <g transform="translate(-30 74)">
        <rect x="-50" y="-30" width="100" height="30" fill={PAL.woodLight} />
        <rect x="-44" y="-70" width="88" height="40" fill="#e9c58d" />
        <path d="M -64 -70 L 0 -108 L 64 -70 Z" fill={PAL.vermilion} />
        <path d="M -52 -30 H 52 M -52 -70 H 52" stroke={PAL.woodDark} strokeWidth="5" />
        <circle cx="0" cy="-52" r="14" fill="#fffaf0" />
        <circle cx="0" cy="-52" r="6" fill={PAL.vermilion} />
      </g>
      {[-150, -110, -70, 40, 80, 120, 160].map((x, i) => (
        <Lantern key={x} x={x} y={-30 + (i % 3) * 10} s={0.34} color={['#d9533a', '#e6b84a', '#f48aa0'][i % 3]} />
      ))}
    </g>
  );
}

function FujiVignette() {
  return (
    <g>
      <Ground color="#d8e6e0" dark="#7d96a3" />
      <path d="M -190 -30 Q -60 -60 0 -50 Q 80 -60 190 -26" stroke="#ffd7d0" strokeWidth="14" fill="none" opacity="0.6" />
      <Mountain x={0} y={80} w={420} h={200} color="#6f8fb0" shade="#4f6f92" snow />
      <Mountain x={-150} y={80} w={200} h={80} color="#8aa7a4" />
      <Mountain x={160} y={80} w={200} h={70} color="#8aa7a4" />
      <Torii x={140} y={96} s={0.32} />
      <Pine x={-120} y={98} s={0.4} />
      <Pine x={-80} y={104} s={0.3} color="#2f6a52" />
    </g>
  );
}

const VIGNETTES: Record<RegionTheme, () => ReactNode> = {
  countryside: SagaVignette,
  lightForest: LightForestVignette,
  catTown: CatTownVignette,
  school: SchoolVignette,
  railway: RailwayVignette,
  market: MarketVignette,
  festival: FestivalVignette,
  fuji: FujiVignette,
};

/** Tranh nhỏ đặt tại vị trí `x,y` — dùng trong bản đồ thế giới và hộp xem trước vùng khoá. */
export function RegionVignette({ theme, x = 0, y = 0, s = 1 }: { theme: RegionTheme; x?: number; y?: number; s?: number }) {
  const V = VIGNETTES[theme];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <V />
    </g>
  );
}

/** Hộp SVG độc lập chứa một vignette (cho thẻ vùng, hộp xem trước). */
export function RegionVignetteCard({ theme }: { theme: RegionTheme }) {
  return (
    <svg viewBox="-220 -150 440 300" className="art-svg" aria-hidden>
      <rect x="-220" y="-150" width="440" height="300" fill="#f3e6c8" />
      <rect x="-220" y="-150" width="440" height="300" fill="url(#glow-warm)" opacity="0.2" />
      <Wash soft>
        <RegionVignette theme={theme} />
      </Wash>
    </svg>
  );
}

/* ================================================================== */
/* Bản đồ thế giới                                                      */
/* ================================================================== */

const COAST: Pt[] = [
  [110, 400],
  [190, 290],
  [470, 245],
  [830, 285],
  [1180, 240],
  [1540, 280],
  [1790, 360],
  [1870, 560],
  [1800, 740],
  [1870, 900],
  [1680, 1010],
  [1320, 985],
  [1000, 1035],
  [640, 1005],
  [290, 1030],
  [110, 930],
  [80, 700],
  [140, 540],
];

const BIOMES: Record<RegionTheme, string> = {
  countryside: '#b6d97c',
  lightForest: '#5f9a6a',
  catTown: '#e7cf9b',
  school: '#f1dcc3',
  railway: '#a9c78a',
  market: '#efc98f',
  festival: '#d3b2cf',
  fuji: '#cfdde0',
};

/** Đường đi nối 8 vùng theo thứ tự. */
export function worldRoadPoints(): Pt[] {
  return REGIONS.map((r) => [r.marker.x, r.marker.y + 8] as const);
}

export function WorldMapArt() {
  const r = rng(77);
  const trees: { x: number; y: number; k: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const x = 160 + r() * 1650;
    const y = 300 + r() * 700;
    const tooClose = REGIONS.some((reg) => Math.abs(reg.marker.x - x) < 250 && Math.abs(reg.marker.y + 20 - y) < 190);
    if (!tooClose) trees.push({ x, y, k: r() });
  }
  const road = smoothPath(worldRoadPoints());
  return (
    <SceneSvg label="Bản đồ thế giới Komorebi với tám vùng đất">
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fcbd0" />
          <stop offset="0.6" stopColor="#a8dad4" />
          <stop offset="1" stopColor="#8cc5cc" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9e3a6" />
          <stop offset="1" stopColor="#a7cf86" />
        </linearGradient>
      </defs>
      <rect x="-40" y="-40" width="2000" height="1160" fill="url(#sea)" />
      <Wash>
        {[
          [300, 140, 360, 80],
          [1500, 130, 420, 70],
          [960, 1060, 520, 60],
          [60, 640, 80, 220],
          [1890, 520, 60, 240],
        ].map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#b9e6e0" opacity="0.7" />
        ))}
      </Wash>
      {/* sóng */}
      <g stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round">
        {Array.from({ length: 36 }, (_, i) => {
          const rr = rng(i * 13 + 1);
          const x = rr() * 1920;
          const y = rr() > 0.5 ? 40 + rr() * 150 : 1010 + rr() * 60;
          return <path key={i} d={`M ${x} ${y} q 14 -12 28 0 t 28 0`} />;
        })}
      </g>
      {/* bờ biển cát */}
      <path d={smoothPath(COAST, true)} fill="#f4e3b6" stroke="#f4e3b6" strokeWidth="46" strokeLinejoin="round" opacity="0.95" />
      <Wash>
        <path d={smoothPath(COAST, true)} fill="url(#land)" />
        {/* vùng sinh thái */}
        {REGIONS.map((reg) => (
          <ellipse key={reg.id} cx={reg.marker.x} cy={reg.marker.y + 10} rx="300" ry="190" fill={BIOMES[reg.theme]} opacity="0.75" />
        ))}
        {/* sông */}
        <path d="M 290 330 C 420 420 330 560 500 620 C 700 690 860 560 980 680 C 1090 790 960 900 1060 1040" stroke="#8cc5cf" strokeWidth="38" fill="none" strokeLinecap="round" />
        <path d="M 290 330 C 420 420 330 560 500 620 C 700 690 860 560 980 680 C 1090 790 960 900 1060 1040" stroke="#b7e0e3" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="1420" cy="640" rx="130" ry="70" fill="#8cc5cf" />
        <ellipse cx="1400" cy="630" rx="90" ry="40" fill="#b7e0e3" opacity="0.7" />
      </Wash>
      <Wash soft>
        {trees.map((t, i) =>
          t.k > 0.5 ? <Pine key={i} x={t.x} y={t.y} s={0.13 + t.k * 0.07} /> : <RoundTree key={i} x={t.x} y={t.y} s={0.11 + t.k * 0.08} />,
        )}
      </Wash>
      {/* đường đi giữa các vùng */}
      <path d={road} stroke="#f7edcc" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d={road} stroke="#c49a63" strokeWidth="5" fill="none" strokeDasharray="2 16" strokeLinecap="round" />
      {/* vignette 8 vùng */}
      <Wash soft>
        {REGIONS.map((reg) => (
          <RegionVignette key={reg.id} theme={reg.theme} x={reg.marker.x} y={reg.marker.y - 44} />
        ))}
      </Wash>
      {/* thuyền buồm */}
      <g transform="translate(110 1000)" className="art-anim" style={{ animation: 'boat-bob 5s ease-in-out infinite' }}>
        <path d="M -40 0 H 50 L 34 22 H -26 Z" fill={PAL.woodLight} />
        <path d="M 4 0 V -76 L 52 -8 Z" fill="#fffaf0" />
        <path d="M 0 0 V -66 L -34 -10 Z" fill="#f4e3b6" />
      </g>
      <Cloud x={420} y={300} s={1.1} drift={180} delay={40} opacity={0.5} />
      <Cloud x={1400} y={940} s={1.2} drift={220} delay={120} opacity={0.5} />
    </SceneSvg>
  );
}

/* ================================================================== */
/* Bản đồ vùng                                                          */
/* ================================================================== */

/** Vị trí 10 nút stage trên canvas (dùng chung cho tranh và lớp nút bấm). */
export const STAGE_POSITIONS: Pt[] = [
  [200, 880],
  [470, 820],
  [760, 880],
  [1040, 810],
  [1250, 690],
  [1010, 590],
  [730, 560],
  [440, 500],
  [700, 385],
  [1010, 330],
];

interface Palette {
  sky: [string, string, string];
  far: [string, string];
  mid: [string, string];
  near: [string, string];
  ground: [string, string];
  path: string;
}

const PALETTES: Record<RegionTheme, Palette> = {
  countryside: { sky: ['#8dccd6', '#fbe5b8', '#cfe8dc'], far: ['#a2c7b0', '#86b196'], mid: ['#8dc27e', '#6aa75e'], near: ['#90c46f', '#68a251'], ground: ['#9bd07a', '#6aa64f'], path: '#ecdcb0' },
  lightForest: { sky: ['#8ac1c9', '#e3ecbf', '#bcd9c8'], far: ['#6f9d86', '#5a8872'], mid: ['#4f8b66', '#3b7556'], near: ['#5c9a68', '#3f7a52'], ground: ['#6aa66a', '#3f7a52'], path: '#d7caa0' },
  catTown: { sky: ['#a8d1dc', '#fde0bb', '#e6e9d4'], far: ['#b8c9b5', '#a4b79f'], mid: ['#c9cf9d', '#b2ba84'], near: ['#d9c590', '#c4ae77'], ground: ['#dcc995', '#c3ad78'], path: '#f4e8c9' },
  school: { sky: ['#a6d3e3', '#fde8cf', '#e9eadb'], far: ['#b5c9bc', '#9fb7aa'], mid: ['#a9cd9a', '#8dba82'], near: ['#bad8a0', '#9ac381'], ground: ['#c3dda6', '#9dc582'], path: '#f2e6c8' },
  railway: { sky: ['#94c4de', '#f6e4c3', '#d6e6df'], far: ['#9bb7c2', '#86a3b0'], mid: ['#92bf82', '#76a96b'], near: ['#9ccc78', '#79ab5a'], ground: ['#a8d484', '#7fb35f'], path: '#d9d3c0' },
  market: { sky: ['#f2c58f', '#fbe6b8', '#f3d6a5'], far: ['#c9a98b', '#b69274'], mid: ['#d3b27d', '#bf9c68'], near: ['#e0c28d', '#c9a773'], ground: ['#e8d1a0', '#cfb27c'], path: '#f6ead0' },
  festival: { sky: ['#6e7fb8', '#f0a9b4', '#a68fc0'], far: ['#7e86b0', '#6b739b'], mid: ['#6d8b94', '#587681'], near: ['#7a9a8c', '#5f8275'], ground: ['#86a893', '#628574'], path: '#e9d4b5' },
  fuji: { sky: ['#a9cde4', '#fdeee0', '#dbe8ee'], far: ['#b8cad6', '#9fb5c4'], mid: ['#a3bec4', '#87a5ad'], near: ['#c6d8d2', '#a8c0bb'], ground: ['#d6e3df', '#b3c9c4'], path: '#f7f1e4' },
};

export function RegionLandscape({ theme }: { theme: RegionTheme }) {
  const p = PALETTES[theme];
  const pathD = smoothPath(STAGE_POSITIONS);
  const isDusk = theme === 'festival';
  if (theme === 'countryside') return <SagaVillageScene pathD={pathD} />;
  return (
    <SceneSvg label="Phong cảnh vùng với con đường đi qua mười chặng">
      <Sky id={`sky-reg-${theme}`} stops={p.sky} height={720} />
      {isDusk ? (
        <g>
          {Array.from({ length: 40 }, (_, i) => {
            const rr = rng(i * 7 + 2);
            return <circle key={i} cx={rr() * 1920} cy={rr() * 340} r={1 + rr() * 2.4} fill="#fff7d8" opacity={0.4 + rr() * 0.5} />;
          })}
        </g>
      ) : (
        <Cloud x={1450} y={170} s={1.1} drift={170} delay={50} opacity={0.85} />
      )}
      <Cloud x={520} y={230} s={0.9} drift={210} delay={110} opacity={0.75} />
      <Wash>
        <Mountain x={420} y={500} w={800} h={290} color={p.far[0]} shade={p.far[1]} snow={theme === 'fuji'} />
        <Mountain x={1500} y={500} w={1000} h={380} color={p.far[0]} shade={p.far[1]} snow={theme === 'fuji'} />
        <Ridge id={`rr-mid-${theme}`} y={470} amp={30} seed={17} top={p.mid[0]} bottom={p.mid[1]} />
        <Ridge id={`rr-near-${theme}`} y={560} amp={26} seed={23} top={p.near[0]} bottom={p.near[1]} />
        <Ridge id={`rr-gnd-${theme}`} y={650} amp={22} seed={29} top={p.ground[0]} bottom={p.ground[1]} />
      </Wash>
      <Wash>
        {/* dòng sông */}
        <path d="M 1500 600 C 1400 700 1500 800 1380 900 C 1300 980 1380 1040 1320 1100" stroke="#8cc5cf" strokeWidth="70" fill="none" strokeLinecap="round" />
        <path d="M 1500 600 C 1400 700 1500 800 1380 900 C 1300 980 1380 1040 1320 1100" stroke="#bfe5e6" strokeWidth="24" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* con đường */}
        <path d={pathD} stroke="#9c7b4f" strokeWidth="76" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
        <path d={pathD} stroke={p.path} strokeWidth="64" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathD} stroke="#ffffff" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
      </Wash>
      <Wash soft>
        <RoundTree x={100} y={760} s={0.9} sway={9} />
        <RoundTree x={320} y={950} s={0.7} sway={11} delay={3} />
        <Pine x={1560} y={850} s={0.9} />
        <Pine x={1700} y={880} s={0.75} />
        <Pine x={90} y={560} s={0.6} />
        <RoundTree x={1180} y={940} s={0.75} sway={10} delay={5} />
        <Flowers x={560} y={960} w={300} seed={5} />
        <Flowers x={1300} y={1020} w={260} seed={8} />
      </Wash>
      {/* tranh chủ đề của vùng đặt nổi bật phía trên bên phải */}
      <Wash soft>
        <RegionVignette theme={theme} x={1580} y={500} s={1.1} />
      </Wash>
    </SceneSvg>
  );
}

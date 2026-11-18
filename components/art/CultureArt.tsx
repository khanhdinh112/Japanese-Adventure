import type { ReactNode } from 'react';
import { Wash } from './paint';

/**
 * Tranh minh hoạ gốc (SVG màu nước) cho thẻ "Khám phá văn hóa": giúp bé hình dung げんかん,
 * bữa ăn, đồn cảnh sát nhỏ, mèo may mắn, vườn Nhật… mà không cần đọc nhiều chữ.
 * Khoá theo id của mục văn hoá trong data/culture.ts.
 */

const INK = '#3a2a2c';

function Frame({ id, label, top, bottom, children }: { id: string; label: string; top: string; bottom: string; children: ReactNode }) {
  return (
    <svg className="cu-art-svg" viewBox="0 0 600 340" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`cu-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="600" height="340" fill={`url(#cu-${id})`} />
      <Wash soft>{children}</Wash>
    </svg>
  );
}

function Shoe({ x, y, color, flip = false }: { x: number; y: number; color: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="4" cy="26" rx="62" ry="9" fill="#000" opacity="0.18" />
      <path d="M -58 20 C -60 0 -50 -8 -30 -10 L -6 -38 C 4 -46 20 -40 26 -28 L 34 -10 C 52 -6 64 4 62 20 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M -58 20 L 62 20 L 62 28 L -58 28 Z" fill="#fff7e6" stroke={INK} strokeWidth="3" />
      <path d="M -12 -30 L 6 -22 M -4 -20 L 14 -12" stroke="#fff7e6" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Genkan() {
  return (
    <Frame id="genkan" label="Cửa vào nhà Nhật: giày xếp gọn dưới sàn đá, dép trên bậc gỗ" top="#fbeed2" bottom="#f1dcb6">
      {/* tường và cửa shoji */}
      <rect x="0" y="0" width="600" height="230" fill="#f7ecd4" />
      <rect x="40" y="26" width="260" height="190" fill="#fffaf0" stroke="#8a5b34" strokeWidth="8" />
      {[110, 175, 240].map((x) => (
        <path key={x} d={`M ${x} 26 V 216`} stroke="#8a5b34" strokeWidth="5" />
      ))}
      {[90, 150].map((y) => (
        <path key={y} d={`M 40 ${y} H 300`} stroke="#8a5b34" strokeWidth="5" />
      ))}
      <rect x="48" y="34" width="244" height="174" fill="#fff6c8" opacity="0.5" />
      {/* tranh treo + bình hoa */}
      <rect x="350" y="46" width="70" height="110" fill="#f3e2b3" stroke="#8a5b34" strokeWidth="5" />
      <path d="M 365 130 Q 385 70 405 130 M 385 76 L 385 130" stroke="#5a8a5a" strokeWidth="5" fill="none" />
      <path d="M 470 214 L 520 214 L 512 164 L 478 164 Z" fill="#7a9fbf" stroke={INK} strokeWidth="3" />
      <path d="M 495 164 Q 470 120 440 110 M 495 164 Q 500 100 520 80 M 495 164 Q 530 130 560 126" stroke="#5a8a5a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="440" cy="108" r="9" fill="#f08aa6" /><circle cx="520" cy="78" r="9" fill="#f08aa6" /><circle cx="560" cy="124" r="9" fill="#f08aa6" />
      {/* sàn gỗ cao (bậc lên nhà) */}
      <rect x="300" y="214" width="300" height="126" fill="#c98f58" />
      <rect x="300" y="214" width="300" height="22" fill="#e2b078" stroke={INK} strokeWidth="3" />
      {[330, 400, 470, 540].map((x) => (
        <path key={x} d={`M ${x} 238 V 340`} stroke="#a8713f" strokeWidth="3" opacity="0.6" />
      ))}
      {/* sàn đá thấp nơi cởi giày */}
      <path d="M 0 232 L 300 232 L 300 340 L 0 340 Z" fill="#b9b3a4" />
      <path d="M 0 232 H 300" stroke={INK} strokeWidth="3" />
      {[[40, 270], [120, 300], [200, 262], [250, 312]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="22" ry="7" fill="#a39d8e" />
      ))}
      <Shoe x={92} y={268} color="#9a7bd1" />
      <Shoe x={212} y={268} color="#e98a6b" />
      {/* dép đi trong nhà trên bậc gỗ */}
      <g transform="translate(400 262)">
        <ellipse cx="0" cy="12" rx="34" ry="10" fill="#fff" stroke={INK} strokeWidth="3" />
        <ellipse cx="70" cy="12" rx="34" ry="10" fill="#fff" stroke={INK} strokeWidth="3" />
        <path d="M -22 8 Q 0 -10 22 8 M 48 8 Q 70 -10 92 8" stroke="#7aa3cc" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

function Itadakimasu() {
  return (
    <Frame id="ita" label="Bữa cơm Nhật: bát cơm, súp miso, cá nướng và đôi đũa đặt ngay ngắn" top="#fdebc8" bottom="#f4cf9a">
      {/* bàn gỗ */}
      <rect x="0" y="230" width="600" height="110" fill="#c98f58" />
      <rect x="0" y="230" width="600" height="14" fill="#e2b078" />
      {/* khay */}
      <path d="M 70 236 L 530 236 L 500 328 L 100 328 Z" fill="#6d4a35" stroke={INK} strokeWidth="4" />
      <path d="M 86 244 L 514 244 L 490 318 L 110 318 Z" fill="#8d6246" />
      {/* bát cơm */}
      <g transform="translate(170 250)">
        <path d="M -70 -22 Q -70 50 0 56 Q 70 50 70 -22 Z" fill="#fff7e6" stroke={INK} strokeWidth="4" />
        <path d="M -70 -22 Q 0 -64 70 -22 Q 0 -4 -70 -22 Z" fill="#ffffff" stroke={INK} strokeWidth="3" />
        <path d="M -52 -26 Q 0 -72 52 -26" fill="#fffdf6" />
        <path d="M -40 20 H 40" stroke="#e98a6b" strokeWidth="6" />
        <g stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M -24 -70 q -14 -20 0 -40 q 14 -20 0 -40" />
          <path d="M 14 -72 q -14 -20 0 -40 q 14 -20 0 -40" />
        </g>
      </g>
      {/* súp miso */}
      <g transform="translate(330 252)">
        <path d="M -58 -14 Q -58 48 0 52 Q 58 48 58 -14 Z" fill="#b8402e" stroke={INK} strokeWidth="4" />
        <ellipse cx="0" cy="-14" rx="58" ry="14" fill="#c9965a" stroke={INK} strokeWidth="3" />
        <rect x="-18" y="-20" width="14" height="8" rx="2" fill="#f4e3a1" /><circle cx="20" cy="-14" r="6" fill="#6fae62" />
        <g stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M -6 -34 q -12 -16 0 -32 q 12 -16 0 -32" />
        </g>
      </g>
      {/* đĩa cá */}
      <g transform="translate(450 270)">
        <ellipse cx="0" cy="8" rx="58" ry="20" fill="#7a9fbf" stroke={INK} strokeWidth="4" />
        <path d="M -38 4 Q -10 -22 28 0 L 44 -10 L 44 18 L 28 8 Q -10 28 -38 4 Z" fill="#e9905a" stroke={INK} strokeWidth="3" />
        <circle cx="-24" cy="2" r="3" fill={INK} />
      </g>
      {/* đũa đặt trên gác đũa */}
      <path d="M 230 300 L 410 282 M 230 308 L 410 290" stroke="#5a3a25" strokeWidth="5" strokeLinecap="round" />
      <rect x="296" y="296" width="34" height="14" rx="5" fill="#e98a6b" stroke={INK} strokeWidth="3" />
      {/* hai bàn tay chắp lại */}
      <g transform="translate(300 80)">
        <path d="M -40 40 Q -36 -20 0 -40 Q 36 -20 40 40 Z" fill="#fbd7b5" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 0 -40 V 40" stroke={INK} strokeWidth="3" />
        <path d="M -56 52 L -40 28 L 40 28 L 56 52 Z" fill="#e98a6b" stroke={INK} strokeWidth="3" />
        <path d="M -14 -6 q 6 -8 14 -2 M 4 -6 q 6 -8 14 -2" stroke={INK} strokeWidth="2.5" fill="none" opacity="0.6" />
      </g>
    </Frame>
  );
}

function Otoshimono() {
  return (
    <Frame id="oto" label="Đồn cảnh sát nhỏ ở góc phố, đồ rơi như ví, ô, chìa khoá được mang đến" top="#bfe0e6" bottom="#f5e6c0">
      <ellipse cx="90" cy="60" rx="70" ry="22" fill="#fff" opacity="0.8" /><ellipse cx="500" cy="48" rx="80" ry="24" fill="#fff" opacity="0.7" />
      {/* đường phố */}
      <rect x="0" y="236" width="600" height="104" fill="#cfc8b6" />
      <path d="M 0 262 H 600" stroke="#fffaf0" strokeWidth="6" strokeDasharray="34 26" />
      {/* koban */}
      <g transform="translate(300 232)">
        <rect x="-130" y="-120" width="260" height="120" fill="#fff6e4" stroke={INK} strokeWidth="4" />
        <path d="M -156 -118 L 0 -190 L 156 -118 Z" fill="#3e6fa6" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M -156 -118 H 156" stroke={INK} strokeWidth="4" />
        <rect x="-26" y="-90" width="52" height="90" fill="#7a5030" stroke={INK} strokeWidth="3" />
        <rect x="-108" y="-92" width="60" height="52" fill="#bfe0e6" stroke={INK} strokeWidth="3" /><rect x="48" y="-92" width="60" height="52" fill="#bfe0e6" stroke={INK} strokeWidth="3" />
        <path d="M -78 -92 V -40 M 78 -92 V -40" stroke={INK} strokeWidth="2" />
        <circle cx="0" cy="-146" r="14" fill="#f4c542" stroke={INK} strokeWidth="3" />
        {/* đèn đỏ */}
        <path d="M -146 -118 V -86" stroke={INK} strokeWidth="3" />
        <ellipse cx="-146" cy="-70" rx="16" ry="22" fill="#d9533a" stroke={INK} strokeWidth="3" />
        <ellipse cx="-146" cy="-70" rx="10" ry="16" fill="#ff8a6b" opacity="0.7" />
      </g>
      {/* ví */}
      <g transform="translate(90 300)">
        <ellipse cx="0" cy="22" rx="46" ry="8" fill="#000" opacity="0.15" />
        <rect x="-40" y="-20" width="80" height="48" rx="8" fill="#9a5a32" stroke={INK} strokeWidth="3" />
        <path d="M -40 -4 H 40" stroke={INK} strokeWidth="3" /><circle cx="22" cy="12" r="6" fill="#f4c542" stroke={INK} strokeWidth="2" />
      </g>
      {/* ô */}
      <g transform="translate(470 290) rotate(-14)">
        <path d="M -70 0 Q 0 -78 70 0 Q 46 -14 24 0 Q 0 -14 -24 0 Q -46 -14 -70 0 Z" fill="#d9533a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 0 -4 V 50 Q 0 64 14 60" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* chìa khoá */}
      <g transform="translate(200 312)">
        <circle cx="0" cy="0" r="12" fill="none" stroke="#c9a23a" strokeWidth="6" />
        <path d="M 12 0 H 54 M 40 0 V 12 M 50 0 V 10" stroke="#c9a23a" strokeWidth="6" strokeLinecap="round" />
      </g>
    </Frame>
  );
}

function Origami() {
  return (
    <Frame id="ori" label="Hạc giấy gấp và tượng mèo may mắn vẫy tay" top="#f6e9ff" bottom="#fbe3cf">
      <rect x="0" y="262" width="600" height="78" fill="#c98f58" /><rect x="0" y="262" width="600" height="12" fill="#e2b078" />
      {/* giấy gấp bay */}
      {[[70, 70, '#8ec9e8', -14], [130, 40, '#f4b942', 10], [520, 56, '#f08aa6', 12], [470, 120, '#9bd08a', -8]].map(([x, y, c, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M -22 0 L 0 -22 L 22 0 L 0 22 Z" fill={c as string} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M -22 0 H 22" stroke={INK} strokeWidth="2" opacity="0.4" />
        </g>
      ))}
      {/* hạc giấy */}
      <g transform="translate(200 210)">
        <ellipse cx="0" cy="58" rx="86" ry="10" fill="#000" opacity="0.14" />
        <path d="M -90 -50 L -10 0 L -50 20 Z" fill="#f08aa6" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 90 -64 L 8 0 L 50 22 Z" fill="#f6a6bd" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M -50 20 L -10 0 L 8 0 L 50 22 L 0 62 Z" fill="#fff2f6" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M -10 0 L -60 -62 L -48 -66 L 0 -10 Z" fill="#fde0ea" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M -60 -62 L -78 -58 L -62 -70 Z" fill="#e98a6b" stroke={INK} strokeWidth="2" />
        <path d="M 50 22 L 88 40 L 56 34 Z" fill="#fde0ea" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 0 62 V 0" stroke={INK} strokeWidth="2" opacity="0.35" />
      </g>
      {/* mèo may mắn */}
      <g transform="translate(430 256)">
        <ellipse cx="0" cy="10" rx="72" ry="12" fill="#000" opacity="0.14" />
        <path d="M -56 6 Q -62 -70 0 -76 Q 62 -70 56 6 Z" fill="#fffaf0" stroke={INK} strokeWidth="4" />
        <circle cx="0" cy="-112" r="52" fill="#fffaf0" stroke={INK} strokeWidth="4" />
        <path d="M -44 -148 L -40 -176 L -16 -156 Z M 44 -148 L 40 -176 L 16 -156 Z" fill="#fffaf0" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M -38 -154 L -36 -168 L -24 -158 Z M 38 -154 L 36 -168 L 24 -158 Z" fill="#f6a6bd" />
        <circle cx="-18" cy="-114" r="5" fill={INK} /><circle cx="18" cy="-114" r="5" fill={INK} />
        <path d="M -6 -100 L 0 -94 L 6 -100 Z" fill="#f08aa6" /><path d="M 0 -94 Q -8 -84 -14 -88 M 0 -94 Q 8 -84 14 -88" stroke={INK} strokeWidth="2.5" fill="none" />
        <path d="M -48 -104 H -78 M -48 -96 L -76 -90 M 48 -104 H 78 M 48 -96 L 76 -90" stroke={INK} strokeWidth="2" opacity="0.6" />
        <path d="M -34 -66 Q 0 -52 34 -66 L 30 -52 Q 0 -38 -30 -52 Z" fill="#d9533a" stroke={INK} strokeWidth="3" />
        <circle cx="0" cy="-44" r="10" fill="#f4c542" stroke={INK} strokeWidth="3" />
        {/* tay vẫy */}
        <path d="M 40 -36 Q 74 -50 66 -110 Q 64 -130 52 -128 Q 42 -126 44 -104 Q 44 -76 34 -60 Z" fill="#fffaf0" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="56" cy="-116" r="5" fill="#f6a6bd" />
        {/* đồng koban */}
        <path d="M -52 -34 Q -76 -50 -62 -76 Q -48 -88 -36 -70 Z" fill="#fffaf0" stroke={INK} strokeWidth="4" />
      </g>
    </Frame>
  );
}

function Komorebi() {
  return (
    <Frame id="kom" label="Khu vườn Nhật có ánh nắng xuyên qua tán lá, ao cá koi và đèn đá" top="#cfe9c0" bottom="#a9d1a0">
      {/* tia nắng */}
      <g opacity="0.45">
        {[[120, 60], [220, 30], [330, 70], [430, 20], [520, 50]].map(([x, w], i) => (
          <path key={i} d={`M ${x} 0 L ${x + w} 0 L ${x - 50 + w} 260 L ${x - 90} 260 Z`} fill="#fff6c8" />
        ))}
      </g>
      {/* tán lá phía trên */}
      {[[40, 6, 80], [150, -6, 70], [260, 8, 76], [380, -8, 80], [500, 6, 76], [590, -4, 60]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#6fae62' : '#5c9a58'} />
      ))}
      {[[90, 90], [210, 80], [330, 96], [450, 78], [550, 96]].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} q 12 -16 24 0 q -12 16 -24 0 Z`} fill="#8fc974" stroke="#477f4f" strokeWidth="2" />
      ))}
      {/* thân cây */}
      <path d="M 60 340 C 70 240 52 160 92 60 L 120 66 C 96 170 112 250 118 340 Z" fill="#7a5738" stroke={INK} strokeWidth="3" />
      {/* bãi cỏ + ao */}
      <path d="M 0 250 Q 150 220 300 244 T 600 236 V 340 H 0 Z" fill="#8fbc6e" />
      <ellipse cx="360" cy="288" rx="190" ry="44" fill="#6fb6c9" stroke="#3e7f95" strokeWidth="4" />
      <ellipse cx="360" cy="288" rx="150" ry="30" fill="#8fcddc" opacity="0.7" />
      {/* cá koi */}
      <g transform="translate(330 292)">
        <path d="M -30 0 Q -8 -14 18 -2 Q 30 -14 40 -8 Q 36 0 40 8 Q 30 14 18 4 Q -8 14 -30 0 Z" fill="#f08a2c" stroke={INK} strokeWidth="2.5" />
        <circle cx="-20" cy="-2" r="2.5" fill={INK} /><circle cx="6" cy="-4" r="5" fill="#fffaf0" />
      </g>
      <g transform="translate(414 280) scale(-0.8 0.8)">
        <path d="M -30 0 Q -8 -14 18 -2 Q 30 -14 40 -8 Q 36 0 40 8 Q 30 14 18 4 Q -8 14 -30 0 Z" fill="#fffaf0" stroke={INK} strokeWidth="2.5" />
        <circle cx="-20" cy="-2" r="2.5" fill={INK} /><circle cx="6" cy="-4" r="5" fill="#f08a2c" />
      </g>
      {/* lá sen */}
      <circle cx="262" cy="296" r="22" fill="#5c9a58" stroke="#477f4f" strokeWidth="3" /><path d="M 262 296 L 280 282" stroke="#477f4f" strokeWidth="3" />
      {/* đèn đá + đá bậc */}
      <g transform="translate(520 250)">
        <rect x="-26" y="-4" width="52" height="12" fill="#a8a294" stroke={INK} strokeWidth="2.5" />
        <rect x="-10" y="-70" width="20" height="68" fill="#c9c3b2" stroke={INK} strokeWidth="2.5" />
        <rect x="-26" y="-98" width="52" height="30" fill="#c9c3b2" stroke={INK} strokeWidth="2.5" />
        <rect x="-12" y="-92" width="24" height="18" fill="#ffe9a0" />
        <path d="M -40 -98 L 0 -128 L 40 -98 Z" fill="#a8a294" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      {[[170, 312, 34], [214, 322, 28], [250, 334, 24]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.4} fill="#cfc8b6" stroke={INK} strokeWidth="2.5" />
      ))}
    </Frame>
  );
}

function Mottainai() {
  return (
    <Frame id="mot" label="Chú bù nhìn giữa ruộng lúa đội chiếc nón rơm cũ đã vá, trời buổi sáng" top="#cfe8ee" bottom="#f6e9bf">
      <circle cx="500" cy="70" r="36" fill="#fff0b0" opacity="0.9" />
      <path d="M 0 150 Q 150 120 300 146 T 600 138 V 340 H 0 Z" fill="#9fcf86" />
      {[0, 1, 2, 3, 4].map((r) => (
        <path key={r} d={`M 0 ${190 + r * 28} Q 150 ${176 + r * 28} 300 ${192 + r * 28} T 600 ${186 + r * 28}`} stroke="#5f9a4f" strokeWidth="9" fill="none" strokeLinecap="round" />
      ))}
      {/* cọc + tay bù nhìn */}
      <path d="M 300 120 V 300" stroke="#8a5b34" strokeWidth="10" strokeLinecap="round" />
      <path d="M 220 176 H 380" stroke="#8a5b34" strokeWidth="10" strokeLinecap="round" />
      {/* áo vá */}
      <path d="M 244 170 L 356 170 L 340 250 L 260 250 Z" fill="#7a9fbf" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="276" y="196" width="26" height="22" fill="#f08a6a" stroke={INK} strokeWidth="2" />
      <rect x="312" y="212" width="20" height="18" fill="#f7d96e" stroke={INK} strokeWidth="2" />
      <path d="M 280 200 l 22 18 M 302 200 l -22 18" stroke={INK} strokeWidth="2" />
      {/* đầu + nón rơm */}
      <circle cx="300" cy="140" r="26" fill="#f5deb3" stroke={INK} strokeWidth="3" />
      <circle cx="290" cy="138" r="3" fill={INK} /><circle cx="310" cy="138" r="3" fill={INK} />
      <path d="M 288 152 Q 300 160 312 152" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 240 122 Q 300 66 360 122 Z" fill="#e8c46a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 232 122 H 368" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M 262 112 L 270 98 M 292 100 L 292 84 M 322 102 L 330 90" stroke="#b98d38" strokeWidth="3" strokeLinecap="round" />
      <path d="M 330 108 l 14 6 l -8 12 Z" fill="#f08a6a" stroke={INK} strokeWidth="2" />
      {/* chim sẻ */}
      <g transform="translate(400 160)">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#b98d6a" stroke={INK} strokeWidth="2.5" />
        <circle cx="12" cy="-6" r="7" fill="#b98d6a" stroke={INK} strokeWidth="2.5" />
        <path d="M 19 -6 l 8 2 l -8 3 Z" fill="#f2b24a" stroke={INK} strokeWidth="2" />
        <circle cx="14" cy="-8" r="1.6" fill={INK} />
      </g>
    </Frame>
  );
}

function Kome() {
  return (
    <Frame id="kome" label="Bát cơm trắng và đôi đũa trước cánh đồng lúa chín vàng, bên cạnh chữ 米" top="#fbeed2" bottom="#f1dcb6">
      {/* ruộng lúa phía xa */}
      <path d="M 0 150 Q 150 124 300 148 T 600 140 V 340 H 0 Z" fill="#e9d27a" />
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M ${30 + i * 66} 170 q 8 -26 18 -4 M ${34 + i * 66} 170 q -4 -30 -14 -8`} stroke="#c9a53c" strokeWidth="4" fill="none" strokeLinecap="round" />
      ))}
      {/* bàn gỗ */}
      <rect x="0" y="236" width="600" height="104" fill="#c98f58" />
      <rect x="0" y="236" width="600" height="14" fill="#e2b078" stroke={INK} strokeWidth="3" />
      {/* bát cơm */}
      <ellipse cx="300" cy="300" rx="104" ry="16" fill="#000" opacity="0.16" />
      <path d="M 200 220 H 400 C 400 280 360 304 300 304 C 240 304 200 280 200 220 Z" fill="#fffaf0" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M 210 240 H 390" stroke="#6a9fc4" strokeWidth="6" />
      <path d="M 212 220 C 218 164 262 140 300 140 C 338 140 382 164 388 220 Z" fill="#ffffff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {[[260, 180], [300, 160], [340, 182], [282, 200], [326, 206], [250, 208]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="9" ry="4.5" fill="#f1eadb" stroke="#d6ccb4" strokeWidth="1.5" transform={`rotate(${i * 27} ${x} ${y})`} />
      ))}
      <path d="M 290 120 q -10 -18 0 -32 M 316 124 q 10 -18 0 -32" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* đũa */}
      <path d="M 430 232 L 520 296" stroke="#8a2f2f" strokeWidth="7" strokeLinecap="round" />
      <path d="M 444 220 L 548 286" stroke="#8a2f2f" strokeWidth="7" strokeLinecap="round" />
      {/* chữ 米 */}
      <text x="96" y="214" fontSize="92" fontWeight="900" fill="#8a5b34" stroke={INK} strokeWidth="2" textAnchor="middle" fontFamily="serif">米</text>
      <text x="96" y="262" fontSize="26" fontWeight="800" fill="#fffaf0" stroke={INK} strokeWidth="1.2" textAnchor="middle">八十八</text>
    </Frame>
  );
}

function Teruteru() {
  return (
    <Frame id="teru" label="Cửa sổ ngày mưa với búp bê てるてるぼうず trắng mặt cười treo trên dây, mưa rơi bên ngoài" top="#b9c9d6" bottom="#dfe7ea">
      {/* mây */}
      {[[110, 54, 70], [230, 40, 84], [350, 56, 72], [470, 40, 80]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#8fa2b2" />
      ))}
      {/* khung cửa sổ */}
      <rect x="120" y="70" width="360" height="250" fill="#e6f1f6" stroke="#8a5b34" strokeWidth="10" />
      <path d="M 300 70 V 320 M 120 195 H 480" stroke="#8a5b34" strokeWidth="8" />
      {/* mưa */}
      {[...Array(22)].map((_, i) => (
        <path key={i} d={`M ${135 + (i % 11) * 32} ${86 + Math.floor(i / 11) * 110 + (i % 3) * 12} l -7 26`} stroke="#6f9bb8" strokeWidth="3.5" strokeLinecap="round" />
      ))}
      {/* dây + búp bê */}
      <path d="M 100 56 H 500" stroke="#8a5b34" strokeWidth="6" strokeLinecap="round" />
      <path d="M 300 56 V 118" stroke="#8a5b34" strokeWidth="3" />
      <g transform="translate(300 118)">
        <path d="M -42 120 Q -52 52 -26 30 Q 0 6 26 30 Q 52 52 42 120 Q 26 108 14 120 Q 0 106 -14 120 Q -26 108 -42 120 Z" fill="#fffdf7" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="0" cy="-2" r="34" fill="#fffdf7" stroke={INK} strokeWidth="3" />
        <path d="M -20 28 Q 0 38 20 28" stroke="#e6a6a6" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="-12" cy="-4" r="3.4" fill={INK} /><circle cx="12" cy="-4" r="3.4" fill={INK} />
        <path d="M -10 10 Q 0 18 10 10" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="-22" cy="6" r="5" fill="#f4a7b8" opacity="0.7" /><circle cx="22" cy="6" r="5" fill="#f4a7b8" opacity="0.7" />
      </g>
      {/* ô nhỏ ngoài sân */}
      <path d="M 500 330 Q 540 270 580 330 Z" fill="#e87a68" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 540 330 V 300" stroke={INK} strokeWidth="3" />
    </Frame>
  );
}

function Tanabata() {
  const stars: [number, number, number, string][] = [[200, 120, 22, '#f7d96e'], [330, 150, 18, '#f08aa6'], [450, 110, 20, '#9ad0e8']];
  const star = (r: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const rr = i % 2 === 0 ? r : r * 0.45;
      return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
    });
    return pts.join(' ');
  };
  return (
    <Frame id="tana" label="Cành tre đêm Tanabata treo dải giấy điều ước và ngôi sao giấy dưới bầu trời đầy sao" top="#27315f" bottom="#4e5b94">
      {/* ngân hà */}
      <path d="M -20 250 Q 160 150 320 170 T 640 60" stroke="#e8e6ff" strokeWidth="46" fill="none" opacity="0.22" strokeLinecap="round" />
      {[...Array(34)].map((_, i) => (
        <circle key={i} cx={(i * 97) % 600} cy={(i * 53) % 190 + 8} r={i % 4 === 0 ? 2.6 : 1.5} fill="#fffbd6" opacity="0.9" />
      ))}
      {/* thân tre */}
      <path d="M 120 340 C 126 260 112 170 150 60" stroke="#6aa86a" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M 120 340 C 126 260 112 170 150 60" stroke="#2f6a3a" strokeWidth="3" fill="none" strokeDasharray="1 34" strokeLinecap="round" />
      {/* cành ngang */}
      <path d="M 140 100 C 260 70 380 80 520 96" stroke="#6aa86a" strokeWidth="9" fill="none" strokeLinecap="round" />
      {[[210, 84], [330, 80], [450, 90]].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} q 10 -26 30 -22 q -10 12 -30 22 Z`} fill="#7ec27a" stroke="#2f6a3a" strokeWidth="2" />
      ))}
      {/* dải giấy điều ước */}
      {([[210, '#f7d96e'], [290, '#f08aa6'], [370, '#9ad0e8'], [450, '#a9d98c']] as [number, string][]).map(([x, c], i) => (
        <g key={i}>
          <path d={`M ${x} 86 V ${126 + (i % 2) * 14}`} stroke="#f3eee0" strokeWidth="2" />
          <rect x={x - 15} y={126 + (i % 2) * 14} width="30" height="110" fill={c} stroke={INK} strokeWidth="2.5" />
          <path d={`M ${x} ${142 + (i % 2) * 14} V ${216 + (i % 2) * 14}`} stroke={INK} strokeWidth="3" strokeDasharray="10 7" opacity="0.55" strokeLinecap="round" />
        </g>
      ))}
      {/* sao giấy */}
      {stars.map(([x, y, r, c], i) => (
        <g key={i} transform={`translate(${x + 40} ${y + 120})`}>
          <polygon points={star(r * 1.5)} fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ))}
      <ellipse cx="300" cy="334" rx="300" ry="14" fill="#1d2448" opacity="0.8" />
    </Frame>
  );
}

function Yubikiri() {
  return (
    <Frame id="yubi" label="Hai bàn tay, một lớn một nhỏ, ngoéo ngón út vào nhau dưới ánh hoàng hôn" top="#fbd9a6" bottom="#f3a97a">
      <circle cx="300" cy="206" r="120" fill="#fff0c0" opacity="0.55" />
      <circle cx="300" cy="206" r="78" fill="#fff6d6" opacity="0.7" />
      <path d="M 0 296 Q 150 270 300 292 T 600 284 V 340 H 0 Z" fill="#7e9f5a" />
      {/* cẳng tay + nắm tay của bà (trái, lớn) */}
      <path d="M -10 236 L 150 236 L 150 294 L -10 294 Z" fill="#f2c9a2" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M 40 252 H 120 M 40 268 H 110" stroke="#d9a982" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="206" cy="264" rx="72" ry="52" fill="#f2c9a2" stroke={INK} strokeWidth="3.5" />
      <path d="M 170 232 Q 196 244 190 268 M 200 226 Q 226 242 220 268 M 232 232 Q 252 250 244 270" stroke="#d9a982" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="176" cy="290" rx="34" ry="18" fill="#f2c9a2" stroke={INK} strokeWidth="3.5" />
      {/* cẳng tay + nắm tay của bé (phải, nhỏ) */}
      <path d="M 610 250 L 450 250 L 450 298 L 610 298 Z" fill="#f7d5b4" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="396" cy="274" rx="58" ry="42" fill="#f7d5b4" stroke={INK} strokeWidth="3.5" />
      <path d="M 362 250 Q 380 260 374 278 M 392 246 Q 410 260 404 280 M 420 252 Q 434 266 428 282" stroke="#dfb08c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="420" cy="296" rx="28" ry="15" fill="#f7d5b4" stroke={INK} strokeWidth="3.5" />
      {/* hai ngón út móc vào nhau */}
      <path d="M 244 232 Q 270 200 294 176 Q 306 162 322 172" stroke={INK} strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M 244 232 Q 270 200 294 176 Q 306 162 322 172" stroke="#f2c9a2" strokeWidth="21" fill="none" strokeLinecap="round" />
      <path d="M 358 246 Q 338 208 314 184 Q 300 168 284 180" stroke={INK} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 358 246 Q 338 208 314 184 Q 300 168 284 180" stroke="#f7d5b4" strokeWidth="19" fill="none" strokeLinecap="round" />
      {/* trái tim nhỏ */}
      <path d="M 300 108 C 270 84 264 118 300 136 C 336 118 330 84 300 108 Z" fill="#ec6f7b" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </Frame>
  );
}

const ART: Record<string, () => ReactNode> = {
  genkan: Genkan,
  itadakimasu: Itadakimasu,
  otoshimono: Otoshimono,
  origami: Origami,
  komorebi: Komorebi,
  mottainai: Mottainai,
  kome: Kome,
  teruterubouzu: Teruteru,
  tanabata: Tanabata,
  yubikiri: Yubikiri,
};

/** Trả về tranh minh hoạ cho mục văn hoá, hoặc null nếu chưa có. */
export function CultureArt({ id }: { id: string }) {
  const Art = ART[id];
  if (!Art) return null;
  return (
    <div className="cu-art" data-culture={id}>
      <Art />
    </div>
  );
}

export const HAS_CULTURE_ART = (id: string) => id in ART;

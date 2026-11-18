import type { ReactNode } from 'react';

/**
 * Các bộ phận thay đổi được của nhân vật người chơi: tóc, trang phục, mũ, đồ mang thêm.
 * Toạ độ theo hệ 400×760 của CharacterSprite (đầu tâm x=200, mắt y≈292, vai y≈432).
 * Id món khớp với data/wardrobe.ts.
 */

export const OUT = '#3a2a2c';

export interface PartCtx {
  skin: string;
  skinShade: string;
  hair: string;
  hairHi: string;
  /** màu chủ đạo của trang phục (người chơi chọn) */
  c: string;
  /** màu tối hơn */
  d: string;
  /** màu sáng hơn */
  l: string;
}

const S = { stroke: OUT, strokeWidth: 4, strokeLinejoin: 'round' } as const;

/* ------------------------------------------------------------------ */
/* Tóc                                                                  */
/* ------------------------------------------------------------------ */

const FRINGE_BOB =
  'M 58 300 C 40 190 100 94 200 94 C 300 94 360 190 342 300 C 334 262 320 232 298 214 C 262 240 138 240 102 214 C 80 232 66 262 58 300 Z';
const FRINGE_SHORT =
  'M 54 300 C 36 190 96 92 200 92 C 304 92 364 190 346 300 C 336 262 322 232 304 212 L 288 252 L 262 204 L 236 264 L 208 206 L 180 266 L 154 204 L 128 254 L 104 212 C 82 236 66 266 54 300 Z';
const FRINGE_SIDE =
  'M 54 300 C 36 190 96 92 200 92 C 304 92 364 190 346 300 C 338 262 326 236 308 218 C 270 250 190 236 150 200 C 126 240 96 250 74 262 C 64 276 58 288 54 300 Z';
const FRINGE_BOWL =
  'M 56 292 C 38 180 104 92 200 92 C 296 92 362 180 344 292 L 334 250 Q 322 226 296 220 Q 200 238 104 220 Q 78 226 66 250 Z';
const FRINGE_TOPKNOT =
  'M 54 300 C 36 190 96 92 200 92 C 304 92 364 190 346 300 C 336 262 322 240 304 226 C 262 200 138 200 96 226 C 78 240 64 262 54 300 Z';
const FRINGE_SPIKY =
  'M 54 300 C 40 200 74 150 70 120 L 100 150 L 108 96 L 140 134 L 160 70 L 190 120 L 214 58 L 240 118 L 270 78 L 284 130 L 318 100 L 322 150 C 354 190 360 240 346 300 C 336 262 322 232 304 212 L 288 252 L 262 204 L 236 264 L 208 206 L 180 266 L 154 204 L 128 254 L 104 212 C 82 236 66 266 54 300 Z';
const DOME = 'M 50 300 C 40 160 108 96 200 96 C 292 96 360 160 350 300 L 350 332 L 50 332 Z';

const SHINE = (hi: string) => <path d="M 112 140 C 160 112 244 112 290 142" stroke={hi} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.35" />;

function Braid({ x, flip, ctx, tie }: { x: number; flip: 1 | -1; ctx: PartCtx; tie: string }) {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx={x + (i % 2 === 0 ? -6 : 6) * flip} cy={316 + i * 34} rx="20" ry="24" fill={ctx.hair} stroke={OUT} strokeWidth="3.5" />
      ))}
      <rect x={x - 12} y={508} width="24" height="14" rx="6" fill={tie} stroke={OUT} strokeWidth="3" />
    </g>
  );
}

export function hairBack(id: string, ctx: PartCtx): ReactNode {
  const { hair } = ctx;
  switch (id) {
    case 'g-bob':
      return <path d="M 46 302 C 36 160 108 94 200 94 C 292 94 364 160 354 302 C 356 366 342 418 316 430 L 84 430 C 58 418 44 366 46 302 Z" fill={hair} {...S} />;
    case 'g-buns':
      return (
        <g>
          <circle cx="92" cy="130" r="50" fill={hair} {...S} />
          <circle cx="308" cy="130" r="50" fill={hair} {...S} />
          <circle cx="92" cy="130" r="14" fill={ctx.c} stroke={OUT} strokeWidth="3" />
          <circle cx="308" cy="130" r="14" fill={ctx.c} stroke={OUT} strokeWidth="3" />
        </g>
      );
    case 'g-ponytail':
      return (
        <g>
          <path d="M 318 170 C 410 150 436 270 392 350 C 372 392 350 410 336 424 C 358 360 352 300 316 236 Z" fill={hair} {...S} />
          <circle cx="320" cy="176" r="16" fill={ctx.c} stroke={OUT} strokeWidth="3" />
        </g>
      );
    case 'g-long':
      return <path d="M 44 300 C 30 150 110 96 200 96 C 290 96 370 150 356 300 L 376 548 Q 366 596 322 588 L 78 588 Q 34 596 24 548 Z" fill={hair} {...S} />;
    case 'g-pigtails':
      return (
        <g>
          <path d="M 76 236 C 18 290 14 420 46 492 C 90 472 104 360 102 272 Z" fill={hair} {...S} />
          <path d="M 324 236 C 382 290 386 420 354 492 C 310 472 296 360 298 272 Z" fill={hair} {...S} />
          <rect x="66" y="232" width="34" height="22" rx="9" fill={ctx.c} stroke={OUT} strokeWidth="3" transform="rotate(-18 83 243)" />
          <rect x="300" y="232" width="34" height="22" rx="9" fill={ctx.c} stroke={OUT} strokeWidth="3" transform="rotate(18 317 243)" />
        </g>
      );
    case 'g-braid':
      return <path d={DOME} fill={hair} {...S} />;
    case 'g-topbun':
      return (
        <g>
          <circle cx="200" cy="86" r="46" fill={hair} {...S} />
          <path d="M 170 70 Q 200 48 230 70" stroke={ctx.hairHi} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>
      );
    case 'b-curly':
      return (
        <g fill={hair} {...S}>
          {[
            [88, 176],
            [112, 128],
            [160, 102],
            [214, 96],
            [262, 108],
            [300, 140],
            [322, 190],
            [68, 232],
            [334, 238],
            [200, 150],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="44" />
          ))}
        </g>
      );
    default:
      return null;
  }
}

export function hairFront(id: string, ctx: PartCtx): ReactNode {
  const { hair, hairHi } = ctx;
  const fringe = (d: string) => <path d={d} fill={hair} {...S} />;
  const locksShort = (
    <g>
      <path d="M 60 300 C 54 340 60 384 80 414 L 106 404 C 92 366 94 322 106 262 Z" fill={hair} {...S} />
      <path d="M 340 300 C 346 340 340 384 320 414 L 294 404 C 308 366 306 322 294 262 Z" fill={hair} {...S} />
    </g>
  );
  switch (id) {
    case 'g-bob':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
          {locksShort}
        </g>
      );
    case 'g-buns':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
          <path d="M 60 300 C 56 336 62 372 76 396 L 100 388 C 90 356 92 322 104 262 Z" fill={hair} {...S} />
          <path d="M 340 300 C 344 336 338 372 324 396 L 300 388 C 310 356 308 322 296 262 Z" fill={hair} {...S} />
        </g>
      );
    case 'g-ponytail':
      return (
        <g>
          {fringe(FRINGE_SIDE)}
          {SHINE(hairHi)}
        </g>
      );
    case 'g-long':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
          <path d="M 58 296 C 46 380 48 450 60 520 L 102 508 C 90 430 96 350 108 262 Z" fill={hair} {...S} />
          <path d="M 342 296 C 354 380 352 450 340 520 L 298 508 C 310 430 304 350 292 262 Z" fill={hair} {...S} />
        </g>
      );
    case 'g-pigtails':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
        </g>
      );
    case 'g-braid':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
          <Braid x={76} flip={1} ctx={ctx} tie={ctx.c} />
          <Braid x={324} flip={-1} ctx={ctx} tie={ctx.c} />
        </g>
      );
    case 'g-topbun':
      return (
        <g>
          {fringe(FRINGE_BOB)}
          {SHINE(hairHi)}
          <rect x="170" y="116" width="60" height="16" rx="8" fill={ctx.c} stroke={OUT} strokeWidth="3" />
        </g>
      );
    case 'b-short':
      return (
        <g>
          {fringe(FRINGE_SHORT)}
          {SHINE(hairHi)}
        </g>
      );
    case 'b-side':
      return (
        <g>
          {fringe(FRINGE_SIDE)}
          {SHINE(hairHi)}
        </g>
      );
    case 'b-mushroom':
      return (
        <g>
          {fringe(FRINGE_BOWL)}
          {SHINE(hairHi)}
        </g>
      );
    case 'b-spiky':
      return (
        <g>
          {fringe(FRINGE_SPIKY)}
          <path d="M 150 120 L 164 84 M 214 110 L 216 74" stroke={hairHi} strokeWidth="8" strokeLinecap="round" opacity="0.4" />
        </g>
      );
    case 'b-curly':
      return (
        <g fill={hair} {...S}>
          {[
            [104, 200],
            [150, 176],
            [204, 172],
            [258, 178],
            [300, 204],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="32" />
          ))}
        </g>
      );
    case 'b-topknot':
      return (
        <g>
          {fringe(FRINGE_TOPKNOT)}
          {SHINE(hairHi)}
          <circle cx="200" cy="84" r="34" fill={hair} {...S} />
          <rect x="176" y="104" width="48" height="14" rx="7" fill="#d9453a" stroke={OUT} strokeWidth="3" />
        </g>
      );
    default:
      return fringe(FRINGE_BOB);
  }
}

/* ------------------------------------------------------------------ */
/* Trang phục                                                           */
/* ------------------------------------------------------------------ */

const TORSO = 'M 118 432 Q 200 408 282 432 L 298 596 Q 200 620 102 596 Z';
const SHORTS = 'M 124 580 L 276 580 L 284 646 Q 240 660 206 646 L 200 628 L 194 646 Q 160 660 116 646 Z';
const PANTS = 'M 124 580 L 276 580 L 282 706 L 212 706 L 200 636 L 188 706 L 118 706 Z';
const SKIRT = 'M 112 584 L 288 584 L 322 700 Q 200 724 78 700 Z';

export interface OutfitDef {
  sleeve: 'long' | 'short';
  sleeveColor?: (x: PartCtx) => string;
  feet: 'shoe' | 'boots' | 'geta';
  bottom: (x: PartCtx) => ReactNode;
  torso: (x: PartCtx) => ReactNode;
}

const dots = (color: string, pts: number[][], r = 6, opacity = 0.7) =>
  pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={opacity} />);

const Collar = ({ fill, y = 424 }: { fill: string; y?: number }) => (
  <path d={`M 164 ${y} L 200 ${y + 46} L 236 ${y} Q 200 ${y - 10} 164 ${y} Z`} fill={fill} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
);

export const OUTFITS: Record<string, OutfitDef> = {
  /* ---------- bé trai ---------- */
  'b-tee': {
    sleeve: 'short',
    feet: 'shoe',
    bottom: () => <path d={SHORTS} fill="#4a5a7c" {...S} />,
    torso: (x) => (
      <g>
        <path d={TORSO} fill={x.c} {...S} />
        <path d="M 220 432 L 282 432 L 298 596 Q 260 606 226 610 Z" fill={x.d} opacity="0.22" />
        <path d="M 168 424 Q 200 452 232 424 Q 200 414 168 424 Z" fill={x.l} stroke={OUT} strokeWidth="3" />
        <circle cx="200" cy="508" r="28" fill="#fff8e6" stroke={OUT} strokeWidth="3" />
        <path d="M 200 490 l 6 13 l 14 2 l -10 10 l 3 14 l -13 -7 l -13 7 l 3 -14 l -10 -10 l 14 -2 Z" fill="#e8b04a" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    ),
  },
  'b-hoodie': {
    sleeve: 'long',
    feet: 'shoe',
    bottom: () => (
      <g>
        <path d={PANTS} fill="#3f5a86" {...S} />
        <path d="M 200 636 L 200 590" stroke={OUT} strokeWidth="3" />
      </g>
    ),
    torso: (x) => (
      <g>
        <path d="M 138 424 Q 200 388 262 424 L 274 458 Q 200 478 126 458 Z" fill={x.d} {...S} />
        <path d={TORSO} fill={x.c} {...S} />
        <path d="M 168 426 Q 200 470 232 426 Q 200 414 168 426 Z" fill={x.d} opacity="0.55" stroke={OUT} strokeWidth="3" />
        <path d="M 150 530 L 250 530 L 264 592 Q 200 606 136 592 Z" fill={x.d} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 186 452 L 183 506 M 214 452 L 217 506" stroke="#fff8e6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="183" cy="510" r="5" fill="#fff8e6" stroke={OUT} strokeWidth="2" />
        <circle cx="217" cy="510" r="5" fill="#fff8e6" stroke={OUT} strokeWidth="2" />
      </g>
    ),
  },
  'b-explorer': {
    sleeve: 'short',
    sleeveColor: () => '#f3e6c4',
    feet: 'shoe',
    bottom: () => <path d={SHORTS} fill="#b79a62" {...S} />,
    torso: (x) => (
      <g>
        <path d={TORSO} fill="#f3e6c4" {...S} />
        <Collar fill="#fff8e6" />
        <path d="M 118 432 L 176 426 L 164 602 L 102 596 Z" fill={x.c} {...S} />
        <path d="M 282 432 L 224 426 L 236 602 L 298 596 Z" fill={x.c} {...S} />
        <rect x="118" y="500" width="40" height="34" rx="4" fill={x.d} stroke={OUT} strokeWidth="3" />
        <rect x="242" y="500" width="40" height="34" rx="4" fill={x.d} stroke={OUT} strokeWidth="3" />
        <path d="M 118 512 H 158 M 242 512 H 282" stroke={OUT} strokeWidth="2.5" />
        <circle cx="138" cy="522" r="3.5" fill="#e8b04a" />
        <circle cx="262" cy="522" r="3.5" fill="#e8b04a" />
        <path d="M 104 580 H 296" stroke="#8a5a2f" strokeWidth="10" strokeLinecap="round" />
        <rect x="188" y="570" width="24" height="20" rx="3" fill="#e8b04a" stroke={OUT} strokeWidth="3" />
      </g>
    ),
  },
  'b-uniform': {
    sleeve: 'long',
    feet: 'shoe',
    bottom: () => <path d={SHORTS} fill="#6c7280" {...S} />,
    torso: (x) => (
      <g>
        <path d={TORSO} fill={x.c} {...S} />
        <path d="M 168 424 L 200 500 L 232 424 Q 200 414 168 424 Z" fill="#fffdf6" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 192 440 H 208 L 214 458 L 200 560 L 186 458 Z" fill="#d9453a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 168 424 L 190 520 L 160 590 M 232 424 L 210 520 L 240 590" stroke={x.d} strokeWidth="3" fill="none" opacity="0.7" />
        {dots('#e8b04a', [[186, 540], [214, 540]], 5, 1)}
        <path d="M 126 480 h 28 v 24 q -14 12 -28 0 Z" fill="#fff8e6" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    ),
  },
  'b-jinbei': {
    sleeve: 'short',
    feet: 'shoe',
    bottom: (x) => <path d={SHORTS} fill={x.d} {...S} />,
    torso: (x) => (
      <g>
        <path d={TORSO} fill={x.c} {...S} />
        <path d="M 168 424 L 214 560 M 232 424 L 190 560" stroke="#fffdf6" strokeWidth="9" strokeLinecap="round" />
        <path d="M 168 424 L 214 560 M 232 424 L 190 560" stroke={OUT} strokeWidth="2" opacity="0.35" />
        <rect x="104" y="548" width="192" height="26" rx="6" fill="#f4e7c8" stroke={OUT} strokeWidth="3" />
        <path d="M 200 560 l -30 -16 l 0 32 Z M 200 560 l 30 -16 l 0 32 Z" fill="#f4e7c8" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        {dots(x.l, [[140, 470], [256, 480], [152, 520], [250, 526], [124, 502], [280, 506]], 6, 0.8)}
      </g>
    ),
  },
  /* ---------- bé gái ---------- */
  'g-dress': {
    sleeve: 'short',
    feet: 'shoe',
    bottom: (x) => (
      <g>
        <path d={SKIRT} fill={x.c} {...S} />
        <path d="M 84 676 Q 200 704 316 676 L 322 700 Q 200 724 78 700 Z" fill={x.l} stroke={OUT} strokeWidth="3" />
        {dots(x.l, [[140, 630], [250, 640], [196, 660], [112, 660], [286, 662]], 6, 0.8)}
      </g>
    ),
    torso: (x) => (
      <g>
        <path d={TORSO} fill={x.c} {...S} />
        <path d="M 130 428 Q 200 470 270 428 Q 200 416 130 428 Z" fill="#fffdf6" stroke={OUT} strokeWidth="3" />
        <rect x="108" y="574" width="184" height="18" rx="6" fill={x.d} stroke={OUT} strokeWidth="3" />
        <path d="M 200 584 l -34 -20 q -12 20 0 40 Z M 200 584 l 34 -20 q 12 20 0 40 Z" fill={x.l} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="200" cy="584" r="9" fill={x.d} stroke={OUT} strokeWidth="3" />
      </g>
    ),
  },
  'g-sailor': {
    sleeve: 'short',
    sleeveColor: () => '#fbf8ef',
    feet: 'shoe',
    bottom: (x) => (
      <g>
        <path d={SKIRT} fill={x.d} {...S} />
        <path d="M 150 586 L 126 706 M 186 586 L 176 712 M 214 586 L 224 712 M 250 586 L 274 706" stroke={OUT} strokeWidth="2.5" opacity="0.5" />
      </g>
    ),
    torso: (x) => (
      <g>
        <path d={TORSO} fill="#fbf8ef" {...S} />
        <path d="M 128 430 Q 200 408 272 430 L 258 470 L 200 524 L 142 470 Z" fill={x.c} stroke={OUT} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M 140 444 L 200 500 L 260 444 M 148 458 L 200 508 L 252 458" stroke="#fbf8ef" strokeWidth="3" fill="none" />
        <path d="M 200 506 l -26 -22 q -8 24 4 44 Z M 200 506 l 26 -22 q 8 24 -4 44 Z" fill="#d9453a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="200" cy="506" r="9" fill="#d9453a" stroke={OUT} strokeWidth="3" />
      </g>
    ),
  },
  'g-overalls': {
    sleeve: 'short',
    sleeveColor: () => '#fff4dc',
    feet: 'shoe',
    bottom: (x) => <path d="M 112 584 L 288 584 L 306 652 Q 200 676 94 652 Z" fill={x.c} {...S} />,
    torso: (x) => (
      <g>
        <path d={TORSO} fill="#fff4dc" {...S} />
        <path d="M 150 470 L 250 470 L 262 596 L 138 596 Z" fill={x.c} {...S} />
        <path d="M 150 470 L 140 426 L 166 424 L 172 470 Z M 250 470 L 260 426 L 234 424 L 228 470 Z" fill={x.c} {...S} />
        <rect x="172" y="496" width="56" height="40" rx="6" fill={x.d} stroke={OUT} strokeWidth="3" />
        <circle cx="150" cy="474" r="6" fill="#e8b04a" stroke={OUT} strokeWidth="2" />
        <circle cx="250" cy="474" r="6" fill="#e8b04a" stroke={OUT} strokeWidth="2" />
        <path d="M 182 512 q 18 14 36 0" stroke={x.l} strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  'g-raincoat': {
    sleeve: 'long',
    feet: 'boots',
    bottom: () => null,
    torso: (x) => (
      <g>
        <path d="M 140 424 Q 200 384 260 424 L 270 456 Q 200 476 130 456 Z" fill={x.d} {...S} />
        <path d="M 112 428 Q 200 406 288 428 L 310 648 Q 200 678 90 648 Z" fill={x.c} {...S} />
        <path d="M 200 440 V 664" stroke={OUT} strokeWidth="3" />
        {[470, 518, 566, 614].map((y) => (
          <circle key={y} cx="186" cy={y} r="6" fill="#fff8e6" stroke={OUT} strokeWidth="2.5" />
        ))}
        <path d="M 132 560 h 40 v 36 h -40 Z M 228 560 h 40 v 36 h -40 Z" fill={x.d} opacity="0.35" stroke={OUT} strokeWidth="2.5" />
        <path d="M 150 450 Q 200 500 250 450" stroke={x.l} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  },
  'g-yukata': {
    sleeve: 'short',
    feet: 'geta',
    bottom: () => null,
    torso: (x) => (
      <g>
        <path d="M 114 430 Q 200 408 286 430 L 304 600 L 324 714 Q 200 738 76 714 L 96 600 Z" fill={x.c} {...S} />
        {dots('#fffdf6', [[128, 480], [270, 500], [150, 640], [250, 650], [112, 560], [292, 570], [200, 690], [150, 700], [256, 702]], 8, 0.85)}
        {dots('#f4bccb', [[128, 480], [270, 500], [150, 640], [250, 650], [112, 560], [292, 570], [200, 690], [150, 700], [256, 702]], 3.5, 1)}
        <path d="M 168 424 L 214 556 M 232 424 L 192 556" stroke="#fffdf6" strokeWidth="9" strokeLinecap="round" />
        <path d="M 168 424 L 214 556 M 232 424 L 192 556" stroke={OUT} strokeWidth="2" opacity="0.35" />
        <rect x="98" y="546" width="204" height="52" rx="8" fill="#f4d27a" stroke={OUT} strokeWidth="3.5" />
        <path d="M 98 560 H 302 M 98 584 H 302" stroke="#e0a940" strokeWidth="3" />
        <path d="M 200 572 l -44 -26 q -16 28 0 56 Z M 200 572 l 44 -26 q 16 28 0 56 Z" fill="#f4d27a" stroke={OUT} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="186" y="556" width="28" height="32" rx="6" fill="#e8a3c1" stroke={OUT} strokeWidth="3" />
      </g>
    ),
  },
};

/* ------------------------------------------------------------------ */
/* Mũ & đồ đội đầu                                                       */
/* ------------------------------------------------------------------ */

const Flower = ({ x, y, r = 16, petal = '#f6a6c1' }: { x: number; y: number; r?: number; petal?: string }) => (
  <g>
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r} cy={y + Math.sin((a * Math.PI) / 180) * r} r={r * 0.75} fill={petal} stroke={OUT} strokeWidth="2.5" />
    ))}
    <circle cx={x} cy={y} r={r * 0.6} fill="#ffd96b" stroke={OUT} strokeWidth="2.5" />
  </g>
);

const STRAW_HAT = (c: string) => (
  <g>
    <path d="M 78 150 C 78 70 142 52 200 52 C 258 52 322 70 322 150 Z" fill="#e9c878" {...S} />
    <path d="M 80 138 Q 200 160 320 138 L 322 156 Q 200 180 78 156 Z" fill={c} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="200" cy="150" rx="176" ry="32" fill="#f0d68d" stroke={OUT} strokeWidth="4" opacity="0" />
    <path d="M 24 154 Q 60 120 120 130 L 280 130 Q 340 120 376 154 Q 340 196 200 198 Q 60 196 24 154 Z" fill="#f0d68d" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
    <path d="M 108 116 Q 200 142 292 116 L 292 142 Q 200 168 108 142 Z" fill={c} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
    <path d="M 60 156 Q 130 176 200 176 M 340 156 Q 270 176 200 176" stroke="#d9b862" strokeWidth="3" fill="none" />
  </g>
);

export function hatPart(id: string, x: PartCtx): ReactNode {
  switch (id) {
    case 'g-ribbon':
      return (
        <g transform="translate(286 124) rotate(14)">
          <path d="M 0 0 L -56 -30 Q -74 0 -56 30 Z" fill={x.c} {...S} />
          <path d="M 0 0 L 56 -30 Q 74 0 56 30 Z" fill={x.c} {...S} />
          <circle cx="0" cy="0" r="15" fill={x.d} stroke={OUT} strokeWidth="3.5" />
        </g>
      );
    case 'g-flower':
      return (
        <g>
          <path d="M 84 160 q -30 4 -34 34 q 28 4 34 -34 Z" fill="#7fb36a" stroke={OUT} strokeWidth="2.5" />
          <Flower x={104} y={152} />
          <Flower x={140} y={126} r={12} petal="#fff0b8" />
        </g>
      );
    case 'g-catears':
      return (
        <g>
          <path d="M 64 176 Q 200 62 336 176" stroke={OUT} strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M 64 176 Q 200 62 336 176" stroke={x.c} strokeWidth="15" fill="none" strokeLinecap="round" />
          <path d="M 84 128 L 100 56 L 150 98 Z" fill={x.c} {...S} />
          <path d="M 316 128 L 300 56 L 250 98 Z" fill={x.c} {...S} />
          <path d="M 98 108 L 104 76 L 130 98 Z M 302 108 L 296 76 L 270 98 Z" fill="#f6a6c1" />
        </g>
      );
    case 'g-strawhat':
    case 'b-strawhat':
      return STRAW_HAT(x.c);
    case 'g-sakura':
      return (
        <g>
          {[
            [82, 214],
            [74, 176],
            [96, 138],
            [134, 112],
            [180, 100],
            [226, 100],
            [270, 112],
            [306, 138],
            [326, 176],
            [318, 214],
          ].map(([px, py], i) => (
            <Flower key={i} x={px} y={py} r={i % 2 ? 11 : 13} petal={i % 3 === 0 ? '#ffd0df' : '#f6a6c1'} />
          ))}
        </g>
      );
    case 'b-headband':
      return (
        <g>
          <path d="M 330 206 Q 392 214 404 262 L 380 262 Q 368 236 326 232 Z" fill="#d9453a" {...S} />
          <path d="M 322 214 Q 372 222 372 296 L 350 292 Q 350 246 318 238 Z" fill="#d9453a" {...S} />
          <path d="M 58 194 Q 200 160 342 194 L 342 230 Q 200 196 58 230 Z" fill="#d9453a" {...S} />
          <circle cx="200" cy="198" r="15" fill="#fffdf6" stroke={OUT} strokeWidth="3" />
          <circle cx="200" cy="198" r="8" fill="#d9453a" />
        </g>
      );
    case 'b-cap':
      return (
        <g>
          <path d="M 60 196 C 56 100 130 70 200 70 C 270 70 344 100 340 196 Q 200 174 60 196 Z" fill={x.c} {...S} />
          <path d="M 200 70 V 180" stroke={OUT} strokeWidth="3" opacity="0.4" />
          <circle cx="200" cy="70" r="8" fill={x.d} stroke={OUT} strokeWidth="3" />
          <path d="M 84 192 Q 200 220 316 192 Q 352 224 200 246 Q 48 224 84 192 Z" fill={x.d} {...S} />
          <circle cx="200" cy="136" r="16" fill="#fff8e6" stroke={OUT} strokeWidth="3" />
        </g>
      );
    case 'b-goggles':
      return (
        <g>
          <path d="M 58 168 Q 200 120 342 168 L 342 192 Q 200 144 58 192 Z" fill={x.d} {...S} />
          <circle cx="146" cy="150" r="34" fill="#bfe6f5" stroke={OUT} strokeWidth="5" />
          <circle cx="254" cy="150" r="34" fill="#bfe6f5" stroke={OUT} strokeWidth="5" />
          <circle cx="146" cy="150" r="34" fill="none" stroke="#e8b04a" strokeWidth="6" opacity="0.9" />
          <circle cx="254" cy="150" r="34" fill="none" stroke="#e8b04a" strokeWidth="6" opacity="0.9" />
          <path d="M 180 150 H 220" stroke={OUT} strokeWidth="6" />
          <path d="M 128 136 q 10 -10 24 -8 M 236 136 q 10 -10 24 -8" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'b-foxmask':
      return (
        <g transform="translate(296 148) rotate(18)">
          <path d="M -50 -52 L -26 -86 L -6 -48 L 6 -48 L 26 -86 L 50 -52 Q 62 8 0 64 Q -62 8 -50 -52 Z" fill="#fffdf6" {...S} />
          <path d="M -30 -8 Q -14 -24 -6 -2 Q -18 10 -30 -8 Z M 30 -8 Q 14 -24 6 -2 Q 18 10 30 -8 Z" fill="#d9453a" stroke={OUT} strokeWidth="2.5" />
          <path d="M -12 -44 L 0 -62 L 12 -44" stroke="#d9453a" strokeWidth="5" fill="none" strokeLinejoin="round" />
          <ellipse cx="0" cy="34" rx="9" ry="7" fill={OUT} />
          <path d="M -24 28 Q -46 30 -50 40 M 24 28 Q 46 30 50 40" stroke="#d9453a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Đồ mang thêm                                                          */
/* ------------------------------------------------------------------ */

export interface ExtraDef {
  /** Vẽ phía sau thân (ba lô) */
  back?: (x: PartCtx) => ReactNode;
  /** Vẽ đè lên thân và cổ, dưới đầu */
  front?: (x: PartCtx) => ReactNode;
  /** Vẽ trên mặt */
  face?: (x: PartCtx) => ReactNode;
}

const GLASSES = (
  <g>
    <circle cx="146" cy="292" r="42" fill="#d6efff" fillOpacity="0.25" stroke="#5a3a2a" strokeWidth="6" />
    <circle cx="254" cy="292" r="42" fill="#d6efff" fillOpacity="0.25" stroke="#5a3a2a" strokeWidth="6" />
    <path d="M 188 288 Q 200 278 212 288" stroke="#5a3a2a" strokeWidth="6" fill="none" />
    <path d="M 104 286 L 66 274 M 296 286 L 334 274" stroke="#5a3a2a" strokeWidth="5" />
    <path d="M 118 270 q 12 -12 28 -10 M 226 270 q 12 -12 28 -10" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
  </g>
);

const SCARF: ExtraDef = {
  front: (x) => (
    <g>
      <path d="M 218 450 L 258 462 L 268 556 L 228 548 Z" fill={x.c} {...S} />
      <path d="M 226 500 H 264 M 226 524 H 266" stroke={x.l} strokeWidth="5" opacity="0.8" />
      <path d="M 122 414 Q 200 450 278 414 L 286 454 Q 200 490 114 454 Z" fill={x.c} {...S} />
      <path d="M 136 430 Q 200 458 264 430" stroke={x.l} strokeWidth="5" fill="none" opacity="0.8" />
    </g>
  ),
};

export const EXTRAS: Record<string, ExtraDef> = {
  'g-glasses': { face: () => GLASSES },
  'b-glasses': { face: () => GLASSES },
  'g-scarf': SCARF,
  'b-scarf': SCARF,
  'g-satchel': {
    front: (x) => (
      <g>
        <path d="M 138 426 L 292 590" stroke={OUT} strokeWidth="20" strokeLinecap="round" />
        <path d="M 138 426 L 292 590" stroke={x.d} strokeWidth="13" strokeLinecap="round" />
        <path d="M 246 560 h 66 v 56 q -33 10 -66 0 Z" fill={x.c} {...S} />
        <path d="M 246 574 q 33 14 66 0" stroke={OUT} strokeWidth="3" fill="none" />
        <circle cx="279" cy="584" r="5" fill="#e8b04a" stroke={OUT} strokeWidth="2" />
      </g>
    ),
  },
  'b-backpack': {
    back: (x) => <path d="M 96 446 Q 92 430 120 430 L 280 430 Q 308 430 304 446 L 310 590 Q 200 612 90 590 Z" fill={x.c} {...S} />,
    front: (x) => (
      <g>
        <path d="M 146 428 L 140 560 L 166 560 L 172 428 Z M 254 428 L 260 560 L 234 560 L 228 428 Z" fill={x.d} {...S} />
        <rect x="134" y="552" width="40" height="12" rx="4" fill="#e8b04a" stroke={OUT} strokeWidth="2.5" />
        <rect x="226" y="552" width="40" height="12" rx="4" fill="#e8b04a" stroke={OUT} strokeWidth="2.5" />
      </g>
    ),
  },
};

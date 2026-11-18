import { useId, type CSSProperties, type ReactNode } from 'react';
import { finalArt } from '../data/art';
import { HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../data/characters';
import type { CharacterId, Emotion } from '../data/types';
import { DEFAULT_LOOK, type PlayerLook } from '../lib/gameState';
import { FACE_ITEMS, type FaceItem } from '../data/wardrobe';
import { EXTRAS, OUTFITS, hairBack, hairFront, hatPart, type PartCtx } from './art/playerParts';

/**
 * Nhân vật vẽ bằng SVG (placeholder gốc). Thay bằng tranh thật theo docs/ASSETS.md:
 * mỗi nhân vật cần một bộ biểu cảm PNG/WebP trong suốt 800×1520 (xem mục "characters").
 */

const OUT = '#3a2a2c';

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}
/** Làm tối (t>0) hoặc sáng (t<0) một màu. */
function shade(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  if (t >= 0) return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
  return rgbToHex(r + (255 - r) * -t, g + (255 - g) * -t, b + (255 - b) * -t);
}

/* ------------------------------------------------------------------ */
/* Biểu cảm                                                             */
/* ------------------------------------------------------------------ */

type EyeKind = 'open' | 'wide' | 'happy' | 'look' | 'half';
type MouthKind = 'smile' | 'open' | 'grin' | 'o' | 'flat' | 'frown';

interface FaceSpec {
  eye: EyeKind;
  mouth: MouthKind;
  blush: number;
  browL: [number, number];
  browR: [number, number];
  sweat?: boolean;
  sparkle?: boolean;
  thought?: boolean;
}

const FACES: Record<Emotion, FaceSpec> = {
  neutral: { eye: 'open', mouth: 'smile', blush: 0.35, browL: [0, 0], browR: [0, 0] },
  happy: { eye: 'open', mouth: 'open', blush: 0.6, browL: [-4, -6], browR: [4, -6], sparkle: true },
  laugh: { eye: 'happy', mouth: 'grin', blush: 0.65, browL: [-6, -8], browR: [6, -8] },
  surprised: { eye: 'wide', mouth: 'o', blush: 0.3, browL: [-6, -16], browR: [6, -16] },
  worried: { eye: 'open', mouth: 'frown', blush: 0.15, browL: [-18, -2], browR: [18, -2], sweat: true },
  thinking: { eye: 'look', mouth: 'flat', blush: 0.3, browL: [-4, -2], browR: [6, -14], thought: true },
};

function Eye({
  cx,
  cy,
  kind,
  iris,
  outer,
  scale = 1,
  clipId,
}: {
  cx: number;
  cy: number;
  kind: EyeKind;
  iris: string;
  outer: -1 | 1;
  scale?: number;
  clipId: string;
}) {
  const irisDark = shade(iris, 0.35);
  const lx = kind === 'look' ? 9 * -outer * -1 : 0; // nhìn lên và sang phải
  const ly = kind === 'look' ? -11 : 0;
  if (kind === 'happy') {
    return (
      <path
        d={`M ${cx - 28 * scale} ${cy + 8} Q ${cx} ${cy - 32 * scale} ${cx + 28 * scale} ${cy + 8}`}
        stroke={OUT}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const rx = (kind === 'wide' ? 31 : 29) * scale;
  const ry = (kind === 'wide' ? 41 : 37) * scale;
  const irx = (kind === 'wide' ? 18 : 23) * scale;
  const iry = (kind === 'wide' ? 25 : 31) * scale;
  const prx = (kind === 'wide' ? 8 : 11) * scale;
  const pry = (kind === 'wide' ? 12 : 17) * scale;
  const half = kind === 'half';
  return (
    <g>
      {half && (
        <clipPath id={clipId}>
          <path d={`M ${cx - rx} ${cy + 2} Q ${cx} ${cy - 20} ${cx + rx} ${cy + 2} Q ${cx} ${cy + ry} ${cx - rx} ${cy + 2} Z`} />
        </clipPath>
      )}
      <g clipPath={half ? `url(#${clipId})` : undefined}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffdf8" />
        <ellipse cx={cx + lx} cy={cy + ly + 2} rx={irx} ry={iry} fill={iris} />
        <ellipse cx={cx + lx} cy={cy + ly - iry * 0.45} rx={irx} ry={iry * 0.55} fill={irisDark} opacity="0.55" />
        <ellipse cx={cx + lx} cy={cy + ly + 2} rx={prx} ry={pry} fill="#1e1417" />
        <circle cx={cx + lx - 8 * scale} cy={cy + ly - 11 * scale} r={8 * scale} fill="#fff" />
        <circle cx={cx + lx + 10 * scale} cy={cy + ly + 12 * scale} r={4 * scale} fill="#fff" opacity="0.9" />
      </g>
      <path
        d={
          half
            ? `M ${cx - rx} ${cy + 2} Q ${cx} ${cy - 20} ${cx + rx} ${cy + 2}`
            : `M ${cx - rx - 2} ${cy - 8 * scale} C ${cx - rx + 4} ${cy - ry - 8} ${cx + rx - 4} ${cy - ry - 8} ${cx + rx + 2} ${cy - 8 * scale}`
        }
        stroke={OUT}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx + outer * (rx + 2)} ${cy - 8 * scale} l ${outer * 9} -8`}
        stroke={OUT}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function Mouth({ kind, y = 362 }: { kind: MouthKind; y?: number }) {
  switch (kind) {
    case 'open':
      return (
        <g>
          <path d={`M 170 ${y - 8} Q 200 ${y + 44} 230 ${y - 8} Z`} fill="#8c2f38" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d={`M 174 ${y - 6} H 226`} stroke="#fff" strokeWidth="9" />
          <ellipse cx="200" cy={y + 22} rx="14" ry="9" fill="#f08a95" />
        </g>
      );
    case 'grin':
      return (
        <g>
          <path d={`M 160 ${y - 10} Q 200 ${y + 56} 240 ${y - 10} Z`} fill="#8c2f38" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d={`M 166 ${y - 8} H 234`} stroke="#fff" strokeWidth="10" />
          <ellipse cx="200" cy={y + 26} rx="18" ry="11" fill="#f08a95" />
        </g>
      );
    case 'o':
      return <ellipse cx="200" cy={y + 6} rx="13" ry="17" fill="#8c2f38" stroke={OUT} strokeWidth="4" />;
    case 'flat':
      return <path d={`M 184 ${y + 4} Q 200 ${y + 8} 218 ${y - 2}`} stroke="#7a3b34" strokeWidth="5" strokeLinecap="round" fill="none" />;
    case 'frown':
      return <path d={`M 180 ${y + 12} Q 200 ${y - 6} 220 ${y + 12}`} stroke="#7a3b34" strokeWidth="5" strokeLinecap="round" fill="none" />;
    default:
      return <path d={`M 178 ${y} Q 200 ${y + 22} 222 ${y}`} stroke="#7a3b34" strokeWidth="5.5" strokeLinecap="round" fill="none" />;
  }
}

function Brow({ cx, rot, dy, color, w = 8 }: { cx: number; rot: number; dy: number; color: string; w?: number }) {
  return (
    <path
      d="M -28 4 Q 0 -8 28 4"
      transform={`translate(${cx} ${240 + dy}) rotate(${rot})`}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** Khuôn mặt chung: mắt, mày, má hồng, mũi, miệng và hiệu ứng cảm xúc. */
function Face({
  emotion,
  skin,
  iris,
  browColor,
  speaking,
  eyeScale = 1,
  half = false,
  browW = 8,
  uid,
  noseTint,
}: {
  emotion: Emotion;
  skin: string;
  iris: string;
  browColor: string;
  speaking?: boolean;
  eyeScale?: number;
  half?: boolean;
  browW?: number;
  uid: string;
  noseTint: string;
}) {
  const f = FACES[emotion];
  const eye: EyeKind = half && f.eye === 'open' ? 'half' : f.eye;
  return (
    <g>
      <ellipse cx="112" cy="338" rx="26" ry="14" fill="#f08a8a" opacity={f.blush} />
      <ellipse cx="288" cy="338" rx="26" ry="14" fill="#f08a8a" opacity={f.blush} />
      <g className="sprite-blink">
        <Eye cx={146} cy={292} kind={eye} iris={iris} outer={-1} scale={eyeScale} clipId={`${uid}-el`} />
        <Eye cx={254} cy={292} kind={eye} iris={iris} outer={1} scale={eyeScale} clipId={`${uid}-er`} />
      </g>
      <Brow cx={146} rot={f.browL[0]} dy={f.browL[1]} color={browColor} w={browW} />
      <Brow cx={254} rot={f.browR[0]} dy={f.browR[1]} color={browColor} w={browW} />
      <path d="M 196 334 q 4 5 8 0" stroke={noseTint} strokeWidth="4" strokeLinecap="round" fill="none" />
      <g className={speaking ? 'sprite-talk' : undefined}>
        <Mouth kind={f.mouth} />
      </g>
      {f.sweat && (
        <path d="M 320 220 Q 334 244 322 258 Q 306 256 308 240 Q 312 228 320 220 Z" fill="#bfe6f5" stroke="#6aa9c4" strokeWidth="3" />
      )}
      {f.sparkle && (
        <g fill="#fff6bf" stroke="#e8b04a" strokeWidth="2">
          <path d="M 340 150 l 6 14 l 14 6 l -14 6 l -6 14 l -6 -14 l -14 -6 l 14 -6 z" />
          <path d="M 70 170 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z" />
        </g>
      )}
      {f.thought && (
        <g fill="#ffffff" stroke="#c9c2b0" strokeWidth="3">
          <circle cx="330" cy="130" r="9" />
          <circle cx="352" cy="100" r="14" />
          <circle cx="380" cy="60" r="22" />
        </g>
      )}
      <path d="" fill={skin} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Phần thân chung                                                      */
/* ------------------------------------------------------------------ */

const HEAD_PATH =
  'M 200 138 C 292 138 342 200 338 282 C 334 352 282 404 200 408 C 118 404 66 352 62 282 C 58 200 108 138 200 138 Z';

/* ------------------------------------------------------------------ */
/* Bé (người chơi)                                                      */
/* ------------------------------------------------------------------ */

const HEAD_OVAL =
  'M 200 138 C 280 138 330 204 326 284 C 322 356 276 408 200 410 C 124 408 78 356 74 284 C 70 204 120 138 200 138 Z';

/** Đường tay áo ngắn (chỉ phần gần vai) theo từng tư thế. */
const SHORT_SLEEVE = {
  down: ['M 124 448 Q 98 468 92 490', 'M 276 448 Q 302 468 308 490'],
  up: ['M 124 448 Q 90 446 72 430', 'M 276 448 Q 310 446 328 430'],
  think: ['M 124 448 Q 98 468 92 490', 'M 276 448 Q 306 446 304 424'],
};

function Player({
  emotion,
  look,
  speaking,
  uid,
}: {
  emotion: Emotion;
  look: PlayerLook;
  speaking?: boolean;
  uid: string;
}) {
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[1];
  const skinShade = shade(skin, 0.14);
  const hair = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const hairHi = shade(hair, -0.35);
  const outfitC = OUTFIT_COLORS[look.outfitColor] ?? OUTFIT_COLORS[1];
  const ctx: PartCtx = { skin, skinShade, hair, hairHi, c: outfitC, d: shade(outfitC, 0.22), l: shade(outfitC, -0.4) };
  const iris = look.hairColor === 4 ? '#6b4a9a' : '#5a3a2a';
  const armUp = emotion === 'surprised' || emotion === 'happy' || emotion === 'laugh';
  const think = emotion === 'thinking';
  const pose: 'down' | 'up' | 'think' = think ? 'think' : armUp ? 'up' : 'down';

  const face: FaceItem = FACE_ITEMS[look.gender].find((x) => x.id === look.face) ?? FACE_ITEMS[look.gender][0];
  const outfit = OUTFITS[look.outfit] ?? OUTFITS[look.gender === 'boy' ? 'b-tee' : 'g-dress'];
  const extra = EXTRAS[look.extra];
  const sleeveFill = outfit.sleeveColor ? outfit.sleeveColor(ctx) : ctx.c;
  const oval = face.shape === 'oval';
  const earL = oval ? 74 : 62;
  const earR = oval ? 326 : 338;

  const armL = pose === 'up' ? 'M 124 448 Q 62 440 54 380' : 'M 124 448 Q 72 496 80 568';
  const armR = pose === 'think' ? 'M 276 448 Q 330 440 270 396' : pose === 'up' ? 'M 276 448 Q 338 440 346 380' : 'M 276 448 Q 328 496 320 568';
  const sleeve = outfit.sleeve === 'short' ? SHORT_SLEEVE[pose] : [armL, armR];

  const shoeFill = outfit.feet === 'boots' ? '#f2c94c' : '#f8f3e6';
  const shoeSole = outfit.feet === 'boots' ? '#d9a52b' : '#b8553f';

  return (
    <g>
      {extra?.back?.(ctx)}
      {hairBack(look.hairStyle, ctx)}
      {/* chân */}
      <g>
        <rect x="150" y="610" width="40" height="92" rx="16" fill={skin} stroke={OUT} strokeWidth="4" />
        <rect x="210" y="610" width="40" height="92" rx="16" fill={skin} stroke={OUT} strokeWidth="4" />
        {outfit.feet === 'geta' ? (
          <g>
            <path d="M 140 712 H 202 L 204 734 H 138 Z" fill="#e8c88a" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 198 712 H 260 L 262 734 H 196 Z" fill="#e8c88a" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 160 712 L 170 696 L 180 712 M 220 712 L 230 696 L 240 712" stroke="#d9453a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        ) : (
          <g>
            <path d="M 142 700 Q 170 686 198 700 L 202 722 Q 168 736 138 722 Z" fill={shoeFill} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 202 700 Q 230 686 258 700 L 262 722 Q 232 736 198 722 Z" fill={shoeFill} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 136 722 Q 166 746 204 722 L 208 738 Q 168 756 134 738 Z" fill={shoeSole} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 196 722 Q 232 746 262 722 L 266 738 Q 230 756 192 738 Z" fill={shoeSole} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          </g>
        )}
      </g>
      {/* quần / váy */}
      {outfit.bottom(ctx)}
      {/* tay: da, rồi tay áo */}
      <g strokeLinecap="round" fill="none">
        <path d={armL} stroke={OUT} strokeWidth="50" />
        <path d={armL} stroke={skin} strokeWidth="42" />
        <path d={armR} stroke={OUT} strokeWidth="50" />
        <path d={armR} stroke={skin} strokeWidth="42" />
        <path d={sleeve[0]} stroke={OUT} strokeWidth="50" />
        <path d={sleeve[0]} stroke={sleeveFill} strokeWidth="42" />
        <path d={sleeve[1]} stroke={OUT} strokeWidth="50" />
        <path d={sleeve[1]} stroke={sleeveFill} strokeWidth="42" />
      </g>
      {/* thân áo */}
      {outfit.torso(ctx)}
      {/* bàn tay */}
      <circle cx={pose === 'up' ? 54 : 80} cy={pose === 'up' ? 372 : 574} r="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <circle cx={pose === 'think' ? 266 : pose === 'up' ? 346 : 320} cy={pose === 'think' ? 392 : pose === 'up' ? 372 : 574} r="24" fill={skin} stroke={OUT} strokeWidth="4" />
      {/* cổ & đầu */}
      <rect x="178" y="392" width="44" height="46" rx="14" fill={skinShade} stroke={OUT} strokeWidth="4" />
      {extra?.front?.(ctx)}
      <ellipse cx={earL} cy="294" rx="16" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <ellipse cx={earR} cy="294" rx="16" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <path d={oval ? HEAD_OVAL : HEAD_PATH} fill={skin} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 120 388 Q 200 420 280 388 Q 200 408 120 388 Z" fill={skinShade} opacity="0.5" />
      <Face emotion={emotion} skin={skin} iris={iris} browColor={shade(hair, 0.1)} browW={face.brow} speaking={speaking} eyeScale={face.eye} uid={uid} noseTint={shade(skin, 0.3)} />
      {face.lashes && (
        <g stroke={OUT} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M 108 270 l -14 -10 M 110 284 l -16 -2" />
          <path d="M 292 270 l 14 -10 M 290 284 l 16 -2" />
        </g>
      )}
      {face.freckles && (
        <g fill={shade(skin, 0.28)} opacity="0.75">
          {[[100, 330], [116, 340], [130, 328], [270, 328], [284, 340], [300, 330]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.4" />
          ))}
        </g>
      )}
      {face.bandaid && (
        <g transform="translate(284 330) rotate(-24)">
          <rect x="-24" y="-9" width="48" height="18" rx="9" fill="#f2c9a0" stroke={OUT} strokeWidth="3" />
          <rect x="-8" y="-9" width="16" height="18" fill="#e5a979" />
        </g>
      )}
      {face.starEyes && emotion !== 'laugh' && (
        <g fill="#fff6bf" stroke="#e8b04a" strokeWidth="1.5">
          <path d="M 164 296 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z" />
          <path d="M 272 296 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z" />
        </g>
      )}
      {extra?.face?.(ctx)}
      {hairFront(look.hairStyle, ctx)}
      {hatPart(look.hat, ctx)}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bà Hana                                                              */
/* ------------------------------------------------------------------ */

function Grandma({ emotion, glasses, speaking, uid }: { emotion: Emotion; glasses: boolean; speaking?: boolean; uid: string }) {
  const skin = '#f6d7ba';
  const skinShade = shade(skin, 0.14);
  const hair = '#ebe8f0';
  const hairShade = '#c4c0cf';
  const kimono = '#35527c';
  const kimonoDark = '#27406a';
  const worriedNoGlasses = !glasses && (emotion === 'worried' || emotion === 'thinking');
  return (
    <g>
      {/* búi tóc */}
      <circle cx="200" cy="104" r="54" fill={hair} stroke={OUT} strokeWidth="4" />
      <path d="M 160 90 Q 200 60 240 90" stroke={hairShade} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="66" r="8" fill="#e996ae" stroke={OUT} strokeWidth="2" />
      {/* tóc sau */}
      <path d="M 54 300 C 46 170 110 112 200 112 C 290 112 354 170 346 300 L 346 330 L 54 330 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      {/* thân */}
      <path d="M 96 604 L 78 730 H 322 L 304 604 Z" fill={kimono} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M 240 604 L 322 730 H 250 Z" fill={kimonoDark} opacity="0.35" />
      <path d="M 100 432 Q 200 404 300 432 L 316 610 Q 200 634 84 610 Z" fill={kimono} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      {/* tay áo rộng */}
      <path d="M 104 446 Q 36 520 58 612 L 126 600 Q 130 520 140 470 Z" fill={kimono} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M 296 446 Q 364 520 342 612 L 274 600 Q 270 520 260 470 Z" fill={kimono} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M 58 612 L 126 600 L 124 626 L 62 636 Z" fill="#e9f0f6" opacity="0.8" />
      <path d="M 342 612 L 274 600 L 276 626 L 338 636 Z" fill="#e9f0f6" opacity="0.8" />
      {/* hoa văn trên kimono */}
      {[
        [130, 520],
        [270, 540],
        [112, 590],
        [286, 600],
        [160, 640],
        [244, 660],
        [200, 700],
      ].map(([x, y], i) => (
        <g key={i} opacity="0.5">
          <circle cx={x} cy={y} r="7" fill="#fff" />
          <circle cx={x} cy={y} r="3" fill="#f4bccb" />
        </g>
      ))}
      {/* tạp dề */}
      <path d="M 138 486 H 262 L 276 628 H 124 Z" fill="#fff6e0" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <rect x="156" y="548" width="88" height="46" rx="8" fill="#f1e2bf" stroke={OUT} strokeWidth="2.5" />
      <path d="M 158 450 L 200 506 L 242 450" stroke="#fffdf4" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 158 450 L 200 506 L 242 450" stroke={OUT} strokeWidth="2" fill="none" opacity="0.4" />
      {/* tay chắp trước */}
      <ellipse cx="184" cy="620" rx="26" ry="20" fill={skin} stroke={OUT} strokeWidth="4" />
      <ellipse cx="218" cy="620" rx="26" ry="20" fill={skin} stroke={OUT} strokeWidth="4" />
      {/* dép */}
      <ellipse cx="150" cy="738" rx="42" ry="12" fill="#b6554a" stroke={OUT} strokeWidth="3" />
      <ellipse cx="250" cy="738" rx="42" ry="12" fill="#b6554a" stroke={OUT} strokeWidth="3" />
      {/* cổ & đầu */}
      <rect x="176" y="392" width="48" height="54" rx="14" fill={skinShade} stroke={OUT} strokeWidth="4" />
      <ellipse cx="62" cy="296" rx="15" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <ellipse cx="338" cy="296" rx="15" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <path d={HEAD_PATH} fill={skin} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 120 388 Q 200 418 280 388 Q 200 406 120 388 Z" fill={skinShade} opacity="0.5" />
      {/* nếp nhăn nhẹ */}
      <g stroke="#c89f84" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M 100 270 q -8 4 -12 10 M 100 282 q -8 2 -12 8" />
        <path d="M 300 270 q 8 4 12 10 M 300 282 q 8 2 12 8" />
        <path d="M 166 364 q -8 10 -4 22 M 234 364 q 8 10 4 22" />
      </g>
      <Face
        emotion={emotion}
        skin={skin}
        iris="#6b4a33"
        browColor="#b9b4c2"
        speaking={speaking}
        eyeScale={0.86}
        half={worriedNoGlasses}
        uid={uid}
        noseTint={shade(skin, 0.3)}
      />
      {/* kính */}
      {glasses && (
        <g>
          <circle cx="146" cy="292" r="44" fill="#d6efff" fillOpacity="0.22" stroke="#8a5a2f" strokeWidth="6" />
          <circle cx="254" cy="292" r="44" fill="#d6efff" fillOpacity="0.22" stroke="#8a5a2f" strokeWidth="6" />
          <path d="M 190 288 Q 200 278 210 288" stroke="#8a5a2f" strokeWidth="6" fill="none" />
          <path d="M 102 288 L 66 276 M 298 288 L 334 276" stroke="#8a5a2f" strokeWidth="5" />
          <path d="M 116 268 q 12 -12 28 -10" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M 224 268 q 12 -12 28 -10" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      )}
      {/* tóc mái */}
      <path
        d="M 56 302 C 40 200 100 120 200 120 C 300 120 360 200 344 302 C 334 262 320 232 300 212 C 262 232 226 228 200 196 C 170 232 120 236 100 214 C 80 236 66 266 56 302 Z"
        fill={hair}
        stroke={OUT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 118 150 C 160 124 244 124 286 150" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.5" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Momo (chú mèo tam thể)                                              */
/* ------------------------------------------------------------------ */

function Momo({ emotion, speaking, uid }: { emotion: Emotion; speaking?: boolean; uid: string }) {
  const f = FACES[emotion];
  const fur = '#fffaf0';
  const orange = '#f0a44e';
  const dark = '#4b3a3e';
  const iris = '#79c27e';
  const eyeKind: EyeKind = f.eye;
  const ey = 452;
  return (
    <g transform="translate(0 6)">
      {/* đuôi */}
      <path className="momo-tail" d="M 296 690 C 380 690 400 600 360 540" stroke={OUT} strokeWidth="46" strokeLinecap="round" fill="none" />
      <path className="momo-tail" d="M 296 690 C 380 690 400 600 360 540" stroke={orange} strokeWidth="38" strokeLinecap="round" fill="none" />
      <path d="M 372 566 C 360 548 360 540 358 534" stroke={fur} strokeWidth="38" strokeLinecap="round" fill="none" />
      {/* thân */}
      <path d="M 90 700 C 70 600 110 520 200 520 C 290 520 330 600 310 700 C 290 730 110 730 90 700 Z" fill={fur} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 250 540 C 300 570 316 640 304 700 C 290 716 270 720 250 722 C 280 650 270 590 250 540 Z" fill={orange} opacity="0.92" />
      <path d="M 112 600 C 90 640 96 690 108 706 C 120 680 122 640 112 600 Z" fill={dark} opacity="0.88" />
      {/* chân trước */}
      <rect x="132" y="620" width="54" height="108" rx="27" fill={fur} stroke={OUT} strokeWidth="4" />
      <rect x="214" y="620" width="54" height="108" rx="27" fill={fur} stroke={OUT} strokeWidth="4" />
      <path d="M 148 722 v 10 M 160 722 v 12 M 172 722 v 10 M 230 722 v 10 M 242 722 v 12 M 254 722 v 10" stroke={OUT} strokeWidth="2.5" strokeLinecap="round" />
      {/* vòng cổ và chuông */}
      <path d="M 130 530 Q 200 566 270 530 L 266 556 Q 200 592 134 556 Z" fill="#d9533a" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="200" cy="582" r="20" fill="#f4c542" stroke={OUT} strokeWidth="4" />
      <path d="M 190 580 H 210 M 200 586 V 600" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
      <circle cx="194" cy="574" r="5" fill="#fff6bf" />
      {/* tai */}
      <path d="M 82 392 L 90 270 L 176 346 Z" fill={orange} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 318 392 L 310 270 L 224 346 Z" fill={dark} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 104 372 L 108 306 L 154 350 Z" fill="#f4bccb" />
      <path d="M 296 372 L 292 306 L 246 350 Z" fill="#f4bccb" />
      {/* đầu */}
      <path d="M 200 336 C 308 336 352 396 346 456 C 340 520 280 556 200 556 C 120 556 60 520 54 456 C 48 396 92 336 200 336 Z" fill={fur} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 54 440 C 50 396 90 340 150 338 C 170 380 150 430 110 466 C 90 480 64 470 54 440 Z" fill={orange} />
      <path d="M 346 440 C 350 396 310 340 250 338 C 230 380 250 430 290 466 C 310 480 336 470 346 440 Z" fill={dark} opacity="0.9" />
      <path d="M 170 346 C 188 360 212 360 230 346 L 222 380 C 210 388 190 388 178 380 Z" fill={orange} opacity="0.9" />
      {/* má hồng */}
      <ellipse cx="102" cy="500" rx="22" ry="12" fill="#f08a8a" opacity={Math.max(0.3, f.blush)} />
      <ellipse cx="298" cy="500" rx="22" ry="12" fill="#f08a8a" opacity={Math.max(0.3, f.blush)} />
      {/* mắt */}
      <g className="sprite-blink-momo">
        {([-1, 1] as const).map((side) => {
          const cx = 200 + side * 70;
          if (eyeKind === 'happy') {
            return <path key={side} d={`M ${cx - 24} ${ey + 8} Q ${cx} ${ey - 28} ${cx + 24} ${ey + 8}`} stroke={OUT} strokeWidth="8" strokeLinecap="round" fill="none" />;
          }
          const wide = eyeKind === 'wide';
          const ox = eyeKind === 'look' ? 8 : 0;
          const oy = eyeKind === 'look' ? -10 : 0;
          return (
            <g key={side}>
              <ellipse cx={cx} cy={ey} rx={wide ? 30 : 27} ry={wide ? 38 : 33} fill="#fffdf8" stroke={OUT} strokeWidth="4" />
              <ellipse cx={cx + ox} cy={ey + 2 + oy} rx={wide ? 19 : 22} ry={wide ? 26 : 28} fill={iris} />
              <ellipse cx={cx + ox} cy={ey - 8 + oy} rx={wide ? 19 : 22} ry="14" fill={shade(iris, 0.3)} opacity="0.5" />
              <ellipse cx={cx + ox} cy={ey + 2 + oy} rx={wide ? 6 : 9} ry={wide ? 18 : 20} fill="#1e1417" />
              <circle cx={cx + ox - 8} cy={ey - 9 + oy} r="7.5" fill="#fff" />
              <circle cx={cx + ox + 9} cy={ey + 12 + oy} r="3.5" fill="#fff" />
            </g>
          );
        })}
      </g>
      <Brow cx={130} rot={f.browL[0]} dy={f.browL[1] + 164} color={dark} />
      <Brow cx={270} rot={f.browR[0]} dy={f.browR[1] + 164} color={dark} />
      {/* mũi & miệng */}
      <path d="M 188 490 H 212 L 200 504 Z" fill="#f08a95" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <g className={speaking ? 'sprite-talk-momo' : undefined}>
        {f.mouth === 'open' || f.mouth === 'grin' ? (
          <g>
            <path d="M 170 512 Q 200 560 230 512 Q 200 524 170 512 Z" fill="#8c2f38" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <ellipse cx="200" cy="540" rx="12" ry="7" fill="#f08a95" />
          </g>
        ) : f.mouth === 'o' ? (
          <ellipse cx="200" cy="524" rx="10" ry="13" fill="#8c2f38" stroke={OUT} strokeWidth="3" />
        ) : f.mouth === 'frown' ? (
          <path d="M 200 506 V 514 M 200 514 q -16 -10 -28 4 M 200 514 q 16 -10 28 4" stroke={OUT} strokeWidth="4" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 200 504 V 512 M 200 512 q -14 16 -30 6 M 200 512 q 14 16 30 6" stroke={OUT} strokeWidth="4" strokeLinecap="round" fill="none" />
        )}
      </g>
      {/* ria mép */}
      <g stroke="#6b5b52" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d="M 120 500 L 56 488 M 120 512 L 52 516 M 124 524 L 64 544" />
        <path d="M 280 500 L 344 488 M 280 512 L 348 516 M 276 524 L 336 544" />
      </g>
      {f.sweat && <path d="M 330 380 Q 344 404 332 418 Q 316 416 318 400 Q 322 388 330 380 Z" fill="#bfe6f5" stroke="#6aa9c4" strokeWidth="3" />}
      {f.sparkle && (
        <g fill="#fff6bf" stroke="#e8b04a" strokeWidth="2">
          <path d="M 352 330 l 6 14 l 14 6 l -14 6 l -6 14 l -6 -14 l -14 -6 l 14 -6 z" />
        </g>
      )}
      {f.thought && (
        <g fill="#ffffff" stroke="#c9c2b0" strokeWidth="3">
          <circle cx="344" cy="320" r="8" />
          <circle cx="362" cy="292" r="12" />
          <circle cx="386" cy="256" r="18" />
        </g>
      )}
      <path d="" fill={uid} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Thành phần xuất ra                                                   */
/* ------------------------------------------------------------------ */

export type SpriteVariant = 'full' | 'bust' | 'head' | 'outfit';

const VIEWBOX: Record<SpriteVariant, string> = {
  full: '0 0 400 760',
  bust: '20 70 360 420',
  head: '30 80 340 340',
  outfit: '10 360 380 400',
};

const MOMO_VIEWBOX: Record<SpriteVariant, string> = {
  full: '0 0 400 760',
  bust: '10 215 420 460',
  head: '30 300 340 290',
  outfit: '10 215 420 460',
};

export interface CharacterSpriteProps {
  id: CharacterId;
  emotion?: Emotion;
  look?: PlayerLook;
  glasses?: boolean;
  speaking?: boolean;
  variant?: SpriteVariant;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export function CharacterSprite({
  id,
  emotion = 'neutral',
  look = DEFAULT_LOOK,
  glasses = true,
  speaking = false,
  variant = 'full',
  className,
  style,
  label,
}: CharacterSpriteProps) {
  const uid = useId().replace(/:/g, '');
  const finalSrc = finalArt(`character:${id}:${emotion}`);
  if (finalSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={finalSrc}
        alt={label ?? id}
        draggable={false}
        className={['sprite', 'sprite-img', `sprite-${id}`, `sprite-${variant}`, className].filter(Boolean).join(' ')}
        style={style}
      />
    );
  }
  const viewBox = id === 'momo' ? MOMO_VIEWBOX[variant] : VIEWBOX[variant];
  return (
    <svg
      viewBox={viewBox}
      className={['sprite', `sprite-${id}`, `sprite-${variant}`, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={label ?? (id === 'hana' ? 'Bà Hana' : id === 'momo' ? 'Momo' : 'Bạn')}
    >
      {variant === 'full' && <ellipse cx="200" cy="742" rx="150" ry="14" fill="#2b2118" opacity="0.18" />}
      {id === 'player' && <Player emotion={emotion} look={look} speaking={speaking} uid={uid} />}
      {id === 'hana' && <Grandma emotion={emotion} glasses={glasses} speaking={speaking} uid={uid} />}
      {id === 'momo' && <Momo emotion={emotion} speaking={speaking} uid={uid} />}
    </svg>
  );
}

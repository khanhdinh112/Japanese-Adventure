import { useId, type CSSProperties, type ReactNode } from 'react';
import { finalArt } from '../data/art';
import { HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../data/characters';
import type { CharacterId, Emotion } from '../data/types';
import { DEFAULT_LOOK, type PlayerLook } from '../lib/gameState';

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

function Brow({ cx, rot, dy, color }: { cx: number; rot: number; dy: number; color: string }) {
  return (
    <path
      d="M -28 4 Q 0 -8 28 4"
      transform={`translate(${cx} ${240 + dy}) rotate(${rot})`}
      stroke={color}
      strokeWidth="8"
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
      <Brow cx={146} rot={f.browL[0]} dy={f.browL[1]} color={browColor} />
      <Brow cx={254} rot={f.browR[0]} dy={f.browR[1]} color={browColor} />
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
  const outfit = OUTFIT_COLORS[look.outfit] ?? OUTFIT_COLORS[1];
  const outfitDark = shade(outfit, 0.22);
  const iris = look.hairColor === 4 ? '#6b4f9a' : '#5a3a2a';
  const f = FACES[emotion];
  const armUp = emotion === 'surprised' || emotion === 'happy' || emotion === 'laugh';
  const think = emotion === 'thinking';

  const backHair: ReactNode = (() => {
    switch (look.hairStyle) {
      case 'bob':
        return <path d="M 46 302 C 36 160 108 94 200 94 C 292 94 364 160 354 302 C 356 366 342 418 316 430 L 84 430 C 58 418 44 366 46 302 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />;
      case 'twin':
        return (
          <g>
            <circle cx="92" cy="130" r="50" fill={hair} stroke={OUT} strokeWidth="4" />
            <circle cx="308" cy="130" r="50" fill={hair} stroke={OUT} strokeWidth="4" />
            <circle cx="92" cy="130" r="14" fill={outfit} />
            <circle cx="308" cy="130" r="14" fill={outfit} />
          </g>
        );
      case 'ponytail':
        return (
          <g>
            <path d="M 318 170 C 410 150 436 270 392 350 C 372 392 350 410 336 424 C 358 360 352 300 316 236 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="320" cy="176" r="16" fill={outfit} stroke={OUT} strokeWidth="3" />
          </g>
        );
      default:
        return null;
    }
  })();

  const frontHair: ReactNode = (() => {
    const fringeBob =
      'M 58 300 C 40 190 100 94 200 94 C 300 94 360 190 342 300 C 334 262 320 232 298 214 C 262 240 138 240 102 214 C 80 232 66 262 58 300 Z';
    const fringeShort =
      'M 54 300 C 36 190 96 92 200 92 C 304 92 364 190 346 300 C 336 262 322 232 304 212 L 288 252 L 262 204 L 236 264 L 208 206 L 180 266 L 154 204 L 128 254 L 104 212 C 82 236 66 266 54 300 Z';
    const fringeSide =
      'M 54 300 C 36 190 96 92 200 92 C 304 92 364 190 346 300 C 338 262 326 236 308 218 C 270 250 190 236 150 200 C 126 240 96 250 74 262 C 64 276 58 288 54 300 Z';
    const path = look.hairStyle === 'short' ? fringeShort : look.hairStyle === 'ponytail' ? fringeSide : fringeBob;
    return (
      <g>
        <path d={path} fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 112 140 C 160 112 244 112 290 142" stroke={hairHi} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.35" />
        {look.hairStyle === 'bob' && (
          <g>
            <path d="M 60 300 C 54 340 60 384 80 414 L 106 404 C 92 366 94 322 106 262 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 340 300 C 346 340 340 384 320 414 L 294 404 C 308 366 306 322 294 262 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          </g>
        )}
        {look.hairStyle === 'twin' && (
          <g>
            <path d="M 60 300 C 56 336 62 372 76 396 L 100 388 C 90 356 92 322 104 262 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 340 300 C 344 336 338 372 324 396 L 300 388 C 310 356 308 322 296 262 Z" fill={hair} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  })();

  return (
    <g>
      {backHair}
      {/* chân */}
      <g>
        <rect x="150" y="610" width="40" height="92" rx="16" fill={skin} stroke={OUT} strokeWidth="4" />
        <rect x="210" y="610" width="40" height="92" rx="16" fill={skin} stroke={OUT} strokeWidth="4" />
        <path d="M 142 700 Q 170 686 198 700 L 202 722 Q 168 736 138 722 Z" fill="#f8f3e6" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 202 700 Q 230 686 258 700 L 262 722 Q 232 736 198 722 Z" fill="#f8f3e6" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 136 722 Q 166 746 204 722 L 208 738 Q 168 756 134 738 Z" fill="#b8553f" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        <path d="M 196 722 Q 232 746 262 722 L 266 738 Q 230 756 192 738 Z" fill="#b8553f" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      </g>
      {/* quần short */}
      <path d="M 124 580 L 276 580 L 284 646 Q 240 660 206 646 L 200 628 L 194 646 Q 160 660 116 646 Z" fill="#4a5a7c" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      {/* tay sau */}
      <g strokeLinecap="round" fill="none">
        <path d={armUp ? 'M 124 448 Q 62 440 54 380' : 'M 124 448 Q 72 496 80 568'} stroke={OUT} strokeWidth="50" />
        <path d={armUp ? 'M 124 448 Q 62 440 54 380' : 'M 124 448 Q 72 496 80 568'} stroke={outfit} strokeWidth="42" />
        <path d={think ? 'M 276 448 Q 330 440 270 396' : armUp ? 'M 276 448 Q 338 440 346 380' : 'M 276 448 Q 328 496 320 568'} stroke={OUT} strokeWidth="50" />
        <path d={think ? 'M 276 448 Q 330 440 270 396' : armUp ? 'M 276 448 Q 338 440 346 380' : 'M 276 448 Q 328 496 320 568'} stroke={outfit} strokeWidth="42" />
      </g>
      {/* thân áo */}
      <path d="M 118 432 Q 200 408 282 432 L 298 596 Q 200 620 102 596 Z" fill={outfit} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M 220 432 Q 282 432 282 432 L 298 596 Q 260 606 226 610 Z" fill={outfitDark} opacity="0.25" />
      <path d="M 164 424 L 200 470 L 236 424 Q 200 414 164 424 Z" fill="#fff8e6" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <rect x="108" y="552" width="184" height="24" fill="#fff3d0" stroke={OUT} strokeWidth="3" />
      <path d="M 200 552 l -24 -22 l 0 44 Z M 200 552 l 24 -22 l 0 44 Z" fill="#fff3d0" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="144" cy="498" r="9" fill="#fff8e6" opacity="0.8" />
      <circle cx="252" cy="512" r="7" fill="#fff8e6" opacity="0.8" />
      <circle cx="190" cy="522" r="6" fill="#fff8e6" opacity="0.8" />
      {/* tay: bàn tay */}
      <circle cx={armUp ? 54 : 80} cy={armUp ? 372 : 574} r="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <circle cx={think ? 266 : armUp ? 346 : 320} cy={think ? 392 : armUp ? 372 : 574} r="24" fill={skin} stroke={OUT} strokeWidth="4" />
      {/* cổ & đầu */}
      <rect x="178" y="392" width="44" height="46" rx="14" fill={skinShade} stroke={OUT} strokeWidth="4" />
      <ellipse cx="62" cy="294" rx="16" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <ellipse cx="338" cy="294" rx="16" ry="24" fill={skin} stroke={OUT} strokeWidth="4" />
      <path d={HEAD_PATH} fill={skin} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <path d="M 120 388 Q 200 420 280 388 Q 200 408 120 388 Z" fill={skinShade} opacity="0.5" />
      <Face emotion={emotion} skin={skin} iris={iris} browColor={shade(hair, 0.1)} speaking={speaking} uid={uid} noseTint={shade(skin, 0.3)} />
      {frontHair}
      {f.thought && null}
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

export type SpriteVariant = 'full' | 'bust' | 'head';

const VIEWBOX: Record<SpriteVariant, string> = {
  full: '0 0 400 760',
  bust: '20 70 360 420',
  head: '30 80 340 340',
};

const MOMO_VIEWBOX: Record<SpriteVariant, string> = {
  full: '0 0 400 760',
  bust: '10 215 420 460',
  head: '30 300 340 290',
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

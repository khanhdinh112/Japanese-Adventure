import type { ShapeKey } from '../../data/types';

const PAPER = '#ffd2c2';
const PAPER_DARK = '#f0a99a';
const INK = '#3a2a2c';

/** Tờ giấy origami ở các bước gấp mèo. Vẽ bằng SVG gốc. */
export function PaperShape({ shape, size = 220, className }: { shape: ShapeKey; size?: number; className?: string }) {
  const dots = (
    <g fill="#fff" opacity="0.55">
      {[
        [70, 78],
        [118, 62],
        [150, 104],
        [92, 128],
        [126, 150],
        [60, 150],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 220 220" width={size} height={size} className={className} role="img" aria-label={`Tờ giấy dạng ${shape}`}>
      <ellipse cx="110" cy="206" rx="78" ry="9" fill="#2b2118" opacity="0.14" />
      {shape === 'square' && (
        <g>
          <rect x="34" y="34" width="152" height="152" rx="6" fill={PAPER} stroke={INK} strokeWidth="4" />
          {dots}
          <path d="M 34 34 L 186 186" stroke={PAPER_DARK} strokeWidth="3" strokeDasharray="8 8" />
        </g>
      )}
      {shape === 'triangle' && (
        <g>
          <path d="M 28 52 H 192 L 110 190 Z" fill={PAPER} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {dots}
        </g>
      )}
      {shape === 'circle' && (
        <g>
          <circle cx="110" cy="112" r="78" fill={PAPER} stroke={INK} strokeWidth="4" />
          {dots}
        </g>
      )}
      {shape === 'earsUp' && (
        <g>
          <path d="M 28 52 H 192 L 110 190 Z" fill={PAPER} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M 28 52 L 70 8 L 98 52 Z M 192 52 L 150 8 L 122 52 Z" fill={PAPER_DARK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </g>
      )}
      {(shape === 'ears' || shape === 'face' || shape === 'blank') && (
        <g>
          <path d="M 34 60 L 40 14 L 84 46 Q 110 38 136 46 L 180 14 L 186 60 Q 196 112 150 168 Q 110 204 70 168 Q 24 112 34 60 Z" fill={PAPER} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M 46 26 L 78 48 L 50 56 Z M 174 26 L 142 48 L 170 56 Z" fill={PAPER_DARK} />
          {shape === 'blank' && <path d="M 62 100 H 158 M 62 130 H 158" stroke={PAPER_DARK} strokeWidth="3" strokeDasharray="6 8" />}
          {shape === 'face' && (
            <g>
              <ellipse cx="82" cy="102" rx="8" ry="11" fill={INK} />
              <ellipse cx="138" cy="102" rx="8" ry="11" fill={INK} />
              <circle cx="85" cy="98" r="3" fill="#fff" />
              <circle cx="141" cy="98" r="3" fill="#fff" />
              <path d="M 102 124 H 118 L 110 134 Z" fill="#e87a8a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
              <path d="M 110 134 q -8 10 -18 4 M 110 134 q 8 10 18 4" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 60 120 L 30 112 M 60 130 L 30 134 M 160 120 L 190 112 M 160 130 L 190 134" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="66" cy="124" rx="10" ry="6" fill="#f08a8a" opacity="0.5" />
              <ellipse cx="154" cy="124" rx="10" ry="6" fill="#f08a8a" opacity="0.5" />
            </g>
          )}
          {shape !== 'face' && dots}
        </g>
      )}
    </svg>
  );
}

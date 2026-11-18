import { Cloud, FarmHouse, Flowers, Mountain, PAL, Pine, RiceField, Ridge, RoundTree, SakuraTree, SceneSvg, Sky, StoneLantern, Torii, Wash, rng } from './paint';

/**
 * Làng Saga (vùng Kyushu, Nhật Bản): đồng lúa bậc thang, những mái nhà tranh, cây hồng, khinh khí cầu
 * của lễ hội Saga, đền nhỏ với cây long não khổng lồ, cột điện kéo dây, cây cầu đá bắc qua suối.
 * Toàn bộ vẽ gốc bằng SVG, đường đi qua 10 chặng (pathD) được vẽ phía trên cảnh nền.
 */

function Balloon({ x, y, s = 1, colors, delay = 0 }: { x: number; y: number; s?: number; colors: [string, string, string]; delay?: number }) {
  return (
    <g className="art-anim" style={{ animation: `balloon-float 9s ease-in-out ${-delay}s infinite` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M 0 -150 C 78 -150 96 -70 52 -8 L 28 22 L -28 22 L -52 -8 C -96 -70 -78 -150 0 -150 Z" fill={colors[0]} stroke="#3a2a2c" strokeWidth="3" />
        <path d="M 0 -150 C 30 -140 34 -60 24 22 L -24 22 C -34 -60 -30 -140 0 -150 Z" fill={colors[1]} opacity="0.95" />
        <path d="M -60 -66 Q 0 -50 60 -66" stroke={colors[2]} strokeWidth="10" fill="none" />
        <path d="M -28 22 L -14 62 M 28 22 L 14 62" stroke="#3a2a2c" strokeWidth="3" />
        <rect x="-18" y="62" width="36" height="24" rx="4" fill="#b88a55" stroke="#3a2a2c" strokeWidth="3" />
        <path d="M -48 -100 q 10 -26 30 -34" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.5" />
      </g>
    </g>
  );
}

function Persimmon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const r = rng(Math.round(x + y));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="70" ry="12" fill="#2f4a37" opacity="0.25" />
      <path d="M -10 0 C -8 -60 -22 -100 -52 -150 L -34 -158 C -8 -118 2 -96 6 -62 C 12 -100 28 -130 60 -164 L 76 -150 C 46 -116 34 -80 28 0 Z" fill="#5a4030" />
      {[[-60, -190, 64], [10, -230, 74], [68, -186, 62], [-10, -170, 60]].map(([cx, cy, rr], i) => (
        <circle key={i} cx={cx} cy={cy} r={rr} fill={i % 2 ? '#8fba66' : '#7fae5c'} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={-90 + r() * 180} cy={-240 + r() * 110} r="9" fill="#f08a2c" stroke="#c8641a" strokeWidth="2" />
      ))}
    </g>
  );
}

function Scarecrow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 0 V -120" stroke="#8a6a3f" strokeWidth="8" strokeLinecap="round" />
      <path d="M -50 -84 H 50" stroke="#8a6a3f" strokeWidth="8" strokeLinecap="round" />
      <path d="M -36 -88 L -44 -50 L 44 -50 L 36 -88 Z" fill="#6f8fd0" stroke="#3a2a2c" strokeWidth="3" />
      <circle cx="0" cy="-112" r="22" fill="#f4e2b0" stroke="#3a2a2c" strokeWidth="3" />
      <path d="M -36 -116 H 36 L 0 -154 Z" fill="#c8a35a" stroke="#3a2a2c" strokeWidth="3" strokeLinejoin="round" />
      <path d="M -8 -112 h 0.1 M 8 -112 h 0.1" stroke="#3a2a2c" strokeWidth="5" strokeLinecap="round" />
      <path d="M -8 -102 q 8 6 16 0" stroke="#3a2a2c" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Bamboo({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const stems = [0, 28, 54, -26, -50];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {stems.map((dx, i) => {
        const h = 360 + (i % 3) * 70;
        return (
          <g key={i}>
            <path d={`M ${dx} 0 Q ${dx + (i % 2 ? 14 : -12)} ${-h / 2} ${dx + (i % 2 ? 22 : -18)} ${-h}`} stroke="#6fa65b" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d={`M ${dx} 0 Q ${dx + (i % 2 ? 14 : -12)} ${-h / 2} ${dx + (i % 2 ? 22 : -18)} ${-h}`} stroke="#9ccf7a" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 60" />
            {[0.3, 0.55, 0.8].map((t) => (
              <g key={t} transform={`translate(${dx + (i % 2 ? 22 : -18) * t} ${-h * t})`}>
                <path d="M 0 0 q 40 -10 74 14 q -36 -2 -74 -14 Z M 0 0 q -40 -14 -70 4 q 34 4 70 -4 Z" fill="#7fb663" stroke="#4f8a45" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

function PolePair({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 0 V -330" stroke="#6e5a46" strokeWidth="12" />
      <path d="M -46 -300 H 46 M -36 -268 H 36" stroke="#6e5a46" strokeWidth="9" strokeLinecap="round" />
      <path d="M -46 -300 Q -400 -270 -780 -310 M 46 -300 Q 400 -250 700 -300 M -36 -268 Q -380 -240 -760 -280" stroke="#3a2a2c" strokeWidth="2.5" fill="none" opacity="0.55" />
    </g>
  );
}

function Hydrangea({ x, y, s = 1, hue }: { x: number; y: number; s?: number; hue: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="76" ry="40" fill="#5f9a56" />
      {[[-34, -24], [0, -40], [34, -24], [-14, -12], [20, -10]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="24" fill={hue} stroke="#ffffff" strokeWidth="2" opacity="0.95" />
      ))}
    </g>
  );
}

/** Ruộng bậc thang trên sườn đồi: các dải màu lúa cong theo triền. */
function Terraces({ x, y, w, rows, seed }: { x: number; y: number; w: number; rows: number; seed: number }) {
  const r = rng(seed);
  const cols = ['#9fcb6c', '#86bb5c', '#b7d77d', '#7fb15a', '#c7de8a'];
  return (
    <g>
      {Array.from({ length: rows }, (_, i) => {
        const t = i / rows;
        const yy = y + i * 34;
        const half = (w / 2) * (0.5 + t * 0.55);
        return (
          <path
            key={i}
            d={`M ${x - half} ${yy + 20} Q ${x - half * 0.3} ${yy - 12 - r() * 10} ${x + half} ${yy + 14} L ${x + half + 12} ${yy + 38} Q ${x} ${yy + 22} ${x - half - 12} ${yy + 42} Z`}
            fill={cols[i % cols.length]}
            stroke="#6a9a4e"
            strokeWidth="3"
            opacity="0.92"
          />
        );
      })}
    </g>
  );
}

function GrassFront({ seed }: { seed: number }) {
  const r = rng(seed);
  return (
    <g strokeLinecap="round" fill="none">
      {Array.from({ length: 70 }, (_, i) => {
        const x = r() * 1920;
        const y = 1020 + r() * 70;
        const h = 36 + r() * 46;
        return <path key={i} d={`M ${x} ${y} q ${r() * 14 - 7} ${-h * 0.5} ${r() * 20 - 10} ${-h}`} stroke={i % 3 ? '#6aa64f' : '#8cc56a'} strokeWidth={4 + r() * 3} />;
      })}
    </g>
  );
}

function Fence({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <path d={`M ${x} ${y - 42} H ${x + n * 44}`} stroke="#9b7a52" strokeWidth="7" strokeLinecap="round" />
      <path d={`M ${x} ${y - 20} H ${x + n * 44}`} stroke="#9b7a52" strokeWidth="7" strokeLinecap="round" />
      {Array.from({ length: n + 1 }, (_, i) => (
        <rect key={i} x={x + i * 44 - 5} y={y - 56} width="10" height="62" rx="3" fill="#b38e62" stroke="#7a5d3a" strokeWidth="2" />
      ))}
    </g>
  );
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g className="art-anim" style={{ animation: 'steam-rise 5s ease-out infinite' }}>
      <ellipse cx={x} cy={y} rx="9" ry="7" fill="#ffffff" opacity="0.6" />
    </g>
  );
}

export function SagaVillageScene({ pathD }: { pathD: string }) {
  return (
    <SceneSvg label="Làng Saga: đồng lúa bậc thang, mái nhà tranh, khinh khí cầu và con đường đi qua mười chặng">
      <Sky id="sky-saga" stops={['#79c2dc', '#fde8c3', '#c4e3de']} height={760} />
      <defs>
        <radialGradient id="saga-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4c4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff4c4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="saga-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.0" />
          <stop offset="1" stopColor="#ffd88a" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <circle cx="1480" cy="190" r="260" fill="url(#saga-sun)" />
      <circle cx="1480" cy="190" r="58" fill="#fff0b8" />
      {/* tia nắng nhẹ */}
      <g opacity="0.12" fill="#fff6cc">
        <path d="M 1480 190 L 700 760 L 900 780 Z" />
        <path d="M 1480 190 L 1100 800 L 1300 800 Z" />
        <path d="M 1480 190 L 1500 810 L 1700 800 Z" />
      </g>

      {/* mây lớn */}
      <Cloud x={380} y={170} s={1.4} drift={260} delay={30} opacity={0.95} />
      <Cloud x={1000} y={120} s={1.1} drift={300} delay={150} opacity={0.9} />
      <Cloud x={1620} y={330} s={1.0} drift={240} delay={90} opacity={0.85} />
      <Cloud x={150} y={380} s={0.8} drift={320} delay={200} opacity={0.8} />

      {/* khinh khí cầu của lễ hội Saga */}
      <Balloon x={300} y={250} s={0.62} colors={['#e8573f', '#f7c948', '#ffffff']} delay={1} />
      <Balloon x={820} y={210} s={0.5} colors={['#4a8fd0', '#ffffff', '#e8573f']} delay={4} />
      <Balloon x={1230} y={290} s={0.7} colors={['#58a96a', '#f7e28a', '#d9453a']} delay={7} />
      <Balloon x={1700} y={170} s={0.42} colors={['#e58bb4', '#ffffff', '#7ab7e8']} delay={3} />

      {/* núi xa (dãy Sefuri) */}
      <Wash>
        <Mountain x={330} y={560} w={900} h={320} color="#a9c8cf" shade="#8fb2bb" />
        <Mountain x={1120} y={560} w={1000} h={390} color="#9dbfc9" shade="#84a9b4" />
        <Mountain x={1720} y={560} w={820} h={300} color="#aecbd0" shade="#93b5bd" />
        <Ridge id="saga-ridge-far" y={500} amp={26} seed={11} top="#a7cfb8" bottom="#8fbea0" />
      </Wash>

      {/* đồi giữa với ruộng bậc thang và làng */}
      <Wash>
        <Ridge id="saga-ridge-mid" y={470} amp={34} seed={17} top="#94c47c" bottom="#74ad62" />
      </Wash>
      <Wash soft>
        <Terraces x={420} y={470} w={760} rows={5} seed={3} />
        <Terraces x={1500} y={450} w={700} rows={4} seed={9} />
        <FarmHouse x={80} y={470} s={0.17} />
        <FarmHouse x={250} y={455} s={0.13} glow={false} />
        <FarmHouse x={830} y={450} s={0.15} />
        <FarmHouse x={1080} y={440} s={0.12} glow={false} />
        <Pine x={720} y={470} s={0.34} />
        <Pine x={1260} y={470} s={0.3} />
        <RoundTree x={1650} y={470} s={0.3} />
      </Wash>
      <Smoke x={152} y={420} />
      <Smoke x={905} y={404} />

      {/* đền nhỏ trên đồi bên phải + cây long não khổng lồ */}
      <Wash soft>
        <RoundTree x={1310} y={490} s={1.15} leaf="#5f9a5a" light="#86bd72" dark="#3f7a4a" />
        <Torii x={1190} y={480} s={0.34} />
        <StoneLantern x={1130} y={486} s={0.26} />
        <StoneLantern x={1252} y={486} s={0.26} />
        <path d="M 1190 480 L 1180 540 L 1200 540 Z" fill="#d6cdb8" opacity="0.8" />
      </Wash>

      {/* đồng lúa gần */}
      <Wash>
        <Ridge id="saga-ridge-near" y={560} amp={26} seed={23} top="#9fd07a" bottom="#78b358" />
        <Ridge id="saga-ridge-ground" y={650} amp={22} seed={29} top="#a9d886" bottom="#79b457" />
      </Wash>
      <Wash soft>
        <RiceField x={170} y={640} w={360} h={170} rows={5} seed={4} />
        <RiceField x={1320} y={820} w={360} h={170} rows={5} seed={14} />
        <Scarecrow x={330} y={760} s={0.9} />
        <Persimmon x={110} y={640} s={0.62} />
        <Persimmon x={1840} y={700} s={0.55} />
        <SakuraTree x={1000} y={700} s={0.58} />
      </Wash>

      {/* suối nhỏ và cầu đá */}
      <Wash>
        <path d="M 1500 600 C 1400 700 1500 800 1380 900 C 1300 980 1380 1040 1320 1100" stroke="#8cc5cf" strokeWidth="74" fill="none" strokeLinecap="round" />
        <path d="M 1500 600 C 1400 700 1500 800 1380 900 C 1300 980 1380 1040 1320 1100" stroke="#bfe5e6" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.8" />
      </Wash>
      <g transform="translate(1388 798)">
        <path d="M -100 0 Q 0 -70 100 0 L 100 18 Q 0 -46 -100 18 Z" fill="#c9c1ac" />
        <path d="M -100 0 Q 0 -70 100 0" stroke="#8c8678" strokeWidth="6" fill="none" />
        <path d="M -70 -30 V -6 M 0 -42 V -16 M 70 -30 V -6" stroke="#8c8678" strokeWidth="6" />
      </g>

      {/* con đường qua mười chặng */}
      <Wash>
        <path d={pathD} stroke="#9c7b4f" strokeWidth="76" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
        <path d={pathD} stroke="#ecdcb0" strokeWidth="64" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathD} stroke="#ffffff" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.28" />
      </Wash>

      {/* hàng rào, cột điện */}
      <Fence x={540} y={980} n={6} />
      <Fence x={1450} y={1010} n={5} />
      <PolePair x={1010} y={640} s={0.6} />

      {/* tiền cảnh: tre, hoa, cẩm tú cầu */}
      <Wash soft>
        <Bamboo x={40} y={1060} s={0.95} />
        <Bamboo x={1880} y={1060} s={0.85} />
        <Hydrangea x={420} y={1040} s={0.8} hue="#8fb0e8" />
        <Hydrangea x={820} y={1050} s={0.7} hue="#e9a4cf" />
        <Hydrangea x={1230} y={1056} s={0.75} hue="#a99be0" />
        <Flowers x={560} y={1050} w={300} seed={5} />
        <Flowers x={1560} y={1060} w={260} seed={8} />
        <Flowers x={200} y={1056} w={200} seed={12} colors={['#f6d6e2', '#ffffff', '#f4a8c0']} />
      </Wash>
      <GrassFront seed={77} />
      <rect width="1920" height="1080" fill="url(#saga-warm)" pointerEvents="none" />
      <path d="" fill={PAL.ink} />
    </SceneSvg>
  );
}

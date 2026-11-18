import type { ComponentType, ReactNode } from 'react';
import type { SceneId } from '../../data/types';
import { GARDEN_SPOTS, LIVING_SPOTS, spotCenter } from '../../data/spots';
import {
  Bamboo,
  Bush,
  Cloud,
  Fence,
  FarmHouse,
  Flowers,
  GrassTufts,
  Hydrangea,
  Koi,
  Lantern,
  LightBeams,
  Mountain,
  PAL,
  Pine,
  Pond,
  RiceField,
  Ridge,
  RoundTree,
  SakuraTree,
  SceneSvg,
  Sky,
  StoneLantern,
  Sun,
  Torii,
  Wash,
  rng,
} from './paint';

/* ================================================================== */
/* Phụ trợ nội thất                                                    */
/* ================================================================== */

function TatamiFloor({ yTop, vpX = 960, vpY = 260, seamGap = 330 }: { yTop: number; vpX?: number; vpY?: number; seamGap?: number }) {
  const t = (yTop - vpY) / (1100 - vpY);
  const seams: number[] = [];
  for (let x = -1600; x <= 3500; x += seamGap) seams.push(x);
  const rows = [0.0, 0.34, 0.62, 0.82];
  return (
    <g>
      <defs>
        <linearGradient id={`tatami-${yTop}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3d99c" />
          <stop offset="1" stopColor="#c9bd7a" />
        </linearGradient>
      </defs>
      <rect x="-60" y={yTop} width="2040" height={1100 - yTop} fill={`url(#tatami-${yTop})`} />
      {seams.map((x) => {
        const topX = vpX + (x - vpX) * t;
        return <path key={x} d={`M ${topX} ${yTop} L ${x} 1100`} stroke={PAL.tatamiEdge} strokeWidth="5" opacity="0.55" />;
      })}
      {rows.slice(1).map((k, i) => {
        const y = yTop + (1100 - yTop) * k;
        return <path key={i} d={`M -60 ${y} H 1980`} stroke={PAL.tatamiEdge} strokeWidth={3 + i * 2} opacity="0.4" />;
      })}
      {/* vân chiếu */}
      {Array.from({ length: 40 }, (_, i) => {
        const r = rng(i * 17 + 3);
        const y = yTop + r() * (1100 - yTop);
        const x = r() * 1920;
        return <path key={i} d={`M ${x} ${y} h ${60 + r() * 80}`} stroke="#fff8d6" strokeWidth="2" opacity="0.25" />;
      })}
    </g>
  );
}

function ShojiWindow({ x, y, w, h, glow = true, tree = false }: { x: number; y: number; w: number; h: number; glow?: boolean; tree?: boolean }) {
  const cols = Math.max(2, Math.round(w / 90));
  const rowsN = Math.max(2, Math.round(h / 90));
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill={PAL.woodDark} />
      <rect x={x} y={y} width={w} height={h} fill={glow ? '#fff3c9' : PAL.shoji} />
      {tree && (
        <g opacity="0.35">
          <circle cx={x + w * 0.3} cy={y + h * 0.3} r={w * 0.2} fill="#8fbf7a" />
          <circle cx={x + w * 0.65} cy={y + h * 0.45} r={w * 0.26} fill="#7fb26d" />
        </g>
      )}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <rect key={`c${i}`} x={x + (w / cols) * (i + 1) - 3} y={y} width="6" height={h} fill={PAL.woodDark} opacity="0.85" />
      ))}
      {Array.from({ length: rowsN - 1 }, (_, i) => (
        <rect key={`r${i}`} x={x} y={y + (h / rowsN) * (i + 1) - 3} width={w} height="6" fill={PAL.woodDark} opacity="0.85" />
      ))}
    </g>
  );
}

function WoodBeams({ y = 0 }: { y?: number }) {
  return (
    <g>
      <rect x="-40" y={y} width="2000" height="54" fill={PAL.woodDark} />
      <rect x="-40" y={y + 54} width="2000" height="12" fill="#3d2616" opacity="0.4" />
      {[60, 520, 980, 1440, 1860].map((x) => (
        <rect key={x} x={x - 22} y={y + 54} width="44" height="650" fill={PAL.woodDark} />
      ))}
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -34 0 L -28 -64 H 28 L 34 0 Z" fill="#c9885b" />
      <rect x="-32" y="-72" width="64" height="14" rx="4" fill="#b0714a" />
      <path d="M 0 -72 C -60 -120 -70 -180 -50 -230 C -30 -190 -10 -150 0 -72 Z" fill={PAL.leaf} />
      <path d="M 0 -72 C 60 -130 74 -190 52 -240 C 30 -196 12 -150 0 -72 Z" fill={PAL.leafLight} />
      <path d="M 0 -72 C -10 -140 -4 -200 6 -262 C 22 -200 14 -140 0 -72 Z" fill={PAL.leafDark} />
    </g>
  );
}

/* ================================================================== */
/* 1. Đường làng                                                       */
/* ================================================================== */

function RoadScene() {
  return (
    <SceneSvg label="Con đường làng buổi chiều, ngôi nhà của bà ở phía xa">
      <Sky id="sky-road" stops={['#8cc8d6', '#f9e3b4', '#cfe7dc']} height={760} />
      <Sun cx={1470} cy={300} r={58} />
      <Cloud x={380} y={190} s={1.3} drift={140} delay={30} />
      <Cloud x={1250} y={120} s={1} drift={170} delay={90} />
      <Cloud x={1700} y={300} s={0.8} drift={200} delay={140} opacity={0.75} />
      <Wash>
        <Mountain x={420} y={640} w={900} h={300} color="#a2c0c0" shade="#86a9aa" />
        <Mountain x={1250} y={650} w={1000} h={380} color="#9bbcbc" shade="#7fa3a6" snow />
        <Mountain x={1750} y={650} w={700} h={240} color="#aac7c2" shade="#8bb1ae" />
        <Ridge id="r-road-1" y={640} amp={26} seed={7} top="#9cc6a6" bottom="#80b08f" />
        <Ridge id="r-road-2" y={705} amp={22} seed={13} top="#8fbf7f" bottom="#6fa863" />
        <RiceField x={620} y={690} w={760} h={250} rows={7} seed={9} />
        <Ridge id="r-road-3" y={900} amp={20} seed={21} top="#86b866" bottom="#5f9a4f" />
        {/* con đường đất */}
        <path d="M 760 760 C 800 840 640 930 420 1100 L 1180 1100 C 1060 930 980 850 940 760 Z" fill="#ead9ad" />
        <path d="M 860 760 C 880 860 800 960 740 1100 L 1000 1100 C 990 950 930 860 910 760 Z" fill="#f5e8c4" opacity="0.8" />
        <GrassTufts x={380} y={940} w={300} seed={2} />
        <GrassTufts x={1100} y={960} w={500} seed={5} />
      </Wash>
      {/* ngôi nhà ở xa */}
      <Wash soft>
        <RoundTree x={1250} y={742} s={0.5} sway={7} />
        <FarmHouse x={1330} y={742} s={0.36} />
        <Pine x={1590} y={760} s={0.55} />
      </Wash>
      {/* cột điện & dây điện */}
      <g stroke="#4a3a2b" strokeWidth="6" fill="none" opacity="0.85">
        <path d="M 160 960 V 380 M 120 420 H 200" />
        <path d="M 1780 880 V 480 M 1750 510 H 1810" strokeWidth="5" />
      </g>
      <path d="M 120 424 Q 900 600 1750 512 M 200 424 Q 940 640 1810 512" stroke="#3b3027" strokeWidth="2.5" fill="none" opacity="0.6" />
      {/* biển bến xe buýt */}
      <g transform="translate(300 880)">
        <rect x="-5" y="-190" width="10" height="190" fill="#6a6f73" />
        <circle cx="0" cy="-212" r="42" fill="#fff7e8" stroke="#d9533a" strokeWidth="9" />
        <path d="M -20 -226 h 40 M -16 -210 h 32 M -12 -194 h 24" stroke="#33403f" strokeWidth="5" />
        <rect x="-70" y="-60" width="140" height="12" rx="3" fill={PAL.woodLight} />
        <rect x="-60" y="-48" width="8" height="48" fill={PAL.woodDark} />
        <rect x="52" y="-48" width="8" height="48" fill={PAL.woodDark} />
      </g>
      <Wash soft>
        <RoundTree x={170} y={980} s={1.2} sway={8} delay={2} />
        <Bush x={1600} y={1000} s={1.2} />
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* 2. Cổng nhà bà Hana                                                 */
/* ================================================================== */

function GateScene() {
  return (
    <SceneSvg label="Trước cổng ngôi nhà mái ngói của bà Hana">
      <Sky id="sky-gate" stops={['#8dcbd9', '#fbe6bb', '#d3ead9']} height={820} />
      <Sun cx={1580} cy={220} r={50} />
      <Cloud x={420} y={150} s={1.2} drift={150} delay={20} />
      <Cloud x={1250} y={210} s={0.9} drift={190} delay={100} opacity={0.8} />
      <Wash>
        <Mountain x={500} y={620} w={900} h={320} color="#a5c4c1" shade="#88aaa8" />
        <Mountain x={1500} y={620} w={1000} h={400} color="#9fc0bd" shade="#7fa4a3" />
        <Ridge id="r-gate-1" y={600} amp={30} seed={3} top="#9ac9a6" bottom="#7fb18c" />
        <Ridge id="r-gate-2" y={690} amp={26} seed={11} top="#86bb78" bottom="#68a35e" />
      </Wash>
      <Wash soft>
        <RoundTree x={230} y={860} s={1.6} sway={9} />
        <Pine x={1750} y={860} s={1.1} />
        <Pine x={1860} y={880} s={0.9} />
      </Wash>
      <Wash>
        {/* sân cỏ */}
        <Ridge id="r-gate-3" y={830} amp={14} seed={5} top="#9bcc75" bottom="#6ba350" />
        {/* lối đi */}
        <path d="M 980 840 C 1040 900 1180 960 1300 1100 L 700 1100 C 820 960 920 900 980 840 Z" fill="#eadbb2" />
      </Wash>
      <Wash soft>
        <FarmHouse x={440} y={852} s={1.75} />
      </Wash>
      {/* đá lót đường */}
      {[
        [1010, 900, 50],
        [990, 960, 66],
        [1040, 1030, 82],
      ].map(([sx, sy, sr], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={sr} ry={sr * 0.42} fill="#cbc4b2" stroke="#9c9585" strokeWidth="3" />
      ))}
      <Wash soft>
        <Fence x={-40} y={930} w={420} />
        <Fence x={1540} y={930} w={460} />
        <Hydrangea x={430} y={980} s={1.15} />
        <Hydrangea x={1500} y={990} s={1.05} color="#b5a1e0" color2="#f0a9c9" />
        <Flowers x={60} y={1030} w={300} seed={6} />
        <Flowers x={1560} y={1050} w={300} seed={9} />
      </Wash>
      <Lantern x={1430} y={640} s={0.9} />
    </SceneSvg>
  );
}

/* ================================================================== */
/* 3. Genkan                                                           */
/* ================================================================== */

function Shoes({ x, y, s = 1, color = '#c0553f' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="10" rx="70" ry="12" fill="#2b2118" opacity="0.25" />
      <path d="M -60 0 C -62 -22 -40 -34 -10 -30 C 14 -28 36 -20 58 -6 C 66 2 60 10 48 10 H -50 C -58 10 -60 6 -60 0 Z" fill={color} />
      <path d="M -60 4 H 56" stroke="#f5ead2" strokeWidth="6" />
      <path d="M -26 -30 q 10 -18 24 -6" stroke="#f5ead2" strokeWidth="4" fill="none" />
    </g>
  );
}

function GenkanScene() {
  return (
    <SceneSvg label="Lối vào genkan với giày xếp gọn và cửa kéo">
      <defs>
        <linearGradient id="genkan-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e9cb" />
          <stop offset="1" stopColor="#ead7ae" />
        </linearGradient>
        <linearGradient id="genkan-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9a08f" />
          <stop offset="1" stopColor="#80786a" />
        </linearGradient>
        <linearGradient id="genkan-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8a977" />
          <stop offset="1" stopColor="#b58455" />
        </linearGradient>
      </defs>
      <rect x="-40" y="-40" width="2000" height="860" fill="url(#genkan-wall)" />
      <Wash soft>
        {/* cửa trượt fusuma phía sau */}
        <g>
          <rect x="520" y="130" width="880" height="520" fill="#f3e2b8" stroke={PAL.woodDark} strokeWidth="12" />
          <rect x="520" y="130" width="440" height="520" fill="#f6e8c3" stroke={PAL.woodDark} strokeWidth="8" />
          <rect x="960" y="130" width="440" height="520" fill="#f0dfb4" stroke={PAL.woodDark} strokeWidth="8" />
          <path d="M 600 560 Q 700 400 760 440 Q 860 330 900 520" stroke="#8aa88a" strokeWidth="10" fill="none" opacity="0.6" />
          <path d="M 1040 580 q 90 -140 160 -80 q 70 -130 120 60" stroke="#c9a56a" strokeWidth="9" fill="none" opacity="0.55" />
          <circle cx="1280" cy="260" r="46" fill="#e9a58c" opacity="0.5" />
          <rect x="925" y="360" width="20" height="90" rx="6" fill={PAL.woodDark} />
          <rect x="975" y="360" width="20" height="90" rx="6" fill={PAL.woodDark} />
        </g>
        {/* cửa sổ shoji bên phải với ánh sáng */}
        <ShojiWindow x={1520} y={180} w={280} h={360} tree />
        {/* tủ giày bên trái */}
        <g>
          <rect x="70" y="330" width="360" height="340" fill={PAL.wood} stroke={PAL.woodDark} strokeWidth="8" />
          <rect x="90" y="350" width="150" height="300" fill={PAL.woodLight} stroke={PAL.woodDark} strokeWidth="5" />
          <rect x="260" y="350" width="150" height="300" fill={PAL.woodLight} stroke={PAL.woodDark} strokeWidth="5" />
          <circle cx="225" cy="500" r="8" fill={PAL.woodDark} />
          <circle cx="275" cy="500" r="8" fill={PAL.woodDark} />
          <rect x="60" y="310" width="380" height="30" fill={PAL.woodDark} />
        </g>
        {/* bình hoa trên tủ */}
        <g transform="translate(180 310)">
          <path d="M -26 0 Q -40 -44 -16 -72 H 16 Q 40 -44 26 0 Z" fill="#6a8fb5" />
          <path d="M -4 -72 Q -30 -140 -50 -150 M 0 -72 Q 4 -150 10 -190 M 6 -72 Q 40 -130 70 -140" stroke={PAL.leafDark} strokeWidth="5" fill="none" />
          <circle cx="-50" cy="-152" r="14" fill="#f6a7b8" />
          <circle cx="10" cy="-192" r="14" fill="#fff2c2" />
          <circle cx="70" cy="-142" r="14" fill="#f48aa0" />
        </g>
        {/* ô dựng góc phải */}
        <g transform="translate(1700 700)">
          <rect x="-48" y="-80" width="96" height="80" rx="8" fill="#7d9aa3" />
          <path d="M -8 -80 V -250 Q 10 -280 24 -250" stroke="#4b3a2b" strokeWidth="7" fill="none" />
          <path d="M 24 -80 V -210" stroke={PAL.indigo} strokeWidth="14" />
        </g>
      </Wash>
      {/* bậc gỗ nâng cao */}
      <rect x="-40" y="676" width="2000" height="70" fill="url(#genkan-wood)" />
      <rect x="-40" y="676" width="2000" height="14" fill="#f0c996" opacity="0.8" />
      <rect x="-40" y="746" width="2000" height="22" fill={PAL.woodDark} />
      <rect x="-40" y="660" width="2000" height="20" fill={PAL.woodDark} opacity="0.2" />
      {[420, 1320].map((x) => (
        <path key={x} d={`M ${x} 676 V 744`} stroke={PAL.woodDark} strokeWidth="3" opacity="0.5" />
      ))}
      {/* dép đi trong nhà trên bậc */}
      <g transform="translate(1180 690)">
        <ellipse cx="0" cy="8" rx="60" ry="10" fill="#2b2118" opacity="0.2" />
        <path d="M -52 0 Q -54 -18 -26 -22 L 30 -22 Q 56 -18 54 2 Q 30 10 -52 0 Z" fill="#7aa8a0" />
      </g>
      <g transform="translate(1330 690)">
        <ellipse cx="0" cy="8" rx="60" ry="10" fill="#2b2118" opacity="0.2" />
        <path d="M -52 0 Q -54 -18 -26 -22 L 30 -22 Q 56 -18 54 2 Q 30 10 -52 0 Z" fill="#7aa8a0" />
      </g>
      {/* nền đất tataki */}
      <rect x="-40" y="768" width="2000" height="330" fill="url(#genkan-floor)" />
      {Array.from({ length: 28 }, (_, i) => {
        const r = rng(i * 31 + 5);
        return <ellipse key={i} cx={r() * 1920} cy={790 + r() * 280} rx={20 + r() * 40} ry={6 + r() * 10} fill="#cfc7b6" opacity="0.2" />;
      })}
      <Wash soft>
        <Shoes x={1060} y={880} s={1.15} color="#c0553f" />
        <Shoes x={1210} y={900} s={1.25} color="#4f7a96" />
        <Shoes x={640} y={940} s={0.95} color="#a28bd0" />
      </Wash>
      <Lantern x={960} y={40} s={1.1} color="#e08b59" />
      <rect x="0" y="0" width="1920" height="1080" fill="url(#glow-warm)" opacity="0.15" />
    </SceneSvg>
  );
}

/* ================================================================== */
/* 4. Phòng ngủ tatami buổi sáng                                       */
/* ================================================================== */

function BedroomScene() {
  return (
    <SceneSvg label="Căn phòng tatami với nắng sáng xuyên qua cửa shoji">
      <rect x="-40" y="-40" width="2000" height="740" fill="#f4e6c6" />
      <rect x="-40" y="-40" width="2000" height="740" fill="url(#glow-warm)" opacity="0.2" />
      <Wash soft>
        <WoodBeams y={0} />
        {/* cửa sổ shoji lớn */}
        <ShojiWindow x={620} y={150} w={640} h={420} tree />
        <rect x="560" y="578" width="760" height="28" fill={PAL.woodDark} />
        {/* góc tokonoma bên phải */}
        <g>
          <rect x="1450" y="130" width="360" height="520" fill="#e9d6a8" stroke={PAL.woodDark} strokeWidth="10" />
          <rect x="1500" y="170" width="140" height="330" fill="#f8efd3" stroke="#6a4a2d" strokeWidth="6" />
          <path d="M 1530 250 Q 1570 210 1600 260 Q 1620 320 1560 360 Q 1590 400 1550 450" stroke="#33403f" strokeWidth="8" fill="none" opacity="0.7" />
          <circle cx="1700" cy="230" r="26" fill="#d9533a" opacity="0.65" />
          <rect x="1490" y="510" width="320" height="60" fill={PAL.woodLight} />
          <g transform="translate(1680 510)">
            <path d="M -22 0 Q -34 -34 -12 -56 H 12 Q 34 -34 22 0 Z" fill="#e8c27a" />
            <path d="M 0 -56 Q -24 -120 -46 -130 M 0 -56 Q 6 -130 16 -166" stroke={PAL.leafDark} strokeWidth="5" fill="none" />
            <circle cx="-46" cy="-132" r="14" fill="#f6a7b8" />
            <circle cx="16" cy="-168" r="14" fill="#fff2c2" />
          </g>
        </g>
        {/* tủ kệ bên trái */}
        <g>
          <rect x="90" y="360" width="320" height="300" fill={PAL.wood} stroke={PAL.woodDark} strokeWidth="8" />
          <rect x="108" y="378" width="140" height="262" fill={PAL.woodLight} />
          <rect x="260" y="378" width="132" height="124" fill={PAL.woodLight} />
          <rect x="260" y="514" width="132" height="126" fill={PAL.woodLight} />
        </g>
      </Wash>
      <TatamiFloor yTop={660} vpY={200} />
      {/* ánh nắng trên sàn */}
      <path d="M 650 660 L 1250 660 L 1560 1100 L 820 1100 Z" fill="url(#beam)" opacity="0.55" />
      <path d="M 720 664 L 1180 664 L 1420 1100 L 880 1100 Z" fill="#fff9d6" opacity="0.18" />
      <Wash soft>
        {/* nệm futon gấp */}
        <g transform="translate(250 900)">
          <ellipse cx="160" cy="40" rx="260" ry="40" fill="#3f352a" opacity="0.2" />
          <rect x="-90" y="-60" width="500" height="100" rx="40" fill="#8fb3d9" />
          <rect x="-70" y="-110" width="460" height="86" rx="38" fill="#a9c6e8" />
          <rect x="-60" y="-150" width="440" height="60" rx="30" fill="#f3d9a3" />
          <path d="M -40 -100 q 100 -30 200 0 t 220 0" stroke="#fff" strokeWidth="5" fill="none" opacity="0.5" />
        </g>
        {/* bàn thấp và đệm ngồi */}
        <g transform="translate(1460 900)">
          <ellipse cx="0" cy="36" rx="190" ry="30" fill="#3f352a" opacity="0.22" />
          <rect x="-170" y="-60" width="340" height="30" rx="8" fill={PAL.woodLight} />
          <rect x="-150" y="-30" width="22" height="60" fill={PAL.woodDark} />
          <rect x="128" y="-30" width="22" height="60" fill={PAL.woodDark} />
          <circle cx="-60" cy="-80" r="26" fill="#f2f6f2" stroke="#9db4a8" strokeWidth="4" />
          <path d="M -60 -104 q 12 -18 0 -30" stroke="#fff" strokeWidth="5" fill="none" opacity="0.7" />
        </g>
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* 5. Phòng ăn                                                         */
/* ================================================================== */

function Bowl({ x, y, s = 1, fill, content, steam = false, rim = '#f1e8d4' }: { x: number; y: number; s?: number; fill: string; content: ReactNode; steam?: boolean; rim?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="26" rx="62" ry="12" fill="#3f2a1c" opacity="0.25" />
      <path d="M -64 -8 H 64 Q 60 46 0 54 Q -60 46 -64 -8 Z" fill={fill} />
      <path d="M -64 -8 H 64 Q 62 6 56 14 H -56 Q -62 6 -64 -8 Z" fill={rim} opacity="0.5" />
      <ellipse cx="0" cy="-8" rx="64" ry="18" fill={rim} />
      {content}
      {steam && (
        <g stroke="#fffef6" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7">
          {[-24, 0, 24].map((dx, i) => (
            <path key={i} className="art-anim" style={{ animation: `steam-rise 3.6s ease-in-out ${-i * 0.9}s infinite` }} d={`M ${dx} -20 q -10 -24 0 -44 q 10 -22 0 -44`} />
          ))}
        </g>
      )}
    </g>
  );
}

function DiningScene() {
  return (
    <SceneSvg label="Bàn ăn thấp với bữa sáng kiểu Nhật nóng hổi">
      <rect x="-40" y="-40" width="2000" height="720" fill="#f3e4c1" />
      <Wash soft>
        <WoodBeams y={0} />
        {/* cửa sổ nhìn ra vườn */}
        <g>
          <rect x="1140" y="140" width="640" height="440" fill="#bfe2d8" stroke={PAL.woodDark} strokeWidth="14" />
          <rect x="1154" y="154" width="612" height="412" fill="#cde8d6" />
          <circle cx="1330" cy="330" r="110" fill="#8fc27a" />
          <circle cx="1520" cy="280" r="130" fill="#7ab36b" />
          <circle cx="1660" cy="400" r="120" fill="#9acf84" />
          <rect x="1440" y="140" width="14" height="440" fill={PAL.woodDark} />
          <path d="M 1154 480 Q 1500 440 1766 500 V 566 H 1154 Z" fill="#93c06e" />
          <rect x="1120" y="580" width="680" height="24" fill={PAL.woodDark} />
        </g>
        {/* kệ bát đĩa trái */}
        <g>
          <rect x="120" y="150" width="520" height="420" fill={PAL.wood} stroke={PAL.woodDark} strokeWidth="8" />
          <rect x="140" y="170" width="480" height="180" fill="#ead7ae" />
          <rect x="140" y="370" width="480" height="180" fill="#ead7ae" />
          {[190, 270, 350, 430, 510].map((cx, i) => (
            <ellipse key={i} cx={cx} cy="318" rx="34" ry="14" fill={['#6a8fb5', '#f3ede0', '#d9533a', '#f3ede0', '#6a8fb5'][i]} />
          ))}
          {[190, 300, 410, 520].map((cx, i) => (
            <rect key={i} x={cx - 26} y="470" width="52" height="68" rx="10" fill={['#f3ede0', '#9db4a8', '#e8c27a', '#f3ede0'][i]} />
          ))}
        </g>
      </Wash>
      <TatamiFloor yTop={680} vpY={240} seamGap={380} />
      <path d="M 1100 680 L 1760 680 L 1900 1100 L 1180 1100 Z" fill="url(#beam)" opacity="0.4" />
      <Wash soft>
        {/* bàn thấp chabudai */}
        <g transform="translate(960 800)">
          <ellipse cx="0" cy="130" rx="640" ry="70" fill="#3f2a1c" opacity="0.2" />
          <ellipse cx="0" cy="40" rx="620" ry="108" fill={PAL.woodDark} />
          <ellipse cx="0" cy="22" rx="620" ry="108" fill={PAL.woodLight} />
          <ellipse cx="-60" cy="2" rx="480" ry="62" fill="#e8bd8d" opacity="0.6" />
        </g>
        {/* đồ ăn */}
        <Bowl x={560} y={780} s={1.15} fill="#d9533a" rim="#fff7e8" content={<ellipse cx="0" cy="-10" rx="52" ry="12" fill="#fffef6" />} steam />
        <Bowl x={740} y={800} s={1.1} fill="#33403f" rim="#6b7a73" content={<ellipse cx="0" cy="-8" rx="52" ry="12" fill="#d7a35a" />} steam />
        {/* đĩa cá nướng */}
        <g transform="translate(1000 790)">
          <ellipse cx="0" cy="10" rx="130" ry="30" fill="#6a8fb5" />
          <ellipse cx="0" cy="2" rx="118" ry="24" fill="#f1ede0" />
          <path d="M -80 0 C -60 -26 40 -26 76 -4 C 90 0 90 6 76 10 C 40 28 -60 24 -80 0 Z" fill="#d68b4a" />
          <path d="M -80 0 L -104 -18 L -104 18 Z" fill="#c4783b" />
          <path d="M -30 -14 q 6 14 0 28 M 0 -16 q 6 16 0 32 M 30 -12 q 6 12 0 24" stroke="#8a4b22" strokeWidth="3" fill="none" />
          <circle cx="58" cy="-2" r="4" fill="#33403f" />
        </g>
        {/* trứng cuộn */}
        <g transform="translate(1190 800)">
          <ellipse cx="0" cy="10" rx="96" ry="24" fill="#d9533a" />
          <ellipse cx="0" cy="2" rx="86" ry="19" fill="#f6efe0" />
          <rect x="-56" y="-22" width="112" height="34" rx="16" fill="#f4c542" />
          <path d="M -40 -12 h 80 M -44 0 h 88" stroke="#e29a1f" strokeWidth="4" opacity="0.6" />
        </g>
        {/* ấm trà & tách */}
        <g transform="translate(1380 780)">
          <ellipse cx="0" cy="30" rx="70" ry="14" fill="#3f2a1c" opacity="0.25" />
          <path d="M -50 20 Q -60 -30 -10 -34 H 20 Q 70 -30 60 20 Z" fill="#6a8fb5" />
          <path d="M 56 -6 Q 100 -14 90 14 Q 84 24 62 20" stroke="#6a8fb5" strokeWidth="10" fill="none" />
          <path d="M -50 -4 L -86 -26 Q -90 -30 -80 -30 L -40 -14 Z" fill="#6a8fb5" />
          <rect x="-14" y="-48" width="34" height="14" rx="6" fill="#4d6f94" />
        </g>
        {/* đệm ngồi */}
        <g>
          <rect x="190" y="880" width="260" height="90" rx="26" fill="#d9533a" opacity="0.9" />
          <rect x="1470" y="890" width="260" height="90" rx="26" fill="#6a8fb5" opacity="0.9" />
        </g>
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* 6. Phòng khách (có đồ vật để tìm)                                   */
/* ================================================================== */

function LivingScene() {
  const glasses = spotCenter(LIVING_SPOTS, 'megane');
  const key = spotCenter(LIVING_SPOTS, 'kagi');
  const book = spotCenter(LIVING_SPOTS, 'hon');
  const tea = spotCenter(LIVING_SPOTS, 'kyuusu');
  const cushion = spotCenter(LIVING_SPOTS, 'zabuton');
  const umbrella = spotCenter(LIVING_SPOTS, 'kasa');
  const clock = spotCenter(LIVING_SPOTS, 'tokei');
  const plant = spotCenter(LIVING_SPOTS, 'ueki');
  return (
    <SceneSvg label="Phòng khách tatami với bàn học, hộp gỗ và nhiều đồ vật">
      <rect x="-40" y="-40" width="2000" height="720" fill="#f2e2bb" />
      <rect x="-40" y="-40" width="2000" height="720" fill="url(#glow-warm)" opacity="0.18" />
      <Wash soft>
        <WoodBeams y={0} />
        {/* cửa sổ shoji */}
        <ShojiWindow x={1180} y={180} w={400} h={340} tree />
        {/* đồng hồ treo tường */}
        <g transform={`translate(${clock.x} ${clock.y})`}>
          <circle r="64" fill={PAL.woodDark} />
          <circle r="54" fill="#fff6e0" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="-2" y="-50" width="4" height="9" fill="#33403f" transform={`rotate(${i * 30})`} />
          ))}
          <path d="M 0 0 V -34 M 0 0 L 24 12" stroke="#33403f" strokeWidth="5" strokeLinecap="round" />
          <circle r="5" fill="#d9533a" />
        </g>
        {/* tranh thư pháp */}
        <g>
          <rect x="560" y="170" width="150" height="300" fill="#faf0d6" stroke="#6a4a2d" strokeWidth="8" />
          <path d="M 600 230 q 30 -20 50 10 q -30 30 -10 70 q 30 10 20 60 M 610 380 h 70" stroke="#33403f" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="670" cy="440" r="14" fill="#d9533a" />
        </g>
      </Wash>
      <TatamiFloor yTop={650} vpY={230} seamGap={360} />
      <Wash soft>
        {/* chậu cây trái */}
        <Plant x={plant.x} y={plant.y + 140} s={1.5} />
        {/* ô dựng ở góc phải */}
        <g transform={`translate(${umbrella.x} ${umbrella.y + 170})`}>
          <rect x="-50" y="60" width="100" height="100" rx="10" fill="#7d9aa3" />
          <path d="M -8 60 V -90 Q 14 -130 30 -90" stroke="#4b3a2b" strokeWidth="9" fill="none" />
          <path d="M 28 60 V -100" stroke={PAL.indigo} strokeWidth="16" />
          <path d="M -30 -40 Q 0 -110 30 -40" fill="#d9533a" opacity="0.0" />
        </g>
        {/* bàn học */}
        <g>
          <ellipse cx="590" cy="860" rx="360" ry="34" fill="#3f2a1c" opacity="0.22" />
          {/* chân sau */}
          <rect x="350" y="600" width="26" height="250" fill={PAL.woodDark} />
          <rect x="800" y="600" width="26" height="250" fill={PAL.woodDark} />
          {/* mặt bàn */}
          <path d="M 330 598 L 850 598 L 880 646 L 300 646 Z" fill="#e0b27d" />
          <path d="M 300 646 H 880 V 676 H 300 Z" fill={PAL.woodLight} />
          <path d="M 300 676 H 880 V 688 H 300 Z" fill={PAL.woodDark} />
          {/* chân trước */}
          <rect x="304" y="688" width="30" height="170" fill={PAL.wood} />
          <rect x="846" y="688" width="30" height="170" fill={PAL.wood} />
          {/* ngăn kéo */}
          <rect x="370" y="690" width="440" height="52" fill="#c28c5a" stroke={PAL.woodDark} strokeWidth="4" />
          <circle cx="590" cy="716" r="9" fill={PAL.woodDark} />
        </g>
        {/* kính trên bàn */}
        <g transform={`translate(${glasses.x} ${glasses.y + 24})`} className="find-art">
          <ellipse cx="0" cy="22" rx="70" ry="10" fill="#3f2a1c" opacity="0.2" />
          <circle cx="-34" cy="0" r="26" fill="#d6efff" fillOpacity="0.55" stroke="#8a5a2f" strokeWidth="7" />
          <circle cx="34" cy="0" r="26" fill="#d6efff" fillOpacity="0.55" stroke="#8a5a2f" strokeWidth="7" />
          <path d="M -8 -4 Q 0 -12 8 -4" stroke="#8a5a2f" strokeWidth="6" fill="none" />
          <path d="M -60 -4 L -86 -14 M 60 -4 L 86 -14" stroke="#8a5a2f" strokeWidth="6" />
          <path d="M -46 -12 q 8 -8 18 -6" stroke="#fff" strokeWidth="5" fill="none" opacity="0.8" />
        </g>
        {/* chìa khoá dưới bàn */}
        <g transform={`translate(${key.x} ${key.y})`} className="find-art">
          <ellipse cx="0" cy="24" rx="62" ry="10" fill="#3f2a1c" opacity="0.2" />
          <circle cx="-34" cy="0" r="20" fill="none" stroke="#e8b04a" strokeWidth="11" />
          <path d="M -14 0 H 54 M 36 0 V 16 M 52 0 V 12" stroke="#e8b04a" strokeWidth="11" strokeLinecap="round" />
          <circle cx="-34" cy="0" r="30" fill="url(#glow-warm)" />
        </g>
        {/* ấm trà trên khay */}
        <g transform={`translate(${tea.x} ${tea.y + 40})`}>
          <ellipse cx="0" cy="40" rx="130" ry="26" fill={PAL.woodDark} />
          <ellipse cx="0" cy="30" rx="130" ry="26" fill={PAL.woodLight} />
          <path d="M -50 20 Q -60 -30 -10 -34 H 20 Q 70 -30 60 20 Z" fill="#7aa8a0" />
          <path d="M 56 -6 Q 100 -14 90 14 Q 84 24 62 20" stroke="#7aa8a0" strokeWidth="10" fill="none" />
          <path d="M -50 -4 L -86 -26 Q -90 -30 -80 -30 L -40 -14 Z" fill="#7aa8a0" />
          <rect x="-14" y="-48" width="34" height="14" rx="6" fill="#5d8982" />
        </g>
        {/* đệm ngồi */}
        <g transform={`translate(${cushion.x} ${cushion.y})`}>
          <rect x="-120" y="-34" width="240" height="68" rx="26" fill="#d9533a" />
          <rect x="-104" y="-30" width="208" height="20" rx="10" fill="#ec8068" opacity="0.7" />
          <circle cx="0" cy="0" r="8" fill="#a63a26" />
        </g>
        {/* hộp gỗ có sách */}
        <g transform={`translate(${book.x} ${book.y})`}>
          <ellipse cx="0" cy="102" rx="150" ry="22" fill="#3f2a1c" opacity="0.22" />
          {/* sách ló ra */}
          <g transform="translate(-6 -34) rotate(-6)">
            <rect x="-62" y="-58" width="124" height="96" rx="6" fill="#4d6f94" />
            <rect x="-62" y="-58" width="16" height="96" fill="#35537a" />
            <rect x="-34" y="-36" width="78" height="36" rx="4" fill="#f6e9c6" />
            <path d="M -22 -24 h 54 M -22 -12 h 40" stroke="#4d6f94" strokeWidth="5" />
          </g>
          <path d="M -116 -16 H 116 L 104 96 H -104 Z" fill={PAL.wood} />
          <path d="M -116 -16 H 116 V 6 H -116 Z" fill={PAL.woodLight} />
          <rect x="-104" y="40" width="208" height="8" fill={PAL.woodDark} opacity="0.5" />
          <rect x="-18" y="26" width="36" height="30" rx="6" fill="#e8b04a" stroke={PAL.woodDark} strokeWidth="3" />
          <path d="M -116 -16 L -90 -50 H 90 L 116 -16" fill="none" stroke={PAL.woodDark} strokeWidth="6" />
        </g>
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* 7. Hiên nhà engawa                                                  */
/* ================================================================== */

function EngawaScene() {
  return (
    <SceneSvg label="Hiên gỗ engawa nhìn ra khu vườn, trên bàn có giấy origami">
      <Sky id="sky-engawa" stops={['#bfe2e4', '#fcebc5', '#e0efe0']} height={700} />
      <Cloud x={1300} y={160} s={0.9} drift={160} delay={60} opacity={0.8} />
      <Wash>
        <Ridge id="r-eng-1" y={520} amp={30} seed={9} top="#a8d0b0" bottom="#86b894" />
        <Ridge id="r-eng-2" y={600} amp={24} seed={14} top="#8dc17c" bottom="#6aa95e" />
      </Wash>
      <Wash soft>
        <RoundTree x={1380} y={700} s={1.5} sway={8} />
        <RoundTree x={1750} y={700} s={1.2} sway={10} delay={3} leaf="#78b86a" />
        <SakuraTree x={980} y={690} s={0.9} />
        <Bush x={1200} y={730} s={1.2} />
      </Wash>
      {/* khung nhà bên trái và trên */}
      <Wash soft>
        <rect x="-40" y="-40" width="2000" height="150" fill={PAL.woodDark} />
        <path d="M -40 110 Q 960 150 1960 110 V 150 Q 960 190 -40 150 Z" fill="#3d2616" opacity="0.5" />
        <rect x="-40" y="110" width="440" height="620" fill="#f3e2b8" />
        <ShojiWindow x={20} y={180} w={300} h={440} glow />
        <rect x="380" y="110" width="40" height="660" fill={PAL.woodDark} />
        <rect x="1760" y="110" width="40" height="660" fill={PAL.woodDark} />
        <rect x="1800" y="110" width="200" height="620" fill="#f3e2b8" />
      </Wash>
      <g transform="translate(1300 120)">
        <path d="M 0 0 V 70" stroke="#4b3a2b" strokeWidth="3" />
        <g className="art-anim" style={{ animation: 'sway 3.5s ease-in-out infinite', transformOrigin: '1300px 190px', transformBox: 'view-box' }}>
          <path d="M -26 70 Q 0 40 26 70 V 110 Q 0 124 -26 110 Z" fill="#9fd0e0" opacity="0.85" />
          <ellipse cx="0" cy="70" rx="26" ry="8" fill="#cfeaf2" />
          <path d="M 0 110 v 40" stroke="#4b3a2b" strokeWidth="2" />
          <rect x="-12" y="150" width="24" height="46" rx="4" fill="#f4d98a" />
        </g>
      </g>
      {/* sàn hiên */}
      <defs>
        <linearGradient id="engawa-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9ac78" />
          <stop offset="1" stopColor="#b17d4f" />
        </linearGradient>
      </defs>
      <rect x="-40" y="730" width="2000" height="400" fill="url(#engawa-floor)" />
      {Array.from({ length: 12 }, (_, i) => {
        const y = 730 + i * i * 3.2 + i * 14;
        return <path key={i} d={`M -40 ${y} H 1960`} stroke={PAL.woodDark} strokeWidth={2 + i * 0.35} opacity="0.55" />;
      })}
      <path d="M 400 730 L 1280 730 L 1700 1100 L 120 1100 Z" fill="url(#beam)" opacity="0.35" />
      <Wash soft>
        {/* bàn thấp */}
        <g transform="translate(960 880)">
          <ellipse cx="0" cy="62" rx="420" ry="40" fill="#3f2a1c" opacity="0.2" />
          <rect x="-400" y="-34" width="800" height="40" rx="10" fill={PAL.woodLight} />
          <rect x="-370" y="6" width="26" height="62" fill={PAL.woodDark} />
          <rect x="344" y="6" width="26" height="62" fill={PAL.woodDark} />
          {/* giấy origami */}
          {[
            [-300, '#f48aa0', -6],
            [-190, '#7ab6d8', 4],
            [-80, '#f4c542', -3],
            [40, '#8fc27a', 5],
            [150, '#b79de0', -4],
            [260, '#f3ede0', 3],
          ].map(([ox, c, rot], i) => (
            <g key={i} transform={`translate(${ox} -52) rotate(${rot})`}>
              <rect x="-42" y="-30" width="84" height="60" rx="3" fill={c as string} />
              <path d="M -42 -30 L 42 30" stroke="#fff" strokeWidth="2" opacity="0.4" />
            </g>
          ))}
          <g transform="translate(330 -70)">
            <rect x="-48" y="-30" width="96" height="62" rx="6" fill={PAL.wood} stroke={PAL.woodDark} strokeWidth="4" />
            <rect x="-48" y="-30" width="96" height="16" rx="6" fill={PAL.woodLight} />
          </g>
        </g>
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* 8. Khu vườn cũ                                                      */
/* ================================================================== */

function GardenScene() {
  const koi = spotCenter(GARDEN_SPOTS, 'koi');
  const flower = spotCenter(GARDEN_SPOTS, 'hana');
  const box = spotCenter(GARDEN_SPOTS, 'hako');
  const lantern = spotCenter(GARDEN_SPOTS, 'touro');
  const bird = spotCenter(GARDEN_SPOTS, 'tori');
  return (
    <SceneSvg label="Khu vườn cũ có ao cá koi, đèn đá, cây lớn và ánh nắng xuyên kẽ lá">
      <Sky id="sky-garden" stops={['#9fd2d8', '#fde8b8', '#d6ebd8']} height={640} />
      <Sun cx={620} cy={170} r={46} color="#fff0bd" />
      <Cloud x={1250} y={130} s={1} drift={190} delay={60} opacity={0.7} />
      <Wash>
        <Ridge id="r-gar-1" y={430} amp={36} seed={22} top="#a3cdb0" bottom="#88b895" />
        <Ridge id="r-gar-2" y={520} amp={26} seed={31} top="#82b979" bottom="#66a05d" />
        {/* tường đất dobei */}
        <rect x="-40" y="560" width="2000" height="130" fill="#eadcb9" />
        <rect x="-40" y="548" width="2000" height="26" fill="#58697a" />
        <path d="M -40 548 H 1960" stroke="#3f5360" strokeWidth="6" />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${i * 130} 574 V 690`} stroke="#c7b387" strokeWidth="3" opacity="0.5" />
        ))}
      </Wash>
      <Wash soft>
        <Bamboo x={120} y={600} h={560} />
        <Bamboo x={210} y={620} h={620} s={1.1} />
        <Bamboo x={300} y={600} h={480} s={0.95} />
        <Bush x={560} y={690} s={1.3} />
        <Bush x={1620} y={700} s={1.2} dark="#3d7448" color="#5fa05c" />
      </Wash>
      <Wash>
        {/* nền vườn rêu */}
        <Ridge id="r-gar-3" y={690} amp={10} seed={4} top="#8fc774" bottom="#5d9d51" />
        <path d="M 1000 700 C 1020 790 960 860 860 940 C 800 990 760 1040 740 1100 H 1060 C 1080 1020 1130 960 1180 900 C 1240 840 1180 760 1130 700 Z" fill="#e5d7b0" opacity="0.9" />
      </Wash>
      {/* ao */}
      <Wash soft>
        <Pond cx={koi.x + 20} cy={koi.y + 20} rx={380} ry={105}>
          <Koi x={koi.x - 60} y={koi.y + 6} s={1.15} delay={0} />
          <Koi x={koi.x + 120} y={koi.y + 40} s={0.95} flip color="#fff2e4" delay={2} />
          <Koi x={koi.x + 10} y={koi.y + 62} s={0.8} color="#e86a3d" delay={3.5} />
          <ellipse cx={koi.x - 220} cy={koi.y - 4} rx="50" ry="16" fill="#7fbf74" />
          <ellipse cx={koi.x - 220} cy={koi.y - 8} rx="14" ry="6" fill="#f6a7b8" />
          <ellipse cx={koi.x + 240} cy={koi.y + 26} rx="44" ry="14" fill="#6fae62" />
        </Pond>
      </Wash>
      {/* đèn đá */}
      <Wash soft>
        <StoneLantern x={lantern.x} y={lantern.y + 140} s={1.35} lit />
      </Wash>
      {/* cây cổ thụ bên phải */}
      <Wash soft>
        <g transform="translate(1385 820)">
          <path d="M -60 0 C -50 -120 -64 -260 -40 -380 C -20 -470 -10 -520 -30 -600 L 30 -600 C 20 -520 40 -460 56 -380 C 90 -260 70 -120 100 0 Z" fill="#6f4d32" />
          <path d="M 20 0 C 30 -120 20 -260 40 -380 C 56 -460 40 -520 30 -600 L 30 -600 C 56 -460 80 -240 100 0 Z" fill="#4b3322" opacity="0.4" />
          <path d="M -40 -330 C -140 -380 -220 -380 -300 -460" stroke="#6f4d32" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M 50 -380 C 140 -430 220 -450 310 -520" stroke="#6f4d32" strokeWidth="30" fill="none" strokeLinecap="round" />
        </g>
        <g>
          <circle cx="1080" cy="130" r="150" fill="#3f7448" />
          <circle cx="1700" cy="150" r="170" fill="#3f7448" />
          <circle cx="1390" cy="90" r="190" fill="#4f8a55" />
          <circle cx="1200" cy="210" r="140" fill="#5fa05c" />
          <circle cx="1600" cy="250" r="150" fill="#5fa05c" />
          <circle cx="1390" cy="260" r="150" fill="#6fae62" />
          <circle cx="1300" cy="150" r="100" fill="#8cc873" />
          <circle cx="1520" cy="170" r="90" fill="#9ccf7c" opacity="0.9" />
        </g>
        {/* cành lá treo bên trái và chú chim */}
        <path d="M -40 120 C 200 120 360 260 420 380" stroke="#6f4d32" strokeWidth="18" fill="none" strokeLinecap="round" />
        <g>
          <circle cx="120" cy="150" r="96" fill="#4f8a55" />
          <circle cx="280" cy="230" r="76" fill="#5fa05c" />
          <circle cx="60" cy="230" r="70" fill="#6fae62" />
          <circle cx="410" cy="300" r="54" fill="#6fae62" />
        </g>
      </Wash>
      <g transform={`translate(${bird.x} ${bird.y + 24})`}>
        <ellipse cx="0" cy="6" rx="42" ry="34" fill="#7fa8d6" />
        <ellipse cx="4" cy="16" rx="28" ry="20" fill="#fff6ea" />
        <circle cx="-26" cy="-22" r="22" fill="#7fa8d6" />
        <path d="M -44 -22 L -62 -16 L -44 -12 Z" fill="#f4a33d" />
        <circle cx="-30" cy="-26" r="4" fill="#33403f" />
        <path d="M 30 6 L 70 22 L 32 24 Z" fill="#5a86b8" />
        <path d="M -10 36 V 46 M 8 36 V 46" stroke="#a5693b" strokeWidth="4" />
      </g>
      {/* hộp bí mật dưới gốc cây */}
      <Wash soft>
        <g transform={`translate(${box.x} ${box.y})`}>
          <ellipse cx="0" cy="56" rx="110" ry="16" fill="#2f4a37" opacity="0.3" />
          <path d="M -86 -34 H 86 L 78 52 H -78 Z" fill="#7d6b4f" />
          <path d="M -86 -34 H 86 V -12 H -86 Z" fill="#9a8662" />
          <path d="M -86 -34 Q 0 -78 86 -34" fill="#8e7a58" />
          <path d="M -60 -30 q 20 -16 40 -4 q 14 8 30 -4 q 20 -12 40 2" stroke="#6fae62" strokeWidth="9" fill="none" />
          <rect x="-16" y="2" width="32" height="34" rx="6" fill="#e8b04a" stroke="#6a4a2d" strokeWidth="3" />
          <circle cx="0" cy="16" r="5" fill="#6a4a2d" />
          <circle cx="0" cy="-10" r="60" fill="url(#glow-warm)" opacity="0.5" />
        </g>
      </Wash>
      {/* hoa trước mặt bên phải */}
      <Wash soft>
        <Hydrangea x={flower.x - 70} y={flower.y + 130} s={1.4} />
        <Hydrangea x={flower.x + 110} y={flower.y + 150} s={1.2} color="#b5a1e0" color2="#f0a9c9" />
        <Flowers x={flower.x - 150} y={flower.y + 170} w={340} seed={7} />
      </Wash>
      <Wash soft>
        <GrassTufts x={40} y={980} w={500} seed={12} />
        <GrassTufts x={1100} y={1030} w={800} seed={15} />
      </Wash>
      <LightBeams
        beams={[
          { x: 760, w: 90, tilt: 300 },
          { x: 960, w: 130, tilt: 340, delay: 2.2 },
          { x: 1250, w: 80, tilt: 280, delay: 4.1 },
          { x: 1500, w: 110, tilt: 310, delay: 1.4 },
        ]}
      />
    </SceneSvg>
  );
}

/* ================================================================== */
/* Màn hình chào                                                       */
/* ================================================================== */

export function WelcomeScene() {
  return (
    <SceneSvg label="Ngôi làng Komorebi giữa những cánh đồng lúa và rặng núi">
      <Sky id="sky-wel" stops={['#9ad0d9', '#fcdfb2', '#d6ead8']} height={760} />
      <Sun cx={1320} cy={290} r={78} />
      <Cloud x={380} y={170} s={1.5} drift={150} delay={20} />
      <Cloud x={1000} y={110} s={1.1} drift={190} delay={80} opacity={0.85} />
      <Cloud x={1600} y={240} s={1.3} drift={170} delay={120} opacity={0.8} />
      <Wash>
        <Mountain x={1250} y={650} w={1200} h={470} color="#9fc0c1" shade="#7fa6a8" snow />
        <Mountain x={400} y={660} w={900} h={320} color="#aac8c3" shade="#8db3b0" />
        <Mountain x={1750} y={660} w={800} h={290} color="#a6c4c0" shade="#88aeac" />
        <Ridge id="r-wel-1" y={640} amp={30} seed={41} top="#a1cba9" bottom="#82b38f" />
        <Ridge id="r-wel-2" y={720} amp={26} seed={43} top="#8dc27e" bottom="#6aa75e" />
        <RiceField x={480} y={740} w={900} h={220} rows={7} seed={12} />
        <Ridge id="r-wel-3" y={900} amp={20} seed={47} top="#8cc16b" bottom="#5f9a4f" />
      </Wash>
      <Wash soft>
        <Pine x={1560} y={800} s={0.9} />
        <Pine x={1650} y={820} s={0.7} />
        <FarmHouse x={1000} y={830} s={0.9} />
        <SakuraTree x={460} y={950} s={2.1} />
        <RoundTree x={1780} y={900} s={1.1} sway={9} />
      </Wash>
      <Wash soft>
        <Torii x={860} y={800} s={0.65} />
        <Flowers x={900} y={1020} w={700} seed={21} />
        <Hydrangea x={1500} y={1040} s={1.1} />
        <GrassTufts x={0} y={1040} w={1920} seed={31} />
      </Wash>
    </SceneSvg>
  );
}

/* ================================================================== */
/* Sổ đăng ký cảnh                                                      */
/* ================================================================== */

export const SCENE_COMPONENTS: Record<SceneId, ComponentType> = {
  road: RoadScene,
  gate: GateScene,
  genkan: GenkanScene,
  bedroom: BedroomScene,
  dining: DiningScene,
  living: LivingScene,
  engawa: EngawaScene,
  garden: GardenScene,
};


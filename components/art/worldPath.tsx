import { REGIONS } from '../../data/regions';
import type { RegionTheme } from '../../data/types';
import { RegionVignette, smoothPath, type Pt } from './maps';
import { Cloud, Mountain, PAL, Pine, RoundTree, SakuraTree, Wash, rng } from './paint';

/**
 * Bản đồ thế giới dạng con đường dọc (giống Candy Crush):
 * bắt đầu ở làng Saga phía dưới cùng, đi lên các vùng sau, Núi Phú Sĩ ở trên đỉnh.
 * Mọi toạ độ ở hệ 1920 × WORLD_H; người chơi kéo (cuộn) lên để thấy vùng mới.
 */

export const WORLD_W = 1920;
export const BAND = 560;
export const WORLD_BOTTOM = 620;
export const WORLD_TOP = 560;
export const WORLD_H = WORLD_TOP + BAND * (REGIONS.length - 1) + WORLD_BOTTOM;

const ZIG = [600, 1320, 620, 1300, 600, 1320, 640, 960];

/** Vị trí tâm của vùng thứ i (0 = làng Saga ở dưới cùng). */
export function regionPos(i: number): { x: number; y: number } {
  return { x: ZIG[i % ZIG.length], y: WORLD_H - WORLD_BOTTOM - i * BAND };
}

/** Các điểm đi qua của con đường (có điểm uốn ở giữa mỗi chặng để đường ngoằn ngoèo). */
export function roadPoints(): Pt[] {
  const pts: Pt[] = [];
  REGIONS.forEach((_, i) => {
    const p = regionPos(i);
    pts.push([p.x, p.y + 10]);
    if (i < REGIONS.length - 1) {
      const q = regionPos(i + 1);
      const swing = i % 2 === 0 ? 1 : -1;
      pts.push([(p.x + q.x) / 2 + swing * 220, p.y - BAND * 0.32]);
      pts.push([(p.x + q.x) / 2 - swing * 160, p.y - BAND * 0.7]);
    }
  });
  // Đoạn đầu: từ lá cờ xuất phát lên làng Saga
  return [[ZIG[0] - 280, WORLD_H - 110], [ZIG[0] - 120, WORLD_H - 300], ...pts];
}

const BIOME: Record<RegionTheme, string> = {
  countryside: '#a9d27a',
  lightForest: '#5f9a6a',
  catTown: '#e2cb97',
  school: '#e8d8bf',
  railway: '#a9c78a',
  market: '#ecc88f',
  festival: '#b79ac0',
  fuji: '#d3e0e6',
};

/** Điểm lấy mẫu nằm trên đường (xấp xỉ bằng nội suy tuyến tính) để đặt chấm tiến độ & tránh cây. */
function sample(pts: readonly Pt[], t: number): Pt {
  const f = t * (pts.length - 1);
  const k = Math.min(pts.length - 2, Math.floor(f));
  const u = f - k;
  return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, pts[k + 1][1] === pts[k][1] ? pts[k][1] : pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u];
}

/** Các chấm nhỏ trên đường giữa hai vùng liên tiếp (i-1 → i): vàng khi đã đi qua. */
export function pathDots(count = 5): { x: number; y: number; to: number; k: number }[] {
  const out: { x: number; y: number; to: number; k: number }[] = [];
  for (let i = 1; i < REGIONS.length; i++) {
    const a = regionPos(i - 1);
    const b = regionPos(i);
    const swing = (i - 1) % 2 === 0 ? 1 : -1;
    const ctrl: Pt[] = [
      [a.x, a.y + 10],
      [(a.x + b.x) / 2 + swing * 220, a.y - BAND * 0.32],
      [(a.x + b.x) / 2 - swing * 160, a.y - BAND * 0.7],
      [b.x, b.y + 10],
    ];
    for (let k = 1; k <= count; k++) {
      const [x, y] = sample(ctrl, k / (count + 1));
      out.push({ x, y, to: i, k });
    }
  }
  return out;
}

export function WorldPathArt({ frontier }: { frontier: number }) {
  const road = smoothPath(roadPoints());
  const r = rng(2024);
  const guide = roadPoints();
  const trees: { x: number; y: number; k: number }[] = [];
  for (let i = 0; i < 230; i++) {
    const x = 40 + r() * 1840;
    const y = 120 + r() * (WORLD_H - 240);
    const nearNode = REGIONS.some((_, n) => {
      const p = regionPos(n);
      return Math.abs(p.x - x) < 340 && Math.abs(p.y - y) < 230;
    });
    let nearRoad = false;
    for (let t = 0; t <= 1; t += 0.01) {
      const [gx, gy] = sample(guide, t);
      if (Math.abs(gx - x) < 150 && Math.abs(gy - y) < 150) {
        nearRoad = true;
        break;
      }
    }
    if (!nearNode && !nearRoad) trees.push({ x, y, k: r() });
  }

  // nền chuyển màu theo vùng
  const stops = REGIONS.map((reg, i) => ({ off: 1 - (regionPos(i).y + 120) / WORLD_H, color: BIOME[reg.theme] }));
  const fogY = frontier < REGIONS.length ? regionPos(frontier).y + 150 : -1;

  return (
    <svg className="world-svg" width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} role="img" aria-label="Con đường phiêu lưu đi lên từ làng Saga đến Núi Phú Sĩ">
      <defs>
        <linearGradient id="wp-land" x1="0" y1="1" x2="0" y2="0">
          {[{ off: 0, color: BIOME.countryside }, ...stops.map((s) => ({ off: Math.max(0, Math.min(1, 1 - s.off)), color: s.color }))]
            .sort((a, b) => a.off - b.off)
            .map((s, i) => (
              <stop key={i} offset={s.off} stopColor={s.color} />
            ))}
        </linearGradient>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9cde4" />
          <stop offset="1" stopColor="#fdeee0" />
        </linearGradient>
        <linearGradient id="wp-fog" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#eef3f6" stopOpacity="0" />
          <stop offset="0.12" stopColor="#eef3f6" stopOpacity="0.4" />
          <stop offset="1" stopColor="#dfe8ee" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect width={WORLD_W} height={WORLD_H} fill="url(#wp-land)" />
      <rect width={WORLD_W} height={WORLD_TOP + 160} fill="url(#wp-sky)" opacity="0.95" />

      {/* mảng sinh thái mềm dưới mỗi vùng */}
      <Wash soft>
        {REGIONS.map((reg, i) => {
          const p = regionPos(i);
          return <ellipse key={reg.id} cx={p.x} cy={p.y + 20} rx="520" ry="300" fill={BIOME[reg.theme]} opacity="0.7" />;
        })}
      </Wash>

      {/* Núi Phú Sĩ khổng lồ phía sau vùng trên cùng */}
      <Wash>
        <Mountain x={960} y={regionPos(REGIONS.length - 1).y + 120} w={1700} h={780} color="#9db6cf" shade="#7f9ab6" snow />
        <Mountain x={300} y={regionPos(REGIONS.length - 1).y - 60} w={620} h={300} color="#b2c6d6" shade="#97aebf" />
        <Mountain x={1640} y={regionPos(REGIONS.length - 1).y - 40} w={640} h={330} color="#b2c6d6" shade="#97aebf" />
      </Wash>

      {/* cây hai bên đường */}
      <Wash soft>
        {trees.map((t, i) => {
          const high = t.y < WORLD_TOP + BAND * 0.8;
          if (high) return t.k > 0.5 ? <Pine key={i} x={t.x} y={t.y} s={0.13 + t.k * 0.06} color="#4d7f78" light="#8fb7b0" /> : null;
          return t.k > 0.62 ? <Pine key={i} x={t.x} y={t.y} s={0.13 + t.k * 0.07} /> : t.k > 0.12 ? <RoundTree key={i} x={t.x} y={t.y} s={0.11 + t.k * 0.08} /> : <SakuraTree key={i} x={t.x} y={t.y} s={0.2} petals={false} />;
        })}
      </Wash>

      {/* con đường */}
      <path d={road} stroke="#6b4c2f" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.18" transform="translate(0 6)" />
      <path d={road} stroke="#f7edcc" strokeWidth="34" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={road} stroke="#e1c996" strokeWidth="34" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" strokeDasharray="1 60" />
      <path d={road} stroke="#c49a63" strokeWidth="4" fill="none" strokeDasharray="2 16" strokeLinecap="round" />

      {/* vignette từng vùng */}
      <Wash soft>
        {REGIONS.map((reg, i) => {
          const p = regionPos(i);
          return <RegionVignette key={reg.id} theme={reg.theme} x={p.x} y={p.y - 54} s={1.05} />;
        })}
      </Wash>

      {/* mây trôi và biển ở chân bản đồ */}
      {[0.12, 0.3, 0.46, 0.62, 0.78, 0.9].map((f, i) => (
        <Cloud key={i} x={i % 2 ? 1500 : 320} y={WORLD_H * f} s={1.1} drift={160 + i * 20} delay={i * 18} opacity={0.5} />
      ))}

      {/* sương mù phủ các vùng chưa mở */}
      {fogY > 0 && (
        <g pointerEvents="none">
          <rect x="0" y="0" width={WORLD_W} height={fogY} fill="url(#wp-fog)" />
          <Wash soft>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={(i * 263 + 140) % 1920} cy={fogY - 20 - (i % 3) * 36} rx={260 + (i % 4) * 40} ry={70} fill="#f5f8fa" opacity="0.55" />
            ))}
          </Wash>
        </g>
      )}
      <path d="" fill={PAL.ink} />
    </svg>
  );
}

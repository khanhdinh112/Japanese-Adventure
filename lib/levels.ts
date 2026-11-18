/**
 * Cấp độ: bé kiếm điểm kinh nghiệm (XP) khi học, đủ XP thì lên cấp, mỗi cấp có danh hiệu riêng
 * và mở một vài món đồ đặc biệt trong Tủ đồ (xem data/wardrobe.ts, trường minLevel).
 */

export interface LevelTitle {
  title: string;
  jp: string;
}

const TITLES: LevelTitle[] = [
  { title: 'Người mới đến', jp: 'ビギナー' },
  { title: 'Bạn của Momo', jp: 'モモの ともだち' },
  { title: 'Nhà thám hiểm nhí', jp: 'ちいさな たんけんか' },
  { title: 'Người kể chuyện', jp: 'はなしじょうず' },
  { title: 'Học trò của bà Osano', jp: 'おさのばあちゃんの でし' },
  { title: 'Người giữ đèn', jp: 'あかりの まもりて' },
  { title: 'Sứ giả Komorebi', jp: 'こもれびの つかい' },
  { title: 'Bạn của các tinh linh', jp: 'せいれいの ともだち' },
  { title: 'Hiệp sĩ ánh sáng', jp: 'ひかりの きし' },
  { title: 'Bậc thầy Komorebi', jp: 'こもれびの たつじん' },
];

/** XP cần có để ĐẠT cấp n (cấp 1 = 0 XP; cấp 2 = 100; cấp 3 = 300; cấp 4 = 600…). */
export function xpForLevel(level: number): number {
  return (50 * level * (level - 1));
}

export function levelOf(xp: number): number {
  let lv = 1;
  while (xp >= xpForLevel(lv + 1)) lv++;
  return lv;
}

export function titleOf(level: number): LevelTitle {
  return TITLES[Math.min(level, TITLES.length) - 1];
}

export interface LevelInfo {
  level: number;
  title: LevelTitle;
  /** XP đã có trong cấp này */
  into: number;
  /** XP cần để lên cấp kế tiếp (độ dài của cấp này) */
  span: number;
  /** 0–1 */
  progress: number;
  /** XP còn thiếu để lên cấp */
  remaining: number;
  nextTitle: LevelTitle;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelOf(xp);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const span = end - start;
  const into = xp - start;
  return {
    level,
    title: titleOf(level),
    into,
    span,
    progress: span === 0 ? 1 : into / span,
    remaining: end - xp,
    nextTitle: titleOf(level + 1),
  };
}

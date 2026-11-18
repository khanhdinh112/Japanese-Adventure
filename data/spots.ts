import type { Spot } from './types';

/**
 * Toạ độ vùng bấm trên canvas 1920×1080.
 * Cả dữ liệu câu chuyện lẫn bản vẽ placeholder (components/art/scenes.tsx)
 * đều đọc từ file này, nên khi thay bằng tranh thật chỉ cần đặt vật thể
 * vào đúng các hộp này (xem docs/ASSETS.md).
 */

export const LIVING_SPOTS: Spot[] = [
  { id: 'megane', label: { jp: 'めがね', romaji: 'megane', vi: 'kính' }, x: 470, y: 520, w: 170, h: 90 },
  { id: 'kagi', label: { jp: 'かぎ', romaji: 'kagi', vi: 'chìa khóa' }, x: 470, y: 770, w: 150, h: 80 },
  { id: 'hon', label: { jp: 'ほん', romaji: 'hon', vi: 'sách' }, x: 1290, y: 640, w: 230, h: 160 },
  { id: 'kyuusu', label: { jp: 'きゅうす', romaji: 'kyuusu', vi: 'ấm trà' }, x: 960, y: 690, w: 170, h: 120 },
  { id: 'zabuton', label: { jp: 'ざぶとん', romaji: 'zabuton', vi: 'đệm ngồi' }, x: 1000, y: 850, w: 240, h: 100 },
  { id: 'kasa', label: { jp: 'かさ', romaji: 'kasa', vi: 'cái ô' }, x: 1700, y: 470, w: 130, h: 340 },
  { id: 'tokei', label: { jp: 'とけい', romaji: 'tokei', vi: 'đồng hồ' }, x: 930, y: 190, w: 150, h: 150 },
  { id: 'ueki', label: { jp: 'うえき', romaji: 'ueki', vi: 'chậu cây' }, x: 110, y: 600, w: 180, h: 290 },
];

export const GARDEN_SPOTS: Spot[] = [
  { id: 'koi', label: { jp: 'こい', romaji: 'koi', vi: 'cá koi' }, x: 520, y: 800, w: 280, h: 120 },
  { id: 'hana', label: { jp: 'はな', romaji: 'hana', vi: 'hoa' }, x: 1560, y: 800, w: 300, h: 180 },
  { id: 'hako', label: { jp: 'はこ', romaji: 'hako', vi: 'cái hộp' }, x: 1130, y: 840, w: 190, h: 120 },
  { id: 'touro', label: { jp: 'いしどうろう', romaji: 'ishidourou', vi: 'đèn đá' }, x: 880, y: 520, w: 210, h: 280 },
  { id: 'ki', label: { jp: 'き', romaji: 'ki', vi: 'cái cây' }, x: 1290, y: 380, w: 190, h: 420 },
  { id: 'tori', label: { jp: 'とり', romaji: 'tori', vi: 'chú chim' }, x: 300, y: 330, w: 150, h: 120 },
];

export function spotsByIds(spots: Spot[], ids: string[]): Spot[] {
  return ids.map((id) => {
    const s = spots.find((x) => x.id === id);
    if (!s) throw new Error(`Unknown spot ${id}`);
    return s;
  });
}

export function spotCenter(spots: Spot[], id: string): { x: number; y: number } {
  const s = spots.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown spot ${id}`);
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

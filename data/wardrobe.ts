/**
 * Tủ đồ nhân vật. Mỗi món có giới tính riêng (bé trai / bé gái), giá bằng sao (cost) và có thể
 * cần cấp độ tối thiểu (minLevel). Món cost = 0 và không có minLevel là món miễn phí có sẵn.
 * Cách vẽ từng món nằm trong components/art/playerParts.tsx (khoá `draw`).
 */

export type Gender = 'girl' | 'boy';

export interface WardrobeItem {
  id: string;
  label: string;
  /** Mô tả ngắn hiện dưới tên món */
  note?: string;
  /** Giá bằng sao (sao được tiêu khi mở khoá) */
  cost: number;
  /** Cấp độ tối thiểu để được mở khoá (kiếm bằng XP) */
  minLevel?: number;
}

export const GENDER_LABEL: Record<Gender, { label: string; icon: string; honorific: 'chan' | 'kun' }> = {
  girl: { label: 'Bé gái', icon: '👧', honorific: 'chan' },
  boy: { label: 'Bé trai', icon: '👦', honorific: 'kun' },
};

/* ---------------- Khuôn mặt ---------------- */

export interface FaceItem extends WardrobeItem {
  /** Hệ số kích thước mắt */
  eye: number;
  lashes?: boolean;
  freckles?: boolean;
  bandaid?: boolean;
  /** Độ dày lông mày */
  brow: number;
  /** Hình dáng khuôn mặt */
  shape: 'round' | 'oval';
  /** Mắt có ánh sao lấp lánh */
  starEyes?: boolean;
}

export const FACE_ITEMS: Record<Gender, FaceItem[]> = {
  girl: [
    { id: 'g-sweet', label: 'Ngọt ngào', note: 'Mắt tròn, mi cong', cost: 0, eye: 1, lashes: true, brow: 7, shape: 'round' },
    { id: 'g-gentle', label: 'Dịu dàng', note: 'Mặt trái xoan', cost: 0, eye: 0.9, lashes: true, brow: 6, shape: 'oval' },
    { id: 'g-freckle', label: 'Tàn nhang', note: 'Vài chấm nắng trên má', cost: 3, eye: 1, freckles: true, brow: 7, shape: 'round' },
    { id: 'g-sparkle', label: 'Mắt lấp lánh', note: 'Mắt to, đầy ánh sao', cost: 6, eye: 1.12, lashes: true, brow: 6, shape: 'round', starEyes: true },
  ],
  boy: [
    { id: 'b-bright', label: 'Tươi tắn', note: 'Mắt sáng, mày rõ', cost: 0, eye: 1, brow: 9, shape: 'round' },
    { id: 'b-calm', label: 'Điềm đạm', note: 'Mặt trái xoan', cost: 0, eye: 0.9, brow: 8, shape: 'oval' },
    { id: 'b-cheeky', label: 'Tinh nghịch', note: 'Tàn nhang, mày dày', cost: 3, eye: 1, freckles: true, brow: 11, shape: 'round' },
    { id: 'b-sporty', label: 'Năng động', note: 'Có miếng dán trên má', cost: 6, eye: 1.05, bandaid: true, brow: 10, shape: 'round' },
  ],
};

/* ---------------- Kiểu tóc ---------------- */

export const HAIR_ITEMS: Record<Gender, WardrobeItem[]> = {
  girl: [
    { id: 'g-bob', label: 'Tóc bob', cost: 0 },
    { id: 'g-buns', label: 'Hai búi', cost: 0 },
    { id: 'g-ponytail', label: 'Đuôi ngựa', cost: 0 },
    { id: 'g-long', label: 'Tóc dài', cost: 5 },
    { id: 'g-pigtails', label: 'Hai bím', cost: 7 },
    { id: 'g-braid', label: 'Tóc tết', cost: 10 },
    { id: 'g-topbun', label: 'Búi cao', cost: 14, minLevel: 3 },
  ],
  boy: [
    { id: 'b-short', label: 'Tóc ngắn', cost: 0 },
    { id: 'b-side', label: 'Rẽ ngôi', cost: 0 },
    { id: 'b-mushroom', label: 'Tóc nấm', cost: 0 },
    { id: 'b-spiky', label: 'Tóc dựng', cost: 5 },
    { id: 'b-curly', label: 'Tóc xoăn', cost: 8 },
    { id: 'b-topknot', label: 'Búi samurai', cost: 14, minLevel: 3 },
  ],
};

/* ---------------- Trang phục ---------------- */

export const OUTFIT_ITEMS: Record<Gender, WardrobeItem[]> = {
  girl: [
    { id: 'g-dress', label: 'Váy xoè', note: 'Váy đi chơi ngày nắng', cost: 0 },
    { id: 'g-sailor', label: 'Đồng phục thuỷ thủ', note: 'Kiểu đồng phục học sinh Nhật', cost: 0 },
    { id: 'g-overalls', label: 'Yếm công chúa nhỏ', note: 'Váy yếm cùng áo thun', cost: 6 },
    { id: 'g-raincoat', label: 'Áo mưa vui vẻ', note: 'Áo mưa và ủng cao su', cost: 9 },
    { id: 'g-yukata', label: 'Yukata mùa hè', note: 'Áo kimono mỏng đi lễ hội', cost: 14, minLevel: 3 },
  ],
  boy: [
    { id: 'b-tee', label: 'Áo thun & quần short', note: 'Gọn gàng, dễ chạy nhảy', cost: 0 },
    { id: 'b-hoodie', label: 'Áo hoodie', note: 'Ấm áp, có mũ', cost: 0 },
    { id: 'b-explorer', label: 'Áo khoác thám hiểm', note: 'Nhiều túi cho đồ nhặt được', cost: 6 },
    { id: 'b-uniform', label: 'Đồng phục học sinh', note: 'Áo vest và cà vạt', cost: 9 },
    { id: 'b-jinbei', label: 'Jinbei mùa hè', note: 'Bộ đồ mát đi lễ hội', cost: 14, minLevel: 3 },
  ],
};

/* ---------------- Phụ kiện: mũ/đồ đội đầu ---------------- */

export const HAT_ITEMS: Record<Gender, WardrobeItem[]> = {
  girl: [
    { id: 'none', label: 'Không đội', cost: 0 },
    { id: 'g-ribbon', label: 'Nơ to', cost: 0 },
    { id: 'g-flower', label: 'Hoa cài tóc', cost: 4 },
    { id: 'g-catears', label: 'Băng đô tai mèo', note: 'Giống Momo!', cost: 8 },
    { id: 'g-strawhat', label: 'Mũ rơm', cost: 10, minLevel: 2 },
    { id: 'g-sakura', label: 'Vòng hoa anh đào', cost: 16, minLevel: 4 },
  ],
  boy: [
    { id: 'none', label: 'Không đội', cost: 0 },
    { id: 'b-headband', label: 'Khăn hachimaki', note: 'Cố lên nào!', cost: 0 },
    { id: 'b-cap', label: 'Mũ lưỡi trai', cost: 4 },
    { id: 'b-goggles', label: 'Kính thám hiểm', cost: 8 },
    { id: 'b-strawhat', label: 'Mũ rơm', cost: 10, minLevel: 2 },
    { id: 'b-foxmask', label: 'Mặt nạ cáo lễ hội', cost: 16, minLevel: 4 },
  ],
};

/* ---------------- Phụ kiện: đồ mang thêm ---------------- */

export const EXTRA_ITEMS: Record<Gender, WardrobeItem[]> = {
  girl: [
    { id: 'none', label: 'Không mang', cost: 0 },
    { id: 'g-glasses', label: 'Kính tròn', cost: 4 },
    { id: 'g-scarf', label: 'Khăn quàng', cost: 6 },
    { id: 'g-satchel', label: 'Túi đeo chéo', cost: 8 },
  ],
  boy: [
    { id: 'none', label: 'Không mang', cost: 0 },
    { id: 'b-glasses', label: 'Kính tròn', cost: 4 },
    { id: 'b-scarf', label: 'Khăn quàng', cost: 6 },
    { id: 'b-backpack', label: 'Ba lô nhỏ', cost: 8 },
  ],
};

export type WardrobeSlot = 'face' | 'hair' | 'outfit' | 'hat' | 'extra';

export const SLOT_ITEMS: Record<WardrobeSlot, Record<Gender, WardrobeItem[]>> = {
  face: FACE_ITEMS,
  hair: HAIR_ITEMS,
  outfit: OUTFIT_ITEMS,
  hat: HAT_ITEMS,
  extra: EXTRA_ITEMS,
};

export const DEFAULT_ITEMS: Record<Gender, { face: string; hair: string; outfit: string; hat: string; extra: string }> = {
  girl: { face: 'g-sweet', hair: 'g-bob', outfit: 'g-dress', hat: 'none', extra: 'none' },
  boy: { face: 'b-bright', hair: 'b-short', outfit: 'b-tee', hat: 'none', extra: 'none' },
};

export function findItem(slot: WardrobeSlot, gender: Gender, id: string): WardrobeItem | undefined {
  return SLOT_ITEMS[slot][gender].find((i) => i.id === id);
}

/** Món có cần mở khoá không (tốn sao hoặc cần cấp độ)? */
export function isPaid(item: WardrobeItem): boolean {
  return item.cost > 0 || (item.minLevel ?? 0) > 1;
}

/** Danh sách id của mọi món (dùng để dọn dữ liệu không hợp lệ). */
export const ALL_ITEM_IDS: ReadonlySet<string> = new Set(
  (Object.keys(SLOT_ITEMS) as WardrobeSlot[]).flatMap((slot) => (['girl', 'boy'] as Gender[]).flatMap((g) => SLOT_ITEMS[slot][g].map((i) => i.id))),
);

/** Giá (sao) của từng món theo id. */
export const ALL_ITEM_COST: Readonly<Record<string, number>> = Object.fromEntries(
  (Object.keys(SLOT_ITEMS) as WardrobeSlot[]).flatMap((slot) =>
    (['girl', 'boy'] as Gender[]).flatMap((g) => SLOT_ITEMS[slot][g].map((i) => [i.id, i.cost] as const)),
  ),
);

export function isUnlocked(item: WardrobeItem, owned: readonly string[]): boolean {
  return !isPaid(item) || owned.includes(item.id);
}

export const SLOTS: WardrobeSlot[] = ['face', 'hair', 'outfit', 'hat', 'extra'];

/** Trả mỗi ô về món mặc định nếu món đang chọn chưa mở khoá. */
export function revertLocked<T extends { gender: Gender; face: string; hairStyle: string; outfit: string; hat: string; extra: string }>(
  look: T,
  owned: readonly string[],
): T {
  const d = DEFAULT_ITEMS[look.gender];
  const keyOf: Record<WardrobeSlot, 'face' | 'hairStyle' | 'outfit' | 'hat' | 'extra'> = { face: 'face', hair: 'hairStyle', outfit: 'outfit', hat: 'hat', extra: 'extra' };
  const out = { ...look };
  for (const slot of SLOTS) {
    const k = keyOf[slot];
    const item = findItem(slot, look.gender, look[k]);
    if (!item || !isUnlocked(item, owned)) out[k] = d[slot] as T[typeof k];
  }
  return out;
}

export function lockedSlots(
  look: { gender: Gender; face: string; hairStyle: string; outfit: string; hat: string; extra: string },
  owned: readonly string[],
): WardrobeItem[] {
  const keyOf: Record<WardrobeSlot, 'face' | 'hairStyle' | 'outfit' | 'hat' | 'extra'> = { face: 'face', hair: 'hairStyle', outfit: 'outfit', hat: 'hat', extra: 'extra' };
  return SLOTS.map((slot) => findItem(slot, look.gender, look[keyOf[slot]])).filter((i): i is WardrobeItem => !!i && !isUnlocked(i, owned));
}

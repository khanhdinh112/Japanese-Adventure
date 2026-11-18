export interface BadgeMeta {
  id: string;
  name: string;
  nameJp: string;
  icon: string;
  desc: string;
}

/** Điều kiện nhận huy hiệu nằm ở lib/selectors.ts (computeBadges). */
export const BADGES: BadgeMeta[] = [
  { id: 'first-steps', name: 'Bước chân nhỏ', nameJp: 'はじめの いっぽ', icon: '👣', desc: 'Hoàn thành stage đầu tiên.' },
  { id: 'letter-writer', name: 'Người viết thư', nameJp: 'てがみの ひと', icon: '💌', desc: 'Viết thư hồi âm cho bà Osano.' },
  { id: 'breakfast', name: 'Bữa sáng ấm áp', nameJp: 'あさごはん', icon: '🍙', desc: 'Hoàn thành Stage 2.' },
  { id: 'detective', name: 'Thám tử nhỏ', nameJp: 'さがしもの めいじん', icon: '🔎', desc: 'Tìm lại đồ vật cho bà Osano.' },
  { id: 'paper-folder', name: 'Thợ gấp giấy', nameJp: 'おりがみ めいじん', icon: '🐈', desc: 'Gấp xong chú mèo giấy.' },
  { id: 'garden-keeper', name: 'Người giữ vườn', nameJp: 'にわの まもりびと', icon: '🌿', desc: 'Hoàn thành chặng 5: Bí mật khu vườn cũ.' },
  { id: 'rice-walker', name: 'Người đi ruộng', nameJp: 'たんぼの さんぽ', icon: '🌾', desc: 'Hoàn thành chặng 6: Con đường ven ruộng.' },
  { id: 'no-waste', name: 'Không bỏ phí', nameJp: 'もったいない', icon: '♻️', desc: 'Hoàn thành chặng 7: Bữa cơm tối.' },
  { id: 'rain-friend', name: 'Bạn của cơn mưa', nameJp: 'あめの ともだち', icon: '🌈', desc: 'Hoàn thành chặng 8: Mưa mùa hè.' },
  { id: 'star-maker', name: 'Người làm sao', nameJp: 'ほしづくり', icon: '⭐', desc: 'Hoàn thành chặng 9: Ngôi sao giấy.' },
  { id: 'grandma-grandchild', name: 'Cháu cưng của bà', nameJp: 'おばあちゃんの まご', icon: '💛', desc: 'Hoàn thành cả 10 chặng ở làng Saga.' },
  { id: 'culture-explorer', name: 'Nhà khám phá văn hóa', nameJp: 'ぶんかの たんけんか', icon: '🧭', desc: 'Khám phá 5 điều thú vị về văn hóa Nhật.' },
  { id: 'three-stars', name: 'Ngôi sao sáng', nameJp: 'ほしの こ', icon: '🌟', desc: 'Đạt 3 sao ở một stage.' },
  { id: 'streak-3', name: 'Ba ngày liền', nameJp: 'みっか れんぞく', icon: '🔥', desc: 'Học 3 ngày liên tiếp.' },
  { id: 'word-master', name: 'Bậc thầy từ vựng', nameJp: 'ことば はかせ', icon: '📚', desc: 'Tự dùng được 10 từ mới.' },
];

export const BADGE_BY_ID: Record<string, BadgeMeta> = Object.fromEntries(BADGES.map((b) => [b.id, b]));

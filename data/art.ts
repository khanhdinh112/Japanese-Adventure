import type { CharacterId, Emotion, RegionTheme, SceneId } from './types';

/**
 * BẢN KÊ TRANH (art manifest)
 * ---------------------------------------------------------------
 * Mọi hình lớn của game đều có một "placeholder" vẽ bằng SVG gốc trong components/art.
 * Khi có tranh thật, chỉ cần:
 *   1. Đặt file vào public/art/final/ (đúng tên và kích thước trong ART_SPECS bên dưới).
 *   2. Điền đường dẫn vào FINAL_ART (ví dụ 'scene:garden': '/art/final/scene-garden.webp').
 * Không phải sửa component nào khác. Xem thêm docs/ASSETS.md và trang /art-preview.
 */

export type ArtKey =
  | 'scene:welcome'
  | `scene:${SceneId}`
  | 'map:world'
  | `region:${RegionTheme}`
  | `character:${CharacterId}:${Emotion}`;

/** Điền đường dẫn tranh thật vào đây để thay placeholder. */
export const FINAL_ART: Partial<Record<ArtKey, string>> = {
  // 'scene:garden': '/art/final/scene-garden.webp',
};

export function finalArt(key: ArtKey): string | undefined {
  return FINAL_ART[key];
}

export interface ArtSpec {
  key: string;
  file: string;
  size: string;
  format: string;
  notes: string;
}

const SCENE_NOTES: Record<SceneId, string> = {
  road: 'Con đường làng buổi sáng, núi xa, ánh nắng vàng. Chừa 1/3 phía dưới yên tĩnh cho hộp thoại.',
  gate: 'Cổng gỗ và mái nhà kiểu nông thôn, hoa cẩm tú cầu, đèn đá. Nhân vật đứng ở phần dưới.',
  genkan: 'Genkan: bậc thấp, giày xếp gọn, cửa shoji sáng ấm.',
  bedroom: 'Phòng chiếu tatami buổi sáng, futon, cửa shoji, ánh nắng nghiêng.',
  dining: 'Bếp/phòng ăn: bàn thấp, nồi súp miso bốc hơi, ánh sáng ấm.',
  living: 'Phòng khách cho trò tìm đồ. Các món đồ PHẢI nằm đúng trong hộp ở data/spots.ts (LIVING_SPOTS).',
  engawa: 'Hiên engawa nhìn ra vườn, chiều nắng nhẹ, chuông gió.',
  garden: 'Khu vườn cổ có ao cá koi, đèn đá, hoa. Các món đồ PHẢI nằm đúng hộp ở data/spots.ts (GARDEN_SPOTS).',
};

const THEMES: RegionTheme[] = ['countryside', 'lightForest', 'catTown', 'school', 'railway', 'market', 'festival', 'fuji'];

export const ART_SPECS: ArtSpec[] = [
  {
    key: 'scene:welcome',
    file: 'scene-welcome.webp',
    size: '1920×1080',
    format: 'WebP/PNG, nền đặc',
    notes: 'Ngôi nhà bà Osano từ xa lúc hoàng hôn dịu, cánh đồng, núi. Chừa nửa trái cho tiêu đề.',
  },
  ...(Object.keys(SCENE_NOTES) as SceneId[]).map((id) => ({
    key: `scene:${id}`,
    file: `scene-${id}.webp`,
    size: '1920×1080',
    format: 'WebP/PNG, nền đặc',
    notes: SCENE_NOTES[id],
  })),
  {
    key: 'map:world',
    file: 'map-world.webp',
    size: '1920×1080',
    format: 'WebP/PNG, nền đặc',
    notes:
      'Bản đồ thế giới với 8 vùng. Tâm vùng đặt tại toạ độ marker của data/regions.ts (vùng ~380×260 px quanh mỗi marker). Các nút bấm và nhãn là HTML, KHÔNG vẽ chữ vào tranh.',
  },
  ...THEMES.map((t) => ({
    key: `region:${t}`,
    file: `region-${t}.webp`,
    size: '1920×1080',
    format: 'WebP/PNG, nền đặc',
    notes:
      'Phong cảnh vùng với con đường uốn lượn qua 10 điểm dừng. Vị trí 10 điểm lấy từ STAGE_POSITIONS (components/art/maps.tsx) — vẽ con đường đi qua các điểm đó.',
  })),
  ...(['player', 'hana', 'momo'] as CharacterId[]).map((id) => ({
    key: `character:${id}:<emotion>`,
    file: `character-${id}-<emotion>.png`,
    size: '800×1520 (full body), nền trong suốt',
    format: 'PNG/WebP có alpha',
    notes: `Mỗi cảm xúc một file: neutral, happy, laugh, surprised, worried, thinking. Chân nhân vật chạm đáy ảnh, đầu cách mép trên ~8%. Nhân vật ${
      id === 'player' ? '(bé) cần 4 tông da × 4 kiểu tóc nếu muốn giữ phần tuỳ chỉnh, hoặc giữ SVG cho người chơi' : ''
    }`.trim(),
  })),
  {
    key: 'word icons',
    file: 'words/<wordId>.png',
    size: '512×512',
    format: 'PNG trong suốt',
    notes: 'Hiện dùng emoji (trường icon trong data/words.ts). Có thể thay bằng tranh minh hoạ.',
  },
];

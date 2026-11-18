import type { Region, StageStub } from './types';
import { STAGE_BY_ID } from './stages';

const SAGA_IDS = ['saga-1', 'saga-2', 'saga-3', 'saga-4', 'saga-5', 'saga-6', 'saga-7', 'saga-8', 'saga-9', 'saga-10'] as const;

/** Làng Saga: cả 10 chặng đều có nội dung đầy đủ. */
const sagaStubs: StageStub[] = SAGA_IDS.map((id, i) => {
  const s = STAGE_BY_ID[id];
  return { id, index: i + 1, title: s.title, titleJp: s.titleJp, icon: s.icon, soon: null };
});

function placeholderStages(regionId: string): StageStub[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${regionId}-${i + 1}`,
    index: i + 1,
    title: `Stage ${i + 1}`,
    titleJp: 'ステージ',
    icon: '✨',
    soon: 'Sắp ra mắt',
  }));
}

export const REGIONS: Region[] = [
  {
    id: 'saga',
    order: 1,
    name: 'Làng Saga',
    nameJp: 'さがの さと',
    tagline: 'Chương 1 · Đèn Cổng nhà. Quê nhà của bà Osano, nơi mọi câu chuyện bắt đầu',
    inspiredBy: 'Lấy cảm hứng từ «Saga no Gabai Baachan» (島田洋七); bà mượn tên bà Osano. Tình tiết là sáng tác gốc.',
    icon: '🏡',
    theme: 'countryside',
    marker: { x: 290, y: 800 },
    stages: sagaStubs,
  },
  {
    id: 'hikari',
    order: 2,
    name: 'Rừng Ánh Sáng',
    nameJp: 'ひかりの もり',
    tagline: 'Chương 2 · Đèn Lá thì thầm. Các Pokkuri chỉ hiện ra khi bạn chào đúng',
    icon: '🌲',
    theme: 'lightForest',
    marker: { x: 740, y: 830 },
    stages: placeholderStages('hikari'),
  },
  {
    id: 'neko',
    order: 3,
    name: 'Thị trấn Mèo',
    nameJp: 'ねこの まち',
    tagline: 'Chương 3 · Đèn Râu mèo. Quê hương bí mật của Momo',
    icon: '🐈',
    theme: 'catTown',
    marker: { x: 1190, y: 790 },
    stages: placeholderStages('neko'),
  },
  {
    id: 'gakkou',
    order: 4,
    name: 'Trường học Nhật',
    nameJp: 'にほんの がっこう',
    tagline: 'Chương 4 · Đèn Bảng đen. Học hiragana và nhìn thấy bức ảnh cũ của bà Osano',
    icon: '🎒',
    theme: 'school',
    marker: { x: 1630, y: 820 },
    stages: placeholderStages('gakkou'),
  },
  {
    id: 'tetsudou',
    order: 5,
    name: 'Làng Đường sắt',
    nameJp: 'てつどうの むら',
    tagline: 'Chương 5 · Đèn Còi tàu. Bóng cáo đeo mặt nạ xuất hiện trên toa cuối',
    icon: '🚂',
    theme: 'railway',
    marker: { x: 1600, y: 440 },
    stages: placeholderStages('tetsudou'),
  },
  {
    id: 'ichiba',
    order: 6,
    name: 'Chợ Nhật Bản',
    nameJp: 'にほんの いちば',
    tagline: 'Chương 6 · Đèn Gian hàng. Ông Gen biết bí mật về chiếc đèn thứ chín',
    icon: '🏮',
    theme: 'market',
    marker: { x: 1170, y: 400 },
    stages: placeholderStages('ichiba'),
  },
  {
    id: 'matsuri',
    order: 7,
    name: 'Lễ hội Mùa hè',
    nameJp: 'なつまつり',
    tagline: 'Chương 7 · Đèn Pháo hoa. Mặt nạ cáo rơi xuống, sự thật được hé lộ',
    icon: '🎆',
    theme: 'festival',
    marker: { x: 700, y: 430 },
    stages: placeholderStages('matsuri'),
  },
  {
    id: 'fuji',
    order: 8,
    name: 'Núi Phú Sĩ',
    nameJp: 'ふじさん',
    tagline: 'Chương 8 · Đèn Bình Minh. Mang chiếc đèn thứ chín lên đỉnh núi',
    icon: '🗻',
    theme: 'fuji',
    marker: { x: 290, y: 410 },
    stages: placeholderStages('fuji'),
  },
];

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

export function getRegion(id: string): Region {
  const r = REGION_BY_ID[id];
  if (!r) throw new Error(`Unknown region id: ${id}`);
  return r;
}

export function previousRegion(region: Region): Region | undefined {
  return REGIONS.find((r) => r.order === region.order - 1);
}

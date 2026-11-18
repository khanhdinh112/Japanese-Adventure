import type { Region, StageStub } from './types';
import { STAGE_BY_ID } from './stages';

const SOON = 'Chương 2 · sắp ra mắt';

/** Làng Saga: 5 stage đầu có nội dung, 5 stage sau là chỗ giữ chỗ cho Chương 2. */
const sagaStubs: StageStub[] = [
  ...(['saga-1', 'saga-2', 'saga-3', 'saga-4', 'saga-5'] as const).map((id, i) => {
    const s = STAGE_BY_ID[id];
    return { id, index: i + 1, title: s.title, titleJp: s.titleJp, icon: s.icon, soon: null };
  }),
  { id: 'saga-6', index: 6, title: 'Con đường ven ruộng', titleJp: 'たんぼの みち', icon: '🌾', soon: SOON },
  { id: 'saga-7', index: 7, title: 'Bữa cơm tối', titleJp: 'ばんごはん', icon: '🍱', soon: SOON },
  { id: 'saga-8', index: 8, title: 'Mưa mùa hè', titleJp: 'なつの あめ', icon: '☔', soon: SOON },
  { id: 'saga-9', index: 9, title: 'Ngôi sao giấy', titleJp: 'おりがみの ほし', icon: '⭐', soon: SOON },
  { id: 'saga-10', index: 10, title: 'Lời hẹn ngày mai', titleJp: 'あしたの やくそく', icon: '🌅', soon: SOON },
];

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
    tagline: 'Quê nhà của bà Hana, nơi mọi câu chuyện bắt đầu',
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
    tagline: 'Khu rừng của những tia nắng và thì thầm của cây',
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
    tagline: 'Nơi mèo mở tiệm và thích nghe bạn nói tiếng Nhật',
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
    tagline: 'Chào cô giáo, làm quen bạn mới và học cùng lớp',
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
    tagline: 'Chuyến tàu nhỏ chạy qua những cánh đồng hoa',
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
    tagline: 'Gian hàng lồng đèn, mùi bánh và tiếng rao vui tai',
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
    tagline: 'Pháo hoa, trống taiko và áo yukata rực rỡ',
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
    tagline: 'Chặng cuối: đỉnh núi trắng tuyết nơi mặt trời mọc',
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

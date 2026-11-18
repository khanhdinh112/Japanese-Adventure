import type { CharacterId } from './types';

export interface CharacterMeta {
  id: CharacterId;
  name: string;
  nameJp: string;
  /** Màu bảng tên trong hộp thoại */
  color: string;
}

export const CHARACTERS: Record<CharacterId, CharacterMeta> = {
  player: { id: 'player', name: '{name}', nameJp: '{nameJp}', color: '#3f7a73' },
  hana: { id: 'hana', name: 'Bà Hana', nameJp: 'はなおばあちゃん', color: '#b4543a' },
  momo: { id: 'momo', name: 'Momo', nameJp: 'モモ', color: '#c9822f' },
};

/** Lựa chọn tạo nhân vật (xem components/CharacterSprite.tsx để biết cách vẽ). */
export const SKIN_TONES = ['#fbdcc2', '#f4c7a1', '#e3a97c', '#c58a5f'] as const;
export const HAIR_COLORS = ['#2b2430', '#5a3a2a', '#8a4b2a', '#d0953d', '#6d4c8f'] as const;
export const OUTFIT_COLORS = ['#e0634b', '#3f8f86', '#e6b84a', '#6f8fd0', '#d77aa6'] as const;
export const HAIR_STYLES = [
  { id: 'short', label: 'Tóc ngắn' },
  { id: 'bob', label: 'Tóc bob' },
  { id: 'twin', label: 'Hai búi' },
  { id: 'ponytail', label: 'Tóc đuôi ngựa' },
] as const;
export type HairStyle = (typeof HAIR_STYLES)[number]['id'];

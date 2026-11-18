import type { Profile } from './gameState';

/**
 * Thay các chỗ giữ chỗ trong nội dung:
 *  {name}    → tên bé (chữ Latin)
 *  {nameJp}  → tên + ちゃん / くん
 *  {nameRo}  → tên + -chan / -kun (dùng trong romaji)
 */
export function resolveText(text: string, profile: Pick<Profile, 'name' | 'honorific'> | null): string {
  const name = profile?.name?.trim() || 'bạn';
  const chan = profile?.honorific === 'kun';
  return text
    .replace(/\{nameJp\}/g, `${name}${chan ? 'くん' : 'ちゃん'}`)
    .replace(/\{nameRo\}/g, `${name}-${chan ? 'kun' : 'chan'}`)
    .replace(/\{name\}/g, name);
}

/** Văn bản đưa cho giọng đọc: bỏ ngoặc và dấu câu làm giọng đọc vấp. */
export function toSpeakable(text: string): string {
  return text.replace(/[「」『』"]/g, '').replace(/\s+/g, ' ').trim();
}

/** Tách lời Nhật thành các đoạn để tô sáng từ vựng. */
export function splitByWords(text: string, words: string[]): { text: string; word?: string }[] {
  const sorted = [...words].filter(Boolean).sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return [{ text }];
  const escaped = sorted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');
  const out: { text: string; word?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ text: text.slice(last, idx) });
    out.push({ text: m[0], word: m[0] });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

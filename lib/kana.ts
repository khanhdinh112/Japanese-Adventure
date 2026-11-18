/**
 * Chuyển kana (hiragana, katakana) sang romaji kiểu Hepburn đơn giản để làm phiên âm tự động.
 * Chữ không phải kana (chữ Latin, số, tên bé) được giữ nguyên.
 */

const BASE: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
};

const SMALL: Record<string, string> = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' };
const SMALL_VOWEL: Record<string, string> = { ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o' };

const PUNCT: Record<string, string> = { '。': '.', '、': ',', '？': '?', '！': '!', '「': '"', '」': '"', '　': ' ' };

/** Đổi katakana (U+30A1–U+30F6) về hiragana tương ứng; giữ nguyên ký tự khác. */
function toHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export const isKana = (s: string) => /[぀-ヿ]/.test(s);

/** Một từ/khối (không có khoảng trắng). Trợ từ đứng riêng (は, へ, を) được đọc là wa, e, o. */
export function kanaToRomaji(input: string, opts: { particleAlone?: boolean } = {}): string {
  const text = toHira(input);
  if (opts.particleAlone) {
    if (text === 'は') return 'wa';
    if (text === 'へ') return 'e';
  }
  let out = '';
  let geminate = false;
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === 'っ') {
      geminate = true;
      continue;
    }
    if (c === 'ー') {
      const m = out.match(/[aiueo](?=[^aiueo]*$)/);
      out += m ? m[0] : '';
      continue;
    }
    if (PUNCT[c] !== undefined) {
      out += PUNCT[c];
      continue;
    }
    let syl: string | undefined = BASE[c];
    if (syl !== undefined) {
      const next = chars[i + 1];
      if (next && SMALL[next]) {
        // きゃ, しゅ, ちょ…
        const stem = syl.endsWith('i') ? syl.slice(0, -1) : syl;
        const y = SMALL[next];
        syl = /^(sh|ch|j)$/.test(stem) ? stem + y.slice(1) : stem + y;
        i++;
      } else if (next && SMALL_VOWEL[next]) {
        syl = (syl.length > 1 ? syl.slice(0, -1) : syl) + SMALL_VOWEL[next];
        i++;
      }
      if (geminate) {
        syl = (syl.startsWith('ch') ? 't' : syl[0]) + syl;
        geminate = false;
      }
      out += syl;
      continue;
    }
    out += c;
  }
  return out;
}

/** Cả câu: các khối cách nhau bằng khoảng trắng, mỗi khối được đổi riêng (nên は đứng riêng thành "wa"). */
export function sentenceToRomaji(parts: string[]): string {
  return parts
    .map((p) => kanaToRomaji(p, { particleAlone: true }))
    .join(' ')
    .replace(/\s+([.,?!])/g, '$1')
    .trim();
}

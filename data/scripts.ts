/**
 * Góc luyện chữ: Hiragana, Katakana và một bộ Kanji nhập môn.
 * Mỗi chữ có cách đọc (romaji), một từ ví dụ quen thuộc kèm nghĩa tiếng Việt.
 */

export type ScriptId = 'hiragana' | 'katakana' | 'kanji';

export interface Glyph {
  /** Mã duy nhất, dùng để lưu tiến độ (vd "h:あ") */
  id: string;
  ch: string;
  /** Cách đọc bằng chữ La-tinh */
  read: string;
  /** Kanji: nghĩa tiếng Việt. Kana: để trống */
  meaning?: string;
  /** Từ ví dụ viết bằng tiếng Nhật */
  word: string;
  /** Cách đọc của từ ví dụ (kana) để bé nghe được */
  wordKana: string;
  /** Nghĩa của từ ví dụ */
  wordVi: string;
  /** Nhóm hàng (để xếp thành bảng 5 cột) */
  row: string;
}

type Raw = [ch: string, read: string, word: string, wordKana: string, wordVi: string];

function kana(script: 'h' | 'k', rows: [string, Raw[]][]): Glyph[] {
  return rows.flatMap(([row, items]) =>
    items.map(([ch, read, word, wordKana, wordVi]) => ({ id: `${script}:${ch}`, ch, read, word, wordKana, wordVi, row })),
  );
}

export const HIRAGANA: Glyph[] = kana('h', [
  ['a', [['あ', 'a', 'あめ', 'あめ', 'mưa'], ['い', 'i', 'いぬ', 'いぬ', 'con chó'], ['う', 'u', 'うみ', 'うみ', 'biển'], ['え', 'e', 'えき', 'えき', 'nhà ga'], ['お', 'o', 'おちゃ', 'おちゃ', 'trà']]],
  ['k', [['か', 'ka', 'かさ', 'かさ', 'cái ô'], ['き', 'ki', 'きつね', 'きつね', 'con cáo'], ['く', 'ku', 'くつ', 'くつ', 'đôi giày'], ['け', 'ke', 'けさ', 'けさ', 'sáng nay'], ['こ', 'ko', 'こども', 'こども', 'trẻ em']]],
  ['s', [['さ', 'sa', 'さかな', 'さかな', 'con cá'], ['し', 'shi', 'しろ', 'しろ', 'màu trắng'], ['す', 'su', 'すし', 'すし', 'sushi'], ['せ', 'se', 'せんせい', 'せんせい', 'cô giáo'], ['そ', 'so', 'そら', 'そら', 'bầu trời']]],
  ['t', [['た', 'ta', 'たまご', 'たまご', 'quả trứng'], ['ち', 'chi', 'ちず', 'ちず', 'bản đồ'], ['つ', 'tsu', 'つき', 'つき', 'mặt trăng'], ['て', 'te', 'てがみ', 'てがみ', 'lá thư'], ['と', 'to', 'とり', 'とり', 'con chim']]],
  ['n', [['な', 'na', 'なつ', 'なつ', 'mùa hè'], ['に', 'ni', 'にほん', 'にほん', 'Nhật Bản'], ['ぬ', 'nu', 'ぬいぐるみ', 'ぬいぐるみ', 'thú nhồi bông'], ['ね', 'ne', 'ねこ', 'ねこ', 'con mèo'], ['の', 'no', 'のり', 'のり', 'rong biển']]],
  ['h', [['は', 'ha', 'はな', 'はな', 'bông hoa'], ['ひ', 'hi', 'ひかり', 'ひかり', 'ánh sáng'], ['ふ', 'fu', 'ふね', 'ふね', 'con thuyền'], ['へ', 'he', 'へや', 'へや', 'căn phòng'], ['ほ', 'ho', 'ほし', 'ほし', 'ngôi sao']]],
  ['m', [['ま', 'ma', 'まど', 'まど', 'cửa sổ'], ['み', 'mi', 'みず', 'みず', 'nước'], ['む', 'mu', 'むし', 'むし', 'côn trùng'], ['め', 'me', 'めがね', 'めがね', 'kính mắt'], ['も', 'mo', 'もも', 'もも', 'quả đào']]],
  ['y', [['や', 'ya', 'やま', 'やま', 'ngọn núi'], ['ゆ', 'yu', 'ゆき', 'ゆき', 'tuyết'], ['よ', 'yo', 'よる', 'よる', 'buổi tối']]],
  ['r', [['ら', 'ra', 'らくだ', 'らくだ', 'con lạc đà'], ['り', 'ri', 'りんご', 'りんご', 'quả táo'], ['る', 'ru', 'るす', 'るす', 'vắng nhà'], ['れ', 're', 'れんこん', 'れんこん', 'củ sen'], ['ろ', 'ro', 'ろうそく', 'ろうそく', 'ngọn nến']]],
  ['w', [['わ', 'wa', 'わたし', 'わたし', 'tôi'], ['を', 'wo', 'ほんを よむ', 'ほんを よむ', 'đọc sách'], ['ん', 'n', 'ほん', 'ほん', 'quyển sách']]],
]);

export const KATAKANA: Glyph[] = kana('k', [
  ['a', [['ア', 'a', 'アイス', 'あいす', 'kem'], ['イ', 'i', 'インク', 'いんく', 'mực'], ['ウ', 'u', 'ウール', 'うーる', 'len'], ['エ', 'e', 'エアコン', 'えあこん', 'máy lạnh'], ['オ', 'o', 'オレンジ', 'おれんじ', 'quả cam']]],
  ['k', [['カ', 'ka', 'カメラ', 'かめら', 'máy ảnh'], ['キ', 'ki', 'キウイ', 'きうい', 'quả kiwi'], ['ク', 'ku', 'クッキー', 'くっきー', 'bánh quy'], ['ケ', 'ke', 'ケーキ', 'けーき', 'bánh kem'], ['コ', 'ko', 'コーヒー', 'こーひー', 'cà phê']]],
  ['s', [['サ', 'sa', 'サラダ', 'さらだ', 'rau trộn'], ['シ', 'shi', 'シャツ', 'しゃつ', 'áo sơ mi'], ['ス', 'su', 'スープ', 'すーぷ', 'món súp'], ['セ', 'se', 'セーター', 'せーたー', 'áo len'], ['ソ', 'so', 'ソファ', 'そふぁ', 'ghế sofa']]],
  ['t', [['タ', 'ta', 'タクシー', 'たくしー', 'xe taxi'], ['チ', 'chi', 'チーズ', 'ちーず', 'phô mai'], ['ツ', 'tsu', 'ツナ', 'つな', 'cá ngừ'], ['テ', 'te', 'テレビ', 'てれび', 'ti vi'], ['ト', 'to', 'トマト', 'とまと', 'cà chua']]],
  ['n', [['ナ', 'na', 'ナイフ', 'ないふ', 'con dao'], ['ニ', 'ni', 'ニュース', 'にゅーす', 'tin tức'], ['ヌ', 'nu', 'ヌードル', 'ぬーどる', 'mì sợi'], ['ネ', 'ne', 'ネクタイ', 'ねくたい', 'cà vạt'], ['ノ', 'no', 'ノート', 'のーと', 'quyển vở']]],
  ['h', [['ハ', 'ha', 'ハム', 'はむ', 'giăm bông'], ['ヒ', 'hi', 'ヒーター', 'ひーたー', 'máy sưởi'], ['フ', 'fu', 'フォーク', 'ふぉーく', 'cái dĩa'], ['ヘ', 'he', 'ヘリコプター', 'へりこぷたー', 'trực thăng'], ['ホ', 'ho', 'ホテル', 'ほてる', 'khách sạn']]],
  ['m', [['マ', 'ma', 'マスク', 'ますく', 'khẩu trang'], ['ミ', 'mi', 'ミルク', 'みるく', 'sữa'], ['ム', 'mu', 'ムービー', 'むーびー', 'bộ phim'], ['メ', 'me', 'メロン', 'めろん', 'dưa lưới'], ['モ', 'mo', 'モデル', 'もでる', 'người mẫu']]],
  ['y', [['ヤ', 'ya', 'タイヤ', 'たいや', 'lốp xe'], ['ユ', 'yu', 'ユーモア', 'ゆーもあ', 'sự hài hước'], ['ヨ', 'yo', 'ヨーグルト', 'よーぐると', 'sữa chua']]],
  ['r', [['ラ', 'ra', 'ラジオ', 'らじお', 'radio'], ['リ', 'ri', 'リボン', 'りぼん', 'cái nơ'], ['ル', 'ru', 'ルール', 'るーる', 'luật lệ'], ['レ', 're', 'レモン', 'れもん', 'quả chanh'], ['ロ', 'ro', 'ロボット', 'ろぼっと', 'người máy']]],
  ['w', [['ワ', 'wa', 'ワイン', 'わいん', 'rượu vang'], ['ヲ', 'wo', 'ヲ (ít dùng)', 'を', 'rất hiếm gặp'], ['ン', 'n', 'パン', 'ぱん', 'bánh mì']]],
]);

type KRaw = [ch: string, read: string, meaning: string, word: string, wordKana: string, wordVi: string];

function kanji(rows: [string, KRaw[]][]): Glyph[] {
  return rows.flatMap(([row, items]) =>
    items.map(([ch, read, meaning, word, wordKana, wordVi]) => ({ id: `j:${ch}`, ch, read, meaning, word, wordKana, wordVi, row })),
  );
}

export const KANJI: Glyph[] = kanji([
  ['Số đếm', [
    ['一', 'ichi', 'một', '一つ', 'ひとつ', 'một cái'],
    ['二', 'ni', 'hai', '二人', 'ふたり', 'hai người'],
    ['三', 'san', 'ba', '三月', 'さんがつ', 'tháng ba'],
    ['四', 'shi / yon', 'bốn', '四つ', 'よっつ', 'bốn cái'],
    ['五', 'go', 'năm', '五日', 'いつか', 'ngày mùng năm'],
    ['六', 'roku', 'sáu', '六月', 'ろくがつ', 'tháng sáu'],
    ['七', 'shichi / nana', 'bảy', '七つ', 'ななつ', 'bảy cái'],
    ['八', 'hachi', 'tám', '八月', 'はちがつ', 'tháng tám'],
    ['九', 'kyuu', 'chín', '九月', 'くがつ', 'tháng chín'],
    ['十', 'juu', 'mười', '十日', 'とおか', 'ngày mùng mười'],
  ]],
  ['Thiên nhiên', [
    ['日', 'nichi / hi', 'mặt trời, ngày', '日曜日', 'にちようび', 'chủ nhật'],
    ['月', 'getsu / tsuki', 'mặt trăng, tháng', '月曜日', 'げつようび', 'thứ hai'],
    ['火', 'ka / hi', 'lửa', '火曜日', 'かようび', 'thứ ba'],
    ['水', 'sui / mizu', 'nước', '水曜日', 'すいようび', 'thứ tư'],
    ['木', 'moku / ki', 'cây', '木曜日', 'もくようび', 'thứ năm'],
    ['金', 'kin / kane', 'vàng, tiền', '金曜日', 'きんようび', 'thứ sáu'],
    ['土', 'do / tsuchi', 'đất', '土曜日', 'どようび', 'thứ bảy'],
    ['山', 'san / yama', 'núi', '富士山', 'ふじさん', 'núi Phú Sĩ'],
    ['川', 'sen / kawa', 'sông', '小川', 'おがわ', 'con suối nhỏ'],
  ]],
  ['Con người', [
    ['人', 'jin / hito', 'người', '日本人', 'にほんじん', 'người Nhật'],
    ['女', 'jo / onna', 'phụ nữ, con gái', '女の子', 'おんなのこ', 'bé gái'],
    ['男', 'dan / otoko', 'đàn ông, con trai', '男の子', 'おとこのこ', 'bé trai'],
    ['子', 'shi / ko', 'đứa trẻ', '子ども', 'こども', 'trẻ em'],
    ['口', 'kou / kuchi', 'cái miệng', '入口', 'いりぐち', 'cửa vào'],
    ['目', 'moku / me', 'con mắt', '目', 'め', 'mắt'],
    ['手', 'shu / te', 'bàn tay', '手紙', 'てがみ', 'lá thư'],
    ['足', 'soku / ashi', 'bàn chân', '足', 'あし', 'chân'],
  ]],
  ['Kích thước và vị trí', [
    ['大', 'dai / ookii', 'to, lớn', '大きい', 'おおきい', 'to lớn'],
    ['小', 'shou / chiisai', 'nhỏ', '小さい', 'ちいさい', 'nhỏ bé'],
    ['上', 'jou / ue', 'trên', '上', 'うえ', 'phía trên'],
    ['下', 'ka / shita', 'dưới', '下', 'した', 'phía dưới'],
    ['中', 'chuu / naka', 'giữa, trong', '中', 'なか', 'bên trong'],
  ]],
  ['Trường học', [
    ['学', 'gaku / mana(bu)', 'học', '学校', 'がっこう', 'trường học'],
    ['校', 'kou', 'trường', '学校', 'がっこう', 'trường học'],
    ['先', 'sen / saki', 'trước', '先生', 'せんせい', 'cô giáo, thầy giáo'],
    ['生', 'sei / i(kiru)', 'sinh, sống', '先生', 'せんせい', 'cô giáo, thầy giáo'],
  ]],
]);

export const SCRIPTS: Record<ScriptId, { id: ScriptId; label: string; sample: string; glyphs: Glyph[]; hint: string }> = {
  hiragana: {
    id: 'hiragana',
    label: 'Hiragana',
    sample: 'あ',
    glyphs: HIRAGANA,
    hint: 'Bảng chữ mềm mại, dùng để viết các từ tiếng Nhật.',
  },
  katakana: {
    id: 'katakana',
    label: 'Katakana',
    sample: 'ア',
    glyphs: KATAKANA,
    hint: 'Bảng chữ vuông vức, dùng cho từ mượn như アイス (kem), ケーキ (bánh kem).',
  },
  kanji: {
    id: 'kanji',
    label: 'Kanji',
    sample: '日',
    glyphs: KANJI,
    hint: 'Chữ Hán: mỗi chữ mang một ý nghĩa. Bắt đầu với những chữ thật quen thuộc.',
  },
};

export const GLYPH_BY_ID: Record<string, Glyph> = Object.fromEntries(
  (Object.values(SCRIPTS) as { glyphs: Glyph[] }[]).flatMap((s) => s.glyphs.map((g) => [g.id, g] as const)),
);

export function scriptOf(id: string): ScriptId {
  return id.startsWith('h:') ? 'hiragana' : id.startsWith('k:') ? 'katakana' : 'kanji';
}

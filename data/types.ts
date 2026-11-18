/**
 * Kiểu dữ liệu nội dung của Japanese Adventure.
 * Toàn bộ nội dung (câu chuyện, từ vựng, ngữ pháp…) là dữ liệu thuần, tách khỏi UI
 * để việc thêm Chương 2 chỉ cần thêm file trong data/stages.
 */

export type SkillKind = 'vocab' | 'grammar' | 'listening' | 'mastery';
export type StepKind = 'story' | 'vocab' | 'grammar' | 'listening' | 'quest' | 'mastery';

export const STEP_ORDER: StepKind[] = ['story', 'vocab', 'grammar', 'listening', 'quest', 'mastery'];

export const STEP_META: Record<StepKind, { label: string; jp: string; icon: string }> = {
  story: { label: 'Câu chuyện', jp: 'おはなし', icon: '📖' },
  vocab: { label: 'Từ vựng', jp: 'ことば', icon: '🌸' },
  grammar: { label: 'Ngữ pháp', jp: 'ぶんぽう', icon: '🧩' },
  listening: { label: 'Nghe', jp: 'きく', icon: '👂' },
  quest: { label: 'Nhiệm vụ', jp: 'クエスト', icon: '🧭' },
  mastery: { label: 'Tự làm', jp: 'ひとりで', icon: '⭐' },
};

/* ------------------------------------------------------------------ */
/* Từ vựng                                                              */
/* ------------------------------------------------------------------ */

export interface Line {
  jp: string;
  romaji: string;
  vi: string;
}

export interface Word {
  id: string;
  jp: string;
  romaji: string;
  vi: string;
  /** Emoji dùng làm hình minh hoạ tạm thời (xem docs/ASSETS.md → words) */
  icon: string;
  /** Câu ví dụ lấy từ chính câu chuyện */
  example: Line;
  /** Mẹo ghi nhớ bằng tiếng Việt */
  memo?: string;
}

/* ------------------------------------------------------------------ */
/* Câu chuyện                                                           */
/* ------------------------------------------------------------------ */

export type CharacterId = 'player' | 'hana' | 'momo';
export type Emotion = 'neutral' | 'happy' | 'surprised' | 'worried' | 'thinking' | 'laugh';
export type Slot = 'left' | 'center' | 'right';
export type SceneId = 'road' | 'gate' | 'genkan' | 'bedroom' | 'dining' | 'living' | 'engawa' | 'garden';
export type AmbientKind = 'none' | 'leaves' | 'petals' | 'motes' | 'fireflies';

export interface CastMember {
  id: CharacterId;
  slot: Slot;
  emotion: Emotion;
  /** Bà Hana: có đeo kính hay không (Stage 3 bà mất kính) */
  glasses?: boolean;
  hidden?: boolean;
}

export type CastTweak = Partial<Record<CharacterId, Partial<Omit<CastMember, 'id'>>>>;

export interface LineBeat extends Line {
  type: 'line';
  speaker: CharacterId;
  emotion?: Emotion;
  tweak?: CastTweak;
}

export interface NarrationBeat {
  type: 'narration';
  vi: string;
  jp?: string;
  romaji?: string;
}

export interface SceneBeat {
  type: 'scene';
  scene: SceneId;
  ambient: AmbientKind;
  cast: CastMember[];
  /** Tên địa điểm hiển thị ngắn khi chuyển cảnh */
  place: { vi: string; jp: string };
}

export interface LetterBeat {
  type: 'letter';
  lines: Line[];
}

export type ReplyLine = Omit<LineBeat, 'type'>;

export interface ChoiceOption extends Line {
  correct?: boolean;
  /** Lời đáp của nhân vật sau khi chọn */
  reply?: ReplyLine;
}

export interface ChoiceBeat {
  type: 'choice';
  question: string;
  wordIds?: string[];
  options: ChoiceOption[];
  wrongReply?: ReplyLine;
}

export interface CultureBeat {
  type: 'culture';
  cultureId: string;
}

/** Vùng có thể bấm trong cảnh (toạ độ trên canvas 1920×1080) */
export interface Spot {
  id: string;
  label: Line;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FindRound {
  ask: ReplyLine;
  targetId: string;
  found: ReplyLine;
  miss: ReplyLine;
  wordIds: string[];
}

export interface FindBeat {
  type: 'find';
  instruction: string;
  spots: Spot[];
  rounds: FindRound[];
}

export type ShapeKey = 'square' | 'triangle' | 'circle' | 'ears' | 'earsUp' | 'face' | 'blank';

export interface FoldStep {
  /** Bà Hana đọc hướng dẫn bằng tiếng Nhật */
  say: Line;
  options: { id: string; shape: ShapeKey; label: string }[];
  answerId: string;
  /** Hình giấy sau khi gấp đúng */
  result: ShapeKey;
}

export interface FoldBeat {
  type: 'fold';
  intro: string;
  steps: FoldStep[];
}

export type Beat =
  | LineBeat
  | NarrationBeat
  | SceneBeat
  | LetterBeat
  | ChoiceBeat
  | CultureBeat
  | FindBeat
  | FoldBeat;

export interface CultureNote {
  id: string;
  title: string;
  titleJp: string;
  icon: string;
  body: string;
  fact: string;
  /** Cụm từ Nhật nên nhớ */
  phrase?: Line;
}

/* ------------------------------------------------------------------ */
/* Ngữ pháp                                                             */
/* ------------------------------------------------------------------ */

export type TileRole = 'topic' | 'noun' | 'particle' | 'verb' | 'place' | 'word';

export interface PatternTile {
  text: string;
  role: TileRole;
  label: string;
}

export interface GrammarExample extends Line {
  /** Chia câu thành các khối để tô màu */
  parts: PatternTile[];
}

export interface QuickCheck {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface BuildPractice {
  prompt: string;
  /** Nghĩa tiếng Việt của câu đáp án, hiện ra sau khi trả lời */
  meaning: string;
  /** Token đáp án. Có thể chứa {name}. */
  answer: string[];
  alts?: string[][];
  distractors: string[];
  romaji: string;
  hint: string;
}

export interface GrammarPoint {
  title: string;
  titleJp: string;
  formula: PatternTile[][];
  momoSays: string[];
  examples: GrammarExample[];
  tip: string;
  watchOut: string;
  quick: QuickCheck[];
  practice: BuildPractice[];
  wordIds: string[];
}

/* ------------------------------------------------------------------ */
/* Nghe & tự làm                                                        */
/* ------------------------------------------------------------------ */

export interface ListeningOption {
  id: string;
  label: string;
  icon: string;
}

export interface ListeningItem {
  id: string;
  /** Văn bản tiếng Nhật được đọc (TTS) */
  audio: string;
  romaji: string;
  vi: string;
  question: string;
  options: ListeningOption[];
  answerId: string;
  explain: string;
  wordIds: string[];
}

export interface MasteryPrompt extends BuildPractice {
  id: string;
  kind: 'listen-build' | 'translate-build' | 'scene-build';
  /** Dùng cho listen-build */
  audio?: string;
  /** Hình gợi ý (emoji) */
  scene?: string;
  wordIds: string[];
}

/* ------------------------------------------------------------------ */
/* Nhiệm vụ ngoài đời                                                   */
/* ------------------------------------------------------------------ */

export interface Quest {
  id: string;
  title: string;
  titleJp: string;
  icon: string;
  hook: string;
  materials: string[];
  steps: string[];
  phrase: Line;
  /** Mẫu để chép lại (nếu có) */
  sample?: string[];
  reflectionPrompt: string;
  evidence: 'photo' | 'drawing';
  evidenceLabel: string;
  minutes: number;
}

/* ------------------------------------------------------------------ */
/* Stage, vùng                                                          */
/* ------------------------------------------------------------------ */

export interface StageContent {
  id: string;
  regionId: string;
  index: number;
  title: string;
  titleJp: string;
  icon: string;
  summary: string;
  objectives: string[];
  beats: Beat[];
  wordIds: string[];
  cultureIds: string[];
  grammar: GrammarPoint;
  listening: ListeningItem[];
  quest: Quest;
  mastery: MasteryPrompt[];
  badgeId?: string;
}

export interface StageStub {
  id: string;
  index: number;
  title: string;
  titleJp: string;
  icon: string;
  /** null = đã có nội dung; chuỗi = thông báo sắp ra mắt */
  soon: string | null;
}

export type RegionTheme =
  | 'countryside'
  | 'lightForest'
  | 'catTown'
  | 'school'
  | 'railway'
  | 'market'
  | 'festival'
  | 'fuji';

export interface Region {
  id: string;
  order: number;
  name: string;
  nameJp: string;
  tagline: string;
  icon: string;
  theme: RegionTheme;
  /** Tâm marker trên canvas bản đồ thế giới (1920×1080) */
  marker: { x: number; y: number };
  stages: StageStub[];
}

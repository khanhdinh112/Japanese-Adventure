import type { HairStyle } from '../data/characters';
import type { SkillKind, StepKind } from '../data/types';
import { STEP_ORDER } from '../data/types';

/* ------------------------------------------------------------------ */
/* Kiểu dữ liệu trạng thái (được lưu trong localStorage)                */
/* ------------------------------------------------------------------ */

export type Honorific = 'chan' | 'kun';

export interface PlayerLook {
  skin: number;
  hairStyle: HairStyle;
  hairColor: number;
  outfit: number;
}

export interface Profile {
  name: string;
  honorific: Honorific;
  look: PlayerLook;
  createdAt: string;
}

export interface Settings {
  romaji: boolean;
  sound: boolean;
  voice: boolean;
}

export interface SkillStat {
  correct: number;
  total: number;
}
export type SkillStats = Record<SkillKind, SkillStat>;

export type WordLevel = 0 | 1 | 2 | 3;
export interface WordProgress {
  level: WordLevel;
  correct: number;
  wrong: number;
}

export interface StageRun {
  stepsDone: StepKind[];
  skills: SkillStats;
  hints: number;
  questSaved: boolean;
  wordsBefore: Record<string, WordLevel>;
}

export interface StageResult {
  stars: 0 | 1 | 2 | 3;
  xpGained: number;
  accuracy: number;
  skills: SkillStats;
  hints: number;
  masteryRatio: number;
  questSaved: boolean;
  wordsBefore: Record<string, WordLevel>;
  completedAt: string;
}

export interface StageProgress {
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  plays: number;
  run: StageRun | null;
  lastResult: StageResult | null;
}

export type JournalKind = 'quest' | 'note' | 'culture';
export interface JournalEntry {
  id: string;
  kind: JournalKind;
  date: string; // ISO
  dateKey: string;
  stageId?: string;
  title: string;
  text: string;
  jp?: string;
  image?: string; // data URL (ảnh chụp hoặc tranh vẽ, lưu cục bộ)
  icon?: string;
}

export interface DayActivity {
  seconds: number;
  xp: number;
}

export interface GameState {
  version: 1;
  profile: Profile | null;
  settings: Settings;
  stages: Record<string, StageProgress>;
  words: Record<string, WordProgress>;
  skills: SkillStats;
  journal: JournalEntry[];
  cultures: string[];
  activity: Record<string, DayActivity>;
  xp: number;
}

/* ------------------------------------------------------------------ */
/* Giá trị khởi tạo                                                     */
/* ------------------------------------------------------------------ */

export function emptySkills(): SkillStats {
  return {
    vocab: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    mastery: { correct: 0, total: 0 },
  };
}

export const DEFAULT_LOOK: PlayerLook = { skin: 1, hairStyle: 'bob', hairColor: 0, outfit: 1 };

export function initialState(): GameState {
  return {
    version: 1,
    profile: null,
    settings: { romaji: true, sound: true, voice: true },
    stages: {},
    words: {},
    skills: emptySkills(),
    journal: [],
    cultures: [],
    activity: {},
    xp: 0,
  };
}

export function emptyProgress(): StageProgress {
  return { completed: false, stars: 0, plays: 0, run: null, lastResult: null };
}

/* ------------------------------------------------------------------ */
/* Hành động                                                            */
/* ------------------------------------------------------------------ */

export type Action =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'CREATE_PROFILE'; profile: Profile }
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'START_STAGE'; stageId: string; wordIds: string[]; restart?: boolean }
  | { type: 'SEE_WORDS'; wordIds: string[] }
  | {
      type: 'ANSWER';
      stageId: string;
      skill: SkillKind;
      correct: boolean;
      wordIds: string[];
      /** Chỉ true cho bài tự làm đúng ngay lần đầu, không dùng gợi ý → từ đạt cấp 3 */
      independent?: boolean;
    }
  | { type: 'USE_HINT'; stageId: string }
  | { type: 'COMPLETE_STEP'; stageId: string; step: StepKind; dateKey: string }
  | { type: 'SAVE_QUEST'; stageId: string; entry: JournalEntry }
  | { type: 'FINISH_STAGE'; stageId: string; dateKey: string; now: string }
  | { type: 'COLLECT_CULTURE'; entry: JournalEntry; cultureId: string }
  | { type: 'ADD_NOTE'; entry: JournalEntry }
  | { type: 'DELETE_ENTRY'; id: string }
  | { type: 'TICK'; seconds: number; dateKey: string }
  | { type: 'RESET' };

/* ------------------------------------------------------------------ */
/* Tiện ích                                                             */
/* ------------------------------------------------------------------ */

const XP_STEP = 15;
const XP_QUEST = 30;
const XP_STAGE = 50;
const XP_STAR = 15;

function addActivityXp(state: GameState, dateKey: string, xp: number): Record<string, DayActivity> {
  const day = state.activity[dateKey] ?? { seconds: 0, xp: 0 };
  return { ...state.activity, [dateKey]: { ...day, xp: day.xp + xp } };
}

function sumSkills(skills: SkillStats): { correct: number; total: number } {
  return (Object.values(skills) as SkillStat[]).reduce(
    (acc, s) => ({ correct: acc.correct + s.correct, total: acc.total + s.total }),
    { correct: 0, total: 0 },
  );
}

function bumpSkill(skills: SkillStats, skill: SkillKind, correct: boolean): SkillStats {
  const s = skills[skill];
  return { ...skills, [skill]: { correct: s.correct + (correct ? 1 : 0), total: s.total + 1 } };
}

function levelOf(state: GameState, id: string): WordLevel {
  return state.words[id]?.level ?? 0;
}

function freshRun(state: GameState, wordIds: string[]): StageRun {
  const wordsBefore: Record<string, WordLevel> = {};
  for (const id of wordIds) wordsBefore[id] = levelOf(state, id);
  return { stepsDone: [], skills: emptySkills(), hints: 0, questSaved: false, wordsBefore };
}

export function computeStars(run: StageRun): { stars: 1 | 2 | 3; accuracy: number; masteryRatio: number } {
  const total = sumSkills(run.skills);
  const accuracy = total.total === 0 ? 0 : total.correct / total.total;
  const m = run.skills.mastery;
  const masteryRatio = m.total === 0 ? 0 : m.correct / m.total;
  let stars = 1;
  if (masteryRatio >= 2 / 3 && run.hints <= 1) stars += 1;
  if (accuracy >= 0.8 && run.questSaved) stars += 1;
  return { stars: stars as 1 | 2 | 3, accuracy, masteryRatio };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                              */
/* ------------------------------------------------------------------ */

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'CREATE_PROFILE':
      return { ...state, profile: action.profile };

    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'START_STAGE': {
      const prog = state.stages[action.stageId] ?? emptyProgress();
      if (prog.run && !action.restart) return state;
      return {
        ...state,
        stages: { ...state.stages, [action.stageId]: { ...prog, run: freshRun(state, action.wordIds) } },
      };
    }

    case 'SEE_WORDS': {
      let changed = false;
      const words = { ...state.words };
      for (const id of action.wordIds) {
        const cur = words[id];
        if (!cur) {
          words[id] = { level: 1, correct: 0, wrong: 0 };
          changed = true;
        } else if (cur.level < 1) {
          words[id] = { ...cur, level: 1 };
          changed = true;
        }
      }
      return changed ? { ...state, words } : state;
    }

    case 'ANSWER': {
      const prog = state.stages[action.stageId];
      const words = { ...state.words };
      for (const id of action.wordIds) {
        const cur = words[id] ?? { level: 0 as WordLevel, correct: 0, wrong: 0 };
        let level = cur.level;
        if (action.correct) {
          if (action.independent) level = 3;
          else if (level < 2) level = 2;
        }
        words[id] = {
          level,
          correct: cur.correct + (action.correct ? 1 : 0),
          wrong: cur.wrong + (action.correct ? 0 : 1),
        };
      }
      const skills = bumpSkill(state.skills, action.skill, action.correct);
      if (!prog?.run) return { ...state, words, skills };
      const run = { ...prog.run, skills: bumpSkill(prog.run.skills, action.skill, action.correct) };
      return { ...state, words, skills, stages: { ...state.stages, [action.stageId]: { ...prog, run } } };
    }

    case 'USE_HINT': {
      const prog = state.stages[action.stageId];
      if (!prog?.run) return state;
      return {
        ...state,
        stages: { ...state.stages, [action.stageId]: { ...prog, run: { ...prog.run, hints: prog.run.hints + 1 } } },
      };
    }

    case 'COMPLETE_STEP': {
      const prog = state.stages[action.stageId];
      if (!prog?.run) return state;
      if (prog.run.stepsDone.includes(action.step)) return state;
      const stepsDone = STEP_ORDER.filter((s) => s === action.step || prog.run!.stepsDone.includes(s));
      return {
        ...state,
        xp: state.xp + XP_STEP,
        activity: addActivityXp(state, action.dateKey, XP_STEP),
        stages: { ...state.stages, [action.stageId]: { ...prog, run: { ...prog.run, stepsDone } } },
      };
    }

    case 'SAVE_QUEST': {
      const prog = state.stages[action.stageId];
      const journal = [action.entry, ...state.journal];
      if (!prog?.run) return { ...state, journal };
      const first = !prog.run.stepsDone.includes('quest');
      const stepsDone = STEP_ORDER.filter((s) => s === 'quest' || prog.run!.stepsDone.includes(s));
      return {
        ...state,
        journal,
        xp: state.xp + (first ? XP_QUEST : 0),
        activity: first ? addActivityXp(state, action.entry.dateKey, XP_QUEST) : state.activity,
        stages: {
          ...state.stages,
          [action.stageId]: { ...prog, run: { ...prog.run, stepsDone, questSaved: true } },
        },
      };
    }

    case 'FINISH_STAGE': {
      const prog = state.stages[action.stageId];
      if (!prog?.run) return state;
      const { stars, accuracy, masteryRatio } = computeStars(prog.run);
      const xpGained = XP_STAGE + stars * XP_STAR;
      const result: StageResult = {
        stars,
        xpGained,
        accuracy,
        skills: prog.run.skills,
        hints: prog.run.hints,
        masteryRatio,
        questSaved: prog.run.questSaved,
        wordsBefore: prog.run.wordsBefore,
        completedAt: action.now,
      };
      return {
        ...state,
        xp: state.xp + xpGained,
        activity: addActivityXp(state, action.dateKey, xpGained),
        stages: {
          ...state.stages,
          [action.stageId]: {
            completed: true,
            stars: Math.max(prog.stars, stars) as 0 | 1 | 2 | 3,
            plays: prog.plays + 1,
            run: null,
            lastResult: result,
          },
        },
      };
    }

    case 'COLLECT_CULTURE': {
      if (state.cultures.includes(action.cultureId)) return state;
      return {
        ...state,
        cultures: [...state.cultures, action.cultureId],
        journal: [action.entry, ...state.journal],
      };
    }

    case 'ADD_NOTE':
      return { ...state, journal: [action.entry, ...state.journal] };

    case 'DELETE_ENTRY':
      return { ...state, journal: state.journal.filter((e) => e.id !== action.id) };

    case 'TICK': {
      const day = state.activity[action.dateKey] ?? { seconds: 0, xp: 0 };
      return {
        ...state,
        activity: { ...state.activity, [action.dateKey]: { ...day, seconds: day.seconds + action.seconds } },
      };
    }

    case 'RESET':
      return { ...initialState(), settings: state.settings };

    default:
      return state;
  }
}

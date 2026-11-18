import { BADGES } from '../data/badges';
import { REGIONS, previousRegion } from '../data/regions';
import { STAGES, getStage } from '../data/stages';
import type { Region, StageStub } from '../data/types';
import { STEP_ORDER, type StepKind } from '../data/types';
import { SCRIPTS, type ScriptId } from '../data/scripts';
import { ALL_ITEM_COST } from '../data/wardrobe';
import { levelInfo } from './levels';
import { addDays, dateKey, parseKey } from './dates';
import { emptyProgress, type GameState, type StageProgress, type WordLevel } from './gameState';

export type StageStatus = 'soon' | 'locked' | 'available' | 'current' | 'completed';

export function progressOf(state: GameState, stageId: string): StageProgress {
  return state.stages[stageId] ?? emptyProgress();
}

export function completedCount(state: GameState, region: Region): number {
  return region.stages.filter((s) => progressOf(state, s.id).completed).length;
}

export function starsIn(state: GameState, region: Region): number {
  return region.stages.reduce((sum, s) => sum + progressOf(state, s.id).stars, 0);
}

export interface RegionStatus {
  unlocked: boolean;
  completed: number;
  stars: number;
  maxStars: number;
  /** Lý do khoá (nếu bị khoá) */
  requirement: string | null;
}

export function regionStatus(state: GameState, region: Region): RegionStatus {
  const prev = previousRegion(region);
  const completed = completedCount(state, region);
  const stars = starsIn(state, region);
  const maxStars = region.stages.length * 3;
  if (!prev) return { unlocked: true, completed, stars, maxStars, requirement: null };
  const prevDone = completedCount(state, prev);
  const unlocked = prevDone >= prev.stages.length;
  return {
    unlocked,
    completed,
    stars,
    maxStars,
    requirement: unlocked ? null : `Hoàn thành ${prev.stages.length}/${prev.stages.length} stage của ${prev.name} (hiện ${prevDone}/${prev.stages.length})`,
  };
}

export function stageStatus(state: GameState, region: Region, stub: StageStub): StageStatus {
  const prog = progressOf(state, stub.id);
  if (prog.completed) return 'completed';
  if (stub.soon) return 'soon';
  if (!regionStatus(state, region).unlocked) return 'locked';
  if (stub.index > 1) {
    const prev = region.stages[stub.index - 2];
    if (!progressOf(state, prev.id).completed) return 'locked';
  }
  return prog.run ? 'current' : 'available';
}

/** Stage nên chơi tiếp theo: stage đang dở hoặc stage mở khoá đầu tiên chưa xong. */
export function nextStage(state: GameState): { regionId: string; stageId: string } | null {
  for (const region of REGIONS) {
    if (!regionStatus(state, region).unlocked) continue;
    for (const stub of region.stages) {
      const status = stageStatus(state, region, stub);
      if (status === 'current' || status === 'available') return { regionId: region.id, stageId: stub.id };
    }
  }
  return null;
}

/** Bước đầu tiên chưa xong của một lượt chơi (để "Tiếp tục"). */
export function firstUndoneStep(state: GameState, stageId: string): StepKind {
  const run = progressOf(state, stageId).run;
  if (!run) return 'story';
  return STEP_ORDER.find((s) => !run.stepsDone.includes(s)) ?? 'mastery';
}

export function totalStagesDone(state: GameState): number {
  return STAGES.filter((s) => progressOf(state, s.id).completed).length;
}

export function totalStars(state: GameState): number {
  return REGIONS.reduce((sum, r) => sum + starsIn(state, r), 0);
}

/** Số chữ đã thuộc (mức 2 trở lên) của một bảng chữ. */
export function scriptMastered(state: GameState, id: ScriptId): number {
  return SCRIPTS[id].glyphs.filter((g) => (state.scripts[g.id]?.level ?? 0) >= 2).length;
}

/** Sao thưởng từ luyện chữ: mỗi 10 chữ đã thuộc trong một bảng chữ được 1 sao. */
export function scriptStars(state: GameState): number {
  return (Object.keys(SCRIPTS) as ScriptId[]).reduce((sum, id) => sum + Math.floor(scriptMastered(state, id) / 10), 0);
}

/** Tổng sao kiếm được = sao ở các chặng + sao thưởng luyện chữ. */
export function earnedStars(state: GameState): number {
  return totalStars(state) + scriptStars(state);
}

/** Số sao đã tiêu để mở khoá đồ trong tủ đồ. */
export function starsSpent(state: GameState): number {
  return state.owned.reduce((sum, id) => sum + (ALL_ITEM_COST[id] ?? 0), 0);
}

/** Sao còn lại có thể tiêu = sao kiếm được − sao đã tiêu. */
export function starBalance(state: GameState): number {
  return Math.max(0, earnedStars(state) - starsSpent(state));
}

export function levelOfState(state: GameState): number {
  return levelInfo(state.xp).level;
}

/* ------------------------------------------------------------------ */
/* Từ vựng                                                              */
/* ------------------------------------------------------------------ */

export const WORD_LEVEL_LABEL: Record<WordLevel, { label: string; icon: string }> = {
  0: { label: 'Chưa gặp', icon: '·' },
  1: { label: 'Mới gặp', icon: '🌰' },
  2: { label: 'Đã hiểu', icon: '🌱' },
  3: { label: 'Tự dùng được', icon: '🌸' },
};

export function wordLevel(state: GameState, id: string): WordLevel {
  return state.words[id]?.level ?? 0;
}

export function countWordsAtLevel(state: GameState, level: WordLevel): number {
  return Object.values(state.words).filter((w) => w.level === level).length;
}

export function wordsNeedingReview(state: GameState): string[] {
  return Object.entries(state.words)
    .filter(([, w]) => w.wrong > w.correct || w.level <= 1)
    .map(([id]) => id);
}

/* ------------------------------------------------------------------ */
/* Hoạt động & chuỗi ngày                                               */
/* ------------------------------------------------------------------ */

export function activeDays(state: GameState): Set<string> {
  return new Set(
    Object.entries(state.activity)
      .filter(([, a]) => a.seconds > 0 || a.xp > 0)
      .map(([k]) => k),
  );
}

export function streak(state: GameState, today: Date = new Date()): number {
  const days = activeDays(state);
  let cursor = today;
  // Nếu hôm nay chưa học, chuỗi vẫn tính từ hôm qua.
  if (!days.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let count = 0;
  while (days.has(dateKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function secondsOnDays(state: GameState, keys: string[]): number {
  return keys.reduce((sum, k) => sum + (state.activity[k]?.seconds ?? 0), 0);
}

/* ------------------------------------------------------------------ */
/* Huy hiệu                                                             */
/* ------------------------------------------------------------------ */

export function computeBadges(state: GameState): Set<string> {
  const got = new Set<string>();
  const done = (id: string) => progressOf(state, id).completed;
  if (totalStagesDone(state) >= 1) got.add('first-steps');
  if (state.journal.some((e) => e.kind === 'quest' && e.stageId === 'saga-1')) got.add('letter-writer');
  if (done('saga-2')) got.add('breakfast');
  if (done('saga-3')) got.add('detective');
  if (done('saga-4')) got.add('paper-folder');
  if (STAGES.every((s) => done(s.id))) got.add('garden-keeper');
  if (state.cultures.length >= 5) got.add('culture-explorer');
  if (STAGES.some((s) => progressOf(state, s.id).stars === 3)) got.add('three-stars');
  if (streak(state) >= 3) got.add('streak-3');
  if (countWordsAtLevel(state, 3) >= 10) got.add('word-master');
  return got;
}

export function badgeCount(state: GameState): { got: number; total: number } {
  return { got: computeBadges(state).size, total: BADGES.length };
}

/* ------------------------------------------------------------------ */
/* Tuần                                                                 */
/* ------------------------------------------------------------------ */

export interface WeeklyGoal {
  id: string;
  label: string;
  icon: string;
  current: number;
  target: number;
}

export function weeklyGoals(state: GameState, keys: string[]): WeeklyGoal[] {
  const inWeek = new Set(keys);
  const questsDone = state.journal.filter((e) => e.kind === 'quest' && inWeek.has(e.dateKey)).length;
  const stagesDone = STAGES.filter((s) => {
    const r = progressOf(state, s.id).lastResult;
    return r && inWeek.has(dateKey(new Date(r.completedAt)));
  }).length;
  const culture = state.journal.filter((e) => e.kind === 'culture' && inWeek.has(e.dateKey)).length;
  const active = keys.filter((k) => (state.activity[k]?.seconds ?? 0) > 0 || (state.activity[k]?.xp ?? 0) > 0).length;
  return [
    { id: 'stages', label: 'Hoàn thành 2 stage', icon: '🗺️', current: Math.min(stagesDone, 2), target: 2 },
    { id: 'quests', label: 'Làm 2 nhiệm vụ ngoài đời', icon: '🧭', current: Math.min(questsDone, 2), target: 2 },
    { id: 'culture', label: 'Khám phá 2 điều về văn hóa Nhật', icon: '🏮', current: Math.min(culture, 2), target: 2 },
    { id: 'days', label: 'Học ít nhất 3 ngày', icon: '📅', current: Math.min(active, 3), target: 3 },
  ];
}

/** Stage chứa nhiệm vụ này (để "Mở nhiệm vụ" từ nhật ký). */
export function stageForQuest(questId: string): string | null {
  for (const s of STAGES) if (s.quest.id === questId) return s.id;
  return null;
}

export function stageTitle(stageId: string): string {
  try {
    return getStage(stageId).title;
  } catch {
    return stageId;
  }
}

export function weekdayIndex(key: string): number {
  return (parseKey(key).getDay() + 6) % 7;
}

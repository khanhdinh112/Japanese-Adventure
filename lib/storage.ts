import { initialState, type GameState } from './gameState';

const KEY = 'japanese-adventure:v1';

/** Đọc trạng thái đã lưu và trộn với giá trị mặc định để tương thích khi thêm trường mới. */
export function loadState(): GameState {
  const base = initialState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.version !== 1) return base;
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      skills: { ...base.skills, ...parsed.skills },
      stages: parsed.stages ?? {},
      words: parsed.words ?? {},
      journal: parsed.journal ?? [],
      cultures: parsed.cultures ?? [],
      activity: parsed.activity ?? {},
    };
  } catch {
    return base;
  }
}

/**
 * Ghi trạng thái. Ảnh trong nhật ký có thể làm đầy bộ nhớ, nên nếu lỗi vì quota
 * thì bỏ ảnh của các mục cũ nhất rồi thử lại.
 */
export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  let current = state;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(current));
      return;
    } catch {
      const idx = [...current.journal].reverse().findIndex((e) => e.image);
      if (idx === -1) return;
      const realIdx = current.journal.length - 1 - idx;
      current = {
        ...current,
        journal: current.journal.map((e, i) => (i === realIdx ? { ...e, image: undefined } : e)),
      };
    }
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* bỏ qua */
  }
}

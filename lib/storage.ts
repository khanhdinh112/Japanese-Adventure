import { initialState, type GameState } from './gameState';

const KEY = 'japanese-adventure:v1';

/** Trộn dữ liệu đã lưu (cục bộ hoặc từ cloud) với giá trị mặc định để tương thích khi thêm trường mới. */
export function normalizeState(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== 'object') return base;
  const parsed = raw as Partial<GameState>;
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
}

/** Đọc trạng thái chế độ khách từ localStorage. */
export function loadState(): GameState {
  if (typeof window === 'undefined') return initialState();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? normalizeState(JSON.parse(raw)) : initialState();
  } catch {
    return initialState();
  }
}

/**
 * Ghi JSON vào localStorage. Ảnh trong nhật ký có thể làm đầy bộ nhớ, nên nếu lỗi vì quota
 * thì bỏ ảnh của các mục cũ nhất rồi thử lại. Trả về false nếu vẫn không ghi được.
 */
function writeWithFallback(key: string, state: GameState, wrap: (s: GameState) => unknown): boolean {
  if (typeof window === 'undefined') return false;
  let current = state;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      window.localStorage.setItem(key, JSON.stringify(wrap(current)));
      return true;
    } catch {
      const idx = [...current.journal].reverse().findIndex((e) => e.image);
      if (idx === -1) return false;
      const realIdx = current.journal.length - 1 - idx;
      current = {
        ...current,
        journal: current.journal.map((e, i) => (i === realIdx ? { ...e, image: undefined } : e)),
      };
    }
  }
  return false;
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* bỏ qua */
  }
}

function readString(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Ghi trạng thái chế độ khách. */
export function saveState(state: GameState): void {
  writeWithFallback(KEY, state, (s) => s);
}

export function clearState(): void {
  remove(KEY);
}

/* ---------------- Chế độ khách ---------------- */

const GUEST_KEY = 'japanese-adventure:guest';

export function isGuestChosen(): boolean {
  return readString(GUEST_KEY) === '1';
}

export function setGuestChosen(on: boolean): void {
  if (on) {
    try {
      window.localStorage.setItem(GUEST_KEY, '1');
    } catch {
      /* bỏ qua */
    }
  } else remove(GUEST_KEY);
}

/** Có tiến trình khách (đã tạo nhân vật) trên máy này không? */
export function hasGuestProgress(): boolean {
  return loadState().profile !== null;
}

/* ---------------- Bản lưu tạm của hồ sơ bé (khi dùng tài khoản) ---------------- */

export interface ChildCache {
  state: GameState;
  /** updated_at của bản cloud mà bản lưu tạm này xây trên đó */
  base: string | null;
  /** true = có thay đổi chưa đẩy lên cloud */
  dirty: boolean;
}

const childKey = (id: string) => `japanese-adventure:child:${id}`;

export function loadChildCache(id: string): ChildCache | null {
  const raw = readString(childKey(id));
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<ChildCache>;
    return { state: normalizeState(p.state), base: p.base ?? null, dirty: Boolean(p.dirty) };
  } catch {
    return null;
  }
}

export function saveChildCache(id: string, state: GameState, base: string | null, dirty: boolean): void {
  writeWithFallback(childKey(id), state, (s) => ({ state: s, base, dirty }));
}

export function clearChildCache(id: string): void {
  remove(childKey(id));
}

const activeKey = (userId: string) => `japanese-adventure:active:${userId}`;

export function loadActiveChild(userId: string): string | null {
  return readString(activeKey(userId));
}

export function saveActiveChild(userId: string, childId: string | null): void {
  if (childId) {
    try {
      window.localStorage.setItem(activeKey(userId), childId);
    } catch {
      /* bỏ qua */
    }
  } else remove(activeKey(userId));
}

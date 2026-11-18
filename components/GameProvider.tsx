'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { getStage } from '../data/stages';
import { createChild, deleteChild, fetchChild, listChildren, pushChild, type ChildSummary } from '../lib/cloud';
import type { SkillKind, StepKind } from '../data/types';
import { dateKey } from '../lib/dates';
import {
  initialState,
  reducer,
  type GameState,
  type JournalEntry,
  type PlayerLook,
  type Profile,
  type Settings,
} from '../lib/gameState';
import { defaultTransition, type Route, type TransitionKind, type TransitionSpec } from '../lib/routes';
import { setSfxEnabled } from '../lib/sfx';
import { stopSpeaking } from '../lib/speech';
import {
  clearChildCache,
  clearState,
  hasGuestProgress,
  isGuestChosen,
  loadActiveChild,
  loadChildCache,
  loadState,
  saveActiveChild,
  saveChildCache,
  saveState,
  setGuestChosen,
} from '../lib/storage';
import { authEnabled, viError } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { resolveText } from '../lib/text';

/** Thời gian (ms) màn hình cũ tan đi trước khi đổi màn hình mới, theo từng kiểu chuyển cảnh. */
const OUT_MS: Record<TransitionKind, number> = { fade: 320, zoom: 520, wash: 560 };
const IN_MS: Record<TransitionKind, number> = { fade: 480, zoom: 700, wash: 700 };

export interface TransitionPhase {
  kind: TransitionKind;
  origin?: { x: number; y: number };
  stage: 'out' | 'in';
}

/** guest = chơi không tài khoản (lưu trên máy) · account = phụ huynh đã đăng nhập · none = cần chọn đăng nhập hoặc chơi thử */
export type PlayMode = 'guest' | 'account' | 'none';
export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface GameApi {
  state: GameState;
  hydrated: boolean;
  mode: PlayMode;
  /** Đang tải tiến trình của một bé từ cloud */
  loadingChild: boolean;
  /** Danh sách hồ sơ bé của tài khoản (null = chưa tải) */
  childList: ChildSummary[] | null;
  /** Lỗi gần nhất khi làm việc với hồ sơ bé (đã Việt hoá) */
  childError: string | null;
  /** id bé đang chơi; 'new' = bé mới chưa tạo nhân vật; null = chưa chọn */
  activeChildId: string | null;
  syncStatus: SyncStatus;
  refreshChildren: () => Promise<void>;
  /** true nếu tải được tiến trình của bé */
  selectChild: (id: string) => Promise<boolean>;
  startNewChild: () => void;
  removeChild: (id: string) => Promise<void>;
  /** Lưu nốt tiến trình rồi quay về màn chọn bé */
  leaveChild: () => Promise<void>;
  /** Lưu nốt tiến trình rồi đăng xuất */
  logout: () => Promise<void>;
  playAsGuest: () => void;
  /** Chuyển tiến trình khách trên máy này vào tài khoản thành một bé mới */
  importGuestProgress: () => Promise<boolean>;
  guestHasProgress: boolean;
  route: Route;
  phase: TransitionPhase | null;
  go: (next: Route, spec?: Partial<TransitionSpec>) => void;
  /** Thay chỗ giữ chỗ {name} … bằng thông tin của bé */
  t: (text: string) => string;

  createProfile: (profile: Profile) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setLook: (look: PlayerLook) => void;
  unlockItem: (itemId: string) => void;
  setTourSeen: (seen: boolean) => void;
  recordScripts: (results: { id: string; correct: boolean }[], roundDone: boolean) => void;
  startStage: (stageId: string, restart?: boolean) => void;
  seeWords: (wordIds: string[]) => void;
  answer: (stageId: string, skill: SkillKind, correct: boolean, wordIds: string[], independent?: boolean) => void;
  useHint: (stageId: string) => void;
  completeStep: (stageId: string, step: StepKind) => void;
  saveQuest: (stageId: string, entry: Omit<JournalEntry, 'id' | 'date' | 'dateKey' | 'kind' | 'stageId'>) => void;
  finishStage: (stageId: string) => void;
  collectCulture: (cultureId: string, stageId: string, title: string, text: string, icon: string) => void;
  addNote: (text: string, image?: string) => void;
  deleteEntry: (id: string) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame phải được dùng bên trong <GameProvider>');
  return ctx;
}

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'welcome' });
  const [phase, setPhase] = useState<TransitionPhase | null>(null);

  const routeRef = useRef(route);
  routeRef.current = route;
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const [guestChosen, setGuestState] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [childList, setChildList] = useState<ChildSummary[] | null>(null);
  const [childError, setChildError] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [guestHasProgress, setGuestHasProgress] = useState(false);

  const mode: PlayMode = userId ? 'account' : guestChosen || !authEnabled ? 'guest' : 'none';

  /* Tham chiếu cho phần đồng bộ cloud */
  const stateRef = useRef(state);
  stateRef.current = state;
  /** Bản tiến trình đã khớp với cloud (hoặc vừa nạp từ cloud) — không cần đẩy lại. */
  const syncedRef = useRef<GameState | null>(null);
  /** updated_at của bản cloud gần nhất mà ta biết */
  const baseRef = useRef<string | null>(null);
  /** Bé mà `state` hiện thuộc về */
  const childIdRef = useRef<string | null>(null);
  const pushing = useRef(false);
  const pushAgain = useRef(false);
  const creating = useRef(false);
  const pushTimer = useRef<number | null>(null);
  const retryTimer = useRef<number | null>(null);

  const clearPushTimers = () => {
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    if (retryTimer.current) window.clearTimeout(retryTimer.current);
    pushTimer.current = null;
    retryTimer.current = null;
  };

  /** Đẩy tiến trình của bé hiện tại lên cloud (nếu có thay đổi). */
  const flush = useCallback(async (): Promise<void> => {
    clearPushTimers();
    const id = childIdRef.current;
    if (!id) return;
    if (pushing.current) {
      pushAgain.current = true;
      return;
    }
    const snap = stateRef.current;
    if (snap === syncedRef.current) return;
    pushing.current = true;
    setSyncStatus('saving');
    try {
      const updated = await pushChild(id, snap);
      if (childIdRef.current === id) {
        baseRef.current = updated;
        syncedRef.current = snap;
        saveChildCache(id, stateRef.current, updated, stateRef.current !== snap);
        setSyncStatus('saved');
      }
    } catch {
      setSyncStatus('error');
      retryTimer.current = window.setTimeout(() => void flushRef.current(), 15000);
    } finally {
      pushing.current = false;
      if (pushAgain.current) {
        pushAgain.current = false;
        void flushRef.current();
      }
    }
  }, []);
  const flushRef = useRef(flush);
  flushRef.current = flush;

  /** Đặt lại về trạng thái trống, giữ cài đặt âm thanh/romaji. */
  const blank = useCallback((): GameState => ({ ...initialState(), settings: stateRef.current.settings }), []);

  const detachChild = useCallback(() => {
    clearPushTimers();
    childIdRef.current = null;
    baseRef.current = null;
    const fresh = blank();
    syncedRef.current = fresh;
    dispatch({ type: 'HYDRATE', state: fresh });
  }, [blank]);

  const refreshChildren = useCallback(async () => {
    try {
      setChildList(await listChildren());
      setChildError(null);
    } catch (e) {
      setChildError(viError(e));
    }
  }, []);

  /* --- khởi động: biết phiên đăng nhập rồi mới nạp tiến trình --- */
  useEffect(() => {
    if (!auth.ready) return;
    let alive = true;
    clearPushTimers();
    childIdRef.current = null;
    setActiveChildId(null);
    setChildError(null);
    setSyncStatus('idle');
    setGuestHasProgress(authEnabled ? hasGuestProgress() : false);
    if (userId) {
      const fresh = initialState();
      syncedRef.current = fresh;
      dispatch({ type: 'HYDRATE', state: fresh });
      setChildList(null);
      setHydrated(true);
      (async () => {
        try {
          const list = await listChildren();
          if (!alive) return;
          setChildList(list);
          const last = loadActiveChild(userId);
          if (last && list.some((c) => c.id === last)) await selectRef.current(last);
        } catch (e) {
          if (alive) setChildError(viError(e));
        }
      })();
    } else {
      const guest = isGuestChosen() || !authEnabled;
      setGuestState(guest);
      setChildList(null);
      const loaded = guest ? loadState() : initialState();
      syncedRef.current = loaded;
      dispatch({ type: 'HYDRATE', state: loaded });
      setRoute((r) => (r.name === 'welcome' || guest ? r : { name: 'welcome' }));
      setHydrated(true);
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.ready, userId]);

  const selectChild = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false;
      setLoadingChild(true);
      setChildError(null);
      try {
        const row = await fetchChild(id);
        const cache = loadChildCache(id);
        const useCache = Boolean(cache && cache.dirty && cache.base === row.updatedAt);
        const st = useCache && cache ? cache.state : row.state;
        clearPushTimers();
        childIdRef.current = id;
        baseRef.current = row.updatedAt;
        syncedRef.current = useCache ? null : st;
        dispatch({ type: 'HYDRATE', state: st });
        setActiveChildId(id);
        saveActiveChild(userId, id);
        setSyncStatus('idle');
        return true;
      } catch (e) {
        setChildError(viError(e));
        return false;
      } finally {
        setLoadingChild(false);
      }
    },
    [userId],
  );
  const selectRef = useRef(selectChild);
  selectRef.current = selectChild;

  const startNewChild = useCallback(() => {
    detachChild();
    setActiveChildId('new');
    setChildError(null);
  }, [detachChild]);

  const leaveChild = useCallback(async () => {
    await flushRef.current();
    detachChild();
    setActiveChildId(null);
    if (userId) saveActiveChild(userId, null);
    void refreshChildren();
  }, [detachChild, userId, refreshChildren]);

  const removeChild = useCallback(
    async (id: string) => {
      try {
        if (id === childIdRef.current) {
          detachChild();
          setActiveChildId(null);
          if (userId) saveActiveChild(userId, null);
        }
        await deleteChild(id);
        clearChildCache(id);
        setChildError(null);
        await refreshChildren();
      } catch (e) {
        setChildError(viError(e));
      }
    },
    [detachChild, userId, refreshChildren],
  );

  const logout = useCallback(async () => {
    await flushRef.current();
    await auth.signOut();
  }, [auth]);

  const playAsGuest = useCallback(() => {
    setGuestChosen(true);
    setGuestState(true);
    const loaded = loadState();
    syncedRef.current = loaded;
    dispatch({ type: 'HYDRATE', state: loaded });
  }, []);

  const importGuestProgress = useCallback(async (): Promise<boolean> => {
    const guest = loadState();
    if (!guest.profile) return false;
    try {
      await createChild(guest);
      clearState();
      setGuestChosen(false);
      setGuestHasProgress(false);
      await refreshChildren();
      setChildError(null);
      return true;
    } catch (e) {
      setChildError(viError(e));
      return false;
    }
  }, [refreshChildren]);

  /* --- lưu: khách → localStorage; tài khoản → bản lưu tạm + cloud --- */
  useEffect(() => {
    if (!hydrated || mode !== 'guest') return;
    const id = window.setTimeout(() => saveState(state), 250);
    return () => window.clearTimeout(id);
  }, [state, hydrated, mode]);

  useEffect(() => {
    if (!hydrated || mode !== 'account') return;

    /* Bé mới: tạo hàng trên cloud ngay khi nhân vật được tạo */
    if (activeChildId === 'new') {
      if (state.profile && !creating.current) {
        creating.current = true;
        const snap = state;
        createChild(snap)
          .then((row) => {
            childIdRef.current = row.id;
            baseRef.current = row.updatedAt;
            syncedRef.current = snap;
            setActiveChildId(row.id);
            if (userId) saveActiveChild(userId, row.id);
            setChildList((l) => (l ? [...l, row] : l));
            setSyncStatus('saved');
          })
          .catch((e) => {
            setChildError(viError(e));
            setSyncStatus('error');
          })
          .finally(() => {
            creating.current = false;
          });
      }
      return;
    }

    const id = childIdRef.current;
    if (!id || id !== activeChildId || state === syncedRef.current) return;
    const cacheTimer = window.setTimeout(() => saveChildCache(id, state, baseRef.current, true), 250);
    clearPushTimers();
    pushTimer.current = window.setTimeout(() => void flushRef.current(), 1500);
    return () => window.clearTimeout(cacheTimer);
  }, [state, hydrated, mode, activeChildId, userId]);

  /* Rời tab / đóng trang: đẩy ngay những gì còn lại */
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flushRef.current();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    };
  }, []);

  useEffect(() => {
    setSfxEnabled(state.settings.sound);
  }, [state.settings.sound]);

  /* --- đếm thời gian học (chỉ khi tab đang hiện và đã vào game) --- */
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      const name = routeRef.current.name;
      if (document.visibilityState !== 'visible' || name === 'welcome' || name === 'create' || name === 'auth' || name === 'profiles') return;
      dispatch({ type: 'TICK', seconds: 5, dateKey: dateKey() });
    }, 5000);
    return () => window.clearInterval(id);
  }, [hydrated]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  /* --- điều hướng có chuyển cảnh --- */
  const go = useCallback((next: Route, spec: Partial<TransitionSpec> = {}) => {
    if (busy.current) return;
    stopSpeaking();
    const kind = spec.kind ?? defaultTransition(routeRef.current, next);
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setRoute(next);
      return;
    }
    busy.current = true;
    setPhase({ kind, origin: spec.origin, stage: 'out' });
    timers.current.push(
      window.setTimeout(() => {
        setRoute(next);
        setPhase({ kind, origin: spec.origin, stage: 'in' });
        timers.current.push(
          window.setTimeout(() => {
            setPhase(null);
            busy.current = false;
          }, IN_MS[kind]),
        );
      }, OUT_MS[kind]),
    );
  }, []);

  /* --- hành động --- */
  const api = useMemo<GameApi>(() => {
    const now = () => new Date();
    return {
      state,
      hydrated,
      mode,
      loadingChild,
      childList,
      childError,
      activeChildId,
      syncStatus,
      refreshChildren,
      selectChild,
      startNewChild,
      removeChild,
      leaveChild,
      logout,
      playAsGuest,
      importGuestProgress,
      guestHasProgress,
      route,
      phase,
      go,
      t: (text) => resolveText(text, state.profile),

      createProfile: (profile) => dispatch({ type: 'CREATE_PROFILE', profile }),
      setSettings: (patch) => dispatch({ type: 'SET_SETTINGS', patch }),
      setLook: (look) => dispatch({ type: 'SET_LOOK', look }),
      unlockItem: (itemId) => dispatch({ type: 'UNLOCK_ITEM', itemId }),
      setTourSeen: (seen) => dispatch({ type: 'SET_TOUR_SEEN', seen }),
      recordScripts: (results, roundDone) => dispatch({ type: 'SCRIPT_RESULT', results, roundDone, dateKey: dateKey() }),
      startStage: (stageId, restart) =>
        dispatch({ type: 'START_STAGE', stageId, wordIds: getStage(stageId).wordIds, restart }),
      seeWords: (wordIds) => dispatch({ type: 'SEE_WORDS', wordIds }),
      answer: (stageId, skill, correct, wordIds, independent) =>
        dispatch({ type: 'ANSWER', stageId, skill, correct, wordIds, independent }),
      useHint: (stageId) => dispatch({ type: 'USE_HINT', stageId }),
      completeStep: (stageId, step) => dispatch({ type: 'COMPLETE_STEP', stageId, step, dateKey: dateKey() }),
      saveQuest: (stageId, entry) => {
        const d = now();
        dispatch({
          type: 'SAVE_QUEST',
          stageId,
          entry: { ...entry, id: newId('q'), kind: 'quest', stageId, date: d.toISOString(), dateKey: dateKey(d) },
        });
      },
      finishStage: (stageId) => {
        const d = now();
        dispatch({ type: 'FINISH_STAGE', stageId, dateKey: dateKey(d), now: d.toISOString() });
      },
      collectCulture: (cultureId, stageId, title, text, icon) => {
        const d = now();
        dispatch({
          type: 'COLLECT_CULTURE',
          cultureId,
          entry: {
            id: newId('c'),
            kind: 'culture',
            stageId,
            date: d.toISOString(),
            dateKey: dateKey(d),
            title,
            text,
            icon,
          },
        });
      },
      addNote: (text, image) => {
        const d = now();
        dispatch({
          type: 'ADD_NOTE',
          entry: {
            id: newId('n'),
            kind: 'note',
            date: d.toISOString(),
            dateKey: dateKey(d),
            title: 'Ghi chú của mình',
            text,
            image,
            icon: '✏️',
          },
        });
      },
      deleteEntry: (id) => dispatch({ type: 'DELETE_ENTRY', id }),
      resetProgress: () => {
        if (mode === 'guest') clearState();
        dispatch({ type: 'RESET' });
      },
    };
  }, [
    state,
    hydrated,
    mode,
    loadingChild,
    childList,
    childError,
    activeChildId,
    syncStatus,
    refreshChildren,
    selectChild,
    startNewChild,
    removeChild,
    leaveChild,
    logout,
    playAsGuest,
    importGuestProgress,
    guestHasProgress,
    route,
    phase,
    go,
  ]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

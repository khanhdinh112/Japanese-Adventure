'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { getStage } from '../data/stages';
import type { SkillKind, StepKind } from '../data/types';
import { dateKey } from '../lib/dates';
import {
  initialState,
  reducer,
  type GameState,
  type JournalEntry,
  type Profile,
  type Settings,
} from '../lib/gameState';
import { defaultTransition, type Route, type TransitionKind, type TransitionSpec } from '../lib/routes';
import { setSfxEnabled } from '../lib/sfx';
import { stopSpeaking } from '../lib/speech';
import { clearState, loadState, saveState } from '../lib/storage';
import { resolveText } from '../lib/text';

/** Thời gian (ms) màn hình cũ tan đi trước khi đổi màn hình mới, theo từng kiểu chuyển cảnh. */
const OUT_MS: Record<TransitionKind, number> = { fade: 320, zoom: 520, wash: 560 };
const IN_MS: Record<TransitionKind, number> = { fade: 480, zoom: 700, wash: 700 };

export interface TransitionPhase {
  kind: TransitionKind;
  origin?: { x: number; y: number };
  stage: 'out' | 'in';
}

export interface GameApi {
  state: GameState;
  hydrated: boolean;
  route: Route;
  phase: TransitionPhase | null;
  go: (next: Route, spec?: Partial<TransitionSpec>) => void;
  /** Thay chỗ giữ chỗ {name} … bằng thông tin của bé */
  t: (text: string) => string;

  createProfile: (profile: Profile) => void;
  setSettings: (patch: Partial<Settings>) => void;
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

  /* --- nạp & lưu --- */
  useEffect(() => {
    dispatch({ type: 'HYDRATE', state: loadState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => saveState(state), 250);
    return () => window.clearTimeout(id);
  }, [state, hydrated]);

  useEffect(() => {
    setSfxEnabled(state.settings.sound);
  }, [state.settings.sound]);

  /* --- đếm thời gian học (chỉ khi tab đang hiện và đã vào game) --- */
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      const name = routeRef.current.name;
      if (document.visibilityState !== 'visible' || name === 'welcome' || name === 'create') return;
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
  const stateRef = useRef(state);
  stateRef.current = state;

  const api = useMemo<GameApi>(() => {
    const now = () => new Date();
    return {
      state,
      hydrated,
      route,
      phase,
      go,
      t: (text) => resolveText(text, state.profile),

      createProfile: (profile) => dispatch({ type: 'CREATE_PROFILE', profile }),
      setSettings: (patch) => dispatch({ type: 'SET_SETTINGS', patch }),
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
        clearState();
        dispatch({ type: 'RESET' });
      },
    };
  }, [state, hydrated, route, phase, go]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

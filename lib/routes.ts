import type { StepKind } from '../data/types';

export type Route =
  | { name: 'welcome' }
  | { name: 'auth' }
  | { name: 'profiles' }
  | { name: 'create' }
  | { name: 'world' }
  | { name: 'region'; regionId: string }
  | { name: 'stage'; stageId: string; step: StepKind }
  | { name: 'results'; stageId: string }
  | { name: 'journal' }
  | { name: 'parent' }
  | { name: 'letters' }
  | { name: 'admin' };

export type TransitionKind = 'fade' | 'zoom' | 'wash';

export interface TransitionSpec {
  kind: TransitionKind;
  /** Điểm gốc của hiệu ứng zoom (toạ độ canvas 1920×1080) */
  origin?: { x: number; y: number };
}

export function routeKey(r: Route): string {
  switch (r.name) {
    case 'region':
      return `region:${r.regionId}`;
    case 'stage':
      return `stage:${r.stageId}:${r.step}`;
    case 'results':
      return `results:${r.stageId}`;
    default:
      return r.name;
  }
}

/** Hiệu ứng chuyển mặc định theo cặp màn hình. */
export function defaultTransition(from: Route, to: Route): TransitionKind {
  if (to.name === 'stage' && to.step === 'story' && from.name !== 'stage') return 'wash';
  if (to.name === 'results') return 'wash';
  if (from.name === 'world' && to.name === 'region') return 'zoom';
  if (from.name === 'region' && to.name === 'world') return 'fade';
  return 'fade';
}

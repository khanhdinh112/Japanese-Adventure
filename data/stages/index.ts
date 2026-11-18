import type { StageContent } from '../types';
import { stage1 } from './stage1';
import { stage2 } from './stage2';
import { stage3 } from './stage3';
import { stage4 } from './stage4';
import { stage5 } from './stage5';
import { stage6 } from './stage6';
import { stage7 } from './stage7';
import { stage8 } from './stage8';
import { stage9 } from './stage9';
import { stage10 } from './stage10';

/** Mười chặng của làng Saga (Chương 1). Thêm chương mới chỉ cần import thêm vào đây. */
export const STAGES: StageContent[] = [stage1, stage2, stage3, stage4, stage5, stage6, stage7, stage8, stage9, stage10];

export const STAGE_BY_ID: Record<string, StageContent> = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export function getStage(id: string): StageContent {
  const s = STAGE_BY_ID[id];
  if (!s) throw new Error(`Unknown stage id: ${id}`);
  return s;
}

export const CHAPTER_ONE = {
  id: 'chapter-1',
  title: 'Ngôi nhà của bà Osano',
  titleJp: 'おばあちゃんの いえ',
  stageIds: STAGES.map((s) => s.id),
};

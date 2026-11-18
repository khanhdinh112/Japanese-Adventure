'use client';

import { STAGE_BY_ID } from '../../data/stages';
import type { StepKind } from '../../data/types';
import { progressOf } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { GrammarScreen } from './GrammarScreen';
import { ListeningScreen } from './ListeningScreen';
import { MasteryScreen } from './MasteryScreen';
import { QuestScreen } from './QuestScreen';
import { StoryScreen } from './StoryScreen';
import { VocabularyScreen } from './VocabularyScreen';

/** Chọn màn hình theo chặng hiện tại. Chỉ hiển thị khi stage đang có lượt chơi (run). */
export function StageScreen({ stageId, step }: { stageId: string; step: StepKind }) {
  const { state } = useGame();
  const stage = STAGE_BY_ID[stageId];
  const run = progressOf(state, stageId).run;
  if (!stage || !run) return null;
  switch (step) {
    case 'story':
      return <StoryScreen stage={stage} />;
    case 'vocab':
      return <VocabularyScreen stage={stage} />;
    case 'grammar':
      return <GrammarScreen stage={stage} />;
    case 'listening':
      return <ListeningScreen stage={stage} />;
    case 'quest':
      return <QuestScreen stage={stage} />;
    case 'mastery':
      return <MasteryScreen stage={stage} />;
  }
}

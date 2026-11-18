'use client';

import type { StageContent } from '../../data/types';
import { useGame } from '../GameProvider';
import { QuestPanel } from '../QuestPanel';
import { StageShell } from './StageShell';

export function QuestScreen({ stage }: { stage: StageContent }) {
  const { go } = useGame();
  return (
    <StageShell stage={stage} step="quest">
      <QuestPanel stage={stage} onDone={() => go({ name: 'stage', stageId: stage.id, step: 'mastery' }, { kind: 'fade' })} />
    </StageShell>
  );
}

'use client';

import { STEP_META, STEP_ORDER, type StepKind } from '../../data/types';
import { firstUndoneStep, progressOf } from '../../lib/selectors';
import { useGame } from '../GameProvider';

/** Thanh sáu chặng của một stage; chỉ cho quay lại các chặng đã mở. */
export function StepProgress({ stageId, current }: { stageId: string; current: StepKind }) {
  const { state, go } = useGame();
  const run = progressOf(state, stageId).run;
  const frontier = firstUndoneStep(state, stageId);
  const frontierIdx = STEP_ORDER.indexOf(frontier);
  return (
    <ol className="steps" aria-label="Các chặng của stage">
      {STEP_ORDER.map((step, i) => {
        const done = !!run?.stepsDone.includes(step);
        const open = i <= frontierIdx || done;
        const meta = STEP_META[step];
        return (
          <li key={step}>
            <button
              type="button"
              className={`step${step === current ? ' current' : ''}${done ? ' done' : ''}`}
              disabled={!open || step === current}
              onClick={() => go({ name: 'stage', stageId, step }, { kind: 'fade' })}
              title={meta.label}
            >
              <span className="step-ic" aria-hidden>
                {done ? '✓' : meta.icon}
              </span>
              <span className="step-tx">{meta.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

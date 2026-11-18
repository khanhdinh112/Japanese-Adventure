'use client';

import { useEffect } from 'react';
import { CULTURE } from '../../data/culture';
import { playSfx } from '../../lib/sfx';
import { CultureCard } from '../LearningCard';
import { useGame } from '../GameProvider';

/** Khám phá văn hóa ngắn; có thể thu thập vào nhật ký (mỗi mục chỉ một lần). */
export function CultureOverlay({ cultureId, stageId, onDone }: { cultureId: string; stageId: string; onDone: () => void }) {
  const { state, collectCulture } = useGame();
  const note = CULTURE[cultureId];
  const collected = state.cultures.includes(cultureId);

  useEffect(() => {
    playSfx('page');
  }, []);

  if (!note) {
    onDone();
    return null;
  }

  return (
    <div className="overlay overlay-culture">
      <div className="culture-wrap">
        <CultureCard note={note}>
          {collected ? (
            <span className="saved-note">✅ Đã có trong nhật ký</span>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => collectCulture(cultureId, stageId, note.title, `${note.body}\n\n${note.fact}`, note.icon)}
            >
              📔 Thu thập vào nhật ký
            </button>
          )}
          <button type="button" className="btn btn-primary btn-lg" onClick={onDone}>
            Tiếp tục câu chuyện ▶
          </button>
        </CultureCard>
      </div>
    </div>
  );
}

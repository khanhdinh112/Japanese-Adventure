'use client';

import { useState } from 'react';
import type { ChoiceBeat, Word } from '../../data/types';
import { useGame } from '../GameProvider';
import { SpeakButton } from '../ui/SpeakButton';

interface Props {
  beat: ChoiceBeat;
  wrong: number[];
  right: number | null;
  words: Word[];
  onChoose: (index: number) => void;
}

/** Lựa chọn lời nói: bé đọc/nghe ba câu rồi chọn câu hợp tình huống. */
export function ChoicePanel({ beat, wrong, right, onChoose }: Props) {
  const { state, t } = useGame();
  const [peek, setPeek] = useState(false);
  // Nghĩa tiếng Việt ẩn mặc định; hiện khi bé chạm "Xem nghĩa", hoặc sau khi đã chọn đúng
  const showVi = state.settings.meaning || peek || right !== null;
  return (
    <div className="choice">
      <p className="choice-q">{t(beat.question)}</p>
      {!showVi && (
        <button type="button" className="meaning-btn choice-peek" onClick={() => setPeek(true)}>
          💡 Xem nghĩa các câu
        </button>
      )}
      <div className="choice-opts">
        {beat.options.map((o, i) => {
          const isWrong = wrong.includes(i);
          const isRight = right === i;
          return (
            <div key={i} className={`choice-opt${isWrong ? ' wrong' : ''}${isRight ? ' right' : ''}`}>
              <button type="button" className="choice-btn" disabled={isWrong || right !== null} onClick={() => onChoose(i)}>
                <span className="co-jp" lang="ja">
                  {t(o.jp)}
                </span>
                {state.settings.romaji && <span className="co-ro">{t(o.romaji)}</span>}
                {showVi && <span className="co-vi">{t(o.vi)}</span>}
              </button>
              <SpeakButton text={t(o.jp)} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

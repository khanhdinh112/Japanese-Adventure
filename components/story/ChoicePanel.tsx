'use client';

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
  return (
    <div className="choice">
      <p className="choice-q">{t(beat.question)}</p>
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
                <span className="co-vi">{t(o.vi)}</span>
              </button>
              <SpeakButton text={t(o.jp)} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

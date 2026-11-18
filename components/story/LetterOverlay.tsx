'use client';

import { useEffect, useState } from 'react';
import type { LetterBeat } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { useGame } from '../GameProvider';
import { SpeakButton } from '../ui/SpeakButton';

/** Lá thư của bà Hana: từng dòng hiện ra, chạm vào chữ để nghe, đọc hết mới sang cảnh sau. */
export function LetterOverlay({ beat, onDone }: { beat: LetterBeat; onDone: () => void }) {
  const { state, t } = useGame();
  const [count, setCount] = useState(1);
  const last = count >= beat.lines.length;

  useEffect(() => {
    playSfx('page');
  }, []);

  return (
    <div className="overlay overlay-letter">
      <div className="letter" role="document">
        <div className="letter-seal" aria-hidden>
          🌸
        </div>
        <div className="letter-from">
          <small>Gửi từ làng Saga</small>
          <b lang="ja">はなおばあちゃん より</b>
        </div>
        <div className="letter-lines">
          {beat.lines.slice(0, count).map((line, i) => (
            <div className="letter-line" key={i}>
              <div className="ll-jp" lang="ja">
                {t(line.jp)}
                <SpeakButton text={t(line.jp)} size="sm" />
              </div>
              {state.settings.romaji && <div className="ll-ro">{t(line.romaji)}</div>}
              <div className="ll-vi">{t(line.vi)}</div>
            </div>
          ))}
        </div>
        <div className="letter-actions">
          {!last ? (
            <button type="button" className="btn btn-primary" onClick={() => setCount((c) => c + 1)}>
              Đọc tiếp ▼
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={onDone} autoFocus>
              Gấp thư lại ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

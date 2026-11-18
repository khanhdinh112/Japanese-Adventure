'use client';

import { useEffect, useState } from 'react';
import type { LetterBeat } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { useGame } from '../GameProvider';
import { Meaning } from '../ui/Meaning';
import { SpeakButton } from '../ui/SpeakButton';
import { useSpeech } from '../ui/useSpeech';

/** Lá thư của bà Osano: từng dòng hiện ra, chạm vào chữ để nghe, đọc hết mới sang cảnh sau. */
export function LetterOverlay({ beat, onDone }: { beat: LetterBeat; onDone: () => void }) {
  const { state, t } = useGame();
  const { canSpeak, play, stop } = useSpeech();
  const [count, setCount] = useState(1);
  const last = count >= beat.lines.length;

  useEffect(() => {
    playSfx('page');
  }, []);

  // Tự đọc từng dòng thư mới hiện ra (nếu bật giọng đọc và máy có giọng Nhật)
  useEffect(() => {
    if (!state.settings.voice || !canSpeak) return;
    const line = beat.lines[count - 1];
    if (!line) return;
    const id = window.setTimeout(() => play(t(line.jp)), 350);
    return () => {
      window.clearTimeout(id);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, canSpeak, state.settings.voice]);

  return (
    <div className="overlay overlay-letter">
      <div className="letter" role="document">
        <div className="letter-seal" aria-hidden>
          🌸
        </div>
        <div className="letter-from">
          <small lang="ja">さがの さと から</small>
          <b lang="ja">おさのばあちゃん より</b>
        </div>
        <div className="letter-lines">
          {beat.lines.slice(0, count).map((line, i) => (
            <div className="letter-line" key={i}>
              <div className="ll-jp" lang="ja">
                {t(line.jp)}
                <SpeakButton text={t(line.jp)} size="sm" />
              </div>
              {state.settings.romaji && <div className="ll-ro">{t(line.romaji)}</div>}
              <Meaning text={t(line.vi)} className="ll-vi" resetKey={`${i}-${line.jp}`} />
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

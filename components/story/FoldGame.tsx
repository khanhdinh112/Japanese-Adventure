'use client';

import { useEffect, useState } from 'react';
import type { FoldBeat, ReplyLine, ShapeKey, Word } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { DialogueBox } from '../DialogueBox';
import { useGame } from '../GameProvider';
import { PaperShape } from '../ui/PaperShape';
import { SpeakButton } from '../ui/SpeakButton';

interface Props {
  stageId: string;
  beat: FoldBeat;
  words: Word[];
  onLine: (line: ReplyLine | null) => void;
  onTalking: (talking: boolean) => void;
  onDone: () => void;
}

/** Gấp mèo giấy theo lời hướng dẫn tiếng Nhật của bà Osano: nghe/đọc rồi chọn hình giấy đúng. */
export function FoldGame({ stageId, beat, words, onLine, onTalking, onDone }: Props) {
  const { answer, t } = useGame();
  const [step, setStep] = useState(0);
  const [paper, setPaper] = useState<ShapeKey>('square');
  const [wrong, setWrong] = useState<string[]>([]);
  const [ok, setOk] = useState<string | null>(null);
  const [reading, setReading] = useState(true);
  const [shake, setShake] = useState(0);

  const cur = beat.steps[step];
  const line: ReplyLine = { speaker: 'hana', jp: cur.say.jp, romaji: cur.say.romaji, vi: cur.say.vi, emotion: 'happy' };

  useEffect(() => {
    onLine(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const choose = (id: string) => {
    if (ok) return;
    if (id === cur.answerId) {
      playSfx('good');
      answer(stageId, 'vocab', wrong.length === 0, []);
      setOk(id);
      setPaper(cur.result);
      window.setTimeout(() => {
        if (step + 1 >= beat.steps.length) {
          onDone();
        } else {
          setStep((s) => s + 1);
          setWrong([]);
          setOk(null);
          setReading(true);
        }
      }, 1300);
    } else {
      playSfx('bad');
      if (wrong.length === 0) answer(stageId, 'vocab', false, []);
      setWrong((w) => [...w, id]);
      setShake((n) => n + 1);
    }
  };

  return (
    <>
      <div className="fold">
        <div className="fold-table" key={paper}>
          <PaperShape shape={paper} size={300} className={`fold-paper${ok ? ' folded' : ''}`} />
          <div className="fold-step">
            Bước {step + 1}/{beat.steps.length}
          </div>
        </div>
        {!reading && (
          <div className="fold-panel">
            <p className="fold-say">
              <span lang="ja">{t(cur.say.jp)}</span>
              <SpeakButton text={t(cur.say.jp)} size="sm" />
            </p>
            <p className="fold-vi">{t(cur.say.vi)}</p>
            <div className="fold-opts" key={shake}>
              {cur.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`fold-opt${wrong.includes(o.id) ? ' wrong' : ''}${ok === o.id ? ' right' : ''}`}
                  disabled={wrong.includes(o.id) || !!ok}
                  onClick={() => choose(o.id)}
                >
                  <PaperShape shape={o.shape} size={120} />
                  <span lang="ja">{o.label}</span>
                </button>
              ))}
            </div>
            {wrong.length > 0 && !ok && <p className="fold-miss">Chưa đúng rồi. Nghe lại lời bà Osano và thử hình khác nhé!</p>}
            {ok && <p className="fold-good">できた! Giấy đã gấp đúng 🌸</p>}
          </div>
        )}
      </div>
      {reading && (
        <DialogueBox
          key={step}
          speaker="hana"
          jp={line.jp}
          romaji={line.romaji}
          vi={line.vi}
          words={words}
          onTalking={onTalking}
          onNext={() => setReading(false)}
          nextLabel="Chọn hình"
        />
      )}
      {step === 0 && reading && <div className="fold-intro">{t(beat.intro)}</div>}
    </>
  );
}

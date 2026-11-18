'use client';

import { useEffect, useState } from 'react';
import type { StageContent } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { useGame } from '../GameProvider';
import { MasteryFeedback } from '../MasteryFeedback';
import { SpeakButton } from '../ui/SpeakButton';
import { useSpeech } from '../ui/useSpeech';
import { StageShell } from './StageShell';

/** Thử thách nghe: nghe câu tiếng Nhật rồi chọn hình đúng. Máy không có giọng Nhật → hiện chữ và không tính vào điểm "Nghe". */
export function ListeningScreen({ stage }: { stage: StageContent }) {
  const { state, t, go, answer, completeStep } = useGame();
  const { canSpeak, play } = useSpeech();
  const items = stage.listening;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [plays, setPlays] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const item = items[i];

  useEffect(() => {
    if (!canSpeak || done) return;
    const id = window.setTimeout(() => {
      play(t(item.audio));
      setPlays((p) => p + 1);
    }, 500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, canSpeak, done]);

  // Gợi ý: bước 1 đọc chậm và hiện phiên âm; bước 2 bớt một đáp án sai
  const removed = hintLevel >= 2 ? item.options.find((o) => o.id !== item.answerId)?.id : undefined;
  const showHint = () => {
    if (hintLevel === 0 && canSpeak) play(t(item.audio), 0.6);
    setHintLevel((l) => l + 1);
  };

  const choose = (id: string) => {
    if (picked) return;
    const ok = id === item.answerId;
    playSfx(ok ? 'good' : 'bad');
    answer(stage.id, canSpeak ? 'listening' : 'vocab', ok, item.wordIds);
    if (ok) setScore((s) => s + 1);
    setPicked(id);
  };

  const next = () => {
    if (i + 1 >= items.length) {
      completeStep(stage.id, 'listening');
      playSfx('star');
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
      setPlays(0);
      setHintLevel(0);
    }
  };

  return (
    <StageShell stage={stage} step="listening">
      {!done ? (
        <div className="listen paper">
          <div className="quiz-head">
            <span className="pill">
              Nghe {i + 1}/{items.length}
            </span>
            {!canSpeak && <span className="pill pill-warn">Máy chưa có giọng Nhật — mình hiện chữ thay thế</span>}
          </div>
          <p className="quiz-q">{t(item.question)}</p>
          <div className="listen-player">
            <button
              type="button"
              className="bigplay"
              onClick={() => {
                play(t(item.audio));
                setPlays((p) => p + 1);
              }}
              aria-label="Nghe câu"
              disabled={!canSpeak}
            >
              <span aria-hidden>🔊</span>
              <b>{canSpeak ? 'Nghe câu' : 'Không có âm thanh'}</b>
            </button>
            <SpeakButton text={t(item.audio)} slow size="lg" label="Chậm hơn" />
            {(!canSpeak || (hintLevel >= 1 && !picked)) && (
              <div className="listen-text">
                {!canSpeak && <span lang="ja">{t(item.audio)}</span>}
                <small>{t(item.romaji)}</small>
              </div>
            )}
            {canSpeak && plays > 1 && !picked && <span className="muted">Bạn đã nghe {plays} lần</span>}
          </div>
          <div className="listen-opts">
            {item.options.map((o) => {
              const gone = o.id === removed && !picked;
              const cls = picked ? (o.id === item.answerId ? ' right' : o.id === picked ? ' wrong' : ' faded') : gone ? ' faded' : '';
              return (
                <button key={o.id} type="button" className={`listen-opt${cls}`} disabled={!!picked || gone} onClick={() => choose(o.id)}>
                  <span className="lo-ic" aria-hidden>
                    {o.icon}
                  </span>
                  <span className="lo-label">{t(o.label)}</span>
                </button>
              );
            })}
          </div>
          {!picked && hintLevel >= 0 && (
            <div className="qhint">
              {hintLevel >= 1 && <p className="qhint-box">💡 Mình đã đọc chậm và hiện phiên âm. Hãy nối âm với nghĩa của từ khoá nhé.</p>}
              {hintLevel < 2 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={showHint}>
                  {hintLevel === 0 ? '💡 Gợi ý (nghe chậm + phiên âm)' : '💡 Gợi ý thêm (bớt một đáp án sai)'}
                </button>
              )}
            </div>
          )}
          {picked && (
            <MasteryFeedback
              tone={picked === item.answerId ? 'correct' : 'wrong'}
              title={picked === item.answerId ? 'Tai nghe tốt quá!' : 'Nghe lại một chút nhé'}
              jp={item.audio}
              romaji={item.romaji}
              vi={item.vi}
              nextLabel={i + 1 >= items.length ? 'Xong phần nghe' : 'Câu tiếp'}
              onNext={next}
            >
              {t(item.explain)}
            </MasteryFeedback>
          )}
        </div>
      ) : (
        <div className="stepdone paper">
          <div className="sd-ic" aria-hidden>
            👂
          </div>
          <h2>Đôi tai của bạn giỏi lắm!</h2>
          <p>
            Bạn nghe đúng {score}/{items.length} câu. Tiếp theo là nhiệm vụ ngoài đời: mang tiếng Nhật ra khỏi màn hình!
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => go({ name: 'stage', stageId: stage.id, step: 'quest' }, { kind: 'fade' })}>
            Nhận nhiệm vụ ▶
          </button>
        </div>
      )}
    </StageShell>
  );
}

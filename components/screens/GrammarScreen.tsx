'use client';

import { useEffect, useState } from 'react';
import type { PatternTile, StageContent } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { CharacterSprite } from '../CharacterSprite';
import { useGame } from '../GameProvider';
import { LearningCard } from '../LearningCard';
import { MasteryFeedback } from '../MasteryFeedback';
import { SentenceBuilder, type BuilderStatus } from '../ui/SentenceBuilder';
import { SpeakButton } from '../ui/SpeakButton';
import { useSpeech } from '../ui/useSpeech';
import { StageShell } from './StageShell';

const HAS_JP = /[\u3040-\u30ff\u4e00-\u9faf]/;
const BLANK = '＿＿';

/** Câu có chỗ trống: gạch chân trống thay cho ＿＿. */
function Sentence({ text }: { text: string }) {
  const { t } = useGame();
  const parts = t(text).split(BLANK);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className="qs-blank" aria-label="chỗ trống" />}
        </span>
      ))}
    </>
  );
}

function Tiles({ tiles }: { tiles: PatternTile[] }) {
  const { t } = useGame();
  return (
    <div className="ptiles">
      {tiles.map((p, i) => (
        <span key={i} className={`ptile ptile-${p.role}`}>
          <b lang="ja">{t(p.text)}</b>
          <small>{p.label}</small>
        </span>
      ))}
    </div>
  );
}

/** Chặng ngữ pháp: Momo giảng → kiểm tra nhanh → xếp câu. */
export function GrammarScreen({ stage }: { stage: StageContent }) {
  const g = stage.grammar;
  const { state, t, go, answer, useHint: bumpHint, completeStep } = useGame();
  const [page, setPage] = useState<'explain' | 'check' | 'build' | 'done'>('explain');

  /* kiểm tra nhanh */
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const { canSpeak, play, stop } = useSpeech();

  /* xếp câu */
  const [pi, setPi] = useState(0);
  const [status, setStatus] = useState<BuilderStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const [reset, setReset] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const quick = g.quick[qi];
  const practice = g.practice[pi];

  // Đọc to câu của mỗi câu hỏi (chỗ trống là một quãng nghỉ); đọc lại câu đầy đủ sau khi bé trả lời
  const speakText = quick ? t(picked !== null ? (quick.full ?? quick.jp ?? '') : (quick.jp ?? '').split(BLANK).join('、')) : '';
  useEffect(() => {
    if (page !== 'check' || !speakText || !state.settings.voice || !canSpeak) return;
    const id = window.setTimeout(() => play(speakText), 450);
    return () => {
      window.clearTimeout(id);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, qi, picked !== null, canSpeak, state.settings.voice]);

  // Gợi ý bước 2: tự loại một đáp án sai
  const removed = hintLevel >= 2 && quick ? quick.options.findIndex((_, i) => i !== quick.answer) : -1;

  const chooseQuick = (i: number) => {
    if (picked !== null) return;
    const ok = i === quick.answer;
    playSfx(ok ? 'good' : 'bad');
    answer(stage.id, 'grammar', ok, g.wordIds);
    if (ok) setFirstTry((n) => n + 1);
    setPicked(i);
  };

  const nextQuick = () => {
    if (qi + 1 >= g.quick.length) setPage('build');
    else {
      setQi(qi + 1);
      setPicked(null);
      setHintLevel(0);
    }
  };

  const submit = ({ correct }: { correct: boolean; hintUsed: boolean }) => {
    if (!recorded) {
      answer(stage.id, 'grammar', correct, g.wordIds);
      setRecorded(true);
    }
    playSfx(correct ? 'good' : 'bad');
    setAttempt((a) => a + 1);
    setStatus(correct ? 'correct' : 'wrong');
  };

  const nextPractice = () => {
    if (pi + 1 >= g.practice.length) {
      completeStep(stage.id, 'grammar');
      playSfx('star');
      setPage('done');
    } else {
      setPi(pi + 1);
      setStatus('idle');
      setAttempt(0);
      setRecorded(false);
    }
  };

  return (
    <StageShell stage={stage} step="grammar">
      {page === 'explain' && (
        <div className="grammar">
          <section className="gr-momo">
            <div className="gr-momo-sprite">
              <CharacterSprite id="momo" variant="bust" emotion="thinking" />
            </div>
            <div className="gr-bubbles">
              {g.momoSays.map((s, i) => (
                <p key={i} className="bubble" style={{ animationDelay: `${i * 0.35}s` }}>
                  {t(s)}
                </p>
              ))}
            </div>
          </section>
          <section className="gr-main">
            <header className="gr-title">
              <h2>{g.title}</h2>
              <small lang="ja">{g.titleJp}</small>
            </header>
            <div className="gr-formula paper">
              <h4>Công thức</h4>
              {g.formula.map((row, i) => (
                <Tiles key={i} tiles={row} />
              ))}
            </div>
            <div className="gr-examples">
              {g.examples.map((ex, i) => (
                <div key={i} className="gr-ex paper">
                  <Tiles tiles={ex.parts} />
                  <div className="gr-ex-line">
                    <span lang="ja">{t(ex.jp)}</span>
                    <SpeakButton text={t(ex.jp)} size="sm" />
                  </div>
                  {state.settings.romaji && <div className="gr-ex-ro">{t(ex.romaji)}</div>}
                  <div className="gr-ex-vi">{t(ex.vi)}</div>
                </div>
              ))}
            </div>
            <div className="gr-notes">
              <LearningCard variant="grammar" icon="💡" title="Mẹo nhớ">
                <p>{t(g.tip)}</p>
              </LearningCard>
              <LearningCard variant="grammar" icon="⚠️" title="Để ý nhé">
                <p>{t(g.watchOut)}</p>
              </LearningCard>
            </div>
            <div className="gr-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setPage('check')}>
                Kiểm tra nhanh ▶
              </button>
            </div>
          </section>
        </div>
      )}

      {page === 'check' && (
        <div className="quiz paper">
          <div className="quiz-head">
            <span className="pill">
              Kiểm tra nhanh {qi + 1}/{g.quick.length}
            </span>
          </div>
          <p className="quiz-q">{t(quick.question)}</p>
          {quick.jp && (
            <div className="qs">
              <div className="qs-jp" lang="ja">
                {picked !== null && quick.full ? t(quick.full) : <Sentence text={quick.jp} />}
                <SpeakButton text={speakText} size="md" />
              </div>
              {state.settings.romaji && (quick.romaji || quick.fullRomaji) && <div className="qs-ro">{t(picked !== null && quick.fullRomaji ? quick.fullRomaji : (quick.romaji ?? ''))}</div>}
            </div>
          )}
          <div className="quiz-opts quiz-opts-text">
            {quick.options.map((o, i) => {
              const gone = i === removed && picked === null;
              const cls = picked !== null ? (i === quick.answer ? ' right' : i === picked ? ' wrong' : ' faded') : gone ? ' faded' : '';
              const ro = quick.optionRomaji?.[i];
              return (
                <div key={i} className="qopt">
                  <button type="button" className={`quiz-opt${cls}`} lang="ja" disabled={picked !== null || gone} onClick={() => chooseQuick(i)}>
                    <span>{t(o)}</span>
                    {state.settings.romaji && ro && <small className="qopt-ro">{ro}</small>}
                  </button>
                  {HAS_JP.test(o) && <SpeakButton text={t(o)} size="sm" />}
                </div>
              );
            })}
          </div>
          {picked === null && (
            <div className="qhint">
              {hintLevel >= 1 && <p className="qhint-box">💡 {t(quick.hint)}</p>}
              {hintLevel < 2 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHintLevel((l) => l + 1)}>
                  {hintLevel === 0 ? '💡 Gợi ý' : '💡 Gợi ý thêm (bớt một đáp án sai)'}
                </button>
              )}
            </div>
          )}
          {picked !== null && (
            <MasteryFeedback
              tone={picked === quick.answer ? 'correct' : 'wrong'}
              title={picked === quick.answer ? 'Chính xác!' : 'Chưa đúng, nhưng mình hiểu vì sao rồi'}
              jp={quick.full}
              romaji={quick.fullRomaji}
              vi={quick.fullVi}
              nextLabel={qi + 1 >= g.quick.length ? 'Sang phần xếp câu' : 'Câu tiếp'}
              onNext={nextQuick}
            >
              {t(quick.explain)}
            </MasteryFeedback>
          )}
          <span hidden>{firstTry}</span>
        </div>
      )}

      {page === 'build' && (
        <div className="quiz paper build">
          <div className="quiz-head">
            <span className="pill">
              Xếp câu {pi + 1}/{g.practice.length}
            </span>
            <span className="muted">Chạm các khối để ghép câu đúng</span>
          </div>
          <p className="quiz-q">{t(practice.prompt)}</p>
          <SentenceBuilder
            key={`${pi}`}
            seed={`${stage.id}-g${pi}`}
            answer={practice.answer}
            alts={practice.alts}
            distractors={practice.distractors}
            hint={practice.hint}
            onHint={() => bumpHint(stage.id)}
            onSubmit={submit}
            status={status}
            resetSignal={reset}
            locked={status === 'correct' || (status === 'wrong' && attempt >= 2)}
          />
          {status === 'correct' && (
            <MasteryFeedback
              tone="correct"
              title="Câu rất tự nhiên!"
              jp={practice.answer.join('')}
              romaji={practice.romaji}
              vi={practice.meaning}
              nextLabel={pi + 1 >= g.practice.length ? 'Hoàn thành ngữ pháp' : 'Câu tiếp'}
              onNext={nextPractice}
            />
          )}
          {status === 'wrong' && attempt < 2 && (
            <MasteryFeedback
              tone="retry"
              title="Chưa khớp lắm"
              onRetry={() => {
                setStatus('idle');
                setReset((r) => r + 1);
              }}
            >
              Hãy đọc lại công thức ở trên rồi xếp lại. Bạn có thể bấm “Gợi ý” nếu cần.
            </MasteryFeedback>
          )}
          {status === 'wrong' && attempt >= 2 && (
            <MasteryFeedback
              tone="wrong"
              title="Đáp án mẫu nè"
              jp={practice.answer.join('')}
              romaji={practice.romaji}
              vi={practice.meaning}
              nextLabel={pi + 1 >= g.practice.length ? 'Hoàn thành ngữ pháp' : 'Câu tiếp'}
              onNext={nextPractice}
            >
              Không sao, lần sau sẽ nhớ hơn. Đọc to câu mẫu một lần nhé.
            </MasteryFeedback>
          )}
        </div>
      )}

      {page === 'done' && (
        <div className="stepdone paper">
          <div className="sd-ic" aria-hidden>
            🧩
          </div>
          <h2>Bạn đã nắm mẫu câu “{g.title}”!</h2>
          <p>Bây giờ hãy lắng tai nghe, vì bà Hana sắp nói thật nhanh đấy.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => go({ name: 'stage', stageId: stage.id, step: 'listening' }, { kind: 'fade' })}>
            Sang phần nghe ▶
          </button>
        </div>
      )}
    </StageShell>
  );
}

'use client';

import { useState } from 'react';
import type { PatternTile, StageContent } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { CharacterSprite } from '../CharacterSprite';
import { useGame } from '../GameProvider';
import { LearningCard } from '../LearningCard';
import { MasteryFeedback } from '../MasteryFeedback';
import { SentenceBuilder, type BuilderStatus } from '../ui/SentenceBuilder';
import { SpeakButton } from '../ui/SpeakButton';
import { StageShell } from './StageShell';

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

  /* xếp câu */
  const [pi, setPi] = useState(0);
  const [status, setStatus] = useState<BuilderStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const [reset, setReset] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const quick = g.quick[qi];
  const practice = g.practice[pi];

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
          <div className="quiz-opts quiz-opts-text">
            {quick.options.map((o, i) => {
              const cls = picked !== null ? (i === quick.answer ? ' right' : i === picked ? ' wrong' : ' faded') : '';
              return (
                <button key={i} type="button" className={`quiz-opt${cls}`} lang="ja" disabled={picked !== null} onClick={() => chooseQuick(i)}>
                  {t(o)}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <MasteryFeedback
              tone={picked === quick.answer ? 'correct' : 'wrong'}
              title={picked === quick.answer ? 'Chính xác!' : 'Chưa đúng, nhưng mình hiểu vì sao rồi'}
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

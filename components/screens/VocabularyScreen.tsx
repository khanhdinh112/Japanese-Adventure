'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StageContent, Word } from '../../data/types';
import { getWord } from '../../data/words';
import { wordLevel } from '../../lib/selectors';
import { playSfx } from '../../lib/sfx';
import { useGame } from '../GameProvider';
import { LevelBadge, WordCard } from '../LearningCard';
import { MasteryFeedback } from '../MasteryFeedback';
import { SpeakButton } from '../ui/SpeakButton';
import { StageShell } from './StageShell';

interface Question {
  word: Word;
  options: Word[];
}

function buildQuestions(words: Word[]): Question[] {
  return words.map((word, i) => {
    const others = words.filter((w) => w.id !== word.id);
    const pick = [others[(i * 2) % others.length], others[(i * 2 + 3) % others.length]].filter(
      (w, k, arr) => w && arr.findIndex((x) => x.id === w.id) === k,
    );
    const options = [word, ...pick];
    // xoay vị trí đáp án theo chỉ số để không luôn nằm ở ô đầu
    const shift = i % options.length;
    return { word, options: [...options.slice(shift), ...options.slice(0, shift)] };
  });
}

/** Chặng từ vựng: làm quen từng thẻ rồi kiểm tra nhanh bằng hình + nghĩa. */
export function VocabularyScreen({ stage }: { stage: StageContent }) {
  const { state, go, seeWords, answer, completeStep } = useGame();
  const words = useMemo(() => stage.wordIds.map(getWord), [stage]);
  const questions = useMemo(() => buildQuestions(words), [words]);

  const [phase, setPhase] = useState<'learn' | 'quiz' | 'done'>('learn');
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(() => new Set([words[0].id]));
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    seeWords([words[i].id]);
    setSeen((s) => new Set(s).add(words[i].id));
  }, [i, words, seeWords]);

  const word = words[i];
  const allSeen = seen.size >= words.length;
  const q = questions[qi];

  const choose = (opt: Word) => {
    if (picked) return;
    const ok = opt.id === q.word.id;
    playSfx(ok ? 'good' : 'bad');
    answer(stage.id, 'vocab', ok, [q.word.id]);
    if (ok) setScore((s) => s + 1);
    setPicked(opt.id);
  };

  const nextQuestion = () => {
    if (qi + 1 >= questions.length) {
      completeStep(stage.id, 'vocab');
      playSfx('star');
      setPhase('done');
    } else {
      setQi(qi + 1);
      setPicked(null);
    }
  };

  return (
    <StageShell stage={stage} step="vocab">
      {phase === 'learn' && (
        <div className="vocab">
          <div className="vocab-card-wrap">
            <WordCard word={word} level={wordLevel(state, word.id)} />
            <div className="vocab-nav">
              <button type="button" className="btn btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
                ◀ Từ trước
              </button>
              <span className="muted">
                {i + 1}/{words.length}
              </span>
              {i + 1 < words.length ? (
                <button type="button" className="btn btn-primary" onClick={() => setI(i + 1)}>
                  Từ tiếp ▶
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-lg" disabled={!allSeen} onClick={() => setPhase('quiz')}>
                  Thử tài nhớ ✨
                </button>
              )}
            </div>
          </div>
          <aside className="vocab-list paper">
            <h3>Từ của chặng này</h3>
            <ul>
              {words.map((w, k) => (
                <li key={w.id}>
                  <button type="button" className={`vl-item${k === i ? ' on' : ''}${seen.has(w.id) ? ' seen' : ''}`} onClick={() => setI(k)}>
                    <span className="vl-ic" aria-hidden>
                      {w.icon}
                    </span>
                    <span className="vl-jp" lang="ja">
                      {w.jp}
                    </span>
                    <span className="vl-vi">{w.vi}</span>
                  </button>
                </li>
              ))}
            </ul>
            {!allSeen && <p className="muted">Xem hết các thẻ để mở phần thử tài nhớ.</p>}
            {allSeen && i + 1 < words.length && (
              <button type="button" className="btn btn-ghost btn-block" onClick={() => setPhase('quiz')}>
                Mình nhớ rồi — thử luôn ✨
              </button>
            )}
          </aside>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="quiz paper">
          <div className="quiz-head">
            <span className="pill">
              Câu {qi + 1}/{questions.length}
            </span>
            <span className="muted">Chọn nghĩa đúng của từ</span>
          </div>
          <div className="quiz-word">
            <span lang="ja" className="qw-jp">
              {q.word.jp}
            </span>
            <SpeakButton text={q.word.jp} size="lg" label="Nghe" />
          </div>
          <div className="quiz-opts">
            {q.options.map((o) => {
              const state2 = picked ? (o.id === q.word.id ? ' right' : o.id === picked ? ' wrong' : ' faded') : '';
              return (
                <button key={o.id} type="button" className={`quiz-opt${state2}`} disabled={!!picked} onClick={() => choose(o)}>
                  <span className="qo-ic" aria-hidden>
                    {o.icon}
                  </span>
                  <span>{o.vi}</span>
                </button>
              );
            })}
          </div>
          {picked && (
            <MasteryFeedback
              tone={picked === q.word.id ? 'correct' : 'wrong'}
              title={picked === q.word.id ? 'Đúng rồi!' : 'Gần đúng rồi!'}
              jp={q.word.example.jp}
              romaji={q.word.example.romaji}
              vi={q.word.example.vi}
              nextLabel={qi + 1 >= questions.length ? 'Xong' : 'Câu tiếp'}
              onNext={nextQuestion}
            >
              {picked === q.word.id ? (
                <>
                  <b lang="ja">{q.word.jp}</b> nghĩa là “{q.word.vi}”.
                </>
              ) : (
                <>
                  <b lang="ja">{q.word.jp}</b> nghĩa là “{q.word.vi}”. {q.word.memo}
                </>
              )}
            </MasteryFeedback>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="stepdone paper">
          <div className="sd-ic" aria-hidden>
            🌸
          </div>
          <h2>Bộ sưu tập từ vựng đã đầy!</h2>
          <p>
            Bạn nhớ đúng {score}/{questions.length} từ ngay lần đầu. Những từ chưa chắc sẽ quay lại ở phần sau để mình ôn tiếp.
          </p>
          <div className="sd-words">
            {words.map((w) => (
              <span key={w.id} className="sd-word">
                <span aria-hidden>{w.icon}</span>
                <b lang="ja">{w.jp}</b>
                <LevelBadge level={wordLevel(state, w.id)} />
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => go({ name: 'stage', stageId: stage.id, step: 'grammar' }, { kind: 'fade' })}>
            Sang ngữ pháp ▶
          </button>
        </div>
      )}
    </StageShell>
  );
}

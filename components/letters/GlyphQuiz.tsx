'use client';

import { useMemo, useState } from 'react';
import type { Glyph, ScriptId } from '../../data/scripts';
import type { ScriptProgress } from '../../lib/gameState';
import { playSfx } from '../../lib/sfx';
import { SpeakButton } from '../ui/SpeakButton';
import { useSpeech } from '../ui/useSpeech';

type Kind = 'read' | 'pick' | 'listen';
interface Q {
  glyph: Glyph;
  kind: Kind;
  options: Glyph[];
}

const ROUND = 5;

function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Chọn chữ cần ôn: ưu tiên chữ chưa thuộc. */
function pickGlyphs(glyphs: Glyph[], progress: Record<string, ScriptProgress>): Glyph[] {
  const weighted = glyphs.map((g) => ({ g, w: 4 - (progress[g.id]?.level ?? 0) + Math.random() * 2 }));
  return weighted.sort((a, b) => b.w - a.w).slice(0, ROUND).map((x) => x.g);
}

export function GlyphQuiz({
  script,
  glyphs,
  progress,
  onFinish,
  onClose,
}: {
  script: ScriptId;
  glyphs: Glyph[];
  progress: Record<string, ScriptProgress>;
  onFinish: (results: { id: string; correct: boolean }[]) => void;
  onClose: () => void;
}) {
  const { canSpeak } = useSpeech();
  const questions = useMemo<Q[]>(() => {
    const kinds: Kind[] = canSpeak ? ['read', 'pick', 'listen'] : ['read', 'pick'];
    return shuffle(pickGlyphs(glyphs, progress)).map((g, i) => {
      const others = shuffle(glyphs.filter((x) => x.id !== g.id && (script === 'kanji' ? true : x.read !== g.read))).slice(0, 3);
      return { glyph: g, kind: kinds[i % kinds.length], options: shuffle([g, ...others]) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const q = questions[i];
  const label = (g: Glyph) => (script === 'kanji' ? g.meaning ?? g.read : g.read);

  const choose = (g: Glyph) => {
    if (picked || !q) return;
    setPicked(g.id);
    const ok = g.id === q.glyph.id;
    playSfx(ok ? 'good' : 'bad');
    const next = [...results, { id: q.glyph.id, correct: ok }];
    setResults(next);
    window.setTimeout(() => {
      if (i + 1 >= questions.length) {
        setDone(true);
        onFinish(next);
      } else {
        setI(i + 1);
        setPicked(null);
      }
    }, ok ? 900 : 1700);
  };

  if (done) {
    const right = results.filter((r) => r.correct).length;
    return (
      <div className="quiz-done">
        <h3>{right >= 4 ? 'Giỏi quá!' : right >= 2 ? 'Khá lắm!' : 'Cố lên nhé!'}</h3>
        <p className="quiz-score">
          {right}/{results.length} câu đúng
        </p>
        <p className="muted">Những chữ trả lời đúng sẽ được nhớ thêm. Chơi lại để thuộc hơn nữa.</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
          Xong ▶
        </button>
      </div>
    );
  }
  if (!q) return null;

  const prompt =
    q.kind === 'read' ? (
      <>
        <span className="quiz-q">Chữ này đọc là gì?</span>
        <b className="quiz-glyph" lang="ja">{q.glyph.ch}</b>
      </>
    ) : q.kind === 'pick' ? (
      <>
        <span className="quiz-q">{script === 'kanji' ? 'Chữ nào có nghĩa là' : 'Chữ nào đọc là'}</span>
        <b className="quiz-glyph quiz-text">{label(q.glyph)}</b>
      </>
    ) : (
      <>
        <span className="quiz-q">Nghe và chọn chữ đúng</span>
        <SpeakButton text={script === 'kanji' ? q.glyph.wordKana : q.glyph.ch} size="lg" />
      </>
    );
  const showChars = q.kind !== 'read';

  return (
    <div className="quiz">
      <div className="quiz-head">
        <small>
          Câu {i + 1}/{questions.length}
        </small>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Thoát
        </button>
      </div>
      <div className="quiz-prompt">{prompt}</div>
      <div className="quiz-opts">
        {q.options.map((o) => {
          const state = picked ? (o.id === q.glyph.id ? 'right' : o.id === picked ? 'wrong' : '') : '';
          return (
            <button key={o.id} type="button" className={`quiz-opt ${state}`} onClick={() => choose(o)} disabled={!!picked}>
              {showChars ? <span lang="ja" className="qo-ch">{o.ch}</span> : <span className="qo-tx">{label(o)}</span>}
            </button>
          );
        })}
      </div>
      {picked && picked !== q.glyph.id && (
        <p className="quiz-fix">
          Đáp án đúng: <b lang="ja">{q.glyph.ch}</b> đọc là <b>{label(q.glyph)}</b>
        </p>
      )}
    </div>
  );
}

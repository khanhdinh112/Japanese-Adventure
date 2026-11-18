'use client';

import { useMemo, useState } from 'react';
import { SCRIPTS, type Glyph, type ScriptId } from '../../data/scripts';
import { scriptMastered } from '../../lib/selectors';
import { SceneArt } from '../art/SceneArt';
import { GlyphQuiz } from '../letters/GlyphQuiz';
import { TraceCanvas } from '../letters/TraceCanvas';
import { useGame } from '../GameProvider';
import { SpeakButton } from '../ui/SpeakButton';
import { TopBar } from '../ui/TopBar';

const ORDER: ScriptId[] = ['hiragana', 'katakana', 'kanji'];

function Level({ level }: { level: number }) {
  return (
    <span className="lv" aria-label={`Mức thuộc ${level} trên 3`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= level ? 'on' : ''} />
      ))}
    </span>
  );
}

/** Góc luyện chữ: bảng Hiragana, Katakana, Kanji, tập viết và trò chơi nhận mặt chữ. */
export function LettersScreen() {
  const { state, go, recordScripts } = useGame();
  const [script, setScript] = useState<ScriptId>('hiragana');
  const [sel, setSel] = useState<Glyph>(SCRIPTS.hiragana.glyphs[0]);
  const [mode, setMode] = useState<'view' | 'write' | 'quiz'>('view');
  const [written, setWritten] = useState<string | null>(null);
  const data = SCRIPTS[script];
  const mastered = scriptMastered(state, script);
  const nextStar = 10 - (mastered % 10);

  const groups = useMemo(() => {
    const m = new Map<string, Glyph[]>();
    data.glyphs.forEach((g) => m.set(g.row, [...(m.get(g.row) ?? []), g]));
    return [...m.entries()];
  }, [data]);

  const pick = (g: Glyph) => {
    setSel(g);
    setWritten(null);
    if (mode === 'quiz') setMode('view');
  };
  const progress = state.scripts[sel.id];

  return (
    <div className="letters">
      <div className="journal-bg" aria-hidden>
        <SceneArt scene="engawa" />
      </div>
      <div className="journal-wash" aria-hidden />
      <TopBar title="Góc luyện chữ" titleJp="もじの れんしゅう" onBack={() => go({ name: 'world' }, { kind: 'wash' })} backLabel="Bản đồ" />

      <div className="letters-grid">
        <section className="paper lt-list">
          <div className="lt-tabs" role="tablist">
            {ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={script === id}
                className={`lt-tab${script === id ? ' on' : ''}`}
                onClick={() => {
                  setScript(id);
                  setSel(SCRIPTS[id].glyphs[0]);
                  setMode('view');
                  setWritten(null);
                }}
              >
                <b lang="ja">{SCRIPTS[id].sample}</b>
                <span>{SCRIPTS[id].label}</span>
              </button>
            ))}
          </div>
          <p className="lt-hint">{data.hint}</p>
          <p className="lt-prog">
            Đã thuộc <b>{mastered}</b>/{data.glyphs.length} chữ · còn <b>{nextStar}</b> chữ nữa để nhận ⭐
          </p>
          <div className="lt-table">
            {groups.map(([row, items]) => (
              <div key={row} className={`lt-row${script === 'kanji' ? ' lt-row-kanji' : ''}`}>
                {script === 'kanji' && <h4>{row}</h4>}
                <div className="lt-cells">
                  {items.map((g) => {
                    const lv = state.scripts[g.id]?.level ?? 0;
                    return (
                      <button key={g.id} type="button" className={`lt-cell${sel.id === g.id ? ' on' : ''} lv${lv}`} onClick={() => pick(g)} aria-label={`${g.ch} đọc là ${g.read}`}>
                        <b lang="ja">{g.ch}</b>
                        <small>{script === 'kanji' ? g.meaning : g.read}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="paper lt-detail">
          {mode === 'quiz' ? (
            <GlyphQuiz
              key={script}
              script={script}
              glyphs={data.glyphs}
              progress={state.scripts}
              onFinish={(results) => recordScripts(results, true)}
              onClose={() => setMode('view')}
            />
          ) : (
            <>
              <div className="lt-seg seg">
                <button type="button" className={mode === 'view' ? 'on' : ''} onClick={() => setMode('view')}>
                  <b>👀 Xem chữ</b>
                </button>
                <button type="button" className={mode === 'write' ? 'on' : ''} onClick={() => setMode('write')}>
                  <b>✍️ Tập viết</b>
                </button>
              </div>

              <div className="lt-main">
                <div className="lt-big">
                  {mode === 'write' ? (
                    <TraceCanvas
                      ch={sel.ch}
                      onChecked={(good) => {
                        if (good) {
                          setWritten(sel.id);
                          recordScripts([{ id: sel.id, correct: true }], false);
                        }
                      }}
                    />
                  ) : (
                    <b className="lt-glyph" lang="ja">
                      {sel.ch}
                    </b>
                  )}
                </div>
                <div className="lt-info">
                  <div className="lt-read">
                    <span lang="ja" className="lt-ch">{sel.ch}</span>
                    <b>{sel.read}</b>
                    <SpeakButton text={script === 'kanji' ? sel.wordKana : sel.ch} size="md" />
                  </div>
                  {sel.meaning && <p className="lt-mean">Nghĩa: {sel.meaning}</p>}
                  <div className="lt-word">
                    <small>Ví dụ</small>
                    <b lang="ja">{sel.word}</b>
                    {sel.word !== sel.wordKana && <span lang="ja" className="lt-wk">{sel.wordKana}</span>}
                    <span>{sel.wordVi}</span>
                    <SpeakButton text={sel.wordKana} size="sm" />
                  </div>
                  <div className="lt-level">
                    Mức thuộc: <Level level={progress?.level ?? 0} />
                    {written === sel.id && <em>Viết đẹp lắm! +1 mức</em>}
                  </div>
                  <button type="button" className="btn btn-primary btn-lg" onClick={() => setMode('quiz')}>
                    🎮 Chơi nhận mặt chữ ({data.label})
                  </button>
                  <p className="muted lt-note">Mỗi lượt 5 câu. Đúng thêm chữ nào thì nhớ chữ đó thêm một mức, đủ mỗi 10 chữ thuộc là nhận 1 ⭐.</p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

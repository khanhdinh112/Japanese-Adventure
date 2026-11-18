'use client';

import { useEffect, useMemo, useState } from 'react';
import { rng } from '../art/paint';
import { useGame } from '../GameProvider';

export type BuilderStatus = 'idle' | 'correct' | 'wrong';

interface Props {
  answer: string[];
  alts?: string[][];
  distractors: string[];
  hint?: string;
  /** Gọi khi bé bấm Gợi ý lần đầu của câu này */
  onHint?: () => void;
  onSubmit: (result: { correct: boolean; hintUsed: boolean }) => void;
  status?: BuilderStatus;
  /** Đổi giá trị để xếp lại từ đầu (ví dụ khi thử lại) */
  resetSignal?: number;
  /** Khoá thao tác (sau khi có kết quả) */
  locked?: boolean;
  /** Khoá hoàn toàn giống nhau: dùng khi kết quả đã chốt, giữ nguyên các khối đã xếp */
  seed?: string;
}

interface Tile {
  id: number;
  text: string;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Ô xếp câu: chạm khối chữ để đưa lên dòng, chạm lại để gỡ xuống. */
export function SentenceBuilder({
  answer,
  alts = [],
  distractors,
  hint,
  onHint,
  onSubmit,
  status = 'idle',
  resetSignal = 0,
  locked = false,
  seed = '',
}: Props) {
  const { t } = useGame();
  const tiles = useMemo<Tile[]>(() => {
    const all = [...answer, ...distractors].map((text, id) => ({ id, text: t(text) }));
    const r = rng(hash(seed + all.map((x) => x.text).join('|')));
    const shuffled = [...all];
    for (let attempt = 0; attempt < 4; attempt++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (shuffled.map((x) => x.text).join('') !== answer.map((a) => t(a)).join('')) break;
    }
    return shuffled;
  }, [answer, distractors, seed, t]);

  const [placed, setPlaced] = useState<number[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => {
    setPlaced([]);
  }, [resetSignal, seed]);

  useEffect(() => {
    setHintOpen(false);
    setHintUsed(false);
  }, [seed]);

  const byId = (id: number) => tiles.find((x) => x.id === id)!;
  const placedText = placed.map((id) => byId(id).text);
  const accepted = [answer, ...alts].map((a) => a.map((x) => t(x)).join(''));
  const interactive = !locked && status !== 'correct';

  const check = () => {
    const correct = accepted.includes(placedText.join(''));
    onSubmit({ correct, hintUsed });
  };

  return (
    <div className={`builder builder-${status}`}>
      <div className="builder-line" aria-label="Câu của bạn">
        {placed.length === 0 && <span className="builder-empty">Chạm các khối bên dưới để ghép thành câu…</span>}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            className="tile tile-placed"
            lang="ja"
            disabled={!interactive}
            onClick={() => setPlaced((p) => p.filter((x) => x !== id))}
          >
            {byId(id).text}
          </button>
        ))}
      </div>
      <div className="builder-pool">
        {tiles.map((tile) => {
          const used = placed.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={`tile${used ? ' tile-used' : ''}`}
              lang="ja"
              disabled={!interactive || used}
              onClick={() => setPlaced((p) => [...p, tile.id])}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
      <div className="builder-actions">
        {hint && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!interactive}
            onClick={() => {
              if (!hintUsed) {
                setHintUsed(true);
                onHint?.();
              }
              setHintOpen((v) => !v);
            }}
          >
            💡 Gợi ý
          </button>
        )}
        <button type="button" className="btn btn-ghost" disabled={!interactive || placed.length === 0} onClick={() => setPlaced([])}>
          ↺ Xếp lại
        </button>
        <button type="button" className="btn btn-primary" disabled={!interactive || placed.length === 0} onClick={check}>
          Kiểm tra ✓
        </button>
      </div>
      {hintOpen && hint && <p className="builder-hint">💡 {t(hint)}</p>}
    </div>
  );
}

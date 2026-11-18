'use client';

import { useEffect, useMemo, useState } from 'react';
import { isKana, kanaToRomaji, sentenceToRomaji } from '../../lib/kana';
import { rng } from '../art/paint';
import { useGame } from '../GameProvider';
import { SpeakButton } from './SpeakButton';
import { useSpeech } from './useSpeech';

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
  const { t, state } = useGame();
  const { canSpeak, play } = useSpeech();
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
  const [hintLevel, setHintLevel] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => {
    setPlaced([]);
  }, [resetSignal, seed]);

  useEffect(() => {
    setHintLevel(0);
    setHintUsed(false);
  }, [seed]);

  const byId = (id: number) => tiles.find((x) => x.id === id)!;
  const placedText = placed.map((id) => byId(id).text);
  const accepted = [answer, ...alts].map((a) => a.map((x) => t(x)).join(''));
  const interactive = !locked && status !== 'correct';

  const showRo = state.settings.romaji;
  const roOf = (text: string) => (isKana(text) ? kanaToRomaji(text, { particleAlone: true }) : '');
  const speakTile = (text: string) => {
    if (state.settings.voice && canSpeak && isKana(text)) play(text);
  };
  // Gợi ý bước 2: sáng lên khối đúng kế tiếp (nếu các khối đã xếp đang đúng thứ tự)
  const answerTexts = answer.map((a) => t(a));
  const prefixOk = placedText.every((x, i) => x === answerTexts[i]);
  const nextText = hintLevel >= 2 && prefixOk ? answerTexts[placed.length] : undefined;
  const nextId = nextText !== undefined ? tiles.find((x) => x.text === nextText && !placed.includes(x.id))?.id : undefined;

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
      {placed.length > 0 && (
        <div className="builder-say">
          <SpeakButton text={placedText.join('')} size="sm" />
          {showRo && <span className="builder-ro">{sentenceToRomaji(placedText)}</span>}
        </div>
      )}
      <div className="builder-pool">
        {tiles.map((tile) => {
          const used = placed.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={`tile${used ? ' tile-used' : ''}${tile.id === nextId ? ' tile-next' : ''}`}
              lang="ja"
              disabled={!interactive || used}
              onClick={() => {
                speakTile(tile.text);
                setPlaced((p) => [...p, tile.id]);
              }}
            >
              <span>{tile.text}</span>
              {showRo && roOf(tile.text) && <small className="tile-ro">{roOf(tile.text)}</small>}
            </button>
          );
        })}
      </div>
      <div className="builder-actions">
        {hint && hintLevel < 2 && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!interactive}
            onClick={() => {
              if (!hintUsed) {
                setHintUsed(true);
                onHint?.();
              }
              setHintLevel((l) => l + 1);
            }}
          >
            {hintLevel === 0 ? '💡 Gợi ý' : '💡 Gợi ý thêm (chỉ khối kế tiếp)'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" disabled={!interactive || placed.length === 0} onClick={() => setPlaced([])}>
          ↺ Xếp lại
        </button>
        <button type="button" className="btn btn-primary" disabled={!interactive || placed.length === 0} onClick={check}>
          Kiểm tra ✓
        </button>
      </div>
      {hintLevel >= 1 && hint && <p className="builder-hint">💡 {t(hint)}</p>}
      {hintLevel >= 2 && !prefixOk && <p className="builder-hint">Có khối đặt sai chỗ rồi. Chạm khối trong dòng để gỡ xuống, hoặc bấm Xếp lại nhé.</p>}
    </div>
  );
}

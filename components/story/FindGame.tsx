'use client';

import { useEffect, useState } from 'react';
import type { FindBeat, ReplyLine, Word } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { DialogueBox } from '../DialogueBox';
import { useGame } from '../GameProvider';
import { SpeakButton } from '../ui/SpeakButton';

interface Props {
  stageId: string;
  beat: FindBeat;
  words: Word[];
  onLine: (line: ReplyLine | null) => void;
  onTalking: (talking: boolean) => void;
  onDone: () => void;
}

type Phase = 'ask' | 'play' | 'found' | 'miss';

/**
 * Trò tìm đồ: bà/Momo hỏi bằng tiếng Nhật, bé chạm đúng vật trong tranh.
 * Toạ độ các vùng bấm đọc từ data/spots.ts — cùng nguồn với tranh nền.
 */
export function FindGame({ stageId, beat, words, onLine, onTalking, onDone }: Props) {
  const { answer, useHint: bumpHint, t } = useGame();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('ask');
  const [misses, setMisses] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [missLine, setMissLine] = useState<ReplyLine | null>(null);

  const current = beat.rounds[round];
  const line: ReplyLine | null = phase === 'ask' ? current.ask : phase === 'found' ? current.found : phase === 'miss' ? missLine : null;

  useEffect(() => {
    onLine(line);
  }, [line, onLine]);

  const click = (spotId: string) => {
    if (phase !== 'play') return;
    if (spotId === current.targetId) {
      playSfx('good');
      answer(stageId, 'vocab', misses === 0, current.wordIds);
      setFoundIds((f) => [...f, spotId]);
      setPhase('found');
    } else {
      playSfx('bad');
      if (misses === 0) answer(stageId, 'vocab', false, current.wordIds);
      setMisses((m) => m + 1);
      setMissLine(current.miss);
      setPhase('miss');
    }
  };

  const next = () => {
    if (round + 1 >= beat.rounds.length) {
      onDone();
      return;
    }
    setRound((r) => r + 1);
    setMisses(0);
    setPhase('ask');
  };

  const showHint = misses >= 2 && phase === 'play';

  return (
    <>
      <div className="find-layer">
        {beat.spots.map((s) => {
          const found = foundIds.includes(s.id);
          const isTarget = s.id === current.targetId;
          return (
            <button
              key={s.id}
              type="button"
              className={`hotspot${found ? ' found' : ''}${showHint && isTarget ? ' hint' : ''}`}
              style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
              disabled={phase !== 'play' || found}
              onClick={() => click(s.id)}
              aria-label={`Vật ${s.label.vi}`}
            >
              {found && <span className="hs-tag" lang="ja">{s.label.jp}</span>}
            </button>
          );
        })}
      </div>

      <div className="find-hud">
        <span className="find-round">
          {round + 1}/{beat.rounds.length}
        </span>
        <span className="find-ins">{t(beat.instruction)}</span>
        {phase === 'play' && (
          <>
            <SpeakButton text={t(current.ask.jp)} size="sm" label="Nghe lại" />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={misses < 1}
              onClick={() => {
                bumpHint(stageId);
                setMisses((m) => Math.max(m, 2));
              }}
              title="Hiện chỗ có vật cần tìm (sẽ tính là dùng gợi ý)"
            >
              💡 Gợi ý
            </button>
          </>
        )}
      </div>

      {phase === 'play' && (
        <div className="find-prompt">
          <span lang="ja">{t(current.ask.jp)}</span>
          <small>{t(current.ask.vi)}</small>
        </div>
      )}

      {line && (
        <DialogueBox
          key={`${round}-${phase}-${misses}`}
          speaker={line.speaker}
          jp={line.jp}
          romaji={line.romaji}
          vi={line.vi}
          words={words}
          onTalking={onTalking}
          onNext={() => {
            if (phase === 'ask') setPhase('play');
            else if (phase === 'miss') setPhase('play');
            else if (phase === 'found') next();
          }}
          nextLabel={phase === 'found' ? (round + 1 >= beat.rounds.length ? 'Xong rồi' : 'Tìm tiếp') : phase === 'ask' ? 'Bắt đầu tìm' : 'Thử lại'}
        />
      )}
    </>
  );
}

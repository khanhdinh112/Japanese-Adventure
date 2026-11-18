'use client';

import { useState } from 'react';
import type { StageContent } from '../../data/types';
import { playSfx } from '../../lib/sfx';
import { useGame } from '../GameProvider';
import { MasteryFeedback } from '../MasteryFeedback';
import { SentenceBuilder, type BuilderStatus } from '../ui/SentenceBuilder';
import { SpeakButton } from '../ui/SpeakButton';
import { useSpeech } from '../ui/useSpeech';
import { StageShell } from './StageShell';

const KIND_LABEL = {
  'listen-build': 'Nghe rồi xếp câu',
  'translate-build': 'Dịch sang tiếng Nhật',
  'scene-build': 'Nhìn tranh, nói thành câu',
} as const;

/** Bài tự làm độc lập: không có đáp án gợi sẵn. Gợi ý được tính vào số sao. */
export function MasteryScreen({ stage }: { stage: StageContent }) {
  const { t, go, answer, useHint: bumpHint, completeStep, finishStage } = useGame();
  const { canSpeak, play } = useSpeech();
  const prompts = stage.mastery;
  const [i, setI] = useState(0);
  const [status, setStatus] = useState<BuilderStatus>('idle');
  const [attempt, setAttempt] = useState(0);
  const [reset, setReset] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const p = prompts[i];

  const submit = ({ correct, hintUsed }: { correct: boolean; hintUsed: boolean }) => {
    if (!recorded) {
      answer(stage.id, 'mastery', correct, p.wordIds, correct && !hintUsed && attempt === 0);
      setRecorded(true);
    }
    playSfx(correct ? 'good' : 'bad');
    setAttempt((a) => a + 1);
    setStatus(correct ? 'correct' : 'wrong');
  };

  const next = () => {
    if (i + 1 >= prompts.length) {
      completeStep(stage.id, 'mastery');
      finishStage(stage.id);
      go({ name: 'results', stageId: stage.id }, { kind: 'wash' });
    } else {
      setI(i + 1);
      setStatus('idle');
      setAttempt(0);
      setHinted(false);
      setRecorded(false);
    }
  };

  const last = i + 1 >= prompts.length;

  return (
    <StageShell stage={stage} step="mastery">
      <div className="quiz paper build mastery">
        <div className="quiz-head">
          <span className="pill">
            Tự làm {i + 1}/{prompts.length}
          </span>
          <span className="pill pill-star">⭐ {KIND_LABEL[p.kind]}</span>
          <span className="muted">Lần này không có đáp án sẵn — bạn tự nghĩ nhé!</span>
        </div>

        {p.kind === 'listen-build' && p.audio && (
          <div className="mastery-listen">
            <SpeakButton text={t(p.audio)} size="lg" label={canSpeak ? 'Nghe câu' : 'Đọc câu'} />
            <SpeakButton text={t(p.audio)} size="lg" slow label="Chậm hơn" />
            {!canSpeak && (
              <span className="listen-text">
                <span lang="ja">{t(p.audio)}</span>
              </span>
            )}
          </div>
        )}
        {p.kind === 'scene-build' && p.scene && (
          <div className="mastery-scene" aria-hidden>
            {p.scene}
          </div>
        )}
        <p className="quiz-q">{t(p.prompt)}</p>

        <SentenceBuilder
          key={p.id}
          seed={`${stage.id}-${p.id}`}
          answer={p.answer}
          alts={p.alts}
          distractors={p.distractors}
          hint={p.hint}
          onHint={() => {
            bumpHint(stage.id);
            setHinted(true);
          }}
          onSubmit={submit}
          status={status}
          resetSignal={reset}
          locked={status === 'correct' || (status === 'wrong' && attempt >= 2)}
        />
        {hinted && status === 'idle' && <p className="muted">Bạn đã dùng gợi ý — vẫn tốt lắm, nhưng sẽ khó đạt sao thứ hai.</p>}

        {status === 'correct' && (
          <MasteryFeedback
            tone="correct"
            title={attempt === 1 && !hinted ? 'Bạn tự làm được rồi!' : 'Đúng rồi!'}
            jp={p.answer.join('')}
            romaji={p.romaji}
            vi={p.meaning}
            nextLabel={last ? 'Xem kết quả ⭐' : 'Câu tiếp'}
            onNext={next}
          >
            {attempt === 1 && !hinted ? 'Đúng ngay lần đầu, không cần gợi ý. Từ này đã thuộc về bạn.' : 'Bạn đã sửa lại được — đó chính là cách ghi nhớ tốt nhất.'}
          </MasteryFeedback>
        )}
        {status === 'wrong' && attempt < 2 && (
          <MasteryFeedback
            tone="retry"
            title="Gần được rồi"
            onRetry={() => {
              setStatus('idle');
              setReset((r) => r + 1);
            }}
          >
            Nghĩ lại thứ tự các khối: chủ đề → trợ từ → từ chính. Bạn có thể thử lần nữa.
          </MasteryFeedback>
        )}
        {status === 'wrong' && attempt >= 2 && (
          <MasteryFeedback
            tone="wrong"
            title="Đáp án mẫu"
            jp={p.answer.join('')}
            romaji={p.romaji}
            vi={p.meaning}
            nextLabel={last ? 'Xem kết quả ⭐' : 'Câu tiếp'}
            onNext={next}
          >
            Không sao cả. Đọc to câu này một lần rồi mình đi tiếp nhé.
          </MasteryFeedback>
        )}
      </div>
    </StageShell>
  );
}

'use client';

import { SpeakButton } from './ui/SpeakButton';
import { useGame } from './GameProvider';
import type { ReactNode } from 'react';

export type FeedbackTone = 'correct' | 'wrong' | 'retry';

interface Props {
  tone: FeedbackTone;
  title: string;
  /** Giải thích bằng tiếng Việt */
  children?: ReactNode;
  /** Câu đáp án đúng, hiện kèm nút nghe */
  jp?: string;
  romaji?: string;
  vi?: string;
  nextLabel?: string;
  onNext?: () => void;
  retryLabel?: string;
  onRetry?: () => void;
}

const ICON: Record<FeedbackTone, string> = { correct: '🌸', wrong: '🍃', retry: '💭' };

/** Phản hồi sau mỗi câu trả lời: tích cực, cụ thể, luôn nói rõ vì sao và cho cách đi tiếp. */
export function MasteryFeedback({ tone, title, children, jp, romaji, vi, nextLabel = 'Tiếp tục', onNext, retryLabel = 'Thử lại', onRetry }: Props) {
  const { state, t } = useGame();
  return (
    <div className={`feedback feedback-${tone}`} role="status" aria-live="polite">
      <div className="feedback-ic" aria-hidden>
        {ICON[tone]}
      </div>
      <div className="feedback-body">
        <b className="feedback-title">{title}</b>
        {children && <div className="feedback-text">{children}</div>}
        {jp && (
          <div className="feedback-answer">
            <span lang="ja" className="fa-jp">
              {t(jp)}
            </span>
            <SpeakButton text={t(jp)} size="sm" />
            {state.settings.romaji && romaji && <span className="fa-ro">{t(romaji)}</span>}
            {vi && <span className="fa-vi">{t(vi)}</span>}
          </div>
        )}
      </div>
      <div className="feedback-actions">
        {onRetry && (
          <button type="button" className="btn btn-ghost" onClick={onRetry}>
            ↺ {retryLabel}
          </button>
        )}
        {onNext && (
          <button type="button" className="btn btn-primary" onClick={onNext} autoFocus>
            {nextLabel} ▶
          </button>
        )}
      </div>
    </div>
  );
}

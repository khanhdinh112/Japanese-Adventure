'use client';

import type { ReactNode } from 'react';
import type { CultureNote, Word } from '../data/types';
import type { WordLevel } from '../lib/gameState';
import { WORD_LEVEL_LABEL } from '../lib/selectors';
import { useGame } from './GameProvider';
import { SpeakButton } from './ui/SpeakButton';

interface CardProps {
  variant: 'word' | 'grammar' | 'culture';
  icon?: string;
  title?: string;
  titleJp?: string;
  tag?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Thẻ học tập dùng chung (từ vựng, ngữ pháp, văn hóa): giấy washi có viền mực và ghim. */
export function LearningCard({ variant, icon, title, titleJp, tag, children, footer, className }: CardProps) {
  return (
    <article className={['lcard', `lcard-${variant}`, className].filter(Boolean).join(' ')}>
      <span className="lcard-pin" aria-hidden />
      {(icon || title || tag) && (
        <header className="lcard-head">
          {icon && <span className="lcard-icon">{icon}</span>}
          {title && (
            <div className="lcard-title">
              <h3>{title}</h3>
              {titleJp && <small lang="ja">{titleJp}</small>}
            </div>
          )}
          {tag && <div className="lcard-tag">{tag}</div>}
        </header>
      )}
      <div className="lcard-body">{children}</div>
      {footer && <footer className="lcard-foot">{footer}</footer>}
    </article>
  );
}

export function LevelBadge({ level }: { level: WordLevel }) {
  const l = WORD_LEVEL_LABEL[level];
  return (
    <span className={`level level-${level}`}>
      <span aria-hidden>{l.icon}</span> {l.label}
    </span>
  );
}

/** Thẻ từ vựng lớn. */
export function WordCard({ word, level }: { word: Word; level: WordLevel }) {
  const { state, t } = useGame();
  return (
    <LearningCard variant="word" className="wordcard" tag={<LevelBadge level={level} />}>
      <div className="wc-top">
        <div className="wc-pic" aria-hidden>
          {word.icon}
        </div>
        <div className="wc-main">
          <div className="wc-jp" lang="ja">
            {word.jp}
          </div>
          {state.settings.romaji && <div className="wc-ro">{word.romaji}</div>}
          <div className="wc-vi">{word.vi}</div>
        </div>
        <SpeakButton text={word.jp} size="lg" label="Nghe" />
      </div>
      <div className="wc-example">
        <div className="wc-ex-label">Trong câu chuyện</div>
        <div className="wc-ex-jp" lang="ja">
          {t(word.example.jp)}
          <SpeakButton text={t(word.example.jp)} size="sm" />
        </div>
        {state.settings.romaji && <div className="wc-ex-ro">{t(word.example.romaji)}</div>}
        <div className="wc-ex-vi">{t(word.example.vi)}</div>
      </div>
      {word.memo && (
        <div className="wc-memo">
          <span aria-hidden>💡</span> {word.memo}
        </div>
      )}
    </LearningCard>
  );
}

/** Thẻ khám phá văn hóa. */
export function CultureCard({ note, children }: { note: CultureNote; children?: ReactNode }) {
  const { state, t } = useGame();
  return (
    <LearningCard
      variant="culture"
      icon={note.icon}
      title={note.title}
      tag={<span className="level level-culture">🏮 Khám phá văn hóa</span>}
      footer={children}
    >
      <p className="cu-body">{note.body}</p>
      <p className="cu-fact">
        <span aria-hidden>✨</span> {note.fact}
      </p>
      {note.phrase && (
        <div className="cu-phrase">
          <span lang="ja">{t(note.phrase.jp)}</span>
          <SpeakButton text={t(note.phrase.jp)} size="sm" />
          {state.settings.romaji && <small>{t(note.phrase.romaji)}</small>}
          <em>{t(note.phrase.vi)}</em>
        </div>
      )}
    </LearningCard>
  );
}

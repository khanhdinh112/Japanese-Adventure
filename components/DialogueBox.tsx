'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../data/characters';
import type { CharacterId, Word } from '../data/types';
import { splitByWords } from '../lib/text';
import { useGame } from './GameProvider';
import { SpeakButton } from './ui/SpeakButton';
import { useSpeech } from './ui/useSpeech';

export interface DialogueBoxProps {
  speaker: CharacterId | 'narrator';
  jp?: string;
  romaji?: string;
  vi: string;
  /** Các từ vựng của stage để tô sáng và chạm xem nghĩa */
  words?: Word[];
  onNext?: () => void;
  nextLabel?: string;
  /** Báo cho khung cảnh biết nhân vật đang "nói" (để mấp máy miệng) */
  onTalking?: (talking: boolean) => void;
  /** Đọc to tự động khi có lời thoại mới (nếu bật trong cài đặt và máy có giọng Nhật) */
  autoSpeak?: boolean;
  /** Dùng cho trường hợp không cần nút tiếp (ví dụ đang chờ thao tác khác) */
  hideNext?: boolean;
}

const TYPE_MS = 24;

/** Hộp thoại: bảng tên, lời Nhật gõ dần, romaji, nghĩa tiếng Việt, từ vựng chạm được. */
export function DialogueBox({
  speaker,
  jp,
  romaji,
  vi,
  words = [],
  onNext,
  nextLabel = 'Tiếp',
  onTalking,
  autoSpeak = true,
  hideNext = false,
}: DialogueBoxProps) {
  const { state, t, seeWords } = useGame();
  const { canSpeak, play, stop } = useSpeech();
  const jpText = jp ? t(jp) : '';
  const main = jpText || t(vi);
  const [shown, setShown] = useState(0);
  const [gloss, setGloss] = useState<Word | null>(null);
  const onTalkingRef = useRef(onTalking);
  onTalkingRef.current = onTalking;
  const done = shown >= main.length;

  useEffect(() => {
    setShown(0);
    setGloss(null);
  }, [main]);

  useEffect(() => {
    if (done) {
      onTalkingRef.current?.(false);
      return;
    }
    onTalkingRef.current?.(true);
    const id = window.setInterval(() => setShown((n) => Math.min(main.length, n + 1)), TYPE_MS);
    return () => window.clearInterval(id);
  }, [done, main]);

  useEffect(() => () => onTalkingRef.current?.(false), []);

  useEffect(() => {
    if (!autoSpeak || !jpText || !state.settings.voice || !canSpeak) return;
    const id = window.setTimeout(() => play(jpText), 250);
    return () => {
      window.clearTimeout(id);
      stop();
    };
    // chỉ phát lại khi lời thoại đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jpText, canSpeak, state.settings.voice, autoSpeak]);

  useEffect(() => {
    if (!onNext) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase();
        if (tag === 'textarea' || tag === 'input') return;
        e.preventDefault();
        if (!done) setShown(main.length);
        else onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, done, main]);

  const wordList = useMemo(() => words.filter((w) => w.jp.length >= 2), [words]);
  const segments = useMemo(
    () => (jpText ? splitByWords(jpText.slice(0, shown), wordList.map((w) => w.jp)) : []),
    [jpText, shown, wordList],
  );

  const meta = speaker === 'narrator' ? null : CHARACTERS[speaker];
  const speakable = jpText;

  return (
    <div
      className={`dialogue${speaker === 'narrator' ? ' dialogue-narr' : ''}`}
      onClick={() => {
        if (!done) setShown(main.length);
      }}
    >
      {meta && (
        <div className="nameplate" style={{ background: meta.color }}>
          <b>{t(meta.name)}</b>
          <small lang="ja">{t(meta.nameJp)}</small>
        </div>
      )}
      {gloss && (
        <div className="gloss-card" onClick={(e) => e.stopPropagation()}>
          <span className="gloss-ic">{gloss.icon}</span>
          <span>
            <b lang="ja">{gloss.jp}</b> <small>{gloss.romaji}</small>
            <em>{gloss.vi}</em>
          </span>
        </div>
      )}
      <div className="dialogue-main">
        {jpText ? (
          <p className="d-jp" lang="ja">
            {segments.map((seg, i) =>
              seg.word ? (
                <button
                  key={i}
                  type="button"
                  className="gloss"
                  onClick={(e) => {
                    e.stopPropagation();
                    const w = wordList.find((x) => x.jp === seg.word);
                    if (w) {
                      setGloss(w);
                      seeWords([w.id]);
                    }
                  }}
                >
                  {seg.text}
                </button>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
            {!done && <span className="caret" />}
          </p>
        ) : (
          <p className="d-narr">
            {t(vi).slice(0, shown)}
            {!done && <span className="caret" />}
          </p>
        )}
        {jpText && state.settings.romaji && romaji && <p className="d-ro">{t(romaji)}</p>}
        {jpText && <p className="d-vi">{t(vi)}</p>}
      </div>
      <div className="dialogue-side">
        {speakable && <SpeakButton text={speakable} size="md" />}
        {!hideNext && onNext && (
          <button
            type="button"
            className="btn btn-primary next-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (!done) setShown(main.length);
              else onNext();
            }}
          >
            {nextLabel} ▶
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSpeech } from './useSpeech';

interface Props {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  slow?: boolean;
  className?: string;
}

/** Nút nghe. Nếu máy chưa có giọng Nhật, hiện lời nhắn thay vì im lặng. */
export function SpeakButton({ text, label, size = 'md', slow = false, className }: Props) {
  const { speaking, canSpeak, play } = useSpeech();
  const [note, setNote] = useState(false);
  return (
    <span className={['speak-wrap', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={`speak speak-${size}${speaking ? ' is-speaking' : ''}`}
        aria-label={label ?? 'Nghe'}
        title={canSpeak ? 'Nghe' : 'Máy chưa có giọng đọc tiếng Nhật'}
        onClick={() => {
          if (!canSpeak || !play(text, slow ? 0.6 : 0.85)) {
            setNote(true);
            window.setTimeout(() => setNote(false), 2600);
          }
        }}
      >
        <span aria-hidden>{slow ? '🐢' : '🔊'}</span>
        {label && <span className="speak-label">{label}</span>}
      </button>
      {note && <span className="speak-note">Máy này chưa có giọng đọc tiếng Nhật — hãy đọc theo chữ nhé!</span>}
    </span>
  );
}

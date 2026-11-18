'use client';

import { useEffect, useState } from 'react';
import { useGame } from '../GameProvider';

/**
 * Nghĩa tiếng Việt của câu tiếng Nhật. Mặc định ẩn để bé tập đọc/hiểu tiếng Nhật trước;
 * chạm "Xem nghĩa" khi cần. Cài đặt "Luôn hiện nghĩa tiếng Việt" bật thì hiện sẵn.
 */
export function Meaning({ text, className, resetKey }: { text: string; className?: string; resetKey?: string }) {
  const { state } = useGame();
  const [peek, setPeek] = useState(false);
  useEffect(() => setPeek(false), [resetKey ?? text]);
  if (state.settings.meaning || peek) return <p className={['meaning', className].filter(Boolean).join(' ')}>{text}</p>;
  return (
    <button
      type="button"
      className="meaning-btn"
      onClick={(e) => {
        e.stopPropagation();
        setPeek(true);
      }}
    >
      💡 Xem nghĩa
    </button>
  );
}

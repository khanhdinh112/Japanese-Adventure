'use client';

import { canFullscreen, enterImmersive } from '../../lib/device';

/** Hiện khi điện thoại đang cầm dọc: game thiết kế cho màn hình ngang. */
export function RotatePrompt() {
  return (
    <div className="rotate-prompt" role="alert">
      <div className="rotate-phone" aria-hidden>
        <span className="rotate-screen">🏯</span>
      </div>
      <h2>Xoay ngang điện thoại nhé!</h2>
      <p>Japanese Adventure chơi vui nhất khi màn hình nằm ngang.</p>
      {canFullscreen() && (
        <button type="button" className="rotate-btn" onClick={() => void enterImmersive()}>
          Toàn màn hình
        </button>
      )}
    </div>
  );
}

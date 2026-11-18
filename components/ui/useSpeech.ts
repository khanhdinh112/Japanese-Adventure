'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasJapaneseVoice, onVoicesChanged, speak, speechSupported, stopSpeaking } from '../../lib/speech';

/** Hook đọc tiếng Nhật bằng giọng trình duyệt. `canSpeak=false` → giao diện hiển thị chữ thay thế. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    const update = () => setCanSpeak(speechSupported() && hasJapaneseVoice());
    update();
    return onVoicesChanged(update);
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const play = useCallback((text: string, rate?: number, onEnd?: () => void) => {
    const ok = speak(text, {
      rate,
      onStart: () => setSpeaking(true),
      onEnd: () => {
        setSpeaking(false);
        onEnd?.();
      },
    });
    return ok;
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  return { speaking, canSpeak, play, stop };
}

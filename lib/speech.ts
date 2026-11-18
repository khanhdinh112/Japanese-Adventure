import { toSpeakable } from './text';

/**
 * Giọng đọc tiếng Nhật dùng Web Speech API của trình duyệt (không cần file âm thanh).
 * Nếu thiết bị không có giọng tiếng Nhật, các hoạt động Nghe sẽ hiển thị chữ thay thế
 * (xem ListeningChallenge) và không tính vào điểm kỹ năng Nghe.
 */

type Listener = () => void;
const listeners = new Set<Listener>();
let voicesReady = false;

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return 'speechSynthesis' in window ? window.speechSynthesis : null;
}

export function japaneseVoice(): SpeechSynthesisVoice | undefined {
  const s = synth();
  if (!s) return undefined;
  const voices = s.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === 'ja-jp') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('ja'))
  );
}

export function hasJapaneseVoice(): boolean {
  return !!japaneseVoice();
}

export function speechSupported(): boolean {
  return synth() !== null;
}

/** Đăng ký nghe khi danh sách giọng đọc được nạp xong (trình duyệt nạp bất đồng bộ). */
export function onVoicesChanged(cb: Listener): () => void {
  const s = synth();
  listeners.add(cb);
  if (s && !voicesReady) {
    voicesReady = true;
    s.addEventListener?.('voiceschanged', () => listeners.forEach((l) => l()));
  }
  return () => {
    listeners.delete(cb);
  };
}

export function stopSpeaking(): void {
  synth()?.cancel();
}

export function speak(text: string, opts: { rate?: number; onEnd?: () => void; onStart?: () => void } = {}): boolean {
  const s = synth();
  if (!s) return false;
  s.cancel();
  const utter = new SpeechSynthesisUtterance(toSpeakable(text));
  utter.lang = 'ja-JP';
  const voice = japaneseVoice();
  if (voice) utter.voice = voice;
  utter.rate = opts.rate ?? 0.85;
  utter.pitch = 1.05;
  utter.onstart = () => opts.onStart?.();
  utter.onend = () => opts.onEnd?.();
  utter.onerror = () => opts.onEnd?.();
  s.speak(utter);
  return true;
}

import { duckMusic } from './music';
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
    // Safari/một số máy không bắn sự kiện voiceschanged: hỏi lại vài lần trong 4 giây đầu
    let tries = 0;
    const poll = window.setInterval(() => {
      tries++;
      if (s.getVoices().length > 0 || tries > 16) {
        window.clearInterval(poll);
        listeners.forEach((l) => l());
      }
    }, 250);
  }
  return () => {
    listeners.delete(cb);
  };
}

export function stopSpeaking(): void {
  pendingTimer && clearTimeout(pendingTimer);
  pendingTimer = null;
  synth()?.cancel();
  duckMusic(false);
}

let pendingTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Đọc to một câu tiếng Nhật. Chú ý: gọi cancel() rồi speak() ngay lập tức khiến một số trình duyệt
 * (đặc biệt Chrome) bỏ luôn câu mới, nên nếu đang đọc dở thì cancel rồi đợi một nhịp ngắn mới phát.
 */
export function speak(text: string, opts: { rate?: number; onEnd?: () => void; onStart?: () => void } = {}): boolean {
  const s = synth();
  if (!s) return false;
  if (pendingTimer) clearTimeout(pendingTimer);
  const busy = s.speaking || s.pending;
  if (busy) s.cancel();
  const run = () => {
    pendingTimer = null;
    const utter = new SpeechSynthesisUtterance(toSpeakable(text));
    utter.lang = 'ja-JP';
    const voice = japaneseVoice();
    if (voice) utter.voice = voice;
    utter.rate = opts.rate ?? 0.85;
    utter.pitch = 1.05;
    utter.volume = 1;
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      duckMusic(false);
      opts.onEnd?.();
    };
    utter.onstart = () => {
      duckMusic(true);
      opts.onStart?.();
    };
    utter.onend = finish;
    utter.onerror = finish;
    s.speak(utter);
    // Chrome đôi khi ở trạng thái "paused" sau khi hủy; đánh thức lại
    if (s.paused) s.resume();
  };
  if (busy) pendingTimer = setTimeout(run, 90);
  else run();
  return true;
}

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

const norm = (lang: string) => lang.toLowerCase().replace('_', '-');

/** Android Chrome đôi khi trả "ja_JP" (gạch dưới). Ưu tiên ja-JP, rồi giọng cài sẵn trên máy (không cần mạng). */
export function japaneseVoice(): SpeechSynthesisVoice | undefined {
  const s = synth();
  if (!s) return undefined;
  const ja = s.getVoices().filter((v) => norm(v.lang).startsWith('ja'));
  const score = (v: SpeechSynthesisVoice) => (norm(v.lang) === 'ja-jp' ? 2 : 0) + (v.localService ? 1 : 0);
  return ja.sort((x, y) => score(y) - score(x))[0];
}

/**
 * Trình duyệt di động nhiều khi trả danh sách giọng rỗng nhưng vẫn đọc được, và iPhone chỉ cho phát âm
 * sau lần chạm đầu tiên. Nên lần chạm đầu tiên ta "thăm dò" bằng một câu im lặng: nếu phát được thì coi như có giọng.
 */
type Probe = 'unknown' | 'ok' | 'fail';
let probe: Probe = 'unknown';
let probing = false;
// giữ tham chiếu để Chrome không thu dọn câu đang đọc (lỗi khiến onend không bao giờ bắn)
const alive = new Set<SpeechSynthesisUtterance>();

export function hasJapaneseVoice(): boolean {
  return !!japaneseVoice() || probe === 'ok';
}

export function probeResult(): Probe {
  return probe;
}

function notify(): void {
  listeners.forEach((l) => l());
}

const UNAVAILABLE = new Set(['language-unavailable', 'voice-unavailable', 'synthesis-unavailable']);

/** Thăm dò giọng đọc tiếng Nhật bằng câu im lặng (cần gọi từ thao tác chạm). */
export function runProbe(): void {
  const s = synth();
  if (!s || probing) return;
  probing = true;
  const u = new SpeechSynthesisUtterance('あ');
  u.lang = 'ja-JP';
  const v = japaneseVoice();
  if (v) u.voice = v;
  u.volume = 0;
  const done = (r: Probe | null) => {
    alive.delete(u);
    probing = false;
    if (r && probe !== r) {
      probe = r;
      notify();
    }
  };
  u.onstart = () => done('ok');
  u.onend = () => done('ok');
  u.onerror = (e) => done(UNAVAILABLE.has((e as SpeechSynthesisErrorEvent).error) ? 'fail' : null);
  alive.add(u);
  s.speak(u);
  window.setTimeout(() => probing && done(null), 4000);
}

let unlockInstalled = false;
/** Gắn một lần: lần chạm đầu tiên mở khoá âm thanh (iPhone/Android) rồi thăm dò giọng. */
export function installSpeechUnlock(): void {
  const s = synth();
  if (!s || unlockInstalled || typeof window === 'undefined') return;
  unlockInstalled = true;
  const events = ['pointerdown', 'touchend', 'click', 'keydown'] as const;
  const handler = () => {
    events.forEach((e) => window.removeEventListener(e, handler, true));
    s.getVoices();
    runProbe();
  };
  events.forEach((e) => window.addEventListener(e, handler, true));
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
    s.addEventListener?.('voiceschanged', notify);
    // Safari/một số máy không bắn sự kiện voiceschanged: hỏi lại vài lần trong 4 giây đầu
    let tries = 0;
    const poll = window.setInterval(() => {
      tries++;
      if (s.getVoices().length > 0 || tries > 16) {
        window.clearInterval(poll);
        notify();
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
      alive.delete(utter);
      duckMusic(false);
      opts.onEnd?.();
    };
    utter.onstart = () => {
      duckMusic(true);
      opts.onStart?.();
    };
    utter.onend = finish;
    utter.onerror = (e) => {
      if (UNAVAILABLE.has(e.error) && !japaneseVoice() && probe !== 'fail') {
        probe = 'fail';
        notify();
      }
      finish();
    };
    alive.add(utter);
    s.speak(utter);
    // Chrome đôi khi ở trạng thái "paused" sau khi hủy; đánh thức lại
    if (s.paused) s.resume();
  };
  if (busy) pendingTimer = setTimeout(run, 90);
  else run();
  return true;
}

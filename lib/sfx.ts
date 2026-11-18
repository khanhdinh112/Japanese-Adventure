/**
 * Hiệu ứng âm thanh nhỏ tạo bằng Web Audio (không cần file âm thanh).
 * Bật/tắt trong Cài đặt; tôn trọng trình duyệt chặn tự phát cho đến khi bé chạm lần đầu.
 */

export type Sfx = 'tap' | 'good' | 'bad' | 'star' | 'page' | 'pop';

let enabled = true;
let ctx: AudioContext | null = null;

export function setSfxEnabled(on: boolean): void {
  enabled = on;
}

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number): void {
  const c = context();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playSfx(kind: Sfx): void {
  if (!enabled) return;
  try {
    switch (kind) {
      case 'tap':
        tone(660, 0, 0.08, 'triangle', 0.07);
        break;
      case 'pop':
        tone(520, 0, 0.06, 'sine', 0.08);
        tone(780, 0.04, 0.08, 'sine', 0.06);
        break;
      case 'good':
        tone(659, 0, 0.14, 'sine', 0.1);
        tone(880, 0.1, 0.22, 'sine', 0.1);
        break;
      case 'bad':
        tone(260, 0, 0.18, 'triangle', 0.08);
        tone(220, 0.12, 0.22, 'triangle', 0.07);
        break;
      case 'star':
        [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.3, 'sine', 0.08));
        break;
      case 'page':
        tone(330, 0, 0.1, 'sine', 0.05);
        tone(440, 0.05, 0.12, 'sine', 0.05);
        break;
    }
  } catch {
    /* âm thanh là phần phụ, bỏ qua lỗi */
  }
}

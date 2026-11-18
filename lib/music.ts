/**
 * Nhạc nền không lời, tạo trực tiếp bằng Web Audio (không cần file âm thanh):
 * đàn koto gảy trên thang âm ngũ cung kiểu Nhật, nền đàn pad mềm, sáo trúc thoảng và nốt trầm.
 * Có ba tâm trạng: "home" (ấm áp, chậm), "adventure" (sáng, nhịp nhanh hơn) và "calm" (rất nhẹ khi đang học).
 *
 * Muốn dùng nhạc thật: đặt file vào public/audio/bgm-home.mp3, bgm-adventure.mp3, bgm-calm.mp3
 * (xem docs/ASSETS.md). Nếu có file, trình phát sẽ ưu tiên dùng file thay vì nhạc tạo sinh.
 */

export type MusicMood = 'home' | 'adventure' | 'calm';

interface MoodSpec {
  /** Tần số nốt gốc (Hz) */
  root: number;
  /** Các bậc của thang âm (nửa cung so với nốt gốc) */
  scale: number[];
  bpm: number;
  /** Xác suất có nốt gảy ở mỗi phách phụ */
  density: number;
  /** Âm lượng tương đối của cả bè */
  level: number;
  /** Chuỗi hợp âm (bậc của thang âm cho nốt trầm + pad) */
  chords: number[][];
  flute: boolean;
}

const D4 = 293.66;
const G4 = 392.0;
const A3 = 220.0;

const MOODS: Record<MusicMood, MoodSpec> = {
  // Ngũ cung trưởng (yo): ấm, hơi hoài niệm
  home: { root: D4, scale: [0, 2, 4, 7, 9], bpm: 68, density: 0.5, level: 1, chords: [[0, 7, 14], [-5, 2, 9], [-3, 4, 11], [-5, 2, 9]], flute: true },
  // Sáng và vui hơn
  adventure: { root: G4, scale: [0, 2, 4, 7, 9], bpm: 92, density: 0.7, level: 0.9, chords: [[0, 7, 14], [-3, 4, 11], [-5, 2, 9], [0, 7, 14]], flute: true },
  // Rất nhẹ để bé tập trung khi học
  calm: { root: A3, scale: [0, 3, 5, 7, 10], bpm: 58, density: 0.28, level: 0.62, chords: [[0, 7, 12], [-2, 5, 10], [-4, 3, 8], [-2, 5, 10]], flute: false },
};

const FILE_MOODS: Record<MusicMood, string> = {
  home: '/audio/bgm-home.mp3',
  adventure: '/audio/bgm-adventure.mp3',
  calm: '/audio/bgm-calm.mp3',
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let timer: number | null = null;
let enabled = false;
let wanted: MusicMood = 'home';
let current: MusicMood | null = null;
let volume = 0.7;
let ducked = false;
let nextTime = 0;
let step = 0;
let fileAudio: HTMLAudioElement | null = null;
let fileOk: Partial<Record<MusicMood, boolean>> = {};
let rand = Math.random;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
export function onMusicChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    // "hồ vang" đơn giản: trễ có hồi tiếp lọc trầm
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.43;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1900;
    wet = ctx.createGain();
    wet.gain.value = 0.34;
    wet.connect(delay);
    delay.connect(lp).connect(fb).connect(delay);
    lp.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

function targetGain(): number {
  if (!enabled) return 0;
  return 0.16 * volume * (ducked ? 0.35 : 1);
}

function applyGain(seconds = 0.8) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(targetGain(), t + seconds);
  if (fileAudio) fileAudio.volume = Math.min(1, targetGain() * 5);
}

function note(freq: number, t0: number, dur: number, kind: 'pluck' | 'pad' | 'flute' | 'bass', gain: number, level: number) {
  const c = ctx;
  if (!c || !master || !wet) return;
  const g = c.createGain();
  const osc = c.createOscillator();
  const out: AudioNode = g;
  const peak = gain * level;
  if (kind === 'pluck') {
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const osc2 = c.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.001;
    const g2 = c.createGain();
    g2.gain.value = 0.25;
    osc2.connect(g2).connect(g);
    osc2.start(t0);
    osc2.stop(t0 + dur + 0.1);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  } else if (kind === 'pad') {
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = (rand() - 0.5) * 8;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  } else if (kind === 'flute') {
    osc.type = 'sine';
    osc.frequency.value = freq;
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 5;
    lg.gain.value = freq * 0.006;
    lfo.connect(lg).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.1);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.25);
    g.gain.setValueAtTime(peak, t0 + dur * 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  } else {
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }
  osc.connect(g);
  out.connect(master);
  out.connect(wet);
  osc.start(t0);
  osc.stop(t0 + dur + 0.15);
}

const hz = (root: number, semis: number) => root * Math.pow(2, semis / 12);

function schedule() {
  const c = ctx;
  if (!c || !enabled || fileAudio) return;
  const mood = MOODS[current ?? 'home'];
  const eighth = 60 / mood.bpm / 2;
  while (nextTime < c.currentTime + 0.4) {
    const inBar = step % 8;
    const bar = Math.floor(step / 8);
    const chord = mood.chords[bar % mood.chords.length];
    const t0 = Math.max(nextTime, c.currentTime + 0.02);
    if (inBar === 0) {
      // đàn pad + nốt trầm cho cả ô nhịp
      chord.forEach((s, i) => note(hz(mood.root, s - 12), t0, eighth * 8.5, 'pad', 0.5 - i * 0.08, mood.level));
      note(hz(mood.root, chord[0] - 24), t0, eighth * 4, 'bass', 0.7, mood.level);
      if (mood.flute && bar % 2 === 1) {
        const s = mood.scale[Math.floor(rand() * mood.scale.length)] + 12;
        note(hz(mood.root, s + 12), t0 + eighth, eighth * 5, 'flute', 0.22, mood.level);
      }
    }
    // koto: gảy rải theo thang âm, nhấn ở phách chính
    const strong = inBar % 2 === 0;
    if (rand() < (strong ? Math.min(1, mood.density + 0.35) : mood.density * 0.7)) {
      const deg = mood.scale[Math.floor(rand() * mood.scale.length)];
      const oct = rand() < 0.35 ? 12 : 0;
      note(hz(mood.root, deg + oct + 12), t0, eighth * 3.2, 'pluck', strong ? 0.42 : 0.3, mood.level);
    }
    step++;
    nextTime += eighth;
  }
}

async function tryFile(mood: MusicMood): Promise<boolean> {
  if (fileOk[mood] !== undefined) return !!fileOk[mood];
  try {
    const res = await fetch(FILE_MOODS[mood], { method: 'HEAD' });
    const type = res.headers.get('content-type') ?? '';
    fileOk[mood] = res.ok && type.includes('audio');
  } catch {
    fileOk[mood] = false;
  }
  return !!fileOk[mood];
}

async function switchTo(mood: MusicMood) {
  if (current === mood && (timer !== null || fileAudio)) return;
  current = mood;
  step = 0;
  if (fileAudio) {
    fileAudio.pause();
    fileAudio = null;
  }
  if (await tryFile(mood)) {
    if (current !== mood || !enabled) return;
    fileAudio = new Audio(FILE_MOODS[mood]);
    fileAudio.loop = true;
    fileAudio.volume = Math.min(1, targetGain() * 5);
    void fileAudio.play().catch(() => undefined);
    emit();
    return;
  }
  const c = audioCtx();
  if (!c) return;
  if (c.state === 'suspended') await c.resume().catch(() => undefined);
  nextTime = c.currentTime + 0.1;
  if (timer === null) timer = window.setInterval(schedule, 120);
  applyGain();
  emit();
}

function stopAll() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  if (fileAudio) {
    fileAudio.pause();
    fileAudio = null;
  }
  current = null;
  emit();
}

/** Bật/tắt nhạc nền. Trình duyệt chỉ cho phát sau lần chạm đầu tiên nên gọi lại khi có thao tác. */
export function setMusicEnabled(on: boolean): void {
  enabled = on;
  if (typeof window === 'undefined') return;
  if (on) {
    void switchTo(wanted);
    applyGain();
  } else {
    applyGain(0.4);
    window.setTimeout(() => {
      if (!enabled) stopAll();
    }, 500);
  }
}

export function setMusicMood(mood: MusicMood): void {
  wanted = mood;
  if (enabled && typeof window !== 'undefined') void switchTo(mood);
}

export function setMusicVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  applyGain(0.2);
}

/** Hạ nhỏ nhạc khi có lời thoại được đọc to. */
export function duckMusic(on: boolean): void {
  ducked = on;
  applyGain(0.25);
}

/** Gọi khi người dùng chạm lần đầu để mở khoá âm thanh của trình duyệt. */
export function unlockMusic(): void {
  if (!enabled) return;
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  if (current === null || (timer === null && !fileAudio)) void switchTo(wanted);
  else if (fileAudio && fileAudio.paused) void fileAudio.play().catch(() => undefined);
}

export function musicStatus(): { enabled: boolean; playing: boolean; mood: MusicMood | null; source: 'file' | 'synth' | null } {
  const playing = enabled && ((!!ctx && ctx.state === 'running' && timer !== null) || (!!fileAudio && !fileAudio.paused));
  return { enabled, playing, mood: current, source: fileAudio ? 'file' : timer !== null ? 'synth' : null };
}

/** Dùng cho kiểm thử: cố định bộ sinh số ngẫu nhiên. */
export function __setMusicRandom(fn: () => number): void {
  rand = fn;
}

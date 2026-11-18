/** Tiện ích ngày giờ theo múi giờ của máy (không dùng UTC để "hôm nay" đúng với bé). */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Thứ Hai của tuần chứa `d`. */
export function startOfWeek(d: Date = new Date()): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (copy.getDay() + 6) % 7; // Mon=0 … Sun=6
  copy.setDate(copy.getDate() - dow);
  return copy;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function weekKeys(weekOffset = 0, today: Date = new Date()): string[] {
  const monday = addDays(startOfWeek(today), weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(monday, i)));
}

export const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function formatShortDate(key: string): string {
  const d = parseKey(key);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 1) return seconds > 0 ? '< 1 phút' : '0 phút';
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  return `${h} giờ ${m % 60} phút`;
}

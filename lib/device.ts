/** Tiện ích nhận biết điện thoại và chế độ toàn màn hình (chỉ gọi ở client). */

export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
}

/** Máy cảm ứng có cạnh ngắn dưới 600px: điện thoại (kể cả khi xoay ngang). */
export function isPhone(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('phone') === '1') return true; // xem thử trên máy tính
  return isCoarsePointer() && Math.min(window.screen.width, window.screen.height) < 600;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return !!nav.standalone || !!window.matchMedia?.('(display-mode: standalone), (display-mode: fullscreen)').matches;
}

export function isFullscreen(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenElement;
}

export function canFullscreen(): boolean {
  return typeof document !== 'undefined' && !!document.documentElement.requestFullscreen && !isStandalone();
}

type LockableOrientation = ScreenOrientation & { lock?: (o: string) => Promise<void> };

/** Vào toàn màn hình và khoá xoay ngang (Android Chrome). Phải gọi từ thao tác chạm. iPhone Safari không hỗ trợ. */
export async function enterImmersive(): Promise<void> {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
  } catch {
    /* trình duyệt không cho phép */
  }
  try {
    await (screen.orientation as LockableOrientation)?.lock?.('landscape');
  } catch {
    /* không khoá được, bé tự xoay máy */
  }
}

export async function exitImmersive(): Promise<void> {
  try {
    (screen.orientation as LockableOrientation)?.unlock?.();
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    /* bỏ qua */
  }
}

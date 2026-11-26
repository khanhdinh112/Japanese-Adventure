let cached: boolean | null = null;

/** Kiểm tra trình duyệt có WebGL không (chỉ chạy ở client). Kết quả được nhớ lại. */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    cached = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

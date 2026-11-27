import type { MetadataRoute } from 'next';

/** Cho phép cài game về màn hình chính điện thoại và chạy toàn màn hình, xoay ngang. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Japanese Adventure · Ngôi nhà của bà Osano',
    short_name: 'Japanese Adventure',
    description: 'Trò chơi phiêu lưu học tiếng Nhật cho bé: đến làng Saga, gặp bà Osano và mèo Momo.',
    lang: 'vi',
    start_url: '/',
    scope: '/',
    id: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'standalone'],
    orientation: 'landscape',
    background_color: '#1d1612',
    theme_color: '#f6ecd6',
    categories: ['education', 'games', 'kids'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

import type { Metadata, Viewport } from 'next';
import { ArtDefs } from '../components/art/paint';
import './globals.css';

export const metadata: Metadata = {
  title: 'Japanese Adventure · Ngôi nhà của bà Hana',
  description: 'Trò chơi phiêu lưu học tiếng Nhật cho bé: đến làng Saga, gặp bà Hana và mèo Momo.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f6ecd6' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <ArtDefs />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { ArtDefs } from '../components/art/paint';
import './globals.css';

export const metadata: Metadata = {
  title: 'Japanese Adventure · Ngôi nhà của bà Osano',
  description: 'Trò chơi phiêu lưu học tiếng Nhật cho bé: đến làng Saga, gặp bà Osano và mèo Momo.',
  applicationName: 'Japanese Adventure',
  appleWebApp: { capable: true, title: 'Japanese Adventure', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f6ecd6',
};

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

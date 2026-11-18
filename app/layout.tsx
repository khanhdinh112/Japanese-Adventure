import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Japanese Adventure', description: 'Hành trình học tiếng Nhật tại Komorebi Village' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}

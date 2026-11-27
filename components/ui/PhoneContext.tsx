'use client';

import { createContext, useContext } from 'react';

export type PhoneOrient = 'land' | 'port';
export interface PhoneInfo {
  /** Đang ở chế độ giao diện điện thoại (bố cục riêng, không dùng khung 1920×1080). */
  phone: boolean;
  orient: PhoneOrient | null;
}

export const PhoneContext = createContext<PhoneInfo>({ phone: false, orient: null });

export function usePhone(): PhoneInfo {
  return useContext(PhoneContext);
}

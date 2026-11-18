'use client';

import { useEffect, useState } from 'react';
import { checkIsAdmin } from '../lib/cloud';
import { useAuth } from './AuthProvider';

/** Tài khoản đang đăng nhập có quyền admin không (do Supabase quyết định, không tin phía trình duyệt). */
export function useIsAdmin(): boolean {
  const auth = useAuth();
  const uid = auth.user?.id ?? null;
  const [admin, setAdmin] = useState<{ uid: string; value: boolean } | null>(null);
  useEffect(() => {
    if (!auth.enabled || !uid) return;
    let alive = true;
    void checkIsAdmin().then((v) => alive && setAdmin({ uid, value: v }));
    return () => {
      alive = false;
    };
  }, [auth.enabled, uid]);
  return admin?.uid === uid && admin?.value === true;
}

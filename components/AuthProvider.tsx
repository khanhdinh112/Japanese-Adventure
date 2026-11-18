'use client';

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authEnabled, getSupabase } from '../lib/supabase';

export interface AuthApi {
  /** Supabase đã được cấu hình? (false → chỉ có chế độ khách) */
  enabled: boolean;
  /** Đã biết trạng thái phiên đăng nhập? */
  ready: boolean;
  user: User | null;
  /** Đang ở bước đặt lại mật khẩu (sau khi bấm liên kết trong email) */
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Trả về 'confirm' nếu phải xác nhận email trước khi đăng nhập */
  signUp: (email: string, password: string) => Promise<'signed-in' | 'confirm'>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!authEnabled);
  const [user, setUser] = useState<User | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!authEnabled) return;
    const supabase = getSupabase();
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      if (!alive) return;
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return data.session ? 'signed-in' : 'confirm';
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) throw error;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
    setRecovering(false);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  const api = useMemo<AuthApi>(
    () => ({ enabled: authEnabled, ready, user, recovering, signIn, signUp, signInWithGoogle, sendPasswordReset, updatePassword, signOut }),
    [ready, user, recovering, signIn, signUp, signInWithGoogle, sendPasswordReset, updatePassword, signOut],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Chưa cấu hình Supabase → game chạy ở chế độ khách (không đăng nhập). */
export const authEnabled = Boolean(URL && KEY);
export const googleEnabled = authEnabled && process.env.NEXT_PUBLIC_AUTH_GOOGLE === 'true';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!URL || !KEY) throw new Error('Supabase chưa được cấu hình (thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  if (!client) {
    client = createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** Việt hoá các lỗi thường gặp của Supabase Auth / PostgREST. */
export function viError(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email hoặc mật khẩu chưa đúng.';
  if (m.includes('email not confirmed')) return 'Email chưa được xác nhận. Hãy mở thư xác nhận trong hộp thư của bạn.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Email này đã có tài khoản. Hãy đăng nhập.';
  if (m.includes('password should be') || m.includes('weak password')) return 'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Bạn thử quá nhiều lần. Hãy đợi một lát rồi thử lại.';
  if (m.includes('valid email') || m.includes('invalid email')) return 'Email chưa hợp lệ.';
  if (m.includes('tối đa 6') || m.includes('check_violation')) return 'Mỗi tài khoản chỉ có tối đa 6 hồ sơ bé.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.';
  return raw ? `Có lỗi xảy ra: ${raw}` : 'Có lỗi xảy ra. Hãy thử lại.';
}

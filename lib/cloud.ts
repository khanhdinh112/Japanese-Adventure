import type { PlayerLook } from './gameState';
import type { GameState } from './gameState';
import { normalizeState } from './storage';
import { totalStars } from './selectors';
import { getSupabase } from './supabase';

/** Thông tin tóm tắt để hiện ở màn chọn hồ sơ (không tải cả tiến trình). */
export interface ChildSummary {
  id: string;
  name: string;
  look: PlayerLook | null;
  xp: number;
  stars: number;
  updatedAt: string;
}

interface SummaryRow {
  id: string;
  name: string;
  look: PlayerLook | null;
  xp: number;
  stars: number;
  updated_at: string;
}

const SUMMARY_COLS = 'id,name,look,xp,stars,updated_at';

function toSummary(r: SummaryRow): ChildSummary {
  return { id: r.id, name: r.name, look: r.look, xp: r.xp, stars: r.stars, updatedAt: r.updated_at };
}

/** Các cột tóm tắt suy ra từ tiến trình. */
function summaryFields(state: GameState) {
  return {
    name: state.profile?.name ?? '',
    look: state.profile?.look ?? null,
    xp: state.xp,
    stars: totalStars(state),
  };
}

export async function listChildren(): Promise<ChildSummary[]> {
  const { data, error } = await getSupabase().from('children').select(SUMMARY_COLS).order('created_at', { ascending: true });
  if (error) throw error;
  return (data as SummaryRow[]).map(toSummary);
}

export async function fetchChild(id: string): Promise<{ state: GameState; updatedAt: string }> {
  const { data, error } = await getSupabase().from('children').select('state,updated_at').eq('id', id).single();
  if (error) throw error;
  return { state: normalizeState(data.state), updatedAt: data.updated_at as string };
}

export async function createChild(state: GameState): Promise<ChildSummary> {
  const { data, error } = await getSupabase()
    .from('children')
    .insert({ ...summaryFields(state), state })
    .select(SUMMARY_COLS)
    .single();
  if (error) throw error;
  return toSummary(data as SummaryRow);
}

/** Đẩy tiến trình lên cloud; trả về updated_at mới. */
export async function pushChild(id: string, state: GameState): Promise<string> {
  const { data, error } = await getSupabase()
    .from('children')
    .update({ ...summaryFields(state), state })
    .eq('id', id)
    .select('updated_at')
    .single();
  if (error) throw error;
  return data.updated_at as string;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await getSupabase().from('children').delete().eq('id', id);
  if (error) throw error;
}

/* ===== Quản trị: chỉ chạy được khi tài khoản có trong bảng `admins` (kiểm tra ở phía Supabase) ===== */

export interface AdminAccount {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  children: number;
  isAdmin: boolean;
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await getSupabase().rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function adminListAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await getSupabase().rpc('admin_list_accounts');
  if (error) throw error;
  return (
    data as { id: string; email: string | null; created_at: string; last_sign_in_at: string | null; children_count: number | string; is_admin: boolean }[]
  ).map((r) => ({
    id: r.id,
    email: r.email ?? '(không có email)',
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
    children: Number(r.children_count),
    isAdmin: r.is_admin,
  }));
}

export async function adminDeleteAccount(id: string): Promise<void> {
  const { error } = await getSupabase().rpc('admin_delete_account', { target: id });
  if (error) throw error;
}

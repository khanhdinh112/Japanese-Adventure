'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminDeleteAccount, adminListAccounts, type AdminAccount } from '../../lib/cloud';
import { viError } from '../../lib/supabase';
import { SceneArt } from '../art/SceneArt';
import { useAuth } from '../AuthProvider';
import { useGame } from '../GameProvider';
import { Modal } from '../ui/Modal';
import { TopBar } from '../ui/TopBar';
import { useIsAdmin } from '../useIsAdmin';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Quản trị: xem và xoá tài khoản phụ huynh. Mọi quyền được kiểm tra lại ở Supabase (hàm SQL), nút ẩn chỉ để gọn giao diện. */
export function AdminScreen() {
  const { go } = useGame();
  const auth = useAuth();
  const isAdmin = useIsAdmin();
  const [list, setList] = useState<AdminAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<AdminAccount | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setList(await adminListAccounts());
    } catch (e) {
      setList([]);
      setError(viError(e) || 'Không tải được danh sách tài khoản');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list ?? []).filter((a) => !q || a.email.toLowerCase().includes(q));
  }, [list, query]);

  const remove = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await adminDeleteAccount(target.id);
      setNotice(`Đã xoá tài khoản ${target.email}`);
      setTarget(null);
      setTyped('');
      await load();
    } catch (e) {
      setError(viError(e) || 'Không xoá được tài khoản');
      setTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin">
      <div className="journal-bg" aria-hidden>
        <SceneArt scene="engawa" />
      </div>
      <div className="journal-wash" aria-hidden />
      <TopBar title="Quản trị tài khoản" titleJp="かんりしゃ" onBack={() => go({ name: 'profiles' }, { kind: 'fade' })} backLabel="Quay lại" compact />
      <div className="admin-body">
        {!isAdmin ? (
          <section className="paper ad-card">
            <h3>Cần quyền quản trị</h3>
            <p>Tài khoản này chưa là quản trị viên. Cấp quyền bằng SQL trong Supabase (xem docs/AUTH.md).</p>
          </section>
        ) : (
          <section className="paper ad-card">
            <div className="ad-head">
              <div>
                <h3>Tài khoản ({list?.length ?? '…'})</h3>
                <p className="muted">Xoá tài khoản sẽ xoá luôn toàn bộ hồ sơ và tiến trình của các bé trong tài khoản đó.</p>
              </div>
              <input className="ad-search" type="search" placeholder="Tìm theo email…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            {notice && <p className="ad-notice" role="status">{notice}</p>}
            {list === null ? (
              <p>Đang tải…</p>
            ) : (
              <ul className="ad-list">
                {shown.map((a) => {
                  const me = a.id === auth.user?.id;
                  return (
                    <li key={a.id} data-email={a.email}>
                      <div className="ad-who">
                        <b>{a.email}</b>
                        {me && <em>bạn</em>}
                        {a.isAdmin && <em className="adm">admin</em>}
                      </div>
                      <small>
                        {a.children} bé · tạo {fmt(a.createdAt)} · đăng nhập gần nhất {fmt(a.lastSignInAt)}
                      </small>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={me || a.isAdmin}
                        title={me ? 'Không thể tự xoá chính mình' : a.isAdmin ? 'Hãy gỡ quyền admin trước' : undefined}
                        onClick={() => {
                          setTyped('');
                          setTarget(a);
                        }}
                      >
                        🗑 Xoá tài khoản
                      </button>
                    </li>
                  );
                })}
                {shown.length === 0 && <li className="ad-empty">Không có tài khoản nào khớp.</li>}
              </ul>
            )}
          </section>
        )}
      </div>

      {target && (
        <Modal title="Xoá tài khoản này?" onClose={() => !busy && setTarget(null)} width={680}>
          <p>
            Tài khoản <b>{target.email}</b> cùng {target.children} hồ sơ bé sẽ bị xoá vĩnh viễn và không thể khôi phục.
          </p>
          <p>
            Gõ lại email để xác nhận:
          </p>
          <input className="ad-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={target.email} autoFocus />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setTarget(null)} disabled={busy}>
              Giữ lại
            </button>
            <button type="button" className="btn btn-danger" disabled={busy || typed.trim().toLowerCase() !== target.email.toLowerCase()} onClick={() => void remove()}>
              {busy ? 'Đang xoá…' : 'Xoá vĩnh viễn'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

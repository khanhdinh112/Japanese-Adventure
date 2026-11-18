'use client';

import { useState, type FormEvent } from 'react';
import { googleEnabled, viError } from '../../lib/supabase';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { useAuth } from '../AuthProvider';
import { useGame } from '../GameProvider';
import { TopBar } from '../ui/TopBar';

type Tab = 'signin' | 'signup' | 'forgot';

const MIN_PASSWORD = 8;

/** Đăng nhập / tạo tài khoản dành cho phụ huynh, kèm quên mật khẩu và đặt mật khẩu mới. */
export function AuthScreen() {
  const auth = useAuth();
  const { go, playAsGuest } = useGame();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setNotice(null);
  };

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await job();
    } catch (e) {
      setError(viError(e));
    } finally {
      setBusy(false);
    }
  };

  const validate = (needPassword: boolean, needConfirm: boolean): string | null => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Hãy nhập một địa chỉ email hợp lệ.';
    if (needPassword && password.length < MIN_PASSWORD) return `Mật khẩu cần ít nhất ${MIN_PASSWORD} ký tự.`;
    if (needConfirm && password !== confirm) return 'Hai lần nhập mật khẩu chưa giống nhau.';
    return null;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (tab === 'signin') {
      if (!email.trim() || !password) return setError('Hãy nhập email và mật khẩu.');
      void run(() => auth.signIn(email, password));
    } else if (tab === 'signup') {
      const problem = validate(true, true);
      if (problem) return setError(problem);
      void run(async () => {
        const result = await auth.signUp(email, password);
        if (result === 'confirm') {
          setNotice(`Mình đã gửi thư xác nhận tới ${email.trim()}. Hãy mở thư, bấm liên kết, rồi quay lại đăng nhập.`);
          setTab('signin');
          setPassword('');
          setConfirm('');
        }
      });
    } else {
      const problem = validate(false, false);
      if (problem) return setError(problem);
      void run(async () => {
        await auth.sendPasswordReset(email);
        setNotice(`Nếu ${email.trim()} đã có tài khoản, thư đặt lại mật khẩu đang trên đường tới.`);
      });
    }
  };

  const submitNewPassword = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < MIN_PASSWORD) return setError(`Mật khẩu cần ít nhất ${MIN_PASSWORD} ký tự.`);
    if (password !== confirm) return setError('Hai lần nhập mật khẩu chưa giống nhau.');
    void run(async () => {
      await auth.updatePassword(password);
      setPassword('');
      setConfirm('');
    });
  };

  return (
    <div className="auth">
      <div className="auth-art" aria-hidden>
        <SceneArt scene="welcome" />
      </div>
      <div className="auth-veil" aria-hidden />
      <TopBar title="Tài khoản phụ huynh" titleJp="ほごしゃの アカウント" onBack={() => go({ name: 'welcome' }, { kind: 'fade' })} backLabel="Quay lại" compact />

      <div className="auth-momo" aria-hidden>
        <CharacterSprite id="momo" emotion="happy" variant="full" />
      </div>

      <div className="auth-card paper">
        {auth.recovering ? (
          <form onSubmit={submitNewPassword} noValidate>
            <h2>Đặt mật khẩu mới</h2>
            <p className="muted">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            <label className="auth-field">
              <span>Mật khẩu mới</span>
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="auth-field">
              <span>Nhập lại mật khẩu</span>
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
              {busy ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
            </button>
          </form>
        ) : (
          <>
            {tab !== 'forgot' && (
              <div className="auth-tabs" role="tablist" aria-label="Đăng nhập hoặc tạo tài khoản">
                <button type="button" role="tab" aria-selected={tab === 'signin'} className={tab === 'signin' ? 'on' : ''} onClick={() => switchTab('signin')}>
                  Đăng nhập
                </button>
                <button type="button" role="tab" aria-selected={tab === 'signup'} className={tab === 'signup' ? 'on' : ''} onClick={() => switchTab('signup')}>
                  Tạo tài khoản
                </button>
              </div>
            )}

            <form onSubmit={submit} noValidate>
              {tab === 'forgot' && (
                <>
                  <h2>Quên mật khẩu?</h2>
                  <p className="muted">Nhập email đã đăng ký, mình sẽ gửi liên kết để đặt mật khẩu mới.</p>
                </>
              )}
              {tab === 'signup' && <p className="muted">Một tài khoản phụ huynh có thể tạo hồ sơ riêng cho từng bé và chơi trên nhiều thiết bị.</p>}

              <label className="auth-field">
                <span>Email</span>
                <input type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              {tab !== 'forgot' && (
                <label className="auth-field">
                  <span>Mật khẩu</span>
                  <input
                    type="password"
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? `Ít nhất ${MIN_PASSWORD} ký tự` : undefined}
                  />
                </label>
              )}
              {tab === 'signup' && (
                <label className="auth-field">
                  <span>Nhập lại mật khẩu</span>
                  <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </label>
              )}

              {error && <p className="error" role="alert">{error}</p>}
              {notice && <p className="auth-notice" role="status">{notice}</p>}

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
                {busy ? 'Đang xử lý…' : tab === 'signin' ? 'Đăng nhập' : tab === 'signup' ? 'Tạo tài khoản' : 'Gửi liên kết đặt lại'}
              </button>
            </form>

            {tab === 'signin' && (
              <button type="button" className="auth-link" onClick={() => switchTab('forgot')}>
                Quên mật khẩu?
              </button>
            )}
            {tab === 'forgot' && (
              <button type="button" className="auth-link" onClick={() => switchTab('signin')}>
                ← Quay lại đăng nhập
              </button>
            )}

            {googleEnabled && tab !== 'forgot' && (
              <>
                <div className="auth-or" aria-hidden>
                  <span>hoặc</span>
                </div>
                <button type="button" className="btn btn-ghost btn-block" disabled={busy} onClick={() => void run(() => auth.signInWithGoogle())}>
                  <span aria-hidden>🔵</span> Tiếp tục với Google
                </button>
              </>
            )}

            <div className="auth-guest">
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  playAsGuest();
                  go({ name: 'welcome' }, { kind: 'fade' });
                }}
              >
                Chơi thử không cần tài khoản (tiến trình chỉ lưu trên máy này)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

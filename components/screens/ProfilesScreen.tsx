'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { TopBar } from '../ui/TopBar';

const MAX_CHILDREN = 6;

/** "Ai đang chơi?" — chọn hồ sơ bé trong tài khoản phụ huynh, hoặc thêm bé mới. */
export function ProfilesScreen() {
  const auth = useAuth();
  const { go, childList, childError, loadingChild, selectChild, startNewChild, refreshChildren, guestHasProgress, importGuestProgress, logout } = useGame();
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (childList === null) void refreshChildren();
  }, [childList, refreshChildren]);

  const list = childList ?? [];
  const full = list.length >= MAX_CHILDREN;

  const open = async (id: string) => {
    if (await selectChild(id)) go({ name: 'welcome' }, { kind: 'wash' });
  };

  const add = () => {
    startNewChild();
    go({ name: 'create' }, { kind: 'wash' });
  };

  return (
    <div className="profiles">
      <div className="auth-art" aria-hidden>
        <SceneArt scene="welcome" />
      </div>
      <div className="auth-veil" aria-hidden />
      <TopBar
        title="Ai đang chơi?"
        titleJp="だれが あそぶ？"
        onBack={() => go({ name: 'welcome' }, { kind: 'fade' })}
        backLabel="Quay lại"
        center={<span className="pf-email">{auth.user?.email}</span>}
        compact
      />

      <div className="pf-body">
        {childList === null && !childError ? (
          <p className="pf-loading">Đang mở danh sách hồ sơ…</p>
        ) : (
          <ul className="pf-grid" aria-label="Hồ sơ của các bé">
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" className="pf-card paper" disabled={loadingChild} onClick={() => void open(c.id)}>
                  <span className="pf-avatar" aria-hidden>
                    {c.look ? <CharacterSprite id="player" look={c.look} emotion="happy" variant="head" /> : <span className="pf-blank">🌱</span>}
                  </span>
                  <b>{c.name || 'Bé chưa đặt tên'}</b>
                  <small>
                    ⭐ {c.stars} · ✨ {c.xp}
                  </small>
                </button>
              </li>
            ))}
            {!full && (
              <li>
                <button type="button" className="pf-card pf-add paper" disabled={loadingChild} onClick={add}>
                  <span className="pf-avatar pf-plus" aria-hidden>
                    ＋
                  </span>
                  <b>Thêm bé</b>
                  <small>Tạo nhân vật mới</small>
                </button>
              </li>
            )}
          </ul>
        )}

        {childError && (
          <p className="error pf-error" role="alert">
            {childError}{' '}
            <button type="button" className="auth-link" onClick={() => void refreshChildren()}>
              Thử lại
            </button>
          </p>
        )}

        {guestHasProgress && childList !== null && !full && (
          <div className="pf-import paper">
            <p>
              <b>Có tiến trình chơi thử trên máy này.</b> Bạn có thể chuyển nó vào tài khoản thành một hồ sơ bé.
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={importing}
              onClick={async () => {
                setImporting(true);
                await importGuestProgress();
                setImporting(false);
              }}
            >
              {importing ? 'Đang chuyển…' : 'Chuyển vào tài khoản'}
            </button>
          </div>
        )}

        <div className="pf-foot">
          <button type="button" className="btn btn-pill btn-sm" onClick={() => void logout()}>
            ⎋ Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

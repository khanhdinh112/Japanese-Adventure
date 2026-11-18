'use client';

import { useState } from 'react';
import { getStage } from '../../data/stages';
import { nextStage } from '../../lib/selectors';
import { authEnabled } from '../../lib/supabase';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { AmbientLayer } from '../ui/AmbientLayer';
import { SettingsMenu } from '../ui/SettingsMenu';

/** Màn hình chào: ngôi nhà bà Hana lúc bình minh, tên game, Tiếp tục / Bắt đầu. */
export function WelcomeScreen() {
  const { state, go, startStage, mode, activeChildId, leaveChild, playAsGuest, guestHasProgress } = useGame();
  const [settings, setSettings] = useState(false);
  const profile = state.profile;
  const upcoming = nextStage(state);
  const resumeStage = upcoming ? getStage(upcoming.stageId) : null;

  return (
    <div className="welcome">
      <div className="welcome-art">
        <SceneArt scene="welcome" />
      </div>
      <AmbientLayer kind="petals" seed={7} />
      <div className="welcome-fade" aria-hidden />

      <div className="welcome-chars" aria-hidden>
        <div className="wc-momo">
          <CharacterSprite id="momo" emotion="happy" variant="full" />
        </div>
      </div>

      <header className="welcome-title">
        <span className="wt-jp" lang="ja">
          にほんの ぼうけん
        </span>
        <h1>
          Japanese
          <br />
          Adventure
        </h1>
        <p className="wt-sub">Hành trình đến ngôi nhà của bà Hana</p>
        <p className="wt-tag">Học tiếng Nhật bằng một câu chuyện, từng ngôi sao một.</p>

        <div className="welcome-actions">
          {mode === 'none' ? (
            <>
              <button type="button" className="btn btn-primary btn-xl" onClick={() => go({ name: 'auth' }, { kind: 'fade' })}>
                🔑 Đăng nhập / Tạo tài khoản
              </button>
              <p className="wa-note">Tài khoản dành cho phụ huynh, lưu tiến trình của từng bé.</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  playAsGuest();
                  if (!guestHasProgress) go({ name: 'create' }, { kind: 'wash' });
                }}
              >
                🎒 Chơi thử không cần tài khoản
              </button>
            </>
          ) : mode === 'account' && !activeChildId ? (
            <>
              <button type="button" className="btn btn-primary btn-xl" onClick={() => go({ name: 'profiles' }, { kind: 'fade' })}>
                👧 Chọn bé để chơi
              </button>
              <p className="wa-note">Đã đăng nhập · chọn hồ sơ của bé hoặc thêm bé mới.</p>
            </>
          ) : profile ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-xl"
                onClick={() => {
                  if (upcoming) {
                    startStage(upcoming.stageId);
                    go({ name: 'region', regionId: upcoming.regionId }, { kind: 'zoom' });
                  } else go({ name: 'world' }, { kind: 'wash' });
                }}
              >
                ▶ Tiếp tục hành trình
              </button>
              <p className="wa-note">
                Xin chào, <b>{profile.name}</b>
                {resumeStage ? ` · Tiếp theo: ${resumeStage.title}` : ''}
              </p>
              <div className="wa-row">
                <button type="button" className="btn btn-ghost" onClick={() => go({ name: 'world' }, { kind: 'wash' })}>
                  🗺️ Bản đồ
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => go({ name: 'create' }, { kind: 'fade' })}>
                  ✏️ Đổi nhân vật
                </button>
                {mode === 'account' && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={async () => {
                      await leaveChild();
                      go({ name: 'profiles' }, { kind: 'fade' });
                    }}
                  >
                    👧 Đổi bé
                  </button>
                )}
                {mode === 'guest' && authEnabled && (
                  <button type="button" className="btn btn-ghost" onClick={() => go({ name: 'auth' }, { kind: 'fade' })}>
                    🔑 Đăng nhập
                  </button>
                )}
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-xl" onClick={() => go({ name: 'create' }, { kind: 'wash' })}>
              ▶ Bắt đầu cuộc phiêu lưu
            </button>
          )}
        </div>
      </header>

      {mode !== 'none' && (
        <footer className="welcome-foot">
          <button type="button" className="btn btn-pill" onClick={() => go({ name: 'parent' }, { kind: 'fade' })}>
            👪 Dành cho phụ huynh
          </button>
        </footer>
      )}
      <div className="wf-set">
        <button type="button" className="icon-btn" aria-label="Cài đặt" onClick={() => setSettings((v) => !v)}>
          ⚙️
        </button>
        {settings && <SettingsMenu onClose={() => setSettings(false)} />}
      </div>
    </div>
  );
}

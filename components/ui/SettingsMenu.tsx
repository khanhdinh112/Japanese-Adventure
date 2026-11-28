'use client';

import { useEffect, useState } from 'react';
import { musicStatus, onMusicChange } from '../../lib/music';
import { canFullscreen, enterImmersive, exitImmersive, isFullscreen } from '../../lib/device';
import { useGame } from '../GameProvider';
import { useSpeech } from './useSpeech';

function detectPlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`toggle${on ? ' on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="toggle-text">
        <b>{label}</b>
        <small>{desc}</small>
      </span>
      <span className="toggle-knob" aria-hidden />
    </button>
  );
}

export function SettingsMenu({ onClose }: { onClose: () => void }) {
  const { state, setSettings, setTourSeen, go, route } = useGame();
  const s = state.settings;
  const { canSpeak, speaking, play, recheck } = useSpeech();
  const platform = detectPlatform();
  const [playing, setPlaying] = useState(musicStatus().playing);
  const [full, setFull] = useState(false);
  const [fsOk, setFsOk] = useState(false);
  useEffect(() => {
    setFsOk(canFullscreen());
    const upd = () => setFull(isFullscreen());
    upd();
    document.addEventListener('fullscreenchange', upd);
    return () => document.removeEventListener('fullscreenchange', upd);
  }, []);
  useEffect(() => {
    const upd = () => setPlaying(musicStatus().playing);
    upd();
    const id = window.setInterval(upd, 600);
    const off = onMusicChange(upd);
    return () => {
      window.clearInterval(id);
      off();
    };
  }, []);
  return (
    <div className="settings-pop" role="dialog" aria-label="Cài đặt">
      <div className="settings-head">
        <b>Cài đặt</b>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </div>
      <Toggle label="Luôn hiện nghĩa tiếng Việt" desc="Tắt: nghĩa được ẩn, bé chạm “Xem nghĩa” khi cần" on={s.meaning} onChange={(meaning) => setSettings({ meaning })} />
      <Toggle label="Hiện romaji" desc="Chữ La-tinh dưới câu tiếng Nhật" on={s.romaji} onChange={(romaji) => setSettings({ romaji })} />
      <Toggle label="Nhạc nền" desc={s.music ? (playing ? 'Đang phát nhạc không lời' : 'Chạm vào màn hình để bắt đầu phát nhạc') : 'Nhạc không lời nhẹ nhàng khi chơi'} on={s.music} onChange={(music) => setSettings({ music })} />
      <Toggle label="Hiệu ứng âm thanh" desc="Tiếng chạm, tiếng nhận sao, tiếng lật trang" on={s.sound} onChange={(sound) => setSettings({ sound })} />
      <Toggle label="Giọng đọc lời thoại" desc="Tự đọc to lời thoại tiếng Nhật khi có thoại mới" on={s.voice} onChange={(voice) => setSettings({ voice })} />
      <div className={`voice-status ${canSpeak ? 'ok' : 'none'}`}>
        {canSpeak ? (
          <>
            <span>
              ✅ Máy có giọng đọc tiếng Nhật
              {platform !== 'desktop' && <small className="voice-tip"> · Không nghe thấy? Tăng âm lượng nhạc/media{platform === 'ios' ? ' và gạt công tắc im lặng sang chế độ có tiếng' : ''}.</small>}
            </span>
            <button type="button" className="btn btn-pill" onClick={() => play('こんにちは。いっしょに にほんごを べんきょうしましょう。')} disabled={speaking}>
              🔊 Nghe thử
            </button>
          </>
        ) : (
          <>
            <span>
              ⚠️ Máy này chưa có giọng đọc tiếng Nhật nên lời thoại chỉ hiện chữ.{' '}
              {platform === 'android'
                ? 'Android: Cài đặt → Quản lý chung → Chuyển văn bản thành giọng nói → ⚙ bên cạnh “Dịch vụ giọng nói của Google” → Cài đặt dữ liệu giọng nói → Tiếng Nhật (Nhật Bản), rồi tải về.'
                : platform === 'ios'
                  ? 'iPhone/iPad: Cài đặt → Trợ năng → Nội dung đọc to → Giọng nói → Tiếng Nhật, chọn một giọng (ví dụ Kyoko) và tải về.'
                  : 'Hãy cài giọng “Japanese (日本語)” trong cài đặt Giọng nói / Ngôn ngữ của thiết bị.'}{' '}
              Sau đó bấm “Kiểm tra lại”.
            </span>
            <button type="button" className="btn btn-pill" onClick={() => recheck()}>
              🔄 Kiểm tra lại
            </button>
          </>
        )}
      </div>
      {fsOk && (
        <button type="button" className="btn btn-ghost btn-block" onClick={() => void (full ? exitImmersive() : enterImmersive())}>
          {full ? '🗗 Thoát toàn màn hình' : '⛶ Toàn màn hình (ngang)'}
        </button>
      )}
      {state.profile && (
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => {
            onClose();
            setTourSeen(false);
            if (route.name !== 'world') go({ name: 'world' }, { kind: 'fade' });
          }}
        >
          🧭 Xem lại hướng dẫn nhanh
        </button>
      )}
      {route.name !== 'welcome' && (
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => {
            onClose();
            go({ name: 'welcome' }, { kind: 'fade' });
          }}
        >
          🏠 Về màn hình chính
        </button>
      )}
    </div>
  );
}

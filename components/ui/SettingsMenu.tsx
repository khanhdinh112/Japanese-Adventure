'use client';

import { useEffect, useState } from 'react';
import { musicStatus, onMusicChange } from '../../lib/music';
import { useGame } from '../GameProvider';
import { useSpeech } from './useSpeech';

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
  const { canSpeak, speaking, play } = useSpeech();
  const [playing, setPlaying] = useState(musicStatus().playing);
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
            <span>✅ Máy có giọng đọc tiếng Nhật</span>
            <button type="button" className="btn btn-pill" onClick={() => play('こんにちは。いっしょに にほんごを べんきょうしましょう。')} disabled={speaking}>
              🔊 Nghe thử
            </button>
          </>
        ) : (
          <span>
            ⚠️ Máy này chưa có giọng đọc tiếng Nhật nên lời thoại chỉ hiện chữ. Hãy cài giọng “Japanese (日本語)” trong cài đặt Giọng nói / Ngôn ngữ của thiết bị, rồi mở lại game.
          </span>
        )}
      </div>
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

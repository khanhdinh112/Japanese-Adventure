'use client';

import { useGame } from '../GameProvider';

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
  const { state, setSettings, go, route } = useGame();
  const s = state.settings;
  return (
    <div className="settings-pop" role="dialog" aria-label="Cài đặt">
      <div className="settings-head">
        <b>Cài đặt</b>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </div>
      <Toggle label="Hiện romaji" desc="Chữ La-tinh dưới câu tiếng Nhật" on={s.romaji} onChange={(romaji) => setSettings({ romaji })} />
      <Toggle label="Âm thanh" desc="Tiếng chạm, tiếng sao, tiếng lật trang" on={s.sound} onChange={(sound) => setSettings({ sound })} />
      <Toggle label="Tự đọc lời thoại" desc="Giọng đọc tiếng Nhật khi có thoại mới" on={s.voice} onChange={(voice) => setSettings({ voice })} />
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

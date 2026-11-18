'use client';

import { useState, type ReactNode } from 'react';
import { streak, totalStars } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { SettingsMenu } from './SettingsMenu';

interface Props {
  title?: string;
  titleJp?: string;
  onBack?: () => void;
  backLabel?: string;
  center?: ReactNode;
  /** Ẩn các nút nhật ký / phụ huynh (ví dụ trong lúc đang làm bài) */
  compact?: boolean;
  tone?: 'light' | 'dark';
}

/** Thanh HUD phía trên: quay lại, tên màn hình, sao/XP, nhật ký, phụ huynh, cài đặt. */
export function TopBar({ title, titleJp, onBack, backLabel = 'Quay lại', center, compact = false, tone = 'light' }: Props) {
  const { state, go, route } = useGame();
  const [open, setOpen] = useState(false);
  const stars = totalStars(state);
  const days = streak(state);
  return (
    <header className={`topbar topbar-${tone}`}>
      <div className="topbar-left">
        {onBack && (
          <button type="button" className="btn btn-pill" onClick={onBack}>
            ← {backLabel}
          </button>
        )}
        {title && (
          <div className="topbar-title">
            <b>{title}</b>
            {titleJp && <small lang="ja">{titleJp}</small>}
          </div>
        )}
      </div>
      <div className="topbar-center">{center}</div>
      <div className="topbar-right">
        <span className="chip" title="Tổng số sao">
          ⭐ {stars}
        </span>
        <span className="chip" title="Điểm kinh nghiệm">
          ✨ {state.xp}
        </span>
        {days > 0 && (
          <span className="chip" title="Số ngày học liên tiếp">
            🔥 {days}
          </span>
        )}
        {!compact && (
          <>
            <button
              type="button"
              className="icon-btn"
              aria-label="Nhật ký"
              title="Nhật ký"
              disabled={route.name === 'journal'}
              onClick={() => go({ name: 'journal' }, { kind: 'wash' })}
            >
              📔
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Dành cho phụ huynh"
              title="Dành cho phụ huynh"
              disabled={route.name === 'parent'}
              onClick={() => go({ name: 'parent' }, { kind: 'fade' })}
            >
              👪
            </button>
          </>
        )}
        <button type="button" className="icon-btn" aria-label="Cài đặt" title="Cài đặt" onClick={() => setOpen((v) => !v)}>
          ⚙️
        </button>
        {open && <SettingsMenu onClose={() => setOpen(false)} />}
      </div>
    </header>
  );
}

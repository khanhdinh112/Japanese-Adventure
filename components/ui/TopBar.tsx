'use client';

import { useState, type ReactNode } from 'react';
import { levelInfo } from '../../lib/levels';
import { starBalance, streak } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { RewardsModal, type RewardsTab } from './RewardsModal';
import { SettingsMenu } from './SettingsMenu';
import { WardrobeModal } from './WardrobeModal';

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
  const [rewards, setRewards] = useState<RewardsTab | null>(null);
  const [wardrobe, setWardrobe] = useState(false);
  const stars = starBalance(state);
  const level = levelInfo(state.xp).level;
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
        <button type="button" className="chip chip-btn" title="Sao có thể tiêu. Bấm để xem cách kiếm và dùng sao" onClick={() => setRewards('stars')}>
          ⭐ {stars}
        </button>
        <button type="button" className="chip chip-btn" title="Điểm kinh nghiệm và cấp độ. Bấm để xem chi tiết" onClick={() => setRewards('xp')}>
          ✨ {state.xp} · Cấp {level}
        </button>
        {days > 0 && (
          <button type="button" className="chip chip-btn" title="Số ngày học liên tiếp" onClick={() => setRewards('streak')}>
            🔥 {days}
          </button>
        )}
        {!compact && (
          <>
            {state.profile && (
              <button type="button" className="icon-btn" aria-label="Tủ đồ" title="Tủ đồ" onClick={() => setWardrobe(true)}>
                👕
              </button>
            )}
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
        {rewards && (
          <RewardsModal
            focus={rewards}
            onClose={() => setRewards(null)}
            onOpenWardrobe={
              state.profile
                ? () => {
                    setRewards(null);
                    setWardrobe(true);
                  }
                : undefined
            }
          />
        )}
        {wardrobe && <WardrobeModal onClose={() => setWardrobe(false)} />}
      </div>
    </header>
  );
}

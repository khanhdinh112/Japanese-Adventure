'use client';

import { useState } from 'react';
import { lockedSlots, revertLocked, type WardrobeItem } from '../../data/wardrobe';
import { levelInfo } from '../../lib/levels';
import { starBalance } from '../../lib/selectors';
import type { PlayerLook } from '../../lib/gameState';
import { CharacterSprite } from '../CharacterSprite';
import { useGame } from '../GameProvider';
import { Modal } from './Modal';
import { WardrobePanel } from './WardrobePanel';

/** Tủ đồ: thay diện mạo bất cứ lúc nào, tiêu sao để mở khoá đồ mới. */
export function WardrobeModal({ onClose }: { onClose: () => void }) {
  const { state, setLook, unlockItem } = useGame();
  const current = state.profile?.look;
  const [look, setLocal] = useState<PlayerLook | null>(current ?? null);
  if (!look) return null;
  const balance = starBalance(state);
  const level = levelInfo(state.xp).level;
  const locked = lockedSlots(look, state.owned);
  const buy = (item: WardrobeItem) => {
    if (balance >= item.cost) unlockItem(item.id);
  };
  const save = () => {
    setLook(revertLocked(look, state.owned));
    onClose();
  };
  return (
    <Modal
      title="Tủ đồ của bạn"
      onClose={onClose}
      width={1280}
      footer={
        <div className="wd-footer">
          {locked.length > 0 && <span className="muted">🔒 {locked.length} món đang mặc thử, chưa mở khoá nên sẽ không được lưu.</span>}
          <button type="button" className="btn btn-pill" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn btn-primary" onClick={save}>
            Lưu diện mạo
          </button>
        </div>
      }
    >
      <div className="wd-modal">
        <div className="wd-modal-preview">
          <CharacterSprite id="player" look={look} emotion="happy" variant="full" />
        </div>
        <WardrobePanel look={look} onChange={setLocal} owned={state.owned} balance={balance} level={level} onBuy={buy} />
      </div>
    </Modal>
  );
}

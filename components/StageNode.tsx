'use client';

import type { StageStub } from '../data/types';
import type { StageStatus } from '../lib/selectors';
import { StarRating } from './ui/StarRating';

interface Props {
  stub: StageStub;
  status: StageStatus;
  stars: number;
  selected: boolean;
  x: number;
  y: number;
  onClick: () => void;
}

const STATUS_LABEL: Record<StageStatus, string> = {
  soon: 'Sắp ra mắt',
  locked: 'Đang khoá',
  available: 'Sẵn sàng',
  current: 'Đang chơi dở',
  completed: 'Đã hoàn thành',
};

/** Một chặng trên bản đồ vùng. Bấm để xem trước; luôn có hành động thật (không phải nút trang trí). */
export function StageNode({ stub, status, stars, selected, x, y, onClick }: Props) {
  const dim = status === 'soon' || status === 'locked';
  return (
    <button
      type="button"
      className={`stage-node st-${status}${selected ? ' is-selected' : ''}`}
      style={{ left: x, top: y }}
      onClick={onClick}
      aria-label={`Chặng ${stub.index}: ${stub.title}. ${STATUS_LABEL[status]}`}
      aria-pressed={selected}
    >
      <span className="sn-ring" aria-hidden />
      <span className="sn-disc">
        {status === 'locked' ? <span aria-hidden>🔒</span> : status === 'soon' ? <span aria-hidden>…</span> : <b>{stub.index}</b>}
      </span>
      {!dim && <span className="sn-icon" aria-hidden>{stub.icon}</span>}
      {status === 'completed' && <StarRating value={stars} size="sm" className="sn-stars" />}
      <span className="sn-label">{stub.soon ? `Chặng ${stub.index}` : stub.title}</span>
    </button>
  );
}

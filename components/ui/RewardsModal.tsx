'use client';

import { useMemo, useState } from 'react';
import { levelInfo, xpForLevel } from '../../lib/levels';
import { earnedStars, starBalance, starsSpent, streak } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { Modal } from './Modal';

export type RewardsTab = 'stars' | 'xp' | 'streak';

const WAYS_STARS: [string, string][] = [
  ['+1 ⭐', 'Hoàn thành một chặng'],
  ['+1 ⭐', 'Nhớ tốt từ mới: đúng ít nhất 2/3, dùng không quá 1 gợi ý'],
  ['+1 ⭐', 'Đúng từ 80% trở lên và lưu Nhiệm vụ của bé vào nhật ký'],
  ['+1 ⭐', 'Mỗi 10 chữ thuộc trong Góc luyện chữ'],
];

const WAYS_XP: [string, string][] = [
  ['+15 XP', 'Mỗi bước học hoàn thành'],
  ['+30 XP', 'Lưu Nhiệm vụ của bé'],
  ['+50 XP', 'Hoàn thành một chặng'],
  ['+15 XP', 'Mỗi sao nhận được'],
  ['+4 XP', 'Mỗi lần nhớ thêm một chữ (Góc luyện chữ)'],
  ['+15 XP', 'Hoàn thành một lượt chơi nhận mặt chữ'],
];

function Ways({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="rw-ways">
      {rows.map(([pill, text], i) => (
        <li key={i}>
          <span className="rw-pill">{pill}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Giải thích sao, điểm kinh nghiệm (XP) và chuỗi ngày: kiếm thế nào, dùng để làm gì. Mỗi thứ một thẻ, bấm để chuyển. */
export function RewardsModal({ onClose, focus = 'stars', onOpenWardrobe }: { onClose: () => void; focus?: RewardsTab; onOpenWardrobe?: () => void }) {
  const { state } = useGame();
  const [tab, setTab] = useState<RewardsTab>(focus);
  const info = useMemo(() => levelInfo(state.xp), [state.xp]);
  const earned = earnedStars(state);
  const spent = starsSpent(state);
  const balance = starBalance(state);
  const days = streak(state);
  const pct = Math.round(info.progress * 100);

  const tabs: { id: RewardsTab; icon: string; value: string; label: string }[] = [
    { id: 'stars', icon: '⭐', value: String(balance), label: 'Sao' },
    { id: 'xp', icon: '✨', value: `Cấp ${info.level}`, label: 'Kinh nghiệm' },
    { id: 'streak', icon: '🔥', value: `${days} ngày`, label: 'Chuỗi ngày' },
  ];

  return (
    <Modal title="Sao, kinh nghiệm và chuỗi ngày" onClose={onClose} width={960}>
      <div className="rw">
        <div className="rw-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`rw-tab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
              <span className="rw-tab-ic" aria-hidden>{t.icon}</span>
              <span className="rw-tab-tx">
                <small>{t.label}</small>
                <b>{t.value}</b>
              </span>
            </button>
          ))}
        </div>

        {tab === 'stars' && (
          <div className="rw-panel">
            <p className="rw-head">
              <b>{balance}</b> sao có thể tiêu <small>(đã kiếm {earned} · đã tiêu {spent})</small>
            </p>
            <h4>Kiếm sao</h4>
            <Ways rows={WAYS_STARS} />
            <h4>Dùng sao</h4>
            <p>Mở khoá trang phục, tóc, mũ và phụ kiện trong Tủ đồ. Sao cũng mở các vùng mới trên bản đồ. Chơi lại chặng để lấy đủ 3 sao; sao đã kiếm không mất.</p>
            {onOpenWardrobe && (
              <button type="button" className="btn btn-primary" onClick={onOpenWardrobe}>
                Mở Tủ đồ 👕
              </button>
            )}
          </div>
        )}

        {tab === 'xp' && (
          <div className="rw-panel">
            <p className="rw-head">
              <b>{state.xp}</b> XP <small>· {info.title.title} <span lang="ja">({info.title.jp})</span></small>
            </p>
            <div className="rw-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${pct}%` }} />
            </div>
            <p className="rw-sub">
              Còn {info.remaining} XP để lên cấp {info.level + 1}: <b>{info.nextTitle.title}</b>
            </p>
            <h4>Kiếm XP</h4>
            <Ways rows={WAYS_XP} />
            <h4>Dùng XP</h4>
            <p>
              XP giúp bé lên cấp và nhận danh hiệu. Vài món trong Tủ đồ mở theo cấp: <b>cấp 2</b> mũ rơm · <b>cấp 3</b> kimono, búi tóc · <b>cấp 4</b> vòng hoa, mặt nạ lễ hội. XP không bị tiêu đi.
            </p>
            <p className="rw-note">{[2, 3, 4, 5].map((l) => `Cấp ${l}: ${xpForLevel(l)} XP`).join(' · ')}</p>
          </div>
        )}

        {tab === 'streak' && (
          <div className="rw-panel">
            <p className="rw-head">
              <b>{days}</b> ngày liên tiếp
            </p>
            <p>Mỗi ngày bé học dù chỉ một chút, chuỗi dài thêm một ngày. Nghỉ một ngày thì chuỗi bắt đầu lại. Học đều từng ít một giúp nhớ chữ lâu hơn.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

'use client';

import { useMemo } from 'react';
import { levelInfo, xpForLevel } from '../../lib/levels';
import { earnedStars, starBalance, starsSpent, streak } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { Modal } from './Modal';

export type RewardsTab = 'stars' | 'xp' | 'streak';

/** Giải thích sao, điểm kinh nghiệm (XP) và chuỗi ngày: kiếm thế nào, dùng để làm gì. */
export function RewardsModal({ onClose, focus = 'stars', onOpenWardrobe }: { onClose: () => void; focus?: RewardsTab; onOpenWardrobe?: () => void }) {
  const { state } = useGame();
  const info = useMemo(() => levelInfo(state.xp), [state.xp]);
  const earned = earnedStars(state);
  const spent = starsSpent(state);
  const balance = starBalance(state);
  const days = streak(state);
  return (
    <Modal title="Sao và điểm kinh nghiệm" onClose={onClose} width={1180}>
      <div className="rw-grid">
        <section className={`rw-card${focus === 'stars' ? ' focus' : ''}`}>
          <h3>⭐ Sao</h3>
          <p className="rw-big">
            <b>{balance}</b> sao có thể tiêu
          </p>
          <p className="rw-sub">
            Đã kiếm {earned} · đã tiêu {spent}
          </p>
          <h4>Kiếm sao thế nào?</h4>
          <ul>
            <li>
              <b>+1 ⭐</b> khi hoàn thành một chặng.
            </li>
            <li>
              <b>+1 ⭐</b> khi nhớ tốt từ mới: trả lời đúng ít nhất 2/3 mà dùng không quá 1 gợi ý.
            </li>
            <li>
              <b>+1 ⭐</b> khi đúng từ 80% trở lên và lưu được Nhiệm vụ của bé vào nhật ký.
            </li>
            <li>
              <b>+1 ⭐</b> cho mỗi 10 chữ bạn thuộc trong Góc luyện chữ (Hiragana, Katakana hoặc Kanji).
            </li>
          </ul>
          <p className="rw-note">Chơi lại chặng để lấy thêm sao nếu lần trước chưa đủ 3 sao. Sao đã kiếm không bị mất khi chơi lại.</p>
          <h4>Dùng sao để làm gì?</h4>
          <p>Mở khoá trang phục, kiểu tóc, mũ và phụ kiện mới trong Tủ đồ. Sao cũng làm đầy bản đồ: mỗi vùng cần đủ sao để mở vùng kế tiếp.</p>
          {onOpenWardrobe && (
            <button type="button" className="btn btn-primary" onClick={onOpenWardrobe}>
              Mở Tủ đồ 👕
            </button>
          )}
        </section>

        <section className={`rw-card${focus === 'xp' ? ' focus' : ''}`}>
          <h3>✨ Điểm kinh nghiệm (XP)</h3>
          <p className="rw-big">
            <b>{state.xp}</b> XP · Cấp {info.level}
          </p>
          <p className="rw-sub">
            {info.title.title} <span lang="ja">({info.title.jp})</span>
          </p>
          <div className="rw-bar" role="progressbar" aria-valuenow={Math.round(info.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${Math.round(info.progress * 100)}%` }} />
          </div>
          <p className="rw-sub">
            Còn {info.remaining} XP để lên cấp {info.level + 1}: <b>{info.nextTitle.title}</b>
          </p>
          <h4>Kiếm XP thế nào?</h4>
          <ul>
            <li>
              <b>+15 XP</b> mỗi bước học hoàn thành (xem từ, nghe, ghép, nói…).
            </li>
            <li>
              <b>+30 XP</b> khi lưu Nhiệm vụ của bé.
            </li>
            <li>
              <b>+50 XP</b> khi hoàn thành một chặng.
            </li>
            <li>
              <b>+15 XP</b> cho mỗi sao nhận được.
            </li>
            <li>
              <b>+4 XP</b> mỗi lần nhớ thêm một chữ trong Góc luyện chữ, và <b>+15 XP</b> khi hoàn thành một lượt chơi.
            </li>
          </ul>
          <h4>Dùng XP để làm gì?</h4>
          <p>
            XP làm bé lên cấp và nhận danh hiệu mới. Một số món đặc biệt trong Tủ đồ cần đạt cấp nhất định mới mở được: cấp 2 cho mũ rơm, cấp 3 cho kimono và búi tóc, cấp 4 cho vòng hoa và mặt nạ lễ hội. XP không bị tiêu đi như sao.
          </p>
          <p className="rw-note">
            Mốc cấp: {[2, 3, 4, 5].map((l) => `cấp ${l} = ${xpForLevel(l)} XP`).join(' · ')}…
          </p>
        </section>

        <section className={`rw-card rw-small${focus === 'streak' ? ' focus' : ''}`}>
          <h3>🔥 Chuỗi ngày</h3>
          <p className="rw-big">
            <b>{days}</b> ngày liên tiếp
          </p>
          <p>Mỗi ngày bé học dù chỉ một chút, chuỗi sẽ dài thêm một ngày. Nghỉ một ngày thì chuỗi bắt đầu lại. Học đều từng ít một sẽ giúp nhớ chữ lâu hơn.</p>
        </section>
      </div>
    </Modal>
  );
}

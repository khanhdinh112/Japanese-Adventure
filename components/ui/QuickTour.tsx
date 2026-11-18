'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Emotion, CharacterId } from '../../data/types';
import { CharacterSprite } from '../CharacterSprite';
import { useGame } from '../GameProvider';

interface Slide {
  speaker: CharacterId;
  emotion: Emotion;
  title: string;
  jp?: string;
  body: ReactNode;
}

function slides(name: string): Slide[] {
  return [
    {
      speaker: 'hana',
      emotion: 'happy',
      title: `Chào mừng ${name} đến với Japanese Adventure!`,
      jp: 'ようこそ！',
      body: (
        <>
          <p>Bà Osano sống ở làng Saga, Nhật Bản. Bà nhờ bạn và chú mèo Momo đi tìm những chiếc đèn kỷ niệm bị lạc, để học tiếng Nhật và khám phá văn hoá Nhật Bản theo một câu chuyện dài.</p>
          <p>Mỗi ngày chỉ cần học một chút, câu chuyện sẽ tiếp tục.</p>
        </>
      ),
    },
    {
      speaker: 'momo',
      emotion: 'surprised',
      title: 'Bản đồ phiêu lưu',
      jp: 'ちず',
      body: (
        <>
          <p>
            Hành trình bắt đầu ở <b>làng Saga</b> (dưới cùng của bản đồ) rồi đi dần lên cao. Kéo bản đồ lên để xem những vùng đất mới.
          </p>
          <p>Mỗi vùng có nhiều chặng. Hoàn thành chặng, vùng kế tiếp sẽ sáng lên và được mở khoá.</p>
        </>
      ),
    },
    {
      speaker: 'hana',
      emotion: 'neutral',
      title: 'Mỗi chặng có 6 bước nhỏ',
      jp: 'ステップ',
      body: (
        <ul>
          <li>📖 <b>Câu chuyện</b>: xem và nghe hội thoại.</li>
          <li>🌸 <b>Từ vựng</b>: làm quen từ mới.</li>
          <li>🧩 <b>Ngữ pháp</b>: ghép câu đơn giản.</li>
          <li>👂 <b>Nghe</b>: nghe rồi chọn đáp án.</li>
          <li>🧭 <b>Nhiệm vụ</b>: dùng từ đã học để làm một việc thật.</li>
          <li>⭐ <b>Tự làm</b>: thử một mình không cần gợi ý.</li>
        </ul>
      ),
    },
    {
      speaker: 'momo',
      emotion: 'happy',
      title: 'Sao ⭐ và điểm kinh nghiệm ✨',
      jp: 'ほし と けいけん',
      body: (
        <>
          <p>
            <b>Sao ⭐</b> kiếm được khi hoàn thành chặng và học thật tốt. Sao dùng để <b>mở khoá đồ mới</b> trong Tủ đồ.
          </p>
          <p>
            <b>Điểm kinh nghiệm ✨</b> tăng dần khi học, giúp bạn lên cấp và nhận danh hiệu. Một số món đặc biệt cần đạt cấp nhất định.
          </p>
          <p className="qt-tip">Bấm vào ⭐ hoặc ✨ ở góc trên bất cứ lúc nào để xem chi tiết.</p>
        </>
      ),
    },
    {
      speaker: 'player',
      emotion: 'happy',
      title: 'Tủ đồ, nhật ký và luyện chữ',
      jp: 'おしゃれ',
      body: (
        <ul>
          <li>👕 <b>Tủ đồ</b>: thay kiểu tóc, trang phục, mũ và phụ kiện.</li>
          <li>📔 <b>Nhật ký</b>: lưu những điều bạn đã học và nhiệm vụ đã làm.</li>
          <li>👪 <b>Phụ huynh</b>: xem tiến độ học của bé.</li>
          <li>⚙️ <b>Cài đặt</b>: bật hoặc tắt nhạc nền, âm thanh, giọng đọc. Bạn có thể xem lại hướng dẫn này ở đây.</li>
        </ul>
      ),
    },
  ];
}

/** Hướng dẫn nhanh cho bé mới: hiện một lần sau khi tạo nhân vật (hoặc khi xem lại từ Cài đặt). */
export function QuickTour() {
  const { state, setTourSeen } = useGame();
  const name = state.profile?.name ?? 'bạn';
  const list = slides(name);
  const [i, setI] = useState(0);
  const last = i === list.length - 1;
  const s = list[i];
  const close = () => setTourSeen(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setI((n) => Math.min(list.length - 1, n + 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label="Hướng dẫn nhanh">
      <div className="tour-card">
        <div className="tour-char" key={i}>
          <CharacterSprite id={s.speaker} emotion={s.emotion} variant="bust" look={s.speaker === 'player' ? state.profile?.look : undefined} />
        </div>
        <div className="tour-main">
          <small className="tour-step">
            Hướng dẫn nhanh {i + 1}/{list.length}
          </small>
          <h2>{s.title}</h2>
          {s.jp && <span className="tour-jp" lang="ja">{s.jp}</span>}
          <div className="tour-body">{s.body}</div>
          <div className="tour-dots" aria-hidden>
            {list.map((_, k) => (
              <i key={k} className={k === i ? 'on' : ''} />
            ))}
          </div>
          <div className="tour-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Bỏ qua
            </button>
            <span className="tour-spacer" />
            {i > 0 && (
              <button type="button" className="btn btn-pill" onClick={() => setI(i - 1)}>
                ← Trước
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={() => (last ? close() : setI(i + 1))}>
              {last ? 'Bắt đầu thôi! ▶' : 'Tiếp ▶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

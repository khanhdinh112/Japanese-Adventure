'use client';

import { useState } from 'react';

const regions = [
  ['01', 'Làng Saga', 'さがの さと', '🏡', 'Bắt đầu'], ['02', 'Rừng Ánh Sáng', 'ひかりの もり', '🌲', 'Mở khóa'],
  ['03', 'Thị trấn Mèo', 'ねこの まち', '🐈', 'Mở khóa'], ['04', 'Trường học Nhật', 'にほんの がっこう', '🎒', 'Mở khóa'],
  ['05', 'Làng Đường sắt', 'でんしゃの えき', '🚂', 'Mở khóa'], ['06', 'Chợ Nhật Bản', 'にほんの いちば', '🏮', 'Mở khóa'],
  ['07', 'Lễ hội Mùa hè', 'なつまつり', '🎆', 'Mở khóa'], ['08', 'Núi Phú Sĩ', 'ふじさん', '🗻', 'Mở khóa'],
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const [started, setStarted] = useState(false);
  const current = regions[selected];
  return <main>
    <nav className="topbar"><div className="brand"><span className="brand-mark">✦</span><span>JAPANESE<br /><b>ADVENTURE</b></span></div><div className="nav-links"><span className="active">Bản đồ</span><span>Bài học</span><span>Nhiệm vụ</span></div><div className="profile"><span className="streak">🔥 3 ngày</span><div className="avatar">H</div><span>Hana⌄</span></div></nav>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">KOMOREBI VILLAGE · NGÀY 01</p><h1>Chào mừng trở lại,<br /><em>Hana!</em></h1><p className="intro">Momo đang đợi bạn ở Làng Saga. Cùng khám phá một ngày thật vui bằng tiếng Nhật nhé.</p><button className="primary" onClick={() => setStarted(true)}>{started ? 'Đang khám phá ✨' : 'Tiếp tục hành trình'} <span>→</span></button></div><div className="hero-art"><div className="sun" /><div className="mountain m1" /><div className="mountain m2" /><div className="house">🏡</div><div className="cat">🐈</div><div className="cloud c1">☁</div><div className="cloud c2">☁</div></div></section>
    <section className="content"><div className="section-head"><div><p className="eyebrow">BẢN ĐỒ THẾ GIỚI</p><h2>Hành trình của bạn</h2></div><div className="progress-label"><span>Tiến trình tổng</span><b>12%</b><div className="bar"><i /></div></div></div><div className="map-grid">{regions.map((r, i) => <button key={r[0]} className={`region ${i === selected ? 'selected' : ''} ${i > 0 ? 'locked' : ''}`} onClick={() => setSelected(i)}><span className="region-no">{r[0]}</span><span className="region-icon">{r[3]}</span><span className="region-name">{r[1]}</span><span className="region-jp">{r[2]}</span><span className="region-action">{i === 0 ? (i === selected ? 'Đang ở đây' : r[4]) : '🔒'}</span></button>)}</div><div className="quest-card"><div className="quest-icon">🐾</div><div><p className="eyebrow">NHIỆM VỤ HIỆN TẠI</p><h3>{current[1]} · Chào hỏi người bạn mới</h3><p>Học 5 từ vựng về lời chào và giúp Momo tìm đường về nhà.</p></div><div className="quest-meta"><span>⭐ 120 XP</span><span>⏱ 10 phút</span><button onClick={() => setStarted(true)}>Vào stage →</button></div></div></section>
    <footer><span>© 2026 Japanese Adventure</span><span>Học một chút, khám phá thật nhiều <span className="heart">♥</span></span></footer>
  </main>;
}

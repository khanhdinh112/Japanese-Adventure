'use client';

import { useEffect, useMemo, useState } from 'react';
import { BADGES } from '../../data/badges';
import { STAGES } from '../../data/stages';
import { getWord } from '../../data/words';
import type { SkillKind } from '../../data/types';
import { formatMinutes, WEEKDAY_SHORT, weekKeys } from '../../lib/dates';
import {
  computeBadges,
  countWordsAtLevel,
  progressOf,
  secondsOnDays,
  streak,
  totalStagesDone,
  totalStars,
  WORD_LEVEL_LABEL,
  wordsNeedingReview,
} from '../../lib/selectors';
import { authEnabled } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';
import { useGame, type SyncStatus } from '../GameProvider';
import { LevelBadge } from '../LearningCard';
import { Modal } from '../ui/Modal';
import { TopBar } from '../ui/TopBar';

const SKILLS: { id: SkillKind; label: string }[] = [
  { id: 'vocab', label: 'Từ vựng' },
  { id: 'grammar', label: 'Ngữ pháp' },
  { id: 'listening', label: 'Nghe' },
  { id: 'mastery', label: 'Tự làm độc lập' },
];

const SYNC_LABEL: Record<SyncStatus, string> = {
  idle: 'Tiến trình được lưu vào tài khoản mỗi khi bé học.',
  saving: '⏳ Đang lưu lên tài khoản…',
  saved: '✅ Đã lưu lên tài khoản.',
  error: '⚠️ Chưa lưu được lên tài khoản — game sẽ tự thử lại. Tiến trình vẫn được giữ trên máy này.',
};

function Gate({ onOpen }: { onOpen: () => void }) {
  const [q] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }));
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const submit = () => (Number(v) === q.a * q.b ? onOpen() : setBad(true));
  return (
    <div className="gate paper">
      <div className="gate-ic" aria-hidden>
        🔐
      </div>
      <h2>Khu vực dành cho phụ huynh</h2>
      <p className="muted">Để bảo vệ tiến trình của bé, hãy giải phép tính này nhé.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="gate-q">
          <b>
            {q.a} × {q.b} =
          </b>
          <input
            type="number"
            inputMode="numeric"
            value={v}
            autoFocus
            onChange={(e) => {
              setV(e.target.value);
              setBad(false);
            }}
            aria-label="Đáp án"
          />
        </label>
        {bad && <p className="error">Chưa đúng, thử lại nhé.</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={v === ''}>
          Mở bảng điều khiển
        </button>
      </form>
    </div>
  );
}

/** Biểu đồ cột một chuỗi: phút học mỗi ngày trong tuần. Có tooltip khi rê chuột và có bảng số liệu thay thế. */
function WeekChart({ minutes, labels }: { minutes: number[]; labels: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(10, ...minutes);
  const top = Math.ceil(max / 10) * 10;
  const total = minutes.reduce((a, b) => a + b, 0);
  return (
    <div className="chart">
      <div className="chart-head">
        <div>
          <b>Thời gian học theo ngày</b>
          <small>Tuần này · tổng {total} phút</small>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTable((v) => !v)}>
          {table ? '📊 Xem biểu đồ' : '🔢 Xem bảng'}
        </button>
      </div>
      {table ? (
        <table className="chart-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Phút</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((l, i) => (
              <tr key={l}>
                <td>{l}</td>
                <td>{minutes[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bars" role="img" aria-label={`Số phút học mỗi ngày: ${labels.map((l, i) => `${l} ${minutes[i]} phút`).join(', ')}`}>
          <div className="bars-grid" aria-hidden>
            {[top, top / 2, 0].map((g) => (
              <span key={g} style={{ bottom: `${(g / top) * 100}%` }}>
                <em>{g}</em>
              </span>
            ))}
          </div>
          {minutes.map((m, i) => (
            <div
              key={i}
              className={`bar-col${hover === i ? ' hot' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
            >
              <div className="bar-area">
                {hover === i && <span className="bar-tip">{labels[i]}: {m} phút</span>}
                <i className="bar" style={{ height: `${(m / top) * 100}%` }} />
              </div>
              <small>{labels[i]}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Bảng điều khiển phụ huynh: cổng tính nhẩm, tổng quan, thời gian, kỹ năng, từ cần ôn, cài đặt, xuất/xoá dữ liệu. */
export function ParentScreen() {
  const { state, go, setSettings, resetProgress, mode, childList, childError, activeChildId, syncStatus, refreshChildren, removeChild, leaveChild, logout } = useGame();
  const auth = useAuth();
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const keys = useMemo(() => weekKeys(0), []);
  const minutes = keys.map((k) => Math.round((state.activity[k]?.seconds ?? 0) / 60));
  const badges = computeBadges(state);
  const lv3 = countWordsAtLevel(state, 3);
  const review = wordsNeedingReview(state).slice(0, 8);
  const known = Object.keys(state.words).length;
  const done = totalStagesDone(state);
  const weekSeconds = secondsOnDays(state, keys);

  useEffect(() => {
    if (open && mode === 'account' && childList === null) void refreshChildren();
  }, [open, mode, childList, refreshChildren]);
  const toRemove = childList?.find((c) => c.id === removeId) ?? null;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japanese-adventure-${state.profile?.name ?? 'tien-trinh'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="parent">
      <TopBar title="Dành cho phụ huynh" titleJp="ほごしゃ むけ" onBack={() => go({ name: state.profile ? 'world' : 'welcome' }, { kind: 'fade' })} backLabel="Quay lại game" compact />
      {!open ? (
        <Gate onOpen={() => setOpen(true)} />
      ) : (
        <div className="parent-grid">
          <section className="pa-tiles">
            {[
              { ic: '🗺️', v: `${done}/${STAGES.length}`, l: 'Chặng hoàn thành' },
              { ic: '⭐', v: String(totalStars(state)), l: 'Sao đã nhận' },
              { ic: '✨', v: String(state.xp), l: 'Điểm kinh nghiệm' },
              { ic: '🔥', v: `${streak(state)} ngày`, l: 'Học liên tiếp' },
              { ic: '🌸', v: `${lv3}/${known}`, l: 'Từ tự dùng được' },
              { ic: '🏅', v: `${badges.size}/${BADGES.length}`, l: 'Huy hiệu' },
            ].map((t) => (
              <div key={t.l} className="tile-stat paper">
                <span aria-hidden>{t.ic}</span>
                <b>{t.v}</b>
                <small>{t.l}</small>
              </div>
            ))}
          </section>

          <section className="paper pa-chart">
            <WeekChart minutes={minutes} labels={WEEKDAY_SHORT} />
            <p className="muted">Tuần này bé đã học {formatMinutes(weekSeconds)}. Mỗi ngày 10–15 phút là đủ cho trẻ 7–8 tuổi.</p>
          </section>

          <section className="paper pa-skills">
            <h3>Kỹ năng (độ chính xác)</h3>
            {SKILLS.map((s) => {
              const st = state.skills[s.id];
              const pct = st.total ? Math.round((st.correct / st.total) * 100) : 0;
              return (
                <div key={s.id} className="skillbar">
                  <span>{s.label}</span>
                  <div className="sb-track" role="img" aria-label={`${s.label}: ${st.correct} trên ${st.total} đúng`}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <b>{st.total ? `${pct}%` : '—'}</b>
                </div>
              );
            })}
            <small className="muted">Nghe chỉ được tính khi thiết bị có giọng đọc tiếng Nhật.</small>
          </section>

          <section className="paper pa-stages">
            <h3>Các chặng</h3>
            <ul>
              {STAGES.map((s) => {
                const p = progressOf(state, s.id);
                return (
                  <li key={s.id}>
                    <span aria-hidden>{s.icon}</span>
                    <span className="ps-t">{s.title}</span>
                    <span className="ps-s">{p.completed ? '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars) : p.run ? 'Đang học' : 'Chưa học'}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="paper pa-words">
            <h3>Từ cần ôn lại</h3>
            {review.length === 0 ? (
              <p className="muted">Chưa có từ nào cần ôn. Tuyệt vời!</p>
            ) : (
              <ul>
                {review.map((id) => {
                  const w = getWord(id);
                  return (
                    <li key={id}>
                      <span aria-hidden>{w.icon}</span>
                      <b lang="ja">{w.jp}</b>
                      <span className="pw-vi">{w.vi}</span>
                      <LevelBadge level={state.words[id].level} />
                    </li>
                  );
                })}
              </ul>
            )}
            <small className="muted">
              {WORD_LEVEL_LABEL[1].icon} mới gặp · {WORD_LEVEL_LABEL[2].icon} đã hiểu · {WORD_LEVEL_LABEL[3].icon} tự dùng được
            </small>
          </section>

          <section className="paper pa-tips">
            <h3>Gợi ý cho phụ huynh</h3>
            <ul>
              <li>Hỏi bé: “Hôm nay mèo Momo nói gì?” — nghe bé kể lại tốt hơn nhắc từ.</li>
              <li>Cùng làm nhiệm vụ ngoài đời (viết thư, gấp mèo giấy); bé nhớ từ nhờ làm thật.</li>
              <li>Không cần bé đúng ngay. Sao thứ hai thưởng cho việc tự làm, không phải làm vội.</li>
            </ul>
          </section>

          {mode === 'account' && (
            <section className="paper pa-acct">
              <div className="pa-acct-head">
                <div>
                  <h3>Tài khoản & hồ sơ bé</h3>
                  <p className="muted">
                    Đăng nhập: <b>{auth.user?.email}</b>
                  </p>
                  <p className={`pa-sync pa-sync-${syncStatus}`} role="status">
                    {SYNC_LABEL[syncStatus]}
                  </p>
                </div>
                <div className="pa-btns">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      await leaveChild();
                      go({ name: 'profiles' }, { kind: 'fade' });
                    }}
                  >
                    👧 Đổi bé
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void logout()}>
                    ⎋ Đăng xuất
                  </button>
                </div>
              </div>
              {childError && <p className="error">{childError}</p>}
              <ul className="pa-children">
                {(childList ?? []).map((c) => (
                  <li key={c.id}>
                    <span className="pa-child-name">
                      <b>{c.name || 'Bé chưa đặt tên'}</b>
                      {c.id === activeChildId && <em>đang chơi</em>}
                    </span>
                    <small>
                      ⭐ {c.stars} · ✨ {c.xp}
                    </small>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setRemoveId(c.id)}>
                      🗑 Xoá hồ sơ
                    </button>
                  </li>
                ))}
                {childList && childList.length === 0 && <li className="muted">Chưa có hồ sơ bé nào.</li>}
              </ul>
            </section>
          )}

          {mode === 'guest' && authEnabled && (
            <section className="paper pa-acct">
              <div className="pa-acct-head">
                <div>
                  <h3>Lưu tiến trình trên tài khoản</h3>
                  <p className="muted">Hiện tiến trình chỉ nằm trên máy này. Đăng nhập để lưu an toàn và chơi trên nhiều thiết bị.</p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => go({ name: 'auth' }, { kind: 'fade' })}>
                  🔑 Đăng nhập
                </button>
              </div>
            </section>
          )}

          <section className="paper pa-set">
            <h3>Cài đặt & dữ liệu</h3>
            <div className="pa-toggles">
              {([
                ['romaji', 'Hiện romaji'],
                ['sound', 'Âm thanh'],
                ['voice', 'Tự đọc lời thoại'],
              ] as const).map(([k, label]) => (
                <button key={k} type="button" role="switch" aria-checked={state.settings[k]} className={`toggle${state.settings[k] ? ' on' : ''}`} onClick={() => setSettings({ [k]: !state.settings[k] })}>
                  <span className="toggle-text">
                    <b>{label}</b>
                  </span>
                  <span className="toggle-knob" aria-hidden />
                </button>
              ))}
            </div>
            <p className="muted">
              {mode === 'account'
                ? 'Tiến trình, nhật ký và ảnh của bé được lưu trong tài khoản của bạn, chỉ bạn xem được, và có bản dự phòng trên máy này.'
                : 'Mọi dữ liệu và ảnh của bé chỉ lưu trên trình duyệt của máy này, không gửi đi đâu.'}
            </p>
            <div className="pa-btns">
              <button type="button" className="btn btn-ghost" onClick={exportData}>
                ⬇ Xuất tiến trình (JSON)
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
                🗑 Xoá toàn bộ tiến trình
              </button>
            </div>
          </section>
        </div>
      )}

      {confirm && (
        <Modal title="Xoá toàn bộ tiến trình?" onClose={() => setConfirm(false)} width={620}>
          <p>
            Sao, từ vựng, nhật ký và ảnh sẽ bị xoá khỏi {mode === 'account' ? 'hồ sơ này trong tài khoản' : 'máy này'}. Bé sẽ tạo lại nhân vật từ đầu. Hành động này không thể hoàn tác.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
              Giữ lại
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                resetProgress();
                setConfirm(false);
                setOpen(false);
                go({ name: mode === 'account' ? 'create' : 'welcome' }, { kind: 'fade' });
              }}
            >
              Xoá hết
            </button>
          </div>
        </Modal>
      )}
      {toRemove && (
        <Modal title={`Xoá hồ sơ của ${toRemove.name || 'bé'}?`} onClose={() => setRemoveId(null)} width={620}>
          <p>Toàn bộ sao, từ vựng, nhật ký và ảnh của hồ sơ này sẽ bị xoá khỏi tài khoản. Hành động này không thể hoàn tác.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setRemoveId(null)}>
              Giữ lại
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={removing}
              onClick={async () => {
                setRemoving(true);
                await removeChild(toRemove.id);
                setRemoving(false);
                setRemoveId(null);
              }}
            >
              {removing ? 'Đang xoá…' : 'Xoá hồ sơ'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

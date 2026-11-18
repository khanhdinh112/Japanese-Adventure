'use client';

import { useMemo, useRef, useState } from 'react';
import { BADGES } from '../../data/badges';
import { dateKey, formatLongDate, formatMinutes, formatShortDate, parseKey, WEEKDAY_SHORT, weekKeys } from '../../lib/dates';
import type { JournalEntry } from '../../lib/gameState';
import { fileToThumbnail } from '../../lib/image';
import { computeBadges, secondsOnDays, stageTitle, weeklyGoals } from '../../lib/selectors';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { SpeakButton } from '../ui/SpeakButton';
import { TopBar } from '../ui/TopBar';

const KIND: Record<JournalEntry['kind'], { label: string; icon: string }> = {
  quest: { label: 'Nhiệm vụ', icon: '🧭' },
  culture: { label: 'Văn hóa', icon: '🏮' },
  note: { label: 'Ghi chú', icon: '✏️' },
};

/** Nhật ký nhiệm vụ theo tuần: mục tiêu tuần, bảng ngày, các trang đã ghim, huy hiệu. */
export function JournalScreen() {
  const { state, go, t, addNote, deleteEntry } = useGame();
  const [offset, setOffset] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const keys = useMemo(() => weekKeys(offset), [offset]);
  const goals = weeklyGoals(state, keys);
  const badges = computeBadges(state);
  const entries = state.journal.filter((e) => keys.includes(e.dateKey) && (!day || e.dateKey === day));
  const todayKey = dateKey();
  const weekLabel = `${formatShortDate(keys[0])} – ${formatShortDate(keys[6])}`;
  const mins = formatMinutes(secondsOnDays(state, keys));

  const pick = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await fileToThumbnail(file));
      setError(null);
    } catch {
      setError('Mình chưa đọc được ảnh này.');
    }
  };

  return (
    <div className="journal">
      <div className="journal-bg" aria-hidden>
        <SceneArt scene="engawa" />
      </div>
      <div className="journal-wash" aria-hidden />
      <TopBar title="Nhật ký của mình" titleJp="にっき" onBack={() => go({ name: 'world' }, { kind: 'fade' })} backLabel="Bản đồ" />

      <div className="journal-grid">
        <aside className="journal-side">
          <section className="paper jn-week">
            <header>
              <button type="button" className="icon-btn" aria-label="Tuần trước" onClick={() => { setOffset(offset - 1); setDay(null); }}>
                ◀
              </button>
              <div>
                <b>{offset === 0 ? 'Tuần này' : offset === -1 ? 'Tuần trước' : `${-offset} tuần trước`}</b>
                <small>{weekLabel}</small>
              </div>
              <button type="button" className="icon-btn" aria-label="Tuần sau" disabled={offset >= 0} onClick={() => { setOffset(offset + 1); setDay(null); }}>
                ▶
              </button>
            </header>
            <div className="jn-days">
              {keys.map((k, i) => {
                const n = state.journal.filter((e) => e.dateKey === k).length;
                const s = state.activity[k]?.seconds ?? 0;
                const on = day === k;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`jn-day${on ? ' on' : ''}${s > 0 || n > 0 ? ' active' : ''}${k === todayKey ? ' today' : ''}`}
                    onClick={() => setDay(on ? null : k)}
                    aria-pressed={on}
                    title={`${formatShortDate(k)} · ${formatMinutes(s)} · ${n} trang`}
                  >
                    <small>{WEEKDAY_SHORT[i]}</small>
                    <b>{parseKey(k).getDate()}</b>
                    <span className="dots" aria-hidden>
                      {Array.from({ length: Math.min(n, 3) }, (_, j) => (
                        <i key={j} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="muted jn-min">⏱ Thời gian học: {mins}</p>
          </section>

          <section className="paper jn-goals">
            <h3>Mục tiêu tuần</h3>
            {goals.map((g) => (
              <div key={g.id} className={`goal${g.current >= g.target ? ' done' : ''}`}>
                <span aria-hidden>{g.current >= g.target ? '✅' : g.icon}</span>
                <span className="goal-l">{g.label}</span>
                <div className="sb-track" role="img" aria-label={`${g.current} trên ${g.target}`}>
                  <i style={{ width: `${(g.current / g.target) * 100}%` }} />
                </div>
                <b>
                  {g.current}/{g.target}
                </b>
              </div>
            ))}
          </section>

          <section className="paper jn-badges">
            <h3>
              Huy hiệu · {badges.size}/{BADGES.length}
            </h3>
            <div className="badge-grid">
              {BADGES.map((b) => (
                <div key={b.id} className={`badge${badges.has(b.id) ? ' got' : ''}`} title={b.desc}>
                  <span className="badge-ic" aria-hidden>
                    {badges.has(b.id) ? b.icon : '🔒'}
                  </span>
                  <small>{b.name}</small>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="journal-main">
          <div className="paper jn-new">
            <h3>✏️ Viết một trang mới</h3>
            <textarea rows={2} value={text} maxLength={300} placeholder="Hôm nay mình học được gì? Mình thấy gì thú vị?" onChange={(e) => setText(e.target.value)} />
            <div className="jn-new-row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                📷 {photo ? 'Đổi ảnh' : 'Thêm ảnh'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="jn-thumb" />
              )}
              {error && <span className="error">{error}</span>}
              <button
                type="button"
                className="btn btn-primary"
                disabled={text.trim().length < 2 && !photo}
                onClick={() => {
                  addNote(text.trim(), photo ?? undefined);
                  setText('');
                  setPhoto(null);
                }}
              >
                📌 Ghim vào nhật ký
              </button>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="paper jn-empty">
              <span aria-hidden>🌱</span>
              <b>{day ? 'Ngày này chưa có trang nhật ký.' : 'Tuần này chưa có trang nhật ký nào.'}</b>
              <p>Hoàn thành nhiệm vụ ngoài đời, thu thập điều thú vị về văn hóa Nhật, hoặc tự viết một trang nhé.</p>
            </div>
          ) : (
            <div className="jn-entries">
              {entries.map((e) => (
                <article key={e.id} className={`entry entry-${e.kind}`}>
                  <span className="entry-pin" aria-hidden />
                  <header>
                    <span className="entry-ic" aria-hidden>
                      {e.icon ?? KIND[e.kind].icon}
                    </span>
                    <div>
                      <b>{e.title}</b>
                      <small>
                        {KIND[e.kind].label} · {formatLongDate(e.date)}
                        {e.stageId ? ` · ${stageTitle(e.stageId)}` : ''}
                      </small>
                    </div>
                  </header>
                  {e.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image} alt={e.title} className="entry-img" />
                  )}
                  {e.text && <p className="entry-text">{e.text}</p>}
                  {e.jp && (
                    <p className="entry-jp" lang="ja">
                      {t(e.jp)} <SpeakButton text={t(e.jp)} size="sm" />
                    </p>
                  )}
                  <footer>
                    {confirmId === e.id ? (
                      <>
                        <span className="muted">Xoá trang này?</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { deleteEntry(e.id); setConfirmId(null); }}>
                          Xoá
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>
                          Giữ lại
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(e.id)}>
                        🗑 Xoá
                      </button>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

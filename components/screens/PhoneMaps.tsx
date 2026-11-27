'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { REGIONS } from '../../data/regions';
import { STAGES, STAGE_BY_ID, getStage } from '../../data/stages';
import type { Region } from '../../data/types';
import { firstUndoneStep, nextStage, progressOf, regionStatus, stageStatus, totalStagesDone, totalStars } from '../../lib/selectors';
import { RegionVignetteCard } from '../art/maps';
import { CharacterSprite } from '../CharacterSprite';
import { useGame } from '../GameProvider';
import { ctaFor, StatusPill } from '../RegionMap';
import { Modal } from '../ui/Modal';
import { StarRating } from '../ui/StarRating';
import { TopBar } from '../ui/TopBar';

/** Bản đồ thế giới cho điện thoại: danh sách vùng nối nhau bằng con đường, cuộn dọc; thẻ tóm tắt ở bên phải (ngang) hoặc phía dưới (dọc). */
export function PhoneWorld() {
  const { state, go, startStage } = useGame();
  const [locked, setLocked] = useState<Region | null>(null);
  const upcoming = nextStage(state);
  const next = upcoming ? getStage(upcoming.stageId) : null;
  const here = upcoming?.regionId ?? 'saga';
  const statuses = useMemo(() => REGIONS.map((r) => regionStatus(state, r)), [state]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('.phw-region.is-here');
    el?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <div className="phw">
      <div className="phw-bg" aria-hidden />
      <TopBar title="Bản đồ Komorebi" titleJp="こもれびの せかい" onBack={() => go({ name: 'welcome' }, { kind: 'fade' })} backLabel="Màn hình chính" />
      <div className="phw-body">
        <div className="phw-list" ref={listRef} role="list" aria-label="Các vùng đất">
          <div className="phw-goal">🗻 Đích đến: Núi Phú Sĩ</div>
          {[...REGIONS].reverse().map((region) => {
            const i = REGIONS.indexOf(region);
            const st = statuses[i];
            const isHere = region.id === here && st.unlocked;
            return (
              <button
                key={region.id}
                type="button"
                role="listitem"
                className={`phw-region ${st.unlocked ? 'is-open' : 'is-locked'}${isHere ? ' is-here' : ''}`}
                onClick={() => (st.unlocked ? go({ name: 'region', regionId: region.id }, { kind: 'zoom' }) : setLocked(region))}
                aria-label={`Vùng ${i + 1}: ${region.name}. ${st.unlocked ? 'Đã mở' : 'Đang khoá'}. ${st.completed} trên ${region.stages.length} chặng`}
              >
                <span className="phw-no" aria-hidden>
                  {st.unlocked ? i + 1 : '🔒'}
                </span>
                <span className="phw-info">
                  <b>
                    <span aria-hidden>{st.unlocked ? region.icon : ''}</span> {region.name}
                  </b>
                  <small lang="ja">{region.nameJp}</small>
                  <span className="phw-meta">
                    {st.completed}/{region.stages.length} chặng
                    {st.unlocked && (
                      <span className="phw-stars">
                        <StarRating value={Math.min(3, Math.round((st.stars / st.maxStars) * 3))} size="sm" /> {st.stars}/{st.maxStars}
                      </span>
                    )}
                  </span>
                </span>
                {isHere ? (
                  <span className="phw-pawn" aria-hidden>
                    <CharacterSprite id="player" look={state.profile?.look} variant="head" emotion="happy" />
                  </span>
                ) : (
                  <span className="phw-go" aria-hidden>
                    {st.unlocked ? '›' : ''}
                  </span>
                )}
              </button>
            );
          })}
          <div className="phw-goal phw-start">🚩 Xuất phát từ làng Saga</div>
        </div>
        <aside className="phw-card paper">
          <div className="phw-stats">
            <span>🗺️ Chặng xong</span>
            <b>
              {totalStagesDone(state)}/{STAGES.length}
            </b>
            <span>⭐ Tổng sao</span>
            <b>{totalStars(state)}</b>
          </div>
          <button type="button" className="btn btn-block" onClick={() => go({ name: 'letters' }, { kind: 'wash' })}>
            ✍️ Góc luyện chữ
          </button>
          {next && upcoming ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                startStage(next.id);
                go({ name: 'region', regionId: upcoming.regionId }, { kind: 'zoom' });
              }}
            >
              ▶ Tiếp tục: {next.title}
            </button>
          ) : (
            <p className="muted">Bạn đã hoàn thành Chương 1!</p>
          )}
        </aside>
      </div>
      {locked && (
        <Modal title={`${locked.name} đang ngủ yên`} onClose={() => setLocked(null)} width={860}>
          <div className="locked-panel">
            <div className="locked-art">
              <RegionVignetteCard theme={locked.theme} />
              <span className="locked-badge" aria-hidden>
                🔒
              </span>
            </div>
            <div className="locked-info">
              <p className="locked-jp" lang="ja">
                {locked.nameJp}
              </p>
              <p>{locked.tagline}</p>
              <div className="locked-req">
                <b>Cách mở khoá</b>
                <span>{regionStatus(state, locked).requirement}</span>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setLocked(null)}>
                Mình hiểu rồi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Bản đồ vùng cho điện thoại: danh sách chặng + thẻ chi tiết chặng đang chọn. */
export function PhoneRegion({ region }: { region: Region }) {
  const { state, go, startStage } = useGame();
  const suggested = nextStage(state);
  const [selectedId, setSelectedId] = useState(() => (suggested?.regionId === region.id ? suggested.stageId : region.stages[0].id));
  const selected = region.stages.find((s) => s.id === selectedId) ?? region.stages[0];
  const status = stageStatus(state, region, selected);
  const content = STAGE_BY_ID[selected.id];
  const prog = progressOf(state, selected.id);
  const cta = ctaFor(status, prog.run !== null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('.phr-row.on')?.scrollIntoView({ block: 'center' });
    // chỉ cuộn khi vào màn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const play = (restart: boolean) => {
    const step = restart ? 'story' : firstUndoneStep(state, selected.id);
    startStage(selected.id, restart);
    go({ name: 'stage', stageId: selected.id, step }, { kind: 'wash' });
  };

  return (
    <div className="phr">
      <div className="phr-bg" aria-hidden />
      <TopBar title={region.name} titleJp={region.nameJp} onBack={() => go({ name: 'world' }, { kind: 'fade' })} backLabel="Bản đồ thế giới" />
      <div className="phr-body">
        <div className="phr-list" ref={listRef}>
          <p className="phr-tag">
            <span aria-hidden>{region.icon}</span> {region.tagline}
          </p>
          {region.stages.map((stub) => {
            const st = stageStatus(state, region, stub);
            const pr = progressOf(state, stub.id);
            const mark = st === 'completed' ? '✓' : st === 'locked' || st === 'soon' ? '🔒' : stub.index;
            return (
              <button
                key={stub.id}
                type="button"
                className={`phr-row st-${st}${stub.id === selected.id ? ' on' : ''}`}
                onClick={() => setSelectedId(stub.id)}
                aria-pressed={stub.id === selected.id}
              >
                <span className="phr-no" aria-hidden>
                  {mark}
                </span>
                <span className="phr-ic" aria-hidden>
                  {stub.icon}
                </span>
                <span className="phr-tx">
                  <b>{stub.title}</b>
                  <small lang="ja">{stub.titleJp}</small>
                </span>
                {pr.completed ? <StarRating value={pr.stars} size="sm" /> : st === 'current' ? <span className="phr-badge">Đang chơi</span> : null}
              </button>
            );
          })}
        </div>
        <aside className="phr-card" aria-live="polite">
          <div className="phr-card-top">
            <span className="phr-card-no">
              Chặng {selected.index}/{region.stages.length}
            </span>
            <StatusPill status={status} />
          </div>
          <div className="phr-card-title">
            <span aria-hidden>{selected.icon}</span>
            <div>
              <h3>{selected.title}</h3>
              <small lang="ja">{selected.titleJp}</small>
            </div>
          </div>
          {content ? (
            <>
              <p className="phr-sum">{content.summary}</p>
              <ul className="phr-obj">
                {content.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <p className="phr-meta">
                ⏱ ~15 phút · 🌸 {content.wordIds.length} từ mới
              </p>
            </>
          ) : (
            <p className="phr-sum">{selected.soon ?? 'Chặng này chưa có nội dung.'}. Hãy hoàn thành các chặng trước nhé.</p>
          )}
          {cta ? (
            <button type="button" className="btn btn-primary btn-block phr-cta" onClick={() => play(cta.restart)}>
              {cta.label}
            </button>
          ) : (
            <button type="button" className="btn btn-disabled btn-block phr-cta" disabled>
              {status === 'locked' ? 'Hoàn thành chặng trước để mở' : 'Sắp ra mắt'}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

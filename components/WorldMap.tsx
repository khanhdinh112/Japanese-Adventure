'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { REGIONS } from '../data/regions';
import type { Region } from '../data/types';
import { nextStage, regionStatus } from '../lib/selectors';
import { RegionVignetteCard } from './art/maps';
import { WorldPathArt, WORLD_H, WORLD_W, pathDots, regionPos } from './art/worldPath';
import { finalArt } from '../data/art';
import { CharacterSprite } from './CharacterSprite';
import { useGame } from './GameProvider';
import { Modal } from './ui/Modal';
import { StarRating } from './ui/StarRating';

interface Props {
  onOpenRegion: (region: Region, origin: { x: number; y: number }) => void;
}

const VIEW_H = 1080;

/**
 * Bản đồ thế giới dạng con đường dọc kiểu Candy Crush: xuất phát từ làng Saga ở dưới cùng,
 * kéo (cuộn) lên để thấy các vùng tiếp theo, Núi Phú Sĩ nằm trên đỉnh. Tự cuộn tới vùng bé đang chơi.
 */
export function WorldMap({ onOpenRegion }: Props) {
  const { state } = useGame();
  const [locked, setLocked] = useState<Region | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const here = nextStage(state)?.regionId ?? 'saga';
  const statuses = useMemo(() => REGIONS.map((r) => regionStatus(state, r)), [state]);
  const hereIndex = Math.max(0, REGIONS.findIndex((r) => r.id === here));
  const frontier = statuses.findIndex((s) => !s.unlocked); // vùng khoá đầu tiên (-1 nếu mở hết)
  const dots = useMemo(() => pathDots(5), []);
  const bg = finalArt('map:world');

  const scrollToRegion = useCallback((i: number, smooth: boolean) => {
    const el = scroller.current;
    if (!el) return;
    const top = Math.max(0, Math.min(WORLD_H - VIEW_H, regionPos(i).y - VIEW_H * 0.52));
    el.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToRegion(hereIndex, false);
  }, [hereIndex, scrollToRegion]);

  const nextIdx = Math.min(REGIONS.length - 1, hereIndex + 1);
  const hereY = regionPos(hereIndex).y;
  const viewMid = scrollTop + VIEW_H / 2;

  return (
    <div className="world">
      <div
        className="world-scroll"
        ref={scroller}
        onScroll={(e) => setScrollTop((e.target as HTMLElement).scrollTop)}
        tabIndex={0}
        aria-label="Bản đồ phiêu lưu. Cuộn lên để thấy các vùng đất tiếp theo"
      >
        <div className="world-sheet" style={{ width: WORLD_W, height: WORLD_H }}>
          {bg ? <img className="art-img" src={bg} alt="Bản đồ thế giới" draggable={false} style={{ width: WORLD_W, height: WORLD_H }} /> : <WorldPathArt frontier={frontier < 0 ? REGIONS.length : frontier} />}

          {dots.map((d) => {
            const open = statuses[d.to].unlocked;
            return <span key={`${d.to}-${d.k}`} className={`wp-dot${open ? ' on' : ''}`} style={{ left: d.x, top: d.y }} aria-hidden />;
          })}

          <div className="wp-start" style={{ left: regionPos(0).x - 360, top: WORLD_H - 330 }}>
            <span className="wp-flag" aria-hidden>🚩</span>
            <b>Xuất phát</b>
            <small>Hành trình bắt đầu từ làng Saga</small>
          </div>
          <div className="wp-goal" style={{ left: 960, top: 150 }}>
            <b>🗻 Đích đến: Núi Phú Sĩ</b>
            <small lang="ja">ふじさん</small>
          </div>

          {REGIONS.map((region, i) => {
            const st = statuses[i];
            const p = regionPos(i);
            const isHere = i === hereIndex && st.unlocked;
            return (
              <button
                key={region.id}
                type="button"
                className={`region-marker ${st.unlocked ? 'is-open' : 'is-locked'}${isHere ? ' is-here' : ''}`}
                style={{ left: p.x, top: p.y }}
                onClick={() => (st.unlocked ? onOpenRegion(region, { x: p.x, y: p.y - scrollTop }) : setLocked(region))}
                aria-label={`Vùng ${i + 1}: ${region.name}. ${st.unlocked ? 'Đã mở' : 'Đang khoá'}. ${st.completed} trên ${region.stages.length} chặng, ${st.stars} sao`}
              >
                <span className="rm-haze" aria-hidden />
                <span className="rm-order" aria-hidden>{i + 1}</span>
                {isHere && (
                  <span className="rm-pawn" aria-hidden>
                    <CharacterSprite id="player" look={state.profile?.look} variant="head" emotion="happy" />
                  </span>
                )}
                <span className="rm-plate">
                  <span className="rm-name">
                    <span aria-hidden>{st.unlocked ? region.icon : '🔒'}</span> {region.name}
                  </span>
                  <span className="rm-jp" lang="ja">
                    {region.nameJp}
                  </span>
                  <span className="rm-stats">
                    <span>
                      {st.completed}/{region.stages.length} chặng
                    </span>
                    <span className="rm-stars">
                      <StarRating value={Math.min(3, Math.round((st.stars / st.maxStars) * 3))} size="sm" /> {st.stars}/{st.maxStars}
                    </span>
                  </span>
                  <span className={`rm-state ${st.unlocked ? 'open' : 'lock'}`}>{st.unlocked ? 'Đã mở' : 'Đang khoá'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="world-nav">
        {hereY < viewMid - 380 || hereY > viewMid + 380 ? (
          <button type="button" className="btn btn-pill" onClick={() => scrollToRegion(hereIndex, true)}>
            📍 Về chỗ bé đang đứng
          </button>
        ) : null}
        {scrollTop > 40 && nextIdx !== hereIndex && regionPos(nextIdx).y < scrollTop + 60 && (
          <span className="wn-hint">⬆ Kéo lên để xem vùng kế tiếp</span>
        )}
        {scrollTop < 40 && <span className="wn-hint">Chạm vào từng vùng để vào chơi</span>}
        {scrollTop > WORLD_H - VIEW_H - 40 && <span className="wn-hint">⬆ Kéo lên để đi tiếp về phía Núi Phú Sĩ</span>}
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
              <p className="muted">Vùng này sẽ mở dần khi các chương mới ra mắt. Hãy tiếp tục khám phá Làng Saga nhé!</p>
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

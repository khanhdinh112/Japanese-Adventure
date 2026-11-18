'use client';

import { useState } from 'react';
import { REGIONS } from '../data/regions';
import type { Region } from '../data/types';
import { nextStage, regionStatus } from '../lib/selectors';
import { RegionVignetteCard } from './art/maps';
import { WorldArt } from './art/SceneArt';
import { CharacterSprite } from './CharacterSprite';
import { useGame } from './GameProvider';
import { Modal } from './ui/Modal';
import { StarRating } from './ui/StarRating';

interface Props {
  onOpenRegion: (region: Region, origin: { x: number; y: number }) => void;
}

/** Bản đồ thế giới: tám vùng có thể bấm, mỗi vùng có tranh, tên, số chặng, số sao và trạng thái khoá. */
export function WorldMap({ onOpenRegion }: Props) {
  const { state } = useGame();
  const [locked, setLocked] = useState<Region | null>(null);
  const here = nextStage(state)?.regionId ?? 'saga';

  return (
    <div className="world">
      <div className="world-art">
        <WorldArt />
      </div>
      <div className="world-glow" aria-hidden />
      {REGIONS.map((region) => {
        const st = regionStatus(state, region);
        const isHere = here === region.id && st.unlocked;
        return (
          <button
            key={region.id}
            type="button"
            className={`region-marker ${st.unlocked ? 'is-open' : 'is-locked'}${isHere ? ' is-here' : ''}`}
            style={{ left: region.marker.x, top: region.marker.y }}
            onClick={() => (st.unlocked ? onOpenRegion(region, region.marker) : setLocked(region))}
            aria-label={`${region.name}. ${st.unlocked ? 'Đã mở' : 'Đang khoá'}. ${st.completed} trên ${region.stages.length} chặng, ${st.stars} sao`}
          >
            <span className="rm-haze" aria-hidden />
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

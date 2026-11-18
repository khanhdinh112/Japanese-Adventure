'use client';

import { useMemo, useState } from 'react';
import type { Region } from '../data/types';
import { STAGE_BY_ID } from '../data/stages';
import { nextStage, progressOf, stageStatus, type StageStatus } from '../lib/selectors';
import { STAGE_POSITIONS } from './art/maps';
import { RegionArt } from './art/SceneArt';
import { CharacterSprite } from './CharacterSprite';
import { useGame } from './GameProvider';
import { StageNode } from './StageNode';
import { StarRating } from './ui/StarRating';

interface Props {
  region: Region;
  onPlay: (stageId: string, restart: boolean) => void;
}

/** Bản đồ vùng: con đường uốn lượn qua mười chặng + thẻ xem trước chặng đang chọn. */
export function RegionMap({ region, onPlay }: Props) {
  const { state } = useGame();
  const suggested = nextStage(state);
  const initial = useMemo(() => {
    if (suggested?.regionId === region.id) return suggested.stageId;
    return region.stages[0].id;
  }, [suggested, region]);
  const [selectedId, setSelectedId] = useState(initial);
  const selected = region.stages.find((s) => s.id === selectedId) ?? region.stages[0];
  const status = stageStatus(state, region, selected);
  const content = STAGE_BY_ID[selected.id];
  const prog = progressOf(state, selected.id);
  const pawnIndex = region.stages.findIndex((s) => s.id === suggested?.stageId);
  const pawn = pawnIndex >= 0 && suggested?.regionId === region.id ? STAGE_POSITIONS[pawnIndex] : null;

  const cta = ctaFor(status, prog.run !== null);

  return (
    <div className="region">
      <div className="region-art">
        <RegionArt theme={region.theme} />
      </div>
      <div className="region-banner">
        <span className="rb-icon" aria-hidden>
          {region.icon}
        </span>
        <div>
          <h2>{region.name}</h2>
          <small lang="ja">{region.nameJp}</small>
        </div>
        <p>{region.tagline}</p>
      </div>

      {region.stages.map((stub, i) => {
        const [x, y] = STAGE_POSITIONS[i];
        return (
          <StageNode
            key={stub.id}
            stub={stub}
            status={stageStatus(state, region, stub)}
            stars={progressOf(state, stub.id).stars}
            selected={stub.id === selected.id}
            x={x}
            y={y}
            onClick={() => setSelectedId(stub.id)}
          />
        );
      })}

      {pawn && (
        <div className="pawn" style={{ left: pawn[0] - 56, top: pawn[1] - 150 }} aria-hidden>
          <CharacterSprite id="player" look={state.profile?.look} variant="head" emotion="happy" />
        </div>
      )}

      <aside className="stage-card" aria-live="polite">
        <div className="sc-top">
          <span className="sc-no">Chặng {selected.index}/{region.stages.length}</span>
          <StatusPill status={status} />
        </div>
        <div className="sc-title">
          <span className="sc-icon" aria-hidden>
            {selected.icon}
          </span>
          <div>
            <h3>{selected.title}</h3>
            <small lang="ja">{selected.titleJp}</small>
          </div>
        </div>
        {content ? (
          <>
            <p className="sc-summary">{content.summary}</p>
            <ul className="sc-obj">
              {content.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <div className="sc-meta">
              <span>⏱ ~15 phút</span>
              <span>🌸 {content.wordIds.length} từ mới</span>
              {prog.completed && <StarRating value={prog.stars} size="md" />}
            </div>
          </>
        ) : (
          <p className="sc-summary">
            {selected.soon ?? 'Chặng này chưa có nội dung.'}. Hãy hoàn thành các chặng trước đó trong Chương 1 và chờ những câu chuyện tiếp theo nhé.
          </p>
        )}
        <div className="sc-actions">
          {cta ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onPlay(selected.id, cta.restart)}>
              {cta.label}
            </button>
          ) : (
            <button type="button" className="btn btn-disabled btn-lg" disabled>
              {status === 'locked' ? 'Hoàn thành chặng trước để mở' : 'Sắp ra mắt'}
            </button>
          )}
          {prog.completed && prog.run === null && cta?.restart && <small className="muted">Chơi lại để tìm thêm sao</small>}
        </div>
      </aside>
    </div>
  );
}

function ctaFor(status: StageStatus, hasRun: boolean): { label: string; restart: boolean } | null {
  switch (status) {
    case 'available':
      return { label: 'Bắt đầu chặng ▶', restart: false };
    case 'current':
      return { label: hasRun ? 'Tiếp tục chặng ▶' : 'Bắt đầu chặng ▶', restart: false };
    case 'completed':
      return { label: 'Chơi lại ↺', restart: true };
    default:
      return null;
  }
}

function StatusPill({ status }: { status: StageStatus }) {
  const map: Record<StageStatus, [string, string]> = {
    soon: ['Sắp ra mắt', 'soon'],
    locked: ['Đang khoá', 'locked'],
    available: ['Sẵn sàng', 'available'],
    current: ['Đang chơi dở', 'current'],
    completed: ['Đã hoàn thành', 'completed'],
  };
  const [label, cls] = map[status];
  return <span className={`pill pill-${cls}`}>{label}</span>;
}


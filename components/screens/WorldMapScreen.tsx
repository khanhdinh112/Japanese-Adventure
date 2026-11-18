'use client';

import { getStage } from '../../data/stages';
import { nextStage, totalStagesDone, totalStars } from '../../lib/selectors';
import { STAGES } from '../../data/stages';
import { useGame } from '../GameProvider';
import { WorldMap } from '../WorldMap';
import { TopBar } from '../ui/TopBar';

export function WorldMapScreen() {
  const { state, go, startStage } = useGame();
  const upcoming = nextStage(state);
  const next = upcoming ? getStage(upcoming.stageId) : null;
  return (
    <div className="screen-world">
      <WorldMap onOpenRegion={(region, origin) => go({ name: 'region', regionId: region.id }, { kind: 'zoom', origin })} />
      <TopBar title="Bản đồ Komorebi" titleJp="こもれびの せかい" onBack={() => go({ name: 'welcome' }, { kind: 'fade' })} backLabel="Màn hình chính" />
      <aside className="world-card paper">
        <div className="wcard-row">
          <span>🗺️ Chặng đã xong</span>
          <b>
            {totalStagesDone(state)}/{STAGES.length}
          </b>
        </div>
        <div className="wcard-row">
          <span>⭐ Tổng sao đã kiếm</span>
          <b>{totalStars(state)}</b>
        </div>
        <button type="button" className="btn btn-block" onClick={() => go({ name: 'letters' }, { kind: 'wash' })}>
          ✍️ Góc luyện chữ
        </button>
        {next && upcoming ? (
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            onClick={() => {
              startStage(next.id);
              go({ name: 'region', regionId: upcoming.regionId }, { kind: 'zoom', origin: { x: 960, y: 540 } });
            }}
          >
            ▶ Tiếp tục: {next.title}
          </button>
        ) : (
          <p className="muted">Bạn đã hoàn thành Chương 1! Chương 2 sẽ mở thêm các vùng mới.</p>
        )}
      </aside>
    </div>
  );
}

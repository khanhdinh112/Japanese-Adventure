'use client';

import { useEffect, type ReactNode } from 'react';
import { REGION_BY_ID } from '../data/regions';
import { STAGE_BY_ID } from '../data/stages';
import { GameProvider, useGame } from '../components/GameProvider';
import { CharacterCreation } from '../components/screens/CharacterCreation';
import { JournalScreen } from '../components/screens/JournalScreen';
import { ParentScreen } from '../components/screens/ParentScreen';
import { RegionScreen } from '../components/screens/RegionScreen';
import { ResultsScreen } from '../components/screens/ResultsScreen';
import { StageScreen } from '../components/screens/StageScreen';
import { WelcomeScreen } from '../components/screens/WelcomeScreen';
import { WorldMapScreen } from '../components/screens/WorldMapScreen';
import { GameStage } from '../components/ui/GameStage';
import type { Route } from '../lib/routes';
import { routeKey } from '../lib/routes';
import { regionStatus } from '../lib/selectors';

/** Bảo vệ điều hướng: chưa có nhân vật → tạo nhân vật; vùng khoá / chặng không tồn tại → bản đồ. */
function useGuardedRoute(): Route {
  const { state, route, hydrated } = useGame();
  if (!hydrated) return { name: 'welcome' };
  const open = route.name === 'welcome' || route.name === 'create' || route.name === 'parent';
  if (!state.profile && !open) return { name: 'create' };
  if (route.name === 'region') {
    const r = REGION_BY_ID[route.regionId];
    if (!r || !regionStatus(state, r).unlocked) return { name: 'world' };
  }
  if ((route.name === 'stage' || route.name === 'results') && !STAGE_BY_ID[route.stageId]) return { name: 'world' };
  return route;
}

function Screen({ route }: { route: Route }): ReactNode {
  switch (route.name) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'create':
      return <CharacterCreation />;
    case 'world':
      return <WorldMapScreen />;
    case 'region':
      return <RegionScreen regionId={route.regionId} />;
    case 'stage':
      return <StageScreen stageId={route.stageId} step={route.step} />;
    case 'results':
      return <ResultsScreen stageId={route.stageId} />;
    case 'journal':
      return <JournalScreen />;
    case 'parent':
      return <ParentScreen />;
  }
}

function Game() {
  const { hydrated, phase } = useGame();
  const route = useGuardedRoute();

  useEffect(() => {
    document.documentElement.dataset.ready = hydrated ? 'true' : 'false';
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="boot">
        <span lang="ja">にほんの ぼうけん</span>
        <b>Đang mở cuốn sách phiêu lưu…</b>
      </div>
    );
  }

  const cls = phase ? `screen-host tr-${phase.kind} tr-${phase.stage}` : 'screen-host';
  const style = phase?.origin ? ({ '--ox': `${phase.origin.x}px`, '--oy': `${phase.origin.y}px` } as React.CSSProperties) : undefined;
  return (
    <div className={cls} style={style}>
      <div className="screen" key={routeKey(route)}>
        <Screen route={route} />
      </div>
      {phase && <div className={`tr-veil tr-veil-${phase.kind} tr-veil-${phase.stage}`} aria-hidden />}
    </div>
  );
}

export default function Page() {
  return (
    <GameProvider>
      <GameStage>
        <Game />
      </GameStage>
    </GameProvider>
  );
}

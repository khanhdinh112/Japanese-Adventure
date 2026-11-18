'use client';

import { useEffect, type ReactNode } from 'react';
import { REGION_BY_ID } from '../data/regions';
import { STAGE_BY_ID } from '../data/stages';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import { GameProvider, useGame } from '../components/GameProvider';
import { AuthScreen } from '../components/screens/AuthScreen';
import { ProfilesScreen } from '../components/screens/ProfilesScreen';
import { CharacterCreation } from '../components/screens/CharacterCreation';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { AdminScreen } from '../components/screens/AdminScreen';
import { LettersScreen } from '../components/screens/LettersScreen';
import { JournalScreen } from '../components/screens/JournalScreen';
import { ParentScreen } from '../components/screens/ParentScreen';
import { RegionScreen } from '../components/screens/RegionScreen';
import { ResultsScreen } from '../components/screens/ResultsScreen';
import { StageScreen } from '../components/screens/StageScreen';
import { WelcomeScreen } from '../components/screens/WelcomeScreen';
import { WorldMapScreen } from '../components/screens/WorldMapScreen';
import { GameStage } from '../components/ui/GameStage';
import { QuickTour } from '../components/ui/QuickTour';
import { setMusicEnabled, setMusicMood, unlockMusic, type MusicMood } from '../lib/music';
import type { Route } from '../lib/routes';
import { routeKey } from '../lib/routes';
import { regionStatus } from '../lib/selectors';

/**
 * Bảo vệ điều hướng:
 * - chưa đăng nhập cũng chưa chọn chơi thử → chỉ có màn chào / đăng nhập;
 * - đã đăng nhập nhưng chưa chọn bé → màn chọn hồ sơ;
 * - chưa có nhân vật → tạo nhân vật; vùng khoá / chặng không tồn tại → bản đồ.
 */
function useGuardedRoute(): Route {
  const { state, route, hydrated, mode, activeChildId } = useGame();
  const auth = useAuth();
  if (!hydrated) return { name: 'welcome' };

  if (mode === 'none') {
    return route.name === 'auth' ? route : { name: 'welcome' };
  }
  if (mode === 'account') {
    if (auth.recovering) return { name: 'auth' };
    if (route.name === 'auth') return { name: 'profiles' };
    if (!activeChildId) return route.name === 'welcome' || route.name === 'profiles' || route.name === 'admin' ? route : { name: 'profiles' };
  } else if (route.name === 'profiles' || route.name === 'admin') {
    return { name: 'welcome' };
  }

  const open = route.name === 'welcome' || route.name === 'create' || route.name === 'parent' || route.name === 'profiles' || route.name === 'auth' || route.name === 'admin';
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
    case 'auth':
      return <AuthScreen />;
    case 'profiles':
      return <ProfilesScreen />;
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
    case 'letters':
      return <LettersScreen />;
    case 'admin':
      return <AdminScreen />;
  }
}

function moodFor(route: Route): MusicMood {
  switch (route.name) {
    case 'stage':
    case 'journal':
    case 'parent':
    case 'results':
    case 'letters':
    case 'admin':
      return 'calm';
    case 'world':
    case 'region':
      return 'adventure';
    default:
      return 'home';
  }
}

/** Nhạc nền: theo cài đặt và theo màn hình; chỉ thực sự phát sau lần chạm đầu tiên (luật của trình duyệt). */
function useBackgroundMusic(route: Route, enabled: boolean) {
  const mood = moodFor(route);
  useEffect(() => {
    setMusicMood(mood);
  }, [mood]);
  useEffect(() => {
    setMusicEnabled(enabled);
    if (!enabled) return;
    const unlock = () => unlockMusic();
    const vis = () => setMusicEnabled(enabled && document.visibilityState === 'visible');
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [enabled]);
}

function Game() {
  const { hydrated, phase, loadingChild, state, go, mode } = useGame();
  const route = useGuardedRoute();
  useBackgroundMusic(route, hydrated && state.settings.music);

  useEffect(() => {
    document.documentElement.dataset.ready = hydrated ? 'true' : 'false';
  }, [hydrated]);

  if (!hydrated || loadingChild) {
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
        <ErrorBoundary resetKey={routeKey(route)} onHome={() => go({ name: mode === 'account' ? 'profiles' : 'welcome' }, { kind: 'fade' })}>
          <Screen route={route} />
        </ErrorBoundary>
      </div>
      {route.name === 'world' && state.profile && !state.tourSeen && !phase && <QuickTour />}
      {phase && <div className={`tr-veil tr-veil-${phase.kind} tr-veil-${phase.stage}`} aria-hidden />}
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <GameProvider>
        <GameStage>
          <Game />
        </GameStage>
      </GameProvider>
    </AuthProvider>
  );
}

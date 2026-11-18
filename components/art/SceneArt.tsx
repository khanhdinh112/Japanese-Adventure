import type { RegionTheme, SceneId } from '../../data/types';
import { finalArt } from '../../data/art';
import { RegionLandscape, WorldMapArt } from './maps';
import { SCENE_COMPONENTS, WelcomeScene } from './scenes';

/** Mọi nền lớn đều đi qua các wrapper này để có thể thay bằng tranh thật qua data/art.ts. */

export function SceneArt({ scene }: { scene: SceneId | 'welcome' }) {
  const src = finalArt(`scene:${scene}`);
  if (src) return <img className="art-img" src={src} alt="" draggable={false} />;
  if (scene === 'welcome') return <WelcomeScene />;
  const C = SCENE_COMPONENTS[scene];
  return <C />;
}

export function WorldArt() {
  const src = finalArt('map:world');
  if (src) return <img className="art-img" src={src} alt="Bản đồ thế giới" draggable={false} />;
  return <WorldMapArt />;
}

export function RegionArt({ theme }: { theme: RegionTheme }) {
  const src = finalArt(`region:${theme}`);
  if (src) return <img className="art-img" src={src} alt="Phong cảnh vùng" draggable={false} />;
  return <RegionLandscape theme={theme} />;
}

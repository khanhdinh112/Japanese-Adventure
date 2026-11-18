'use client';

import { getRegion } from '../../data/regions';
import { firstUndoneStep } from '../../lib/selectors';
import { useGame } from '../GameProvider';
import { RegionMap } from '../RegionMap';
import { TopBar } from '../ui/TopBar';

export function RegionScreen({ regionId }: { regionId: string }) {
  const { state, go, startStage } = useGame();
  const region = getRegion(regionId);
  return (
    <div className="screen-region">
      <RegionMap
        region={region}
        onPlay={(stageId, restart) => {
          const step = restart ? 'story' : firstUndoneStep(state, stageId);
          startStage(stageId, restart);
          go({ name: 'stage', stageId, step }, { kind: 'wash' });
        }}
      />
      <TopBar title={region.name} titleJp={region.nameJp} onBack={() => go({ name: 'world' }, { kind: 'fade' })} backLabel="Bản đồ thế giới" />
    </div>
  );
}

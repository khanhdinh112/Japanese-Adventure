'use client';

import type { ReactNode } from 'react';
import type { SceneId, StageContent, StepKind } from '../../data/types';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { StepProgress } from '../ui/StepProgress';
import { TopBar } from '../ui/TopBar';

export function sceneOf(stage: StageContent): SceneId {
  const b = stage.beats.find((x) => x.type === 'scene');
  return b && b.type === 'scene' ? b.scene : 'engawa';
}

interface Props {
  stage: StageContent;
  step: StepKind;
  children: ReactNode;
  className?: string;
}

/** Khung chung cho các chặng học (từ vựng, ngữ pháp, nghe, nhiệm vụ, tự làm): nền cảnh mờ + thanh HUD + tiến độ. */
export function StageShell({ stage, step, children, className }: Props) {
  const { go } = useGame();
  return (
    <div className={['shell', `shell-${step}`, className].filter(Boolean).join(' ')}>
      <div className="shell-bg" aria-hidden>
        <SceneArt scene={sceneOf(stage)} />
      </div>
      <div className="shell-wash" aria-hidden />
      <TopBar
        title={stage.title}
        titleJp={stage.titleJp}
        onBack={() => go({ name: 'region', regionId: stage.regionId }, { kind: 'fade' })}
        backLabel="Bản đồ"
        center={<StepProgress stageId={stage.id} current={step} />}
        compact
      />
      <main className="shell-main">{children}</main>
    </div>
  );
}

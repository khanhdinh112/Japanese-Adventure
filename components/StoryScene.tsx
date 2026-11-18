'use client';

import type { ReactNode } from 'react';
import type { AmbientKind, CastMember, CharacterId, SceneId } from '../data/types';
import type { PlayerLook } from '../lib/gameState';
import { CharacterSprite } from './CharacterSprite';
import { SceneArt } from './art/SceneArt';
import { AmbientLayer } from './ui/AmbientLayer';

export interface StorySceneProps {
  scene: SceneId;
  ambient: AmbientKind;
  cast: CastMember[];
  look: PlayerLook;
  /** Nhân vật đang nói (được làm sáng, người khác hơi mờ) */
  speakerId?: CharacterId | null;
  talking?: boolean;
  /** Biểu ngữ tên địa điểm khi vừa chuyển cảnh */
  place?: { vi: string; jp: string } | null;
  /** Lớp tương tác nằm trên tranh (trò tìm đồ, hộp thoại…) */
  children?: ReactNode;
  /** Làm mờ nhẹ cảnh (khi có lá thư / thẻ văn hóa) */
  dimmed?: boolean;
  /** Ẩn nhân vật (trò tìm đồ cần nhìn rõ cả căn phòng) */
  hideCast?: boolean;
}

/** Khung cảnh câu chuyện: tranh nền + hạt môi trường + nhân vật + lớp tương tác. */
export function StoryScene({ scene, ambient, cast, look, speakerId, talking, place, children, dimmed, hideCast }: StorySceneProps) {
  return (
    <div className={`story-scene${dimmed ? ' is-dimmed' : ''}`} data-scene={scene}>
      <div className="story-art" key={scene}>
        <SceneArt scene={scene} />
      </div>
      <AmbientLayer kind={ambient} seed={scene.length} />
      {!hideCast && (
        <div className="cast">
          {cast
            .filter((m) => !m.hidden)
            .map((m) => {
              const isSpeaker = speakerId === m.id;
              return (
                <div
                  key={m.id}
                  className={`cast-slot slot-${m.slot} cast-${m.id}${isSpeaker ? ' is-speaker' : ''}${
                    speakerId && !isSpeaker ? ' is-quiet' : ''
                  }`}
                >
                  <CharacterSprite
                    id={m.id}
                    emotion={m.emotion}
                    look={look}
                    glasses={m.glasses ?? true}
                    speaking={isSpeaker && !!talking}
                    variant="full"
                  />
                </div>
              );
            })}
        </div>
      )}
      <div className="story-vignette" aria-hidden />
      {place && (
        <div className="place-banner" key={place.vi}>
          <span lang="ja">{place.jp}</span>
          <b>{place.vi}</b>
        </div>
      )}
      {children}
    </div>
  );
}

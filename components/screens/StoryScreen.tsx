'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWord } from '../../data/words';
import type { AmbientKind, Beat, CastMember, CharacterId, ReplyLine, SceneId, StageContent } from '../../data/types';
import { DEFAULT_LOOK } from '../../lib/gameState';
import { playSfx } from '../../lib/sfx';
import { DialogueBox } from '../DialogueBox';
import { useGame } from '../GameProvider';
import { StoryScene } from '../StoryScene';
import { ChoicePanel } from '../story/ChoicePanel';
import { CultureOverlay } from '../story/CultureOverlay';
import { FindGame } from '../story/FindGame';
import { FoldGame } from '../story/FoldGame';
import { LetterOverlay } from '../story/LetterOverlay';
import { StepProgress } from '../ui/StepProgress';
import { TopBar } from '../ui/TopBar';

interface SceneState {
  scene: SceneId;
  ambient: AmbientKind;
  cast: CastMember[];
}

function firstScene(stage: StageContent): SceneState {
  const b = stage.beats.find((x): x is Extract<Beat, { type: 'scene' }> => x.type === 'scene');
  return b ? { scene: b.scene, ambient: b.ambient, cast: b.cast } : { scene: 'engawa', ambient: 'none', cast: [] };
}

/** Màn hình câu chuyện tương tác: chạy tuần tự các "beat" trong data/stages/*. */
export function StoryScreen({ stage }: { stage: StageContent }) {
  const { state, go, completeStep, answer } = useGame();
  const words = useMemo(() => stage.wordIds.map(getWord), [stage]);
  const look = state.profile?.look ?? DEFAULT_LOOK;

  const [idx, setIdx] = useState(0);
  const [sc, setSc] = useState<SceneState>(() => firstScene(stage));
  const [place, setPlace] = useState<{ vi: string; jp: string } | null>(null);
  const [speakerId, setSpeakerId] = useState<CharacterId | null>(null);
  const [talking, setTalking] = useState(false);
  const [reply, setReply] = useState<{ line: ReplyLine; after: () => void } | null>(null);
  const [wrongPicked, setWrongPicked] = useState<number[]>([]);
  const [rightPicked, setRightPicked] = useState<number | null>(null);
  const finished = useRef(false);

  const beat: Beat | undefined = stage.beats[idx];
  const advance = useCallback(() => {
    setIdx((i) => i + 1);
    setWrongPicked([]);
    setRightPicked(null);
  }, []);

  /** Áp dụng một lời thoại lên đội hình nhân vật: cảm xúc, kính, người đang nói. */
  const applyLine = useCallback((line: ReplyLine | null) => {
    if (!line) {
      setSpeakerId(null);
      return;
    }
    setSpeakerId(line.speaker);
    setSc((s) => ({
      ...s,
      cast: s.cast.map((m) => {
        const tweak = line.tweak?.[m.id];
        const emotion = m.id === line.speaker && line.emotion ? line.emotion : m.emotion;
        return { ...m, ...tweak, emotion };
      }),
    }));
  }, []);

  /* Xử lý các beat tự chạy: đổi cảnh, kết thúc. */
  useEffect(() => {
    if (!beat) {
      if (finished.current) return;
      finished.current = true;
      playSfx('star');
      completeStep(stage.id, 'story');
      go({ name: 'stage', stageId: stage.id, step: 'vocab' }, { kind: 'wash' });
      return;
    }
    if (beat.type === 'scene') {
      setSc({ scene: beat.scene, ambient: beat.ambient, cast: beat.cast });
      setPlace(beat.place);
      setSpeakerId(null);
      const id = window.setTimeout(() => {
        setPlace(null);
        advance();
      }, 2000);
      return () => window.clearTimeout(id);
    }
    if (beat.type === 'line') applyLine(beat);
    if (beat.type === 'narration') setSpeakerId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    if (reply) applyLine(reply.line);
  }, [reply, applyLine]);

  const choose = (i: number) => {
    if (!beat || beat.type !== 'choice') return;
    const opt = beat.options[i];
    const anyCorrect = beat.options.some((o) => o.correct);
    const correct = anyCorrect ? !!opt.correct : true;
    if (correct) {
      playSfx('good');
      if (wrongPicked.length === 0) answer(stage.id, 'vocab', true, beat.wordIds ?? []);
      setRightPicked(i);
      if (opt.reply) setReply({ line: opt.reply, after: advance });
      else window.setTimeout(advance, 700);
    } else {
      playSfx('bad');
      if (wrongPicked.length === 0) answer(stage.id, 'vocab', false, beat.wordIds ?? []);
      setWrongPicked((w) => [...w, i]);
      if (beat.wrongReply) setReply({ line: beat.wrongReply, after: () => undefined });
    }
  };

  const overlayOpen = beat?.type === 'letter' || beat?.type === 'culture';
  const gameOpen = beat?.type === 'find' || beat?.type === 'fold';
  const progress = Math.min(100, Math.round((idx / stage.beats.length) * 100));

  return (
    <div className="story">
      <StoryScene
        scene={sc.scene}
        ambient={sc.ambient}
        cast={sc.cast}
        look={look}
        speakerId={speakerId}
        talking={talking}
        place={place}
        dimmed={overlayOpen}
        hideCast={gameOpen}
      >
        {reply ? (
          <DialogueBox
            key={`reply-${idx}-${reply.line.jp}`}
            speaker={reply.line.speaker}
            jp={reply.line.jp}
            romaji={reply.line.romaji}
            vi={reply.line.vi}
            words={words}
            onTalking={setTalking}
            onNext={() => {
              const r = reply;
              setReply(null);
              r.after();
            }}
          />
        ) : beat?.type === 'line' ? (
          <DialogueBox
            key={idx}
            speaker={beat.speaker}
            jp={beat.jp}
            romaji={beat.romaji}
            vi={beat.vi}
            words={words}
            onTalking={setTalking}
            onNext={advance}
          />
        ) : beat?.type === 'narration' ? (
          <DialogueBox key={idx} speaker="narrator" jp={beat.jp} romaji={beat.romaji} vi={beat.vi} words={words} onTalking={setTalking} onNext={advance} />
        ) : beat?.type === 'choice' ? (
          <ChoicePanel beat={beat} wrong={wrongPicked} right={rightPicked} words={words} onChoose={choose} />
        ) : beat?.type === 'letter' ? (
          <LetterOverlay beat={beat} onDone={advance} />
        ) : beat?.type === 'culture' ? (
          <CultureOverlay cultureId={beat.cultureId} stageId={stage.id} onDone={advance} />
        ) : beat?.type === 'find' ? (
          <FindGame key={idx} stageId={stage.id} beat={beat} words={words} onLine={applyLine} onTalking={setTalking} onDone={advance} />
        ) : beat?.type === 'fold' ? (
          <FoldGame key={idx} stageId={stage.id} beat={beat} words={words} onLine={applyLine} onTalking={setTalking} onDone={advance} />
        ) : null}
      </StoryScene>

      <TopBar
        title={stage.title}
        titleJp={stage.titleJp}
        onBack={() => go({ name: 'region', regionId: stage.regionId }, { kind: 'fade' })}
        backLabel="Bản đồ"
        center={<StepProgress stageId={stage.id} current="story" />}
        compact
        tone="dark"
      />
      <div className="story-progress" aria-hidden>
        <i style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

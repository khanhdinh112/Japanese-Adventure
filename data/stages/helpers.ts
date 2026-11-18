import type {
  CastMember,
  CastTweak,
  CharacterId,
  Emotion,
  LineBeat,
  NarrationBeat,
  PatternTile,
  ReplyLine,
  SceneBeat,
  Slot,
  TileRole,
} from '../types';

export function say(
  speaker: CharacterId,
  jp: string,
  romaji: string,
  vi: string,
  emotion?: Emotion,
  tweak?: CastTweak,
): LineBeat {
  return { type: 'line', speaker, jp, romaji, vi, emotion, tweak };
}

export function reply(
  speaker: CharacterId,
  jp: string,
  romaji: string,
  vi: string,
  emotion?: Emotion,
): ReplyLine {
  return { speaker, jp, romaji, vi, emotion };
}

export function narr(vi: string, jp?: string, romaji?: string): NarrationBeat {
  return { type: 'narration', vi, jp, romaji };
}

export function cast(id: CharacterId, slot: Slot, emotion: Emotion = 'neutral', extra: Partial<CastMember> = {}): CastMember {
  return { id, slot, emotion, ...extra };
}

export function scene(
  sceneId: SceneBeat['scene'],
  ambient: SceneBeat['ambient'],
  place: SceneBeat['place'],
  members: CastMember[],
): SceneBeat {
  return { type: 'scene', scene: sceneId, ambient, place, cast: members };
}

export function tile(text: string, role: TileRole, label: string): PatternTile {
  return { text, role, label };
}

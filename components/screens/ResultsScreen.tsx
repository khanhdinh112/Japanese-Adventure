'use client';

import { useEffect } from 'react';
import { BADGE_BY_ID } from '../../data/badges';
import { getStage } from '../../data/stages';
import { getWord } from '../../data/words';
import type { SkillKind } from '../../data/types';
import { computeBadges, nextStage, progressOf, WORD_LEVEL_LABEL, wordLevel } from '../../lib/selectors';
import { playSfx } from '../../lib/sfx';
import { AmbientLayer } from '../ui/AmbientLayer';
import { useGame } from '../GameProvider';
import { useSpeech } from '../ui/useSpeech';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { StarRating } from '../ui/StarRating';
import { TopBar } from '../ui/TopBar';
import { sceneOf } from './StageShell';

const SKILL_LABEL: Record<SkillKind, string> = { vocab: 'Từ vựng', grammar: 'Ngữ pháp', listening: 'Nghe', mastery: 'Tự làm' };
const HEADLINE = ['', 'Bạn đã hoàn thành chặng này!', 'Rất giỏi — bạn làm gần như một mình!', 'Tuyệt vời! Ba ngôi sao sáng rực!'];

/** Màn hình kết quả: sao, kỹ năng, từ đã học, huy hiệu và bước đi tiếp theo. */
export function ResultsScreen({ stageId }: { stageId: string }) {
  const { state, go, startStage } = useGame();
  const stage = getStage(stageId);
  const prog = progressOf(state, stageId);
  const r = prog.lastResult;
  const badges = computeBadges(state);
  const badge = stage.badgeId && badges.has(stage.badgeId) ? BADGE_BY_ID[stage.badgeId] : null;
  const upcoming = nextStage(state);
  const { canSpeak, speaking, play } = useSpeech();

  useEffect(() => {
    if (r) {
      const id = window.setTimeout(() => playSfx('star'), 500);
      return () => window.clearTimeout(id);
    }
  }, [r]);

  if (!r) return null;
  const skills = (Object.keys(SKILL_LABEL) as SkillKind[]).filter((k) => r.skills[k].total > 0);

  return (
    <div className="results">
      <div className="results-bg" aria-hidden>
        <SceneArt scene={sceneOf(stage)} />
      </div>
      <div className="results-wash" aria-hidden />
      <AmbientLayer kind="petals" seed={3} />
      <TopBar title="Kết quả" onBack={() => go({ name: 'region', regionId: stage.regionId }, { kind: 'fade' })} backLabel="Bản đồ vùng" />

      <div className="results-grid">
        <section className="results-hero paper">
          <div className="rh-chars">
            <CharacterSprite id="momo" emotion="laugh" variant="bust" />
            <CharacterSprite id="player" look={state.profile?.look} emotion="happy" variant="bust" />
            <CharacterSprite id="hana" emotion="happy" variant="bust" />
          </div>
          <p className="rh-stage">
            {stage.icon} {stage.title}
          </p>
          <StarRating value={r.stars} size="xl" animate />
          <h1>{HEADLINE[r.stars]}</h1>
          <div className="rh-nums">
            <div>
              <b>+{r.xpGained}</b>
              <small>điểm kinh nghiệm</small>
            </div>
            <div>
              <b>{Math.round(r.accuracy * 100)}%</b>
              <small>trả lời đúng</small>
            </div>
            <div>
              <b>{r.hints}</b>
              <small>lần dùng gợi ý</small>
            </div>
          </div>
          <ul className="rh-why">
            <li className="on">⭐ Hoàn thành chặng</li>
            <li className={r.stars >= 2 ? 'on' : ''}>⭐ Tự làm đúng ≥ 2/3 và dùng ≤ 1 gợi ý</li>
            <li className={r.stars >= 3 ? 'on' : ''}>⭐ Đúng ≥ 80% và đã lưu nhiệm vụ</li>
          </ul>
        </section>

        <section className="results-side">
          <div className="paper rs-card">
            <h3>Kỹ năng</h3>
            {skills.map((k) => {
              const s = r.skills[k];
              const pct = Math.round((s.correct / s.total) * 100);
              return (
                <div key={k} className="skillbar">
                  <span>{SKILL_LABEL[k]}</span>
                  <div className="sb-track" role="img" aria-label={`${SKILL_LABEL[k]}: ${s.correct} trên ${s.total} đúng`}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <b>
                    {s.correct}/{s.total}
                  </b>
                </div>
              );
            })}
          </div>
          <div className="paper rs-card">
            <h3>Từ đã học</h3>
            <div className="rs-words">
              {stage.wordIds.map((id) => {
                const w = getWord(id);
                const lv = wordLevel(state, id);
                return (
                  <span key={id} className={`rs-word lv${lv}`} title={WORD_LEVEL_LABEL[lv].label}>
                    <span aria-hidden>{w.icon}</span>
                    <b lang="ja">{w.jp}</b>
                    <i aria-hidden>{WORD_LEVEL_LABEL[lv].icon}</i>
                  </span>
                );
              })}
            </div>
            <small className="muted">🌰 mới gặp · 🌱 đã hiểu · 🌸 tự dùng được</small>
          </div>
          {badge && (
            <div className="paper rs-card rs-badge">
              <span className="badge-ic" aria-hidden>
                {badge.icon}
              </span>
              <div>
                <small>Huy hiệu mới</small>
                <b>{badge.name}</b>
                <span lang="ja">{badge.nameJp}</span>
              </div>
            </div>
          )}
          {stage.osanoSaying && (
            <div className="paper rs-card rs-saying">
              <div className="rs-saying-head">
                <h3>Lời bà Osano dặn</h3>
                {canSpeak && (
                  <button type="button" className="btn btn-pill" disabled={speaking} onClick={() => play(stage.osanoSaying!.jp)} aria-label="Nghe lời bà dặn">
                    🔊 Nghe
                  </button>
                )}
              </div>
              <p lang="ja" className="rs-saying-jp">{stage.osanoSaying.jp}</p>
              <span className="rs-saying-ro">{stage.osanoSaying.romaji}</span>
              <span className="rs-saying-vi">{stage.osanoSaying.vi}</span>
            </div>
          )}
        </section>
      </div>

      <div className="results-actions">
        <button
          type="button"
          className="btn btn-ghost btn-lg"
          onClick={() => {
            startStage(stageId, true);
            go({ name: 'stage', stageId, step: 'story' }, { kind: 'wash' });
          }}
        >
          ↺ Chơi lại để lấy thêm sao
        </button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={() => go({ name: 'journal' }, { kind: 'wash' })}>
          📔 Mở nhật ký
        </button>
        {upcoming ? (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              startStage(upcoming.stageId);
              go({ name: 'stage', stageId: upcoming.stageId, step: 'story' }, { kind: 'wash' });
            }}
          >
            Chặng tiếp theo ▶
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => go({ name: 'world' }, { kind: 'fade' })}>
            Về bản đồ thế giới 🗺️
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES, type HairStyle } from '../../data/characters';
import { DEFAULT_LOOK, type Honorific, type PlayerLook } from '../../lib/gameState';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { AmbientLayer } from '../ui/AmbientLayer';
import { TopBar } from '../ui/TopBar';

function Swatches({ colors, value, onPick, label }: { colors: readonly string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {colors.map((c, i) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${label} ${i + 1}`}
          className={`swatch swatch-lg${value === i ? ' on' : ''}`}
          style={{ background: c }}
          onClick={() => onPick(i)}
        />
      ))}
    </div>
  );
}

/** Tạo nhân vật: tên, cách gọi (ちゃん/くん), da, tóc, áo. Xem trước ngay bên cạnh Momo. */
export function CharacterCreation() {
  const { state, go, createProfile, activeChildId, leaveChild } = useGame();
  const existing = state.profile;
  const [name, setName] = useState(existing?.name ?? '');
  const [hon, setHon] = useState<Honorific>(existing?.honorific ?? 'chan');
  const [look, setLook] = useState<PlayerLook>(existing?.look ?? DEFAULT_LOOK);
  const [touched, setTouched] = useState(false);
  const valid = name.trim().length >= 1;
  const set = (patch: Partial<PlayerLook>) => setLook((l) => ({ ...l, ...patch }));
  const shown = name.trim() || 'Bạn';

  return (
    <div className="create">
      <div className="create-bg" aria-hidden>
        <SceneArt scene="gate" />
      </div>
      <div className="create-wash" aria-hidden />
      <AmbientLayer kind="petals" seed={5} />
      <TopBar title="Tạo nhân vật" titleJp="なまえを おしえて" onBack={async () => {
          if (activeChildId === 'new') {
            await leaveChild();
            go({ name: 'profiles' }, { kind: 'fade' });
          } else go({ name: 'welcome' }, { kind: 'fade' });
        }} backLabel="Quay lại" compact />

      <div className="create-grid">
        <section className="create-preview">
          <div className="cp-stage">
            <div className="cp-player">
              <CharacterSprite id="player" look={look} emotion="happy" variant="full" />
            </div>
            <div className="cp-momo">
              <CharacterSprite id="momo" emotion="happy" variant="full" />
            </div>
          </div>
          <div className="cp-name">
            <b>{shown}</b>
            <small lang="ja">
              {shown}
              {hon === 'chan' ? 'ちゃん' : 'くん'}
            </small>
          </div>
        </section>

        <section className="create-form paper">
          <h2>Bạn là ai nhỉ?</h2>
          <p className="muted">Bà Hana và Momo muốn biết tên bạn để chào đón nhé.</p>

          <label className="field">
            <span>Tên của bạn</span>
            <input
              type="text"
              value={name}
              maxLength={14}
              placeholder="Ví dụ: Minh, Lan, Khanh…"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              autoFocus
            />
            {touched && !valid && <em className="error">Hãy cho mình biết tên của bạn nhé.</em>}
          </label>

          <div className="field">
            <span>Bà Hana sẽ gọi bạn là</span>
            <div className="seg" role="radiogroup">
              {(['chan', 'kun'] as Honorific[]).map((h) => (
                <button key={h} type="button" role="radio" aria-checked={hon === h} className={hon === h ? 'on' : ''} onClick={() => setHon(h)}>
                  <b lang="ja">
                    {shown}
                    {h === 'chan' ? 'ちゃん' : 'くん'}
                  </b>
                  <small>{h === 'chan' ? 'cách gọi thân mật cho bé gái' : 'cách gọi thân mật cho bé trai'}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Kiểu tóc</span>
            <div className="hairs">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={`hair-opt${look.hairStyle === h.id ? ' on' : ''}`}
                  onClick={() => set({ hairStyle: h.id as HairStyle })}
                  aria-label={h.label}
                  title={h.label}
                >
                  <CharacterSprite id="player" look={{ ...look, hairStyle: h.id as HairStyle }} variant="head" />
                  <small>{h.label}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <span>Màu tóc</span>
              <Swatches colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} label="Màu tóc" />
            </div>
            <div className="field">
              <span>Màu da</span>
              <Swatches colors={SKIN_TONES} value={look.skin} onPick={(skin) => set({ skin })} label="Màu da" />
            </div>
            <div className="field">
              <span>Màu áo</span>
              <Swatches colors={OUTFIT_COLORS} value={look.outfit} onPick={(outfit) => set({ outfit })} label="Màu áo" />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-xl btn-block"
            disabled={!valid}
            onClick={() => {
              createProfile({ name: name.trim(), honorific: hon, look, createdAt: existing?.createdAt ?? new Date().toISOString() });
              go({ name: 'world' }, { kind: 'wash' });
            }}
          >
            {existing ? 'Lưu và vào bản đồ' : 'Lên đường đến làng Saga'} ▶
          </button>
        </section>
      </div>
    </div>
  );
}

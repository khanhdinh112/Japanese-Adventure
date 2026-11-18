'use client';

import { useState } from 'react';
import { revertLocked, lockedSlots, type WardrobeItem } from '../../data/wardrobe';
import { DEFAULT_LOOK, type Honorific, type PlayerLook } from '../../lib/gameState';
import { levelInfo } from '../../lib/levels';
import { starBalance } from '../../lib/selectors';
import { CharacterSprite } from '../CharacterSprite';
import { SceneArt } from '../art/SceneArt';
import { useGame } from '../GameProvider';
import { AmbientLayer } from '../ui/AmbientLayer';
import { TopBar } from '../ui/TopBar';
import { WardrobePanel } from '../ui/WardrobePanel';

/** Tạo nhân vật: tên, cách gọi (ちゃん/くん), da, tóc, áo. Xem trước ngay bên cạnh Momo. */
export function CharacterCreation() {
  const { state, go, createProfile, unlockItem, activeChildId, leaveChild } = useGame();
  const existing = state.profile;
  const [name, setName] = useState(existing?.name ?? '');
  const [look, setLook] = useState<PlayerLook>(existing?.look ?? DEFAULT_LOOK);
  const hon: Honorific = look.gender === 'boy' ? 'kun' : 'chan';
  const [touched, setTouched] = useState(false);
  const valid = name.trim().length >= 1;
  const balance = starBalance(state);
  const level = levelInfo(state.xp).level;
  const locked = lockedSlots(look, state.owned);
  const buy = (item: WardrobeItem) => {
    if (balance < item.cost) return;
    unlockItem(item.id);
  };
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
          <p className="muted">Bà Hana và Momo muốn biết tên bạn để chào đón nhé. Bà sẽ gọi bạn là <b lang="ja">{shown}{hon === 'chan' ? 'ちゃん' : 'くん'}</b>.</p>

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

          <WardrobePanel
            look={look}
            onChange={setLook}
            owned={state.owned}
            balance={balance}
            level={level}
            onBuy={buy}
          />
          {locked.length > 0 && (
            <p className="muted wd-trynote">
              🔒 {locked.map((i) => i.label).join(', ')} đang mặc thử. Kiếm sao khi học để mở khoá, còn bây giờ bé sẽ dùng đồ mặc định nhé.
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary btn-xl btn-block"
            disabled={!valid}
            onClick={() => {
              createProfile({ name: name.trim(), honorific: hon, look: revertLocked(look, state.owned), createdAt: existing?.createdAt ?? new Date().toISOString() });
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

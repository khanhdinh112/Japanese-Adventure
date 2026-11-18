'use client';

import { useState } from 'react';
import { HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../../data/characters';
import {
  DEFAULT_ITEMS,
  GENDER_LABEL,
  SLOT_ITEMS,
  isUnlocked,
  type Gender,
  type WardrobeItem,
  type WardrobeSlot,
} from '../../data/wardrobe';
import { defaultLook, type PlayerLook } from '../../lib/gameState';
import { CharacterSprite } from '../CharacterSprite';

const TABS: { slot: WardrobeSlot | 'color'; label: string; icon: string }[] = [
  { slot: 'face', label: 'Khuôn mặt', icon: '🙂' },
  { slot: 'hair', label: 'Kiểu tóc', icon: '💇' },
  { slot: 'outfit', label: 'Trang phục', icon: '👕' },
  { slot: 'hat', label: 'Mũ & nón', icon: '👒' },
  { slot: 'extra', label: 'Phụ kiện', icon: '🎒' },
  { slot: 'color', label: 'Màu sắc', icon: '🎨' },
];

const LOOK_KEY: Record<WardrobeSlot, 'face' | 'hairStyle' | 'outfit' | 'hat' | 'extra'> = {
  face: 'face',
  hair: 'hairStyle',
  outfit: 'outfit',
  hat: 'hat',
  extra: 'extra',
};

/** Hiển thị đúng phần cần xem của từng ô trong thumbnail. */
const THUMB_VARIANT: Record<WardrobeSlot, 'head' | 'bust' | 'outfit'> = { face: 'head', hair: 'head', outfit: 'outfit', hat: 'head', extra: 'bust' };

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

interface Props {
  look: PlayerLook;
  onChange: (look: PlayerLook) => void;
  owned: readonly string[];
  /** Số sao còn có thể tiêu */
  balance: number;
  level: number;
  /** Mua món bằng sao; trả về true nếu thành công */
  onBuy: (item: WardrobeItem) => void;
  /** Cho đổi giới tính (tạo nhân vật); trong tủ đồ vẫn cho, nhưng đồ được tách theo giới */
  allowGender?: boolean;
}

export function WardrobePanel({ look, onChange, owned, balance, level, onBuy, allowGender = true }: Props) {
  const [tab, setTab] = useState<WardrobeSlot | 'color'>('hair');
  const set = (patch: Partial<PlayerLook>) => onChange({ ...look, ...patch });

  const switchGender = (g: Gender) => {
    if (g === look.gender) return;
    onChange({ ...defaultLook(g), skin: look.skin, hairColor: look.hairColor, outfitColor: look.outfitColor });
  };

  return (
    <div className="wardrobe">
      {allowGender && (
        <div className="wd-gender seg" role="radiogroup" aria-label="Bé trai hay bé gái">
          {(['girl', 'boy'] as Gender[]).map((g) => (
            <button key={g} type="button" role="radio" aria-checked={look.gender === g} className={look.gender === g ? 'on' : ''} onClick={() => switchGender(g)}>
              <b>
                {GENDER_LABEL[g].icon} {GENDER_LABEL[g].label}
              </b>
            </button>
          ))}
        </div>
      )}

      <div className="wd-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.slot} type="button" role="tab" aria-selected={tab === t.slot} className={`wd-tab${tab === t.slot ? ' on' : ''}`} onClick={() => setTab(t.slot)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="wd-balance" title="Sao kiếm được khi hoàn thành bài học, dùng để mở khoá đồ">
        Sao có thể tiêu: <b>⭐ {balance}</b>
      </div>

      {tab === 'color' ? (
        <div className="wd-colors">
          <div className="field">
            <span>Màu tóc</span>
            <Swatches colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} label="Màu tóc" />
          </div>
          <div className="field">
            <span>Màu da</span>
            <Swatches colors={SKIN_TONES} value={look.skin} onPick={(skin) => set({ skin })} label="Màu da" />
          </div>
          <div className="field">
            <span>Màu trang phục & phụ kiện</span>
            <Swatches colors={OUTFIT_COLORS} value={look.outfitColor} onPick={(outfitColor) => set({ outfitColor })} label="Màu trang phục" />
          </div>
        </div>
      ) : (
        <div className="wd-grid">
          {SLOT_ITEMS[tab][look.gender].map((item) => {
            const slot = tab;
            const key = LOOK_KEY[slot];
            const unlocked = isUnlocked(item, owned);
            const levelOk = (item.minLevel ?? 1) <= level;
            const canBuy = !unlocked && levelOk && balance >= item.cost;
            const selected = look[key] === item.id;
            const preview = { ...look, [key]: item.id } as PlayerLook;
            // Ô "Không đội/Không mang" cho ra thumbnail trống: nhìn bằng diện mạo hiện tại
            return (
              <div key={item.id} className={`wd-item${selected ? ' on' : ''}${unlocked ? '' : ' locked'}`}>
                <button type="button" className="wd-pick" aria-pressed={selected} aria-label={item.label} onClick={() => set({ [key]: item.id } as Partial<PlayerLook>)}>
                  <CharacterSprite id="player" look={preview} variant={THUMB_VARIANT[slot]} emotion="neutral" />
                  {!unlocked && <span className="wd-lock" aria-hidden>🔒</span>}
                </button>
                <b className="wd-name">{item.label}</b>
                {item.note && <small className="wd-note">{item.note}</small>}
                {unlocked ? (
                  item.id === DEFAULT_ITEMS[look.gender][slot] || !item.cost ? null : <small className="wd-own">✓ Đã mở khoá</small>
                ) : !levelOk ? (
                  <small className="wd-need">Cần cấp {item.minLevel} · ⭐ {item.cost}</small>
                ) : (
                  <button type="button" className="btn btn-pill wd-buy" disabled={!canBuy} onClick={() => onBuy(item)}>
                    Mở khoá ⭐ {item.cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

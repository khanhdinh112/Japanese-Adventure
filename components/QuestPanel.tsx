'use client';

import { useRef, useState } from 'react';
import type { StageContent } from '../data/types';
import { fileToThumbnail } from '../lib/image';
import { progressOf } from '../lib/selectors';
import { useGame } from './GameProvider';
import { DrawingPad } from './ui/DrawingPad';
import { SpeakButton } from './ui/SpeakButton';

interface Props {
  stage: StageContent;
  onDone: () => void;
}

type Mode = 'photo' | 'drawing';

/** Nhiệm vụ ngoài đời: làm việc thật với đồ vật thật, rồi lưu ảnh/tranh vào nhật ký. */
export function QuestPanel({ stage, onDone }: Props) {
  const { state, t, saveQuest, completeStep } = useGame();
  const quest = stage.quest;
  const run = progressOf(state, stage.id).run;
  const alreadySaved = !!run?.questSaved;

  const [mode, setMode] = useState<Mode>(quest.evidence);
  const [checked, setChecked] = useState<boolean[]>(() => quest.steps.map(() => false));
  const [photo, setPhoto] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const image = mode === 'photo' ? photo : drawing;
  const canSave = !alreadySaved && (!!image || text.trim().length >= 3);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setPhoto(await fileToThumbnail(file));
    } catch {
      setError('Mình chưa đọc được ảnh này. Hãy thử ảnh khác hoặc chuyển sang vẽ nhé.');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    saveQuest(stage.id, {
      title: quest.title,
      text: text.trim() || quest.evidenceLabel,
      jp: quest.phrase.jp,
      image: image ?? undefined,
      icon: quest.icon,
    });
  };

  return (
    <div className="quest">
      <section className="quest-left paper">
        <header className="quest-head">
          <span className="quest-icon" aria-hidden>
            {quest.icon}
          </span>
          <div>
            <h2>{quest.title}</h2>
            <small lang="ja">{quest.titleJp}</small>
          </div>
          <span className="pill pill-time">⏱ {quest.minutes} phút</span>
        </header>
        <p className="quest-hook">{t(quest.hook)}</p>
        <h4>Chuẩn bị</h4>
        <ul className="quest-mats">
          {quest.materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <h4>Các bước</h4>
        <ol className="quest-steps">
          {quest.steps.map((s, i) => (
            <li key={s}>
              <label className={checked[i] ? 'on' : ''}>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                />
                <span className="box" aria-hidden>
                  {checked[i] ? '✓' : ''}
                </span>
                <span>{t(s)}</span>
              </label>
            </li>
          ))}
        </ol>
        <div className="quest-phrase">
          <div>
            <small>Câu tiếng Nhật hôm nay</small>
            <b lang="ja">{t(quest.phrase.jp)}</b>
            {state.settings.romaji && <span className="qp-ro">{t(quest.phrase.romaji)}</span>}
            <span className="qp-vi">{t(quest.phrase.vi)}</span>
          </div>
          <SpeakButton text={t(quest.phrase.jp)} size="lg" label="Nghe" />
        </div>
        {quest.sample && quest.sample.length > 0 && (
          <div className="quest-sample">
            <small>Mẫu để chép</small>
            {quest.sample.map((l) => (
              <p key={l} lang="ja">
                {t(l)}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="quest-right paper">
        <h3>Kết quả của mình</h3>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'photo'} className={mode === 'photo' ? 'on' : ''} onClick={() => setMode('photo')}>
            📷 Chụp / chọn ảnh
          </button>
          <button type="button" role="tab" aria-selected={mode === 'drawing'} className={mode === 'drawing' ? 'on' : ''} onClick={() => setMode('drawing')}>
            🎨 Vẽ lại
          </button>
        </div>
        <p className="muted">{quest.evidenceLabel}</p>

        {mode === 'photo' ? (
          <div className="photo-drop">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Ảnh của mình" className="photo-preview" />
            ) : (
              <button type="button" className="photo-empty" onClick={() => fileRef.current?.click()} disabled={busy}>
                <span aria-hidden>📷</span>
                <b>{busy ? 'Đang xử lý…' : 'Chọn ảnh từ máy'}</b>
                <small>Ảnh chỉ lưu trên máy này, không gửi đi đâu.</small>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
            {photo && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhoto(null)}>
                Chọn ảnh khác
              </button>
            )}
          </div>
        ) : (
          <DrawingPad width={760} height={360} onChange={setDrawing} placeholder="Vẽ vào đây…" />
        )}
        {error && <p className="error">{error}</p>}

        <label className="field">
          <span>{quest.reflectionPrompt}</span>
          <textarea rows={3} value={text} maxLength={240} placeholder="Viết bằng tiếng Việt hoặc tiếng Nhật đều được…" onChange={(e) => setText(e.target.value)} />
        </label>

        <div className="quest-actions">
          {alreadySaved ? (
            <>
              <span className="saved-note">✅ Đã lưu vào nhật ký</span>
              <button type="button" className="btn btn-primary btn-lg" onClick={onDone}>
                Sang bài tự làm ▶
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  completeStep(stage.id, 'quest');
                  onDone();
                }}
              >
                Để sau (không nhận sao thứ 3)
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={!canSave}
                onClick={() => {
                  save();
                }}
              >
                📔 Lưu vào nhật ký
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

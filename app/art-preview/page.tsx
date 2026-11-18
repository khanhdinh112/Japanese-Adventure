'use client';

import { useState } from 'react';
import { ART_SPECS } from '../../data/art';
import { CharacterSprite } from '../../components/CharacterSprite';
import { CultureArt } from '../../components/art/CultureArt';
import { RegionArt, SceneArt, WorldArt } from '../../components/art/SceneArt';
import type { Emotion, RegionTheme, SceneId } from '../../data/types';

const SCENES: SceneId[] = ['road', 'gate', 'genkan', 'bedroom', 'dining', 'living', 'engawa', 'garden'];
const THEMES: RegionTheme[] = ['countryside', 'lightForest', 'catTown', 'school', 'railway', 'market', 'festival', 'fuji'];
const EMOTIONS: Emotion[] = ['neutral', 'happy', 'laugh', 'surprised', 'worried', 'thinking'];

/** Trang xem toàn bộ tranh placeholder và bảng kích thước tranh thật cần thay. Mở tại /art-preview */
export default function ArtPreview() {
  const [tab, setTab] = useState<'scenes' | 'maps' | 'culture' | 'chars' | 'specs'>('scenes');
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#f6ecd6', minHeight: '100vh' }}>
      <h1>Art preview — placeholder gốc của Japanese Adventure</h1>
      <p>Thay bằng tranh thật theo docs/ASSETS.md và data/art.ts.</p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {(['scenes', 'maps', 'culture', 'chars', 'specs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', fontWeight: tab === t ? 800 : 400 }}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'scenes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {(['welcome', ...SCENES] as const).map((s) => (
            <figure key={s} style={{ margin: 0 }}>
              <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
                <SceneArt scene={s} />
              </div>
              <figcaption>{s}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {tab === 'culture' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {['genkan', 'itadakimasu', 'otoshimono', 'origami', 'komorebi'].map((id) => (
            <figure key={id} style={{ margin: 0 }}>
              <div style={{ height: 300, borderRadius: 12, overflow: 'hidden', border: '3px solid #3a2a2c' }}>
                <CultureArt id={id} />
              </div>
              <figcaption>{id}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {tab === 'maps' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <figure style={{ margin: 0 }}>
            <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
              <WorldArt />
            </div>
            <figcaption>map:world</figcaption>
          </figure>
          {THEMES.map((t) => (
            <figure key={t} style={{ margin: 0 }}>
              <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
                <RegionArt theme={t} />
              </div>
              <figcaption>region:{t}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {tab === 'chars' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {(['player', 'hana', 'momo'] as const).flatMap((id) =>
            EMOTIONS.map((e) => (
              <figure key={id + e} style={{ margin: 0, textAlign: 'center' }}>
                <div style={{ height: 380 }}>
                  <CharacterSprite id={id} emotion={e} variant="full" style={{ height: '100%' }} />
                </div>
                <figcaption>
                  {id} · {e}
                </figcaption>
              </figure>
            )),
          )}
        </div>
      )}
      {tab === 'specs' && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th align="left">Key</th>
              <th align="left">File</th>
              <th align="left">Kích thước</th>
              <th align="left">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {ART_SPECS.map((s) => (
              <tr key={s.key} style={{ borderTop: '1px solid #cdbf9f' }}>
                <td>{s.key}</td>
                <td>{s.file}</td>
                <td>{s.size}</td>
                <td>{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { prefersReducedMotion } from './webgl';

const easeOutBack = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function starGeometry() {
  const shape = new THREE.Shape();
  const R = 0.84;
  const r = 0.4;
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.13, bevelSegments: 5, curveSegments: 6 });
  g.center();
  return g;
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const CONFETTI = ['#ffd54a', '#ff8fb1', '#ffffff', '#7fd6c2', '#ffb347'].map((c) => new THREE.Color(c));

interface Props {
  value: number;
  max?: number;
  onFail?: () => void;
}

/** Ba ngôi sao 3D bằng three.js: sao đạt được xoay bật vào, có pháo giấy; sao chưa đạt xám mờ. */
export default function ThreeStars({ value, max = 3, onFail }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      failRef.current?.();
      return;
    }
    const W = host.clientWidth || 520;
    const H = host.clientHeight || 130;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = 'fx3d-canvas';
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
    camera.position.set(0, 0, 4.7);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-2, 3, 5);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.5));

    const geo = starGeometry();
    const gold = new THREE.MeshStandardMaterial({ color: '#ffc53d', metalness: 0.55, roughness: 0.28, emissive: new THREE.Color('#8a5200'), emissiveIntensity: 0.28 });
    const grey = new THREE.MeshStandardMaterial({ color: '#d6c8a8', metalness: 0.05, roughness: 0.75 });
    const dot = dotTexture();

    const SP = 2.35;
    const stars = Array.from({ length: max }, (_, i) => {
      const earned = i < value;
      const m = new THREE.Mesh(geo, earned ? gold : grey);
      m.position.set((i - (max - 1) / 2) * SP, 0, 0);
      m.scale.setScalar(0);
      scene.add(m);
      return { m, earned, start: earned ? 0.35 + i * 0.45 : 0.1, burst: false };
    });

    type Burst = { pts: THREE.Points; vel: Float32Array; born: number; mat: THREE.PointsMaterial; geo: THREE.BufferGeometry };
    const bursts: Burst[] = [];
    const rand = Math.random;
    const spawn = (x: number, t: number) => {
      const n = 34;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = x;
        const a = rand() * Math.PI * 2;
        const sp = 1.2 + rand() * 2.4;
        vel[i * 3] = Math.cos(a) * sp;
        vel[i * 3 + 1] = Math.sin(a) * sp * 0.8 + 0.8;
        vel[i * 3 + 2] = (rand() - 0.2) * 1.5;
        const c = CONFETTI[Math.floor(rand() * CONFETTI.length)];
        col.set([c.r, c.g, c.b], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({ size: 0.16, map: dot, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
      const pts = new THREE.Points(g, mat);
      scene.add(pts);
      bursts.push({ pts, vel, born: t, mat, geo: g });
    };

    const reduce = prefersReducedMotion();
    const clock = new THREE.Clock();
    let raf = 0;
    let t = reduce ? 10 : 0;
    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce) t = clock.elapsedTime;
      stars.forEach((s, i) => {
        const p = clamp01((t - s.start) / (s.earned ? 0.95 : 0.55));
        s.m.scale.setScalar(Math.max(0, easeOutBack(p)) * (s.earned ? 1 : 0.88));
        const settle = easeOutCubic(p);
        const spin = s.earned ? (1 - settle) * Math.PI * 4 : 0;
        const idle = s.earned ? Math.sin(t * 1.3 + i * 1.7) * 0.32 : Math.sin(t * 0.8 + i) * 0.1;
        s.m.rotation.set(Math.sin(t * 0.9 + i) * 0.06, spin + idle * settle, (1 - settle) * 0.5 * (i % 2 ? 1 : -1));
        s.m.position.y = (s.earned ? Math.sin(t * 1.6 + i * 1.1) * 0.05 : 0) * settle;
        if (s.earned && !s.burst && p > 0.45) {
          s.burst = true;
          if (!reduce) spawn(s.m.position.x, t);
        }
      });
      for (let b = bursts.length - 1; b >= 0; b--) {
        const B = bursts[b];
        const age = t - B.born;
        if (age > 1.3) {
          scene.remove(B.pts);
          B.geo.dispose();
          B.mat.dispose();
          bursts.splice(b, 1);
          continue;
        }
        const pos = B.geo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          B.vel[i * 3 + 1] -= 4.2 * dt;
          pos.setXYZ(i, pos.getX(i) + B.vel[i * 3] * dt, pos.getY(i) + B.vel[i * 3 + 1] * dt, pos.getZ(i) + B.vel[i * 3 + 2] * dt);
        }
        pos.needsUpdate = true;
        B.mat.opacity = 1 - clamp01((age - 0.5) / 0.8);
      }
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    const onLost = (e: Event) => {
      e.preventDefault();
      failRef.current?.();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      bursts.forEach((b) => {
        b.geo.dispose();
        b.mat.dispose();
      });
      [geo, gold, grey, dot, envTex].forEach((o) => o.dispose());
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [value, max]);

  return <div ref={hostRef} className="fx3d-host" aria-hidden />;
}

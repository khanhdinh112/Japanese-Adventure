'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { AmbientKind } from '../../data/types';
import { prefersReducedMotion } from './webgl';

type Kind = Exclude<AmbientKind, 'none'>;

const COUNTS: Record<Kind, number> = { leaves: 26, petals: 44, motes: 70, fireflies: 30, rain: 170 };
const FOV = 45;
const CAM_Z = 14;
/** Nửa kích thước vùng chứa hạt (đơn vị thế giới). */
const BOX = { x: 14, y: 7.6, zNear: 4.5, zFar: -9 };

function makeRng(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cánh hoa hơi cong, thon dần về phía gốc. */
function petalGeometry() {
  const g = new THREE.PlaneGeometry(0.42, 0.56, 4, 6);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const t = (y + 0.28) / 0.56; // 0 ở gốc, 1 ở đầu cánh
    const taper = 0.35 + 0.65 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62 + 0.25);
    p.setX(i, x * taper);
    p.setZ(i, x * x * 2.6 + (t - 0.5) * (t - 0.5) * 0.25);
    // đầu cánh có khía nhỏ
    if (t > 0.92) p.setY(i, y - Math.abs(x) * -0.12 - 0.02);
  }
  g.computeVertexNormals();
  return g;
}

/** Chiếc lá thuôn nhọn, có đường gân giữa (cong nhẹ). */
function leafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.34);
  s.bezierCurveTo(0.3, -0.18, 0.28, 0.16, 0, 0.4);
  s.bezierCurveTo(-0.28, 0.16, -0.3, -0.18, 0, -0.34);
  const g = new THREE.ShapeGeometry(s, 8);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, Math.abs(x) * 0.55 - x * x * 0.4);
  }
  g.computeVertexNormals();
  return g;
}

const PETAL_COLORS = ['#ffd9e2', '#ffc2d1', '#f9a8bd', '#ffe6ec', '#f4b6c8'];
const LEAF_COLORS = ['#cfe58a', '#a8d06a', '#7fae5a', '#e3d77a', '#b9d977'];

const POINT_VERT = /* glsl */ `
  uniform float uTime; uniform float uScale; uniform float uTwinkle; uniform float uSpeed;
  attribute float aPhase; attribute float aSize;
  varying float vGlow;
  void main() {
    vec3 p = position;
    float t = uTime * uSpeed;
    p.x += sin(t * 0.6 + aPhase * 6.283) * 0.55 + sin(t * 0.23 + aPhase * 11.0) * 0.4;
    p.y += sin(t * 0.5 + aPhase * 9.0) * 0.45 + t * 0.08 * (0.4 + fract(aPhase * 7.0));
    p.y = mod(p.y + ${BOX.y.toFixed(1)}, ${(BOX.y * 2).toFixed(1)}) - ${BOX.y.toFixed(1)};
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = mix(1.0, 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.9 + aPhase) + aPhase * 40.0), 2.0), uTwinkle);
    vGlow = tw;
    gl_PointSize = aSize * uScale / -mv.z * (0.6 + 0.6 * tw);
    gl_Position = projectionMatrix * mv;
  }
`;
const POINT_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uCore;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = pow(1.0 - d, 2.2);
    float core = smoothstep(0.35, 0.0, d);
    vec3 col = mix(uColor, uCore, core);
    gl_FragColor = vec4(col, min(1.0, halo * 0.95 + core * 0.6) * vGlow);
  }
`;

interface Props {
  kind: Kind;
  seed?: number;
  onFail?: () => void;
}

/**
 * Lớp hiệu ứng nền bằng three.js: cánh hoa/lá 3D xoay trong gió, bụi sáng và đom đóm lấp lánh, mưa có chiều sâu.
 * Nghiêng nhẹ theo con trỏ để có cảm giác khung cảnh có độ sâu. Tải động, có thể rơi về bản CSS (onFail).
 */
export default function ThreeAmbient({ kind, seed = 1, onFail }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      failRef.current?.();
      return;
    }
    const W = host.clientWidth || 1920;
    const H = host.clientHeight || 1080;
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = 'fx3d';
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 60);
    camera.position.set(0, 0, CAM_Z);
    const rand = makeRng(seedRef.current * 31 + kind.length);
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T): T => (disposables.push(o), o);

    let update: (t: number, dt: number) => void = () => {};

    if (kind === 'petals' || kind === 'leaves') {
      const n = COUNTS[kind];
      const geo = track(kind === 'petals' ? petalGeometry() : leafGeometry());
      const mat = track(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, transparent: true, opacity: kind === 'petals' ? 0.93 : 0.9 }));
      const mesh = new THREE.InstancedMesh(geo, mat, n);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const palette = (kind === 'petals' ? PETAL_COLORS : LEAF_COLORS).map((c) => new THREE.Color(c));
      const d = Array.from({ length: n }, (_, i) => {
        mesh.setColorAt(i, palette[Math.floor(rand() * palette.length)]);
        return {
          x: (rand() * 2 - 1) * BOX.x,
          y: (rand() * 2 - 1) * BOX.y,
          z: BOX.zFar + rand() * (BOX.zNear - BOX.zFar),
          fall: 0.35 + rand() * 0.55,
          amp: 0.4 + rand() * 0.9,
          freq: 0.4 + rand() * 0.7,
          ph: rand() * 6.283,
          rx: rand() * 6.283,
          ry: rand() * 6.283,
          rz: rand() * 6.283,
          sx: (rand() - 0.5) * 2.2,
          sy: (rand() - 0.5) * 2.6,
          sz: (rand() - 0.5) * 1.6,
          scale: (kind === 'petals' ? 1.15 : 1.45) * (0.7 + rand() * 0.8),
        };
      });
      scene.add(new THREE.AmbientLight(0xffffff, 1.55));
      const sun = new THREE.DirectionalLight(0xfff1dc, 1.7);
      sun.position.set(-4, 7, 9);
      scene.add(sun);
      scene.add(mesh);
      const dummy = new THREE.Object3D();
      update = (t, dt) => {
        for (let i = 0; i < n; i++) {
          const p = d[i];
          p.y -= p.fall * dt;
          p.x += (0.16 + Math.sin(t * 0.25 + p.ph) * 0.08) * dt;
          if (p.y < -BOX.y - 0.6) {
            p.y = BOX.y + 0.6;
            p.x = (rand() * 2 - 1) * BOX.x;
          }
          if (p.x > BOX.x + 1) p.x = -BOX.x - 1;
          dummy.position.set(p.x + Math.sin(t * p.freq + p.ph) * p.amp, p.y, p.z);
          dummy.rotation.set(p.rx + t * p.sx, p.ry + t * p.sy, p.rz + t * p.sz);
          dummy.scale.setScalar(p.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      };
    } else if (kind === 'motes' || kind === 'fireflies') {
      const n = COUNTS[kind];
      const pos = new Float32Array(n * 3);
      const ph = new Float32Array(n);
      const sz = new Float32Array(n);
      const firefly = kind === 'fireflies';
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (rand() * 2 - 1) * BOX.x;
        pos[i * 3 + 1] = (rand() * 2 - 1) * (firefly ? BOX.y * 0.75 : BOX.y);
        pos[i * 3 + 2] = BOX.zFar + rand() * (BOX.zNear - BOX.zFar);
        ph[i] = rand();
        sz[i] = (firefly ? 0.8 : 0.4) * (0.55 + rand() * 0.9);
      }
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
      const uniforms = {
        uTime: { value: 0 },
        uScale: { value: H / (2 * Math.tan((FOV * Math.PI) / 360)) },
        uTwinkle: { value: firefly ? 1 : 0.35 },
        uSpeed: { value: firefly ? 0.8 : 0.45 },
        uColor: { value: new THREE.Color(firefly ? '#d8f56a' : '#fff1b8') },
        uCore: { value: new THREE.Color(firefly ? '#fffde0' : '#ffffff') },
      };
      const mat = track(
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: POINT_VERT,
          fragmentShader: POINT_FRAG,
          transparent: true,
          depthWrite: false,
          blending: firefly ? THREE.AdditiveBlending : THREE.NormalBlending,
        }),
      );
      scene.add(new THREE.Points(geo, mat));
      update = (t) => {
        uniforms.uTime.value = t;
      };
    } else {
      // rain
      const n = COUNTS.rain;
      const pos = new Float32Array(n * 6);
      const d = Array.from({ length: n }, () => ({
        x: (rand() * 2 - 1) * (BOX.x + 4),
        y: (rand() * 2 - 1) * BOX.y,
        z: BOX.zFar + rand() * (BOX.zNear - BOX.zFar),
        v: 16 + rand() * 9,
        len: 0.55 + rand() * 0.7,
      }));
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = track(new THREE.LineBasicMaterial({ color: 0xdaeefa, transparent: true, opacity: 0.62 }));
      scene.add(new THREE.LineSegments(geo, mat));
      const slant = 0.16;
      update = (_t, dt) => {
        for (let i = 0; i < n; i++) {
          const p = d[i];
          p.y -= p.v * dt;
          p.x -= p.v * slant * dt;
          if (p.y < -BOX.y - 1) {
            p.y = BOX.y + 1;
            p.x = (rand() * 2 - 1) * (BOX.x + 4);
          }
          pos[i * 6] = p.x;
          pos[i * 6 + 1] = p.y;
          pos[i * 6 + 2] = p.z;
          pos[i * 6 + 3] = p.x + p.len * slant;
          pos[i * 6 + 4] = p.y + p.len;
          pos[i * 6 + 5] = p.z;
        }
        (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      };
    }

    // nghiêng nhẹ theo con trỏ
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const onLost = (e: Event) => {
      e.preventDefault();
      failRef.current?.();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const reduce = prefersReducedMotion();
    const clock = new THREE.Clock();
    let raf = 0;
    let t = reduce ? 3 : 0;
    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce) t = clock.elapsedTime;
      camera.position.x += (target.x * 0.9 - camera.position.x) * Math.min(1, dt * 2.5);
      camera.position.y += (-target.y * 0.5 - camera.position.y) * Math.min(1, dt * 2.5);
      camera.lookAt(0, 0, 0);
      update(t, reduce ? 0 : dt);
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('webglcontextlost', onLost);
      disposables.forEach((o) => o.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [kind]);

  return <div ref={hostRef} className="fx3d-host" aria-hidden />;
}

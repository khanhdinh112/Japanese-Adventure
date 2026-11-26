'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { prefersReducedMotion } from './webgl';

function faceTexture(emoji: string) {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S / 2);
  g.addColorStop(0, '#fff6c9');
  g.addColorStop(1, '#ffd35e');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  x.strokeStyle = '#c4891f';
  x.lineWidth = 8;
  x.beginPath();
  x.arc(S / 2, S / 2, S / 2 - 26, 0, Math.PI * 2);
  x.stroke();
  x.font = '124px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(emoji, S / 2, S / 2 + 8);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface Props {
  emoji: string;
  onFail?: () => void;
}

/** Đồng xu huy hiệu 3D: vừa xuất hiện thì xoay vài vòng rồi lắc nhẹ. */
export default function ThreeCoin({ emoji, onFail }: Props) {
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
    const W = host.clientWidth || 84;
    const H = host.clientHeight || 84;
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
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
    camera.position.set(0, 0, 5.4);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(-2, 3, 5);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.6));

    const tex = faceTexture(emoji);
    const rimMat = new THREE.MeshStandardMaterial({ color: '#f2b53a', metalness: 0.7, roughness: 0.3 });
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.25, roughness: 0.45 });
    const coinGeo = new THREE.CylinderGeometry(1, 1, 0.2, 64);
    coinGeo.rotateX(Math.PI / 2);
    const ringGeo = new THREE.TorusGeometry(0.96, 0.07, 16, 64);
    const coin = new THREE.Group();
    coin.add(new THREE.Mesh(coinGeo, [rimMat, faceMat, faceMat]));
    const ringF = new THREE.Mesh(ringGeo, rimMat);
    ringF.position.z = 0.1;
    const ringB = ringF.clone();
    ringB.position.z = -0.1;
    coin.add(ringF, ringB);
    scene.add(coin);

    const reduce = prefersReducedMotion();
    const clock = new THREE.Clock();
    let raf = 0;
    let t = reduce ? 5 : 0;
    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce) t = clock.elapsedTime;
      const p = Math.min(1, t / 1.4);
      const settle = 1 - Math.pow(1 - p, 3);
      coin.rotation.y = (1 - settle) * Math.PI * 6 + Math.sin(t * 1.4) * 0.45 * settle;
      coin.rotation.x = Math.sin(t * 1.1) * 0.12 * settle;
      coin.scale.setScalar(0.4 + 0.6 * Math.min(1, t / 0.5));
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
      [tex, rimMat, faceMat, coinGeo, ringGeo, envTex].forEach((o) => o.dispose());
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [emoji]);

  return <div ref={hostRef} className="fx3d-host" aria-hidden />;
}

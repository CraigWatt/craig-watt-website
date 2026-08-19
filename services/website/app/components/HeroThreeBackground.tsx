'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);

  return {
    accent: styles.getPropertyValue('--color-accent').trim() || '#0ea5e9',
    border: styles.getPropertyValue('--color-border').trim() || '#cbd5e1',
    foreground: styles.getPropertyValue('--color-foreground').trim() || '#0f172a',
  };
}

function isDarkThemeActive() {
  return document.documentElement.classList.contains('dark');
}

function buildEllipse(radiusX: number, radiusY: number, segments: number) {
  const points: THREE.Vector3[] = [];

  for (let idx = 0; idx <= segments; idx += 1) {
    const angle = (idx / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

export function HeroThreeBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) {
      return undefined;
    }

    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const supportsResizeObserver = typeof window.ResizeObserver !== 'undefined';
    const webglCanvas = document.createElement('canvas');
    const supportsWebgl =
      typeof window.WebGLRenderingContext !== 'undefined' &&
      !!(webglCanvas.getContext('webgl2') || webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl'));

    if (!supportsMatchMedia || !supportsResizeObserver || !supportsWebgl) {
      return undefined;
    }

    const supportsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const random = createSeededRandom(42);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const pointCount = 180;
    const basePositions = new Float32Array(pointCount * 3);
    const positions = new Float32Array(pointCount * 3);

    for (let idx = 0; idx < pointCount; idx += 1) {
      const stride = idx * 3;
      const x = (random() - 0.5) * 11.5;
      const y = (random() - 0.5) * 6.8;
      const z = (random() - 0.5) * 3.2;

      basePositions[stride] = x;
      basePositions[stride + 1] = y;
      basePositions[stride + 2] = z;

      positions[stride] = x;
      positions[stride + 1] = y;
      positions[stride + 2] = z;
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointMaterial = new THREE.PointsMaterial({
      size: 0.055,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(pointGeometry, pointMaterial);
    particles.position.z = -0.3;
    root.add(particles);

    const ringGeometry = buildEllipse(4.65, 2.55, 220);
    const ringMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.24,
    });
    const outerRing = new THREE.Line(ringGeometry, ringMaterial);
    outerRing.rotation.z = -0.18;
    root.add(outerRing);

    const accentRingGeometry = buildEllipse(3.05, 1.55, 180);
    const accentRingMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.34,
    });
    const innerRing = new THREE.Line(accentRingGeometry, accentRingMaterial);
    innerRing.rotation.z = 0.26;
    innerRing.position.set(1.1, -0.25, 0.2);
    root.add(innerRing);

    const pulseGeometry = new THREE.RingGeometry(0.72, 0.76, 96);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.set(-2.2, 0.95, 0.15);
    root.add(pulse);

    const scanGroup = new THREE.Group();
    root.add(scanGroup);

    const scanLineMaterials: THREE.LineBasicMaterial[] = [];
    const scanLines: THREE.Line[] = [];
    const scanLineOffsets = [-2.4, -0.8, 0.9, 2.6];

    scanLineOffsets.forEach((offset, index) => {
      const scanGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-5.8, offset, 0),
        new THREE.Vector3(5.8, offset + 0.28, 0),
      ]);
      const scanMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.18 + index * 0.04,
      });
      const scanLine = new THREE.Line(scanGeometry, scanMaterial);
      scanLine.position.z = -0.15 - index * 0.05;
      scanGroup.add(scanLine);
      scanLines.push(scanLine);
      scanLineMaterials.push(scanMaterial);
    });

    const beaconGeometry = new THREE.RingGeometry(1.02, 1.09, 96);
    const beaconMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
    beacon.position.set(2.35, -0.9, 0.25);
    scanGroup.add(beacon);

    const darkModeState = {
      active: isDarkThemeActive(),
    };

    const applyTheme = () => {
      const palette = readThemeColors();
      darkModeState.active = isDarkThemeActive();

      pointMaterial.color = new THREE.Color(palette.accent);
      ringMaterial.color = new THREE.Color(palette.border || palette.foreground);
      accentRingMaterial.color = new THREE.Color(palette.accent);
      pulseMaterial.color = new THREE.Color(palette.accent);

      scanLineMaterials.forEach((material, index) => {
        material.color = new THREE.Color(index % 2 === 0 ? palette.accent : palette.border || palette.foreground);
      });
      beaconMaterial.color = new THREE.Color(palette.accent);

      if (darkModeState.active) {
        pointMaterial.size = 0.07;
        pointMaterial.opacity = 0.92;
        ringMaterial.opacity = 0.08;
        accentRingMaterial.opacity = 0.12;
        pulseMaterial.opacity = 0.06;
        outerRing.visible = false;
        innerRing.visible = false;
        pulse.visible = false;
        scanGroup.visible = true;
      } else {
        pointMaterial.size = 0.055;
        pointMaterial.opacity = 0.72;
        ringMaterial.opacity = 0.24;
        accentRingMaterial.opacity = 0.34;
        pulseMaterial.opacity = 0.14;
        outerRing.visible = true;
        innerRing.visible = true;
        pulse.visible = true;
        scanGroup.visible = false;
      }
    };

    applyTheme();

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(() => {
      applyTheme();
      renderFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    const clock = new THREE.Clock();
    let animationFrame = 0;

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      const positionAttribute = pointGeometry.getAttribute('position') as THREE.BufferAttribute;
      const darkMode = darkModeState.active;

      for (let idx = 0; idx < pointCount; idx += 1) {
        const stride = idx * 3;
        const baseX = basePositions[stride];
        const baseY = basePositions[stride + 1];
        const baseZ = basePositions[stride + 2];
        const drift = elapsed * (darkMode ? 0.34 : 0.22) + idx * 0.11;

        positionAttribute.array[stride] =
          baseX +
          Math.cos(drift + baseY * (darkMode ? 0.22 : 0.45)) * (darkMode ? 0.05 : 0.08) +
          pointer.x * (darkMode ? 0.06 : 0.1);
        positionAttribute.array[stride + 1] =
          baseY +
          Math.sin(drift * (darkMode ? 1.8 : 1.2) + baseX * 0.32) * (darkMode ? 0.07 : 0.12) +
          pointer.y * (darkMode ? 0.05 : 0.08);
        positionAttribute.array[stride + 2] =
          baseZ + Math.sin(drift * (darkMode ? 1.1 : 0.65)) * (darkMode ? 0.04 : 0.08);
      }

      positionAttribute.needsUpdate = true;

      if (darkMode) {
        root.rotation.y += ((pointer.x * 0.1) - root.rotation.y) * 0.025;
        root.rotation.x += ((-pointer.y * 0.06) - root.rotation.x) * 0.025;
        root.rotation.z = Math.sin(elapsed * 0.28) * 0.012;

        scanLines.forEach((line, index) => {
          line.position.x = Math.sin(elapsed * 0.45 + index * 0.7) * 0.22;
          line.position.y = scanLineOffsets[index] + Math.cos(elapsed * 0.35 + index) * 0.08;
        });
        beacon.scale.setScalar(1 + Math.sin(elapsed * 1.9) * 0.08);
        beacon.rotation.z += supportsReducedMotion ? 0 : 0.004;
      } else {
        root.rotation.y += ((pointer.x * 0.18) - root.rotation.y) * 0.03;
        root.rotation.x += ((-pointer.y * 0.12) - root.rotation.x) * 0.03;
        root.rotation.z = Math.sin(elapsed * 0.18) * 0.025;

        outerRing.rotation.z += supportsReducedMotion ? 0 : 0.0012;
        innerRing.rotation.z -= supportsReducedMotion ? 0 : 0.0017;
        pulse.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.05);
      }

      renderer.render(scene, camera);
    };

    if (supportsReducedMotion) {
      renderFrame();
    } else {
      const tick = () => {
        renderFrame();
        animationFrame = window.requestAnimationFrame(tick);
      };

      tick();
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeChild(renderer.domElement);

      pointGeometry.dispose();
      pointMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      accentRingGeometry.dispose();
      accentRingMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
      beaconGeometry.dispose();
      beaconMaterial.dispose();
      scanLineMaterials.forEach((material) => material.dispose());
      scanLines.forEach((line) => line.geometry.dispose());
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />;
}

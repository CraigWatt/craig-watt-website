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

function createLine(points: THREE.Vector3[], material: THREE.Material) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function createCircle(radius: number, segments: number, material: THREE.Material) {
  const points: THREE.Vector3[] = [];

  for (let idx = 0; idx <= segments; idx += 1) {
    const angle = (idx / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }

  return createLine(points, material);
}

function createArc(radius: number, start: number, end: number, segments: number, material: THREE.Material) {
  const points: THREE.Vector3[] = [];

  for (let idx = 0; idx <= segments; idx += 1) {
    const progress = idx / segments;
    const angle = start + (end - start) * progress;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }

  return createLine(points, material);
}

function createCloud(scale: number, material: THREE.Material) {
  const group = new THREE.Group();
  const puffGeometry = new THREE.CircleGeometry(0.34, 28);
  const offsets = [
    { x: -0.45, y: 0, size: 0.95 },
    { x: -0.08, y: 0.12, size: 1.18 },
    { x: 0.3, y: 0.02, size: 1 },
    { x: 0.62, y: -0.04, size: 0.78 },
  ];

  offsets.forEach(({ x, y, size }) => {
    const puff = new THREE.Mesh(puffGeometry, material);
    puff.position.set(x, y, 0);
    puff.scale.setScalar(size);
    group.add(puff);
  });

  group.scale.setScalar(scale);
  return group;
}

function createGroundShape(points: Array<[number, number]>, material: THREE.Material) {
  const shape = new THREE.Shape();
  const [startX, startY] = points[0];
  shape.moveTo(startX, startY);

  points.slice(1).forEach(([x, y]) => {
    shape.lineTo(x, y);
  });

  return new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  });
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const random = createSeededRandom(23);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6, 6, 3.6, -3.6, 0.1, 30);
    camera.position.set(0, 0, 12);

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

    const atmosphere = new THREE.Group();
    const dayGroup = new THREE.Group();
    const nightGroup = new THREE.Group();

    root.add(atmosphere);
    root.add(dayGroup);
    root.add(nightGroup);

    const particleCount = 160;
    const particleBase = new Float32Array(particleCount * 3);
    const particlePositions = new Float32Array(particleCount * 3);

    for (let idx = 0; idx < particleCount; idx += 1) {
      const stride = idx * 3;
      const x = (random() - 0.5) * 14;
      const y = (random() - 0.08) * 7;
      const z = (random() - 0.5) * 0.6;

      particleBase[stride] = x;
      particleBase[stride + 1] = y;
      particleBase[stride + 2] = z;

      particlePositions[stride] = x;
      particlePositions[stride + 1] = y;
      particlePositions[stride + 2] = z;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.065,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    atmosphere.add(particles);

    const dayCloudMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const clouds = [
      { group: createCloud(1.1, dayCloudMaterial), speed: 0.12, amplitude: 0.08, offset: 0.2, baseX: -3.8, baseY: 2.15 },
      { group: createCloud(0.9, dayCloudMaterial), speed: 0.16, amplitude: 0.05, offset: 1.4, baseX: 0.8, baseY: 1.7 },
      { group: createCloud(0.72, dayCloudMaterial), speed: 0.14, amplitude: 0.06, offset: 2.3, baseX: 4.3, baseY: 2.45 },
    ];
    clouds.forEach(({ group, baseX, baseY }) => {
      group.position.set(baseX, baseY, -0.4);
      dayGroup.add(group);
    });

    const sunArcMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.38,
    });
    const sunArc = createArc(0.95, Math.PI * 0.1, Math.PI * 1.85, 72, sunArcMaterial);
    sunArc.position.set(-4.4, 2.2, -0.1);
    dayGroup.add(sunArc);

    const dayGroundMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const dayGround = createGroundShape(
      [
        [-7, -2.4],
        [-5.7, -2.1],
        [-4.3, -2.26],
        [-2.4, -1.95],
        [-0.1, -2.28],
        [2.5, -2.02],
        [4.6, -2.2],
        [7, -1.92],
        [7, -3.6],
        [-7, -3.6],
      ],
      dayGroundMaterial,
    );
    dayGroup.add(dayGround);

    const turbineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.42,
    });
    const hubMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.5,
    });

    const turbines: Array<{ group: THREE.Group; rotor: THREE.Group; speed: number }> = [];
    const turbineConfigs = [
      { x: -4.7, y: -1.82, scale: 0.62, speed: 0.58 },
      { x: -2.15, y: -1.98, scale: 0.76, speed: 0.46 },
      { x: 0.6, y: -1.78, scale: 1, speed: 0.34 },
      { x: 3.15, y: -1.95, scale: 0.82, speed: 0.42 },
      { x: 5.4, y: -2.08, scale: 0.66, speed: 0.5 },
    ];

    turbineConfigs.forEach(({ x, y, scale, speed }) => {
      const group = new THREE.Group();
      group.position.set(x, y, 0);
      group.scale.setScalar(scale);

      const tower = createLine(
        [new THREE.Vector3(0, -0.85, 0), new THREE.Vector3(0, 0.62, 0)],
        turbineMaterial,
      );
      group.add(tower);

      const rotor = new THREE.Group();
      rotor.position.set(0, 0.62, 0);

      for (let idx = 0; idx < 3; idx += 1) {
        const blade = createLine(
          [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.58, 0)],
          turbineMaterial,
        );
        blade.rotation.z = (idx / 3) * Math.PI * 2;
        rotor.add(blade);
      }

      const hub = createCircle(0.045, 20, hubMaterial);
      rotor.add(hub);
      group.add(rotor);
      dayGroup.add(group);
      turbines.push({ group, rotor, speed });
    });

    const nightGroundMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const nightGround = createGroundShape(
      [
        [-7, -2.25],
        [-5.6, -1.94],
        [-3.9, -2.2],
        [-2.1, -1.78],
        [0.4, -2.16],
        [2.9, -1.86],
        [5.1, -2.06],
        [7, -1.72],
        [7, -3.6],
        [-7, -3.6],
      ],
      nightGroundMaterial,
    );
    nightGroup.add(nightGround);

    const nightHazeMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const nightHaze = new THREE.Mesh(new THREE.CircleGeometry(1.95, 48), nightHazeMaterial);
    nightHaze.position.set(2.4, -0.15, -0.4);
    nightHaze.scale.set(1.4, 1, 1);
    nightGroup.add(nightHaze);

    const wheelRimMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.46,
    });
    const wheelAccentMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.22,
    });
    const wheelSpokeMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.4,
    });

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(2.25, -0.18, 0);
    const outerWheel = createCircle(1.6, 120, wheelRimMaterial);
    const innerWheel = createCircle(1.16, 90, wheelAccentMaterial);
    const hubWheel = createCircle(0.16, 36, wheelRimMaterial);
    wheelGroup.add(outerWheel);
    wheelGroup.add(innerWheel);
    wheelGroup.add(hubWheel);

    const spokes: THREE.Line[] = [];
    for (let idx = 0; idx < 12; idx += 1) {
      const angle = (idx / 12) * Math.PI * 2;
      const spoke = createLine(
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 0)],
        wheelSpokeMaterial,
      );
      spokes.push(spoke);
      wheelGroup.add(spoke);
    }

    const supportMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.24,
    });
    const leftSupport = createLine(
      [new THREE.Vector3(1.55, -1.75, 0), new THREE.Vector3(2.25, -0.18, 0)],
      supportMaterial,
    );
    const rightSupport = createLine(
      [new THREE.Vector3(2.95, -1.75, 0), new THREE.Vector3(2.25, -0.18, 0)],
      supportMaterial,
    );
    nightGroup.add(leftSupport);
    nightGroup.add(rightSupport);
    nightGroup.add(wheelGroup);

    const beamMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamGeometry = new THREE.PlaneGeometry(0.3, 4.6, 1, 1);
    const beams = [
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: 1.35, y: -0.1, rotation: -0.18, pulse: 0.7 },
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: 2.3, y: 0.25, rotation: -0.03, pulse: 1.2 },
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: 3.15, y: -0.05, rotation: 0.16, pulse: 1.85 },
    ];
    beams.forEach(({ mesh, x, y, rotation }) => {
      mesh.position.set(x, y, -0.55);
      mesh.rotation.z = rotation;
      nightGroup.add(mesh);
    });

    const moonMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.22,
    });
    const moon = createArc(0.58, Math.PI * 0.25, Math.PI * 1.8, 54, moonMaterial);
    moon.position.set(-4.55, 2.15, -0.25);
    nightGroup.add(moon);

    const darkModeState = { active: isDarkThemeActive() };

    const applyTheme = () => {
      const palette = readThemeColors();
      darkModeState.active = isDarkThemeActive();

      const accent = new THREE.Color(palette.accent);
      const border = new THREE.Color(palette.border || palette.foreground);
      const foreground = new THREE.Color(palette.foreground);

      particleMaterial.color = darkModeState.active ? accent : border.clone().lerp(accent, 0.25);
      particleMaterial.opacity = darkModeState.active ? 0.54 : 0.22;
      particleMaterial.size = darkModeState.active ? 0.07 : 0.055;

      dayCloudMaterial.color = border.clone().lerp(new THREE.Color('#ffffff'), 0.18);
      sunArcMaterial.color = accent.clone().lerp(border, 0.35);
      dayGroundMaterial.color = border.clone().lerp(foreground, 0.12);
      turbineMaterial.color = foreground.clone().lerp(border, 0.28);
      hubMaterial.color = accent.clone().lerp(border, 0.45);

      wheelRimMaterial.color = accent;
      wheelAccentMaterial.color = border;
      wheelSpokeMaterial.color = accent.clone().lerp(border, 0.35);
      supportMaterial.color = border;
      beamMaterial.color = accent;
      moonMaterial.color = border.clone().lerp(accent, 0.2);
      nightGroundMaterial.color = border.clone().lerp(foreground, 0.22);
      nightHazeMaterial.color = accent;

      dayGroup.visible = !darkModeState.active;
      nightGroup.visible = darkModeState.active;
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
      const aspect = width / height;
      const viewHeight = 7.2;
      const viewWidth = viewHeight * aspect;

      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
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
      const darkMode = darkModeState.active;
      const positionAttribute = particleGeometry.getAttribute('position') as THREE.BufferAttribute;

      for (let idx = 0; idx < particleCount; idx += 1) {
        const stride = idx * 3;
        const baseX = particleBase[stride];
        const baseY = particleBase[stride + 1];
        const baseZ = particleBase[stride + 2];
        const drift = elapsed * (darkMode ? 0.22 : 0.1) + idx * 0.13;

        positionAttribute.array[stride] = baseX + Math.cos(drift + idx * 0.04) * (darkMode ? 0.04 : 0.03);
        positionAttribute.array[stride + 1] =
          baseY + Math.sin(drift * (darkMode ? 1.6 : 0.8) + baseX * 0.2) * (darkMode ? 0.08 : 0.04);
        positionAttribute.array[stride + 2] = baseZ;
      }

      positionAttribute.needsUpdate = true;

      root.position.x += ((pointer.x * 0.18) - root.position.x) * 0.035;
      root.position.y += ((pointer.y * 0.12) - root.position.y) * 0.035;

      if (darkMode) {
        wheelGroup.rotation.z += prefersReducedMotion ? 0 : 0.0016;
        nightHaze.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.04);
        beams.forEach(({ mesh, pulse }) => {
          mesh.scale.y = 0.96 + Math.sin(elapsed * 1.1 + pulse) * 0.08;
          const material = mesh.material as THREE.MeshBasicMaterial;
          material.opacity = 0.06 + ((Math.sin(elapsed * 1.4 + pulse) + 1) / 2) * 0.09;
        });
      } else {
        clouds.forEach(({ group, speed, amplitude, offset, baseX, baseY }) => {
          group.position.x = baseX + Math.sin(elapsed * speed + offset) * 0.42;
          group.position.y = baseY + Math.cos(elapsed * speed * 1.6 + offset) * amplitude;
        });

        turbines.forEach(({ rotor, speed, group }, index) => {
          rotor.rotation.z -= prefersReducedMotion ? 0 : speed * 0.01;
          group.position.y += (Math.sin(elapsed * 0.8 + index * 0.4) * 0.006 - (group.position.y - turbineConfigs[index].y)) * 0.08;
        });
      }

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
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

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      disposeScene(scene);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />;
}

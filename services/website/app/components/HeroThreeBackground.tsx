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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createPolylineMaterialLine(points: Array<[number, number]>, material: THREE.Material) {
  return createLine(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    material,
  );
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

    const particleCount = 180;
    const particleBase = new Float32Array(particleCount * 3);
    const particlePositions = new Float32Array(particleCount * 3);

    for (let idx = 0; idx < particleCount; idx += 1) {
      const stride = idx * 3;
      const x = (random() - 0.5) * 14;
      const y = (random() - 0.12) * 7.4;
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

    const starCount = 150;
    const starBase = new Float32Array(starCount * 3);
    const starPositions = new Float32Array(starCount * 3);

    for (let idx = 0; idx < starCount; idx += 1) {
      const stride = idx * 3;
      const x = (random() - 0.5) * 15.5;
      const y = random() * 4.9 - 0.1;
      const z = (random() - 0.5) * 0.4;

      starBase[stride] = x;
      starBase[stride + 1] = y;
      starBase[stride + 2] = z;

      starPositions[stride] = x;
      starPositions[stride + 1] = y;
      starPositions[stride + 2] = z;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.055,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color('#f8fafc'),
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.position.z = -0.25;
    nightGroup.add(stars);

    const dayCloudMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const clouds = [
      { group: createCloud(1.04, dayCloudMaterial), speed: 0.12, amplitude: 0.08, offset: 0.2, xRatio: -0.66, baseY: 2.15 },
      { group: createCloud(0.84, dayCloudMaterial), speed: 0.16, amplitude: 0.05, offset: 1.4, xRatio: 0.08, baseY: 1.7 },
      { group: createCloud(0.68, dayCloudMaterial), speed: 0.14, amplitude: 0.06, offset: 2.3, xRatio: 0.72, baseY: 2.45 },
    ];
    clouds.forEach(({ group, xRatio, baseY }) => {
      group.position.set(xRatio * 6, baseY, -0.4);
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
      opacity: 0.12,
      depthWrite: false,
    });
    const dayGround = createGroundShape(
      [
        [-7, -2.12],
        [-5.6, -1.86],
        [-3.8, -1.94],
        [-1.8, -1.78],
        [0.4, -1.96],
        [2.4, -1.84],
        [4.9, -1.98],
        [7, -1.82],
        [7, -3.6],
        [-7, -3.6],
      ],
      dayGroundMaterial,
    );
    dayGroup.add(dayGround);

    const dayRidgeMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.2,
    });
    const dayRidge = createPolylineMaterialLine(
      [
        [-7, -1.82],
        [-5.2, -1.64],
        [-3.4, -1.74],
        [-1.1, -1.58],
        [1.5, -1.8],
        [3.8, -1.66],
        [7, -1.52],
      ],
      dayRidgeMaterial,
    );
    dayGroup.add(dayRidge);

    const seaLineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.18,
    });
    const seaLineDefinitions = [
      { y: -2.08, amplitude: 0.05, speed: 0.9, phase: 0.2 },
      { y: -2.34, amplitude: 0.07, speed: 0.72, phase: 1.1 },
      { y: -2.64, amplitude: 0.08, speed: 0.58, phase: 1.9 },
    ];
    const seaLines = seaLineDefinitions.map((definition) => {
      const line = createPolylineMaterialLine(
        Array.from({ length: 12 }, (_, index) => {
          const x = -7 + index * (14 / 11);
          return [x, definition.y] as [number, number];
        }),
        seaLineMaterial,
      );
      dayGroup.add(line);
      return line;
    });

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
      { xRatio: -0.78, y: -1.82, scale: 0.62, speed: 0.58 },
      { xRatio: -0.36, y: -1.98, scale: 0.76, speed: 0.46 },
      { xRatio: 0.08, y: -1.78, scale: 1, speed: 0.34 },
      { xRatio: 0.5, y: -1.95, scale: 0.82, speed: 0.42 },
      { xRatio: 0.84, y: -2.08, scale: 0.66, speed: 0.5 },
    ];

    turbineConfigs.forEach(({ xRatio, y, scale, speed }) => {
      const group = new THREE.Group();
      group.position.set(xRatio * 6, y, 0);
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

    const vesselMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.32,
    });
    const vesselAccentMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.26,
    });
    const vessels: Array<{
      group: THREE.Group;
      speed: number;
      phase: number;
      laneY: number;
      direction: 1 | -1;
      bob: number;
    }> = [];

    const cargoShip = new THREE.Group();
    cargoShip.add(
      createPolylineMaterialLine(
        [
          [-0.5, -0.04],
          [0.42, -0.04],
          [0.58, 0.06],
          [-0.6, 0.06],
          [-0.5, -0.04],
        ],
        vesselMaterial,
      ),
    );
    cargoShip.add(
      createPolylineMaterialLine(
        [
          [-0.18, 0.06],
          [0.12, 0.06],
          [0.12, 0.18],
          [-0.18, 0.18],
          [-0.18, 0.06],
        ],
        vesselAccentMaterial,
      ),
    );
    cargoShip.add(
      createPolylineMaterialLine(
        [
          [0.12, 0.06],
          [0.26, 0.06],
          [0.26, 0.14],
          [0.12, 0.14],
          [0.12, 0.06],
        ],
        vesselAccentMaterial,
      ),
    );
    dayGroup.add(cargoShip);
    vessels.push({ group: cargoShip, speed: 0.032, phase: 0.14, laneY: -2.22, direction: 1, bob: 0.05 });

    const ferry = new THREE.Group();
    ferry.add(
      createPolylineMaterialLine(
        [
          [-0.32, -0.03],
          [0.28, -0.03],
          [0.4, 0.05],
          [-0.4, 0.05],
          [-0.32, -0.03],
        ],
        vesselMaterial,
      ),
    );
    ferry.add(
      createPolylineMaterialLine(
        [
          [-0.08, 0.05],
          [0.16, 0.05],
          [0.16, 0.16],
          [-0.08, 0.16],
          [-0.08, 0.05],
        ],
        vesselAccentMaterial,
      ),
    );
    ferry.add(createLine([new THREE.Vector3(0.16, 0.16, 0), new THREE.Vector3(0.24, 0.24, 0)], vesselAccentMaterial));
    dayGroup.add(ferry);
    vessels.push({ group: ferry, speed: 0.04, phase: 0.58, laneY: -2.62, direction: -1, bob: 0.04 });

    const helicopterMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.26,
    });
    const helicopters: Array<{
      group: THREE.Group;
      rotor: THREE.Line;
      speed: number;
      phase: number;
      baseY: number;
      xRatio: number;
    }> = [];

    const buildHelicopter = () => {
      const helicopter = new THREE.Group();
      helicopter.add(
        createPolylineMaterialLine(
          [
            [-0.2, -0.02],
            [0.14, -0.02],
            [0.26, 0.05],
            [0.1, 0.12],
            [-0.14, 0.1],
            [-0.2, -0.02],
          ],
          helicopterMaterial,
        ),
      );
      helicopter.add(createLine([new THREE.Vector3(0.14, 0.02, 0), new THREE.Vector3(0.38, 0.08, 0)], helicopterMaterial));
      helicopter.add(createLine([new THREE.Vector3(-0.1, -0.04, 0), new THREE.Vector3(0.12, -0.04, 0)], helicopterMaterial));
      helicopter.add(createLine([new THREE.Vector3(-0.04, -0.04, 0), new THREE.Vector3(-0.12, -0.12, 0)], helicopterMaterial));
      helicopter.add(createLine([new THREE.Vector3(0.05, -0.04, 0), new THREE.Vector3(0.16, -0.12, 0)], helicopterMaterial));
      const rotor = createLine([new THREE.Vector3(-0.34, 0.16, 0), new THREE.Vector3(0.34, 0.16, 0)], helicopterMaterial);
      helicopter.add(rotor);
      return { helicopter, rotor };
    };

    const firstHeli = buildHelicopter();
    dayGroup.add(firstHeli.helicopter);
    helicopters.push({ group: firstHeli.helicopter, rotor: firstHeli.rotor, speed: 0.24, phase: 0.18, baseY: 1.28, xRatio: -0.18 });

    const secondHeli = buildHelicopter();
    secondHeli.helicopter.scale.setScalar(0.86);
    dayGroup.add(secondHeli.helicopter);
    helicopters.push({ group: secondHeli.helicopter, rotor: secondHeli.rotor, speed: 0.2, phase: 0.66, baseY: 1.9, xRatio: 0.46 });

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
    const nightScene = new THREE.Group();
    nightGroup.add(nightScene);

    const nightHaze = new THREE.Mesh(new THREE.CircleGeometry(1.95, 48), nightHazeMaterial);
    nightHaze.position.set(0.15, -0.15, -0.4);
    nightHaze.scale.set(1.4, 1, 1);
    nightScene.add(nightHaze);

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
    wheelGroup.position.set(0, -0.08, 0);
    const outerWheel = createCircle(1.82, 140, wheelRimMaterial);
    const innerWheel = createCircle(1.34, 96, wheelAccentMaterial);
    const hubWheel = createCircle(0.16, 36, wheelRimMaterial);
    wheelGroup.add(outerWheel);
    wheelGroup.add(innerWheel);
    wheelGroup.add(hubWheel);

    const gondolaMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.34,
    });
    const gondolas: THREE.Group[] = [];
    const rimLightMaterial = new THREE.PointsMaterial({
      size: 0.09,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const rimLightPoints: number[] = [];

    for (let idx = 0; idx < 12; idx += 1) {
      const angle = (idx / 12) * Math.PI * 2;
      const gondola = new THREE.Group();
      const hanger = createLine(
        [new THREE.Vector3(0, 0.14, 0), new THREE.Vector3(0, -0.05, 0)],
        gondolaMaterial,
      );
      const cabin = createLine(
        [
          new THREE.Vector3(-0.1, -0.05, 0),
          new THREE.Vector3(0.1, -0.05, 0),
          new THREE.Vector3(0.12, -0.16, 0),
          new THREE.Vector3(-0.12, -0.16, 0),
          new THREE.Vector3(-0.1, -0.05, 0),
        ],
        gondolaMaterial,
      );
      gondola.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
      gondola.userData.baseAngle = angle;
      gondola.add(hanger);
      gondola.add(cabin);
      gondolas.push(gondola);
      wheelGroup.add(gondola);

      rimLightPoints.push(Math.cos(angle) * 1.82, Math.sin(angle) * 1.82, 0);
      rimLightPoints.push(Math.cos(angle + Math.PI / 24) * 1.34, Math.sin(angle + Math.PI / 24) * 1.34, 0);
    }

    const rimLightGeometry = new THREE.BufferGeometry();
    rimLightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rimLightPoints, 3));
    const rimLights = new THREE.Points(rimLightGeometry, rimLightMaterial);
    wheelGroup.add(rimLights);

    const spokes: THREE.Line[] = [];
    for (let idx = 0; idx < 12; idx += 1) {
      const angle = (idx / 12) * Math.PI * 2;
      const spoke = createLine(
        [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(angle) * 1.78, Math.sin(angle) * 1.78, 0)],
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
      [new THREE.Vector3(-0.95, -2.05, 0), new THREE.Vector3(0, -0.08, 0)],
      supportMaterial,
    );
    const rightSupport = createLine(
      [new THREE.Vector3(0.95, -2.05, 0), new THREE.Vector3(0, -0.08, 0)],
      supportMaterial,
    );
    const crossSupport = createLine(
      [new THREE.Vector3(-0.66, -1.54, 0), new THREE.Vector3(0.66, -1.54, 0)],
      supportMaterial,
    );
    nightScene.add(leftSupport);
    nightScene.add(rightSupport);
    nightScene.add(crossSupport);
    nightScene.add(wheelGroup);

    const beamMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamGeometry = new THREE.PlaneGeometry(0.3, 4.6, 1, 1);
    const beams = [
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: -0.9, y: -0.1, rotation: -0.18, pulse: 0.7 },
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: 0, y: 0.25, rotation: -0.03, pulse: 1.2 },
      { mesh: new THREE.Mesh(beamGeometry, beamMaterial), x: 0.85, y: -0.05, rotation: 0.16, pulse: 1.85 },
    ];
    beams.forEach(({ mesh, x, y, rotation }) => {
      mesh.position.set(x, y, -0.55);
      mesh.rotation.z = rotation;
      nightScene.add(mesh);
    });

    const shootingStarMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.52,
    });
    const shootingStars = [
      { line: createLine([new THREE.Vector3(-0.42, 0.12, 0), new THREE.Vector3(0.28, -0.08, 0)], shootingStarMaterial), lane: -0.62, height: 2.2, speed: 0.14, phase: 0.1 },
      { line: createLine([new THREE.Vector3(-0.36, 0.1, 0), new THREE.Vector3(0.22, -0.06, 0)], shootingStarMaterial), lane: -0.08, height: 1.55, speed: 0.18, phase: 0.52 },
      { line: createLine([new THREE.Vector3(-0.34, 0.08, 0), new THREE.Vector3(0.24, -0.06, 0)], shootingStarMaterial), lane: 0.48, height: 2.65, speed: 0.16, phase: 0.84 },
    ];
    shootingStars.forEach(({ line }) => {
      line.visible = false;
      nightGroup.add(line);
    });

    const moonMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.22,
    });
    const moon = createArc(0.58, Math.PI * 0.25, Math.PI * 1.8, 54, moonMaterial);
      moon.position.set(-4.55, 2.15, -0.25);
    nightGroup.add(moon);

    const windLineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.24,
    });
    const windLines = [
      { line: createArc(0.72, Math.PI * 1.06, Math.PI * 1.72, 32, windLineMaterial), xRatio: -0.24, baseY: 0.45, offset: 0.2 },
      { line: createArc(0.92, Math.PI * 1.02, Math.PI * 1.68, 32, windLineMaterial), xRatio: 0.12, baseY: 0.9, offset: 1.1 },
      { line: createArc(0.84, Math.PI * 1.08, Math.PI * 1.7, 32, windLineMaterial), xRatio: 0.46, baseY: 0.2, offset: 2.1 },
    ];
    windLines.forEach(({ line, xRatio, baseY }) => {
      line.position.set(xRatio * 6, baseY, -0.2);
      dayGroup.add(line);
    });

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
      dayGroundMaterial.color = accent.clone().lerp(border, 0.55);
      turbineMaterial.color = foreground.clone().lerp(border, 0.4);
      hubMaterial.color = accent.clone().lerp(border, 0.45);
      windLineMaterial.color = accent.clone().lerp(border, 0.4);
      vesselMaterial.color = foreground.clone().lerp(border, 0.48);
      vesselAccentMaterial.color = accent.clone().lerp(border, 0.52);
      helicopterMaterial.color = foreground.clone().lerp(border, 0.38);
      seaLineMaterial.color = accent.clone().lerp(border, 0.48);

      wheelRimMaterial.color = accent;
      wheelAccentMaterial.color = border;
      wheelSpokeMaterial.color = accent.clone().lerp(border, 0.35);
      gondolaMaterial.color = border.clone().lerp(accent, 0.25);
      rimLightMaterial.color = accent.clone().lerp(new THREE.Color('#ffffff'), 0.24);
      supportMaterial.color = border;
      beamMaterial.color = accent;
      shootingStarMaterial.color = accent.clone().lerp(new THREE.Color('#ffffff'), 0.18);
      moonMaterial.color = border.clone().lerp(accent, 0.2);
      nightGroundMaterial.color = border.clone().lerp(foreground, 0.22);
      nightHazeMaterial.color = accent;
      dayRidgeMaterial.color = border.clone().lerp(foreground, 0.16);

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
      const halfWidth = viewWidth / 2;

      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      dayGround.scale.x = Math.max(1, halfWidth / 6);
      nightGround.scale.x = Math.max(1, halfWidth / 6);
      dayRidge.scale.x = Math.max(1, halfWidth / 6);
      sunArc.position.x = -halfWidth + 1.4;
      moon.position.x = -halfWidth + 1.55;
      nightScene.position.x = halfWidth * 0.43;

      clouds.forEach(({ group, xRatio }) => {
        group.position.x = xRatio * halfWidth;
      });

      turbines.forEach(({ group }, index) => {
        group.position.x = turbineConfigs[index].xRatio * halfWidth;
      });

      windLines.forEach(({ line, xRatio }) => {
        line.position.x = xRatio * halfWidth;
      });

      helicopters.forEach(({ group, xRatio }) => {
        group.position.x = xRatio * halfWidth;
      });
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
      const starAttribute = starGeometry.getAttribute('position') as THREE.BufferAttribute;
      const pointerWorldX = pointer.x * camera.right;
      const pointerWorldY = pointer.y * camera.top;

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

      root.position.x += ((pointer.x * 0.12) - root.position.x) * 0.03;
      root.position.y += ((pointer.y * 0.08) - root.position.y) * 0.03;

      if (darkMode) {
        const meteorBoost = 1 + Math.abs(pointer.x) * 2.2 + Math.max(0, -pointer.y) * 0.8;
        wheelGroup.rotation.z += prefersReducedMotion ? 0 : 0.0013 + Math.abs(pointer.x) * 0.0015;
        nightHaze.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.04);
        starMaterial.opacity = 0.62 + ((Math.sin(elapsed * 0.8) + 1) / 2) * 0.18;
        rimLightMaterial.opacity = 0.54 + ((Math.sin(elapsed * 2.1) + 1) / 2) * 0.2;
        beams.forEach(({ mesh, pulse }) => {
          mesh.scale.y = 0.96 + Math.sin(elapsed * 1.1 + pulse) * 0.08;
          const material = mesh.material as THREE.MeshBasicMaterial;
          material.opacity = 0.06 + ((Math.sin(elapsed * 1.4 + pulse) + 1) / 2) * 0.09;
        });
        gondolas.forEach((gondola) => {
          gondola.rotation.z = -wheelGroup.rotation.z;
        });
        for (let idx = 0; idx < starCount; idx += 1) {
          const stride = idx * 3;
          const baseX = starBase[stride];
          const baseY = starBase[stride + 1];
          starAttribute.array[stride] = baseX + Math.sin(elapsed * 0.12 + idx * 0.7) * 0.01;
          starAttribute.array[stride + 1] = baseY + Math.cos(elapsed * 0.15 + idx * 0.5) * 0.014;
          starAttribute.array[stride + 2] = starBase[stride + 2];
        }
        starAttribute.needsUpdate = true;
        shootingStars.forEach(({ line, lane, height, speed, phase }) => {
          const travel = (((elapsed * speed * meteorBoost) + phase) % 1 + 1) % 1;
          const startX = -6.8 + travel * 13.6;
          line.position.x = startX + lane * 0.4 + pointer.x * 0.65;
          line.position.y = height - travel * 1.6 + pointer.y * 0.18;
          line.visible = travel > 0.04 && travel < 0.96;
          line.scale.setScalar(0.92 + meteorBoost * 0.08);
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = 0.18 + ((Math.sin(elapsed * 3.2 + phase * 8) + 1) / 2) * 0.42;
        });
      } else {
        const windForce = 1 + Math.abs(pointer.x) * 2.6 + Math.max(0, pointer.y) * 0.6;
        starMaterial.opacity = 0;
        clouds.forEach(({ group, speed, amplitude, offset, xRatio, baseY }) => {
          const baseX = xRatio * (camera.right - 0.4);
          group.position.x = baseX + Math.sin(elapsed * speed * windForce + offset) * 0.42 * windForce;
          group.position.y = baseY + Math.cos(elapsed * speed * 1.6 + offset) * amplitude;
        });

        turbines.forEach(({ rotor, speed, group }, index) => {
          const distX = pointerWorldX - group.position.x;
          const distY = pointerWorldY - (group.position.y + 0.6 * group.scale.x);
          const dist = Math.hypot(distX, distY);
          const localBoost = clamp(1 - dist / 2.4, 0, 1);
          const acceleration = 1 + windForce * 0.7 + localBoost * 2.6;
          rotor.rotation.z -= prefersReducedMotion ? 0 : speed * 0.01 * acceleration;
          group.position.y += (Math.sin(elapsed * 0.8 + index * 0.4) * 0.006 - (group.position.y - turbineConfigs[index].y)) * 0.08;
        });
        windLines.forEach(({ line, xRatio, baseY, offset }) => {
          const baseX = xRatio * (camera.right - 0.5);
          line.position.x = baseX + Math.sin(elapsed * 0.7 + offset) * 0.1;
          line.position.y = baseY + Math.cos(elapsed * 0.9 + offset) * 0.04;
          line.scale.setScalar(0.92 + Math.abs(pointer.x) * 0.3);
          line.rotation.z = -0.02 - pointer.x * 0.12;
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = 0.12 + Math.abs(pointer.x) * 0.18;
        });
        seaLines.forEach((line, index) => {
          const definition = seaLineDefinitions[index];
          const geometry = line.geometry as THREE.BufferGeometry;
          const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let pointIndex = 0; pointIndex < attribute.count; pointIndex += 1) {
            const x = -camera.right + pointIndex * ((camera.right * 2) / Math.max(attribute.count - 1, 1));
            const y =
              definition.y +
              Math.sin(elapsed * definition.speed + pointIndex * 0.72 + definition.phase) * definition.amplitude * windForce +
              Math.cos(elapsed * (definition.speed * 0.58) + pointIndex * 0.3) * definition.amplitude * 0.42;
            attribute.setXYZ(pointIndex, x, y, 0);
          }
          attribute.needsUpdate = true;
        });
        vessels.forEach(({ group, speed, phase, laneY, direction, bob }) => {
          const travel = (((elapsed * speed * windForce) + phase) % 1 + 1) % 1;
          const range = camera.right * 2 + 1.4;
          group.position.x = -camera.right - 0.7 + travel * range;
          if (direction === -1) {
            group.position.x = camera.right + 0.7 - travel * range;
          }
          group.position.y = laneY + Math.sin(elapsed * 1.6 + phase * 8) * bob;
          group.rotation.z = Math.sin(elapsed * 1.6 + phase * 5) * 0.03;
        });
        helicopters.forEach(({ group, rotor, speed, phase, baseY, xRatio }) => {
          const baseX = xRatio * (camera.right - 0.5);
          group.position.x = baseX + Math.sin(elapsed * speed + phase) * 1.15;
          group.position.y = baseY + Math.cos(elapsed * speed * 2 + phase) * 0.14 + pointer.y * 0.08;
          group.rotation.z = Math.sin(elapsed * speed * 1.4 + phase) * 0.05;
          rotor.rotation.z += prefersReducedMotion ? 0 : 0.22 + windForce * 0.04;
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

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import GlitchOverlay from "./GlitchOverlay";
import WindowsDesktop from "./WindowsDesktop";

export default function ProjectsPage() {
  const mountRef = useRef(null);
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const glitchFiredRef = useRef(false);
  const savedScrollY = useRef(0);
  const isRestoringRef = useRef(false);
  const resetProgressRef = useRef(null);
  const zoomingOutRef = useRef(false);
  const targetProgressRef = useRef(0);

  const [glitching, setGlitching] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);

  const triggerGlitch = () => {
    if (glitchFiredRef.current) return;
    if (isRestoringRef.current) return;
    glitchFiredRef.current = true;
    savedScrollY.current = window.scrollY;
    setGlitching(true);
  };

  const onGlitchDone = () => {
    setGlitching(false);
    setShowDesktop(true);
  };

  const handleBack = () => {
    isRestoringRef.current = true;
    setShowDesktop(false);
    glitchFiredRef.current = false;
    if (resetProgressRef.current) resetProgressRef.current();
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 300);
  };

  const handleSignOut = () => {
    setShowDesktop(false);
    glitchFiredRef.current = false;
    isRestoringRef.current = true;
    zoomingOutRef.current = true;
  };

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth,
      h = el.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#25263a");

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 2.8, 7);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.3,
      metalness: 0.85,
    });
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x111120,
      roughness: 0.2,
      metalness: 0.9,
    });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x000008,
      roughness: 0.98,
      metalness: 0.0,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e30,
      roughness: 0.65,
      metalness: 0.25,
    });
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3c,
      roughness: 0.3,
      metalness: 0.9,
    });
    const lampArmMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.3,
      metalness: 0.9,
    });
    const lampConeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.25,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });
    const lampBaseMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.8,
    });
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      roughness: 0.1,
      metalness: 0.0,
      emissive: 0xffffcc,
      emissiveIntensity: 1.2,
    });
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x6b3f1e,
      roughness: 0.7,
    });
    const deskLegMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a10,
      roughness: 0.8,
    });
    const paperMats = [
      new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xeeeae0, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.9 }),
    ];

    // Plant materials
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.0,
    });
    const potRimMat = new THREE.MeshStandardMaterial({
      color: 0x7a3d10,
      roughness: 0.75,
      metalness: 0.0,
    });
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x2b1a0d,
      roughness: 1.0,
    });
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a1b,
      roughness: 0.8,
    });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x3a7d2c,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const leafDarkMat = new THREE.MeshStandardMaterial({
      color: 0x2a5e1e,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const box = (
      gw,
      gh,
      gd,
      mat,
      px = 0,
      py = 0,
      pz = 0,
      rx = 0,
      ry = 0,
      rz = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), mat);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };
    const cyl = (
      rt,
      rb,
      ch,
      seg,
      mat,
      px = 0,
      py = 0,
      pz = 0,
      rx = 0,
      ry = 0,
      rz = 0,
    ) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(rt, rb, ch, seg),
        mat,
      );
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    const DESK_Y = 0;

    const desk = new THREE.Group();
    scene.add(desk);
    desk.add(box(9, 0.18, 4, deskMat, 0, DESK_Y - 0.09, 0));
    [
      [-4.3, -1.5],
      [4.3, -1.5],
      [-4.3, 1.5],
      [4.3, 1.5],
    ].forEach(([x, z]) => {
      desk.add(box(0.2, 2.8, 0.2, deskLegMat, x, DESK_Y - 0.09 - 1.4, z));
    });

    const laptop = new THREE.Group();
    laptop.position.set(0, DESK_Y + 0.05, 0);
    scene.add(laptop);
    const base = new THREE.Group();
    laptop.add(base);
    base.add(box(3.4, 0.1, 2.2, bodyMat));
    base.add(
      box(
        3.1,
        0.012,
        1.8,
        new THREE.MeshStandardMaterial({
          color: 0x131323,
          roughness: 0.5,
          metalness: 0.5,
        }),
        0,
        0.056,
        -0.12,
      ),
    );

    const rows = [
      { z: -0.68, n: 13, kw: 0.17 },
      { z: -0.44, n: 12, kw: 0.19 },
      { z: -0.2, n: 11, kw: 0.21 },
      { z: 0.04, n: 10, kw: 0.23 },
    ];
    rows.forEach(({ z, n, kw }) => {
      const total = n * kw + (n - 1) * 0.04;
      for (let i = 0; i < n; i++) {
        const kx = -total / 2 + i * (kw + 0.04) + kw / 2;
        base.add(box(kw - 0.02, 0.04, 0.16, keyMat, kx, 0.077, z));
      }
    });

    const bottomZ = 0.28,
      keyH = 0.04,
      keyD = 0.16,
      keyY = 0.077;
    [
      { w: 0.22, x: -1.12 },
      { w: 0.22, x: -0.86 },
      { w: 0.22, x: -0.6 },
    ].forEach(({ w, x }) => {
      base.add(box(w - 0.02, keyH, keyD, keyMat, x, keyY, bottomZ));
    });
    base.add(box(0.8 - 0.02, keyH, keyD, keyMat, -0.06, keyY, bottomZ));
    [
      { w: 0.22, x: 0.48 },
      { w: 0.22, x: 0.74 },
      { w: 0.22, x: 1.0 },
      { w: 0.22, x: 1.26 },
    ].forEach(({ w, x }) => {
      base.add(box(w - 0.02, keyH, keyD, keyMat, x, keyY, bottomZ));
    });
    base.add(
      box(
        0.95,
        0.005,
        0.58,
        new THREE.MeshStandardMaterial({
          color: 0x181828,
          roughness: 0.12,
          metalness: 0.55,
        }),
        0,
        0.059,
        0.62,
      ),
    );
    [-0.75, 0.75].forEach((x) =>
      base.add(
        cyl(
          0.055,
          0.055,
          0.38,
          16,
          hingeMat,
          x,
          0.055,
          -1.07,
          0,
          0,
          Math.PI / 2,
        ),
      ),
    );

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.055, -1.07);
    lidPivot.rotation.x = -Math.PI * 0.44;
    base.add(lidPivot);
    const lid = new THREE.Group();
    lidPivot.add(lid);
    lid.add(box(3.4, 0.08, 2.2, lidMat, 0, 0, 1.1));
    lid.add(
      box(
        3.05,
        0.018,
        1.9,
        new THREE.MeshStandardMaterial({ color: 0x0c0c1a, roughness: 0.25 }),
        0,
        0.052,
        1.1,
      ),
    );
    lid.add(box(2.75, 0.008, 1.66, screenMat, 0, 0.063, 1.1));

    const paperDefs = [
      // Left side - STACKED PAPERS
      {
        x: -3,
        z: 0.2,
        ry: Math.PI / 2 + 0.05,
        pw: 1.35,
        pd: 1.05,
        yOffset: 0.012,
      },
      // Second paper (slightly rotated and offset)
      {
        x: -2.98,
        z: 0.21,
        ry: Math.PI / 2 + 0.12,
        pw: 1.3,
        pd: 1.0,
        yOffset: 0.024,
      },
      // Third paper (more rotation)
      {
        x: -2.95,
        z: 0.19,
        ry: Math.PI / 2 - 0.08,
        pw: 1.28,
        pd: 0.98,
        yOffset: 0.036,
      },
      // Top paper (most rotated, smaller)
      {
        x: -2.92,
        z: 0.22,
        ry: Math.PI / 2 + 0.22,
        pw: 1.25,
        pd: 0.95,
        yOffset: 0.048,
      },

      // Right side papers (only 2 pieces, separate from stack)
      {
        x: 2.4,
        z: -0.2,
        ry: Math.PI / 2 + 0.15,
        pw: 1.2,
        pd: 0.9,
        yOffset: 0.012,
      },
      {
        x: 3.1,
        z: 0.6,
        ry: Math.PI / 2 - 0.3,
        pw: 1.3,
        pd: 0.95,
        yOffset: 0.012,
      },
    ];
    paperDefs.forEach(({ x, z, ry, pw, pd, yOffset }, i) => {
      scene.add(
        box(
          pw,
          0.012,
          pd,
          paperMats[i % paperMats.length],
          x,
          DESK_Y + yOffset,
          z,
          0,
          ry,
          0,
        ),
      );
    });

    const lamp = new THREE.Group();
    lamp.position.set(3.6, DESK_Y, -0.4);
    scene.add(lamp);

    // Lamp base
    lamp.add(cyl(0.3, 0.45, 0.07, 24, lampBaseMat, 0, 0.035, 0));
    lamp.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 0.11, 0));

    // Lower arm
    const lowerArm = new THREE.Group();
    lowerArm.position.set(0, 0.17, 0);
    lowerArm.rotation.z = -0.55;
    lamp.add(lowerArm);

    const lowerArmCyl = cyl(0.036, 0.036, 1.5, 10, lampArmMat, 0, 0.75, 0);
    lowerArm.add(lowerArmCyl);
    lowerArm.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 1.5, 0));

    // Upper arm
    const upperArm = new THREE.Group();
    upperArm.position.set(0, 1.5, 0);
    upperArm.rotation.z = 1.1;
    lowerArm.add(upperArm);

    const upperArmCyl = cyl(0.032, 0.032, 1.2, 10, lampArmMat, 0, 0.6, 0);
    upperArm.add(upperArmCyl);

    // Head
    const head = new THREE.Group();
    head.position.set(-0.3, 1.2, 0);
    head.rotation.z = 1.4;
    upperArm.add(head);

    // Cone lamp shade
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.44, 24, 1, true),
      lampConeMat,
    );
    cone.rotation.x = Math.PI;
    cone.castShadow = true;
    cone.position.y = -0.22;
    head.add(cone);

    // Bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      bulbMat,
    );
    bulb.position.y = -0.18;
    head.add(bulb);

    // Connector piece
    const connector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.15, 8),
      lampArmMat,
    );
    connector.position.y = -0.35;
    head.add(connector);

    // PLANT - More leafy with branches
    const plant = new THREE.Group();
    plant.position.set(-2.7, DESK_Y, -1);
    scene.add(plant);

    // Pot body
    const potBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.2, 0.45, 20),
      potMat,
    );
    potBody.position.y = 0.225;
    potBody.castShadow = true;
    potBody.receiveShadow = true;
    plant.add(potBody);

    // Pot rim
    const potRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.28, 0.06, 20),
      potRimMat,
    );
    potRim.position.y = 0.45 + 0.03;
    potRim.castShadow = true;
    plant.add(potRim);

    // Soil surface
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.04, 20),
      soilMat,
    );
    soil.position.y = 0.47;
    plant.add(soil);

    // Main stem (taller and thicker)
    const mainStem = cyl(0.04, 0.045, 0.75, 12, stemMat, 0, 0.85, 0);
    plant.add(mainStem);

    // Branch creation helper
    const makeBranch = (
      px,
      py,
      pz,
      angle,
      length,
      thickness,
      rotationAxis = "x",
    ) => {
      const branchGroup = new THREE.Group();
      branchGroup.position.set(px, py, pz);

      const branchCyl = cyl(
        thickness,
        thickness,
        length,
        8,
        stemMat,
        0,
        length / 2,
        0,
      );

      if (rotationAxis === "x") {
        branchGroup.rotation.x = angle;
      } else if (rotationAxis === "z") {
        branchGroup.rotation.z = angle;
      } else if (rotationAxis === "y") {
        branchGroup.rotation.y = angle;
      }

      branchGroup.add(branchCyl);
      plant.add(branchGroup);
      return branchGroup;
    };

    // Main branches extending from the stem
    const branchPoints = [
      { y: 0.65, angle: -0.4, length: 0.28, thickness: 0.022, axis: "x" }, // lower left
      { y: 0.65, angle: 0.4, length: 0.28, thickness: 0.022, axis: "x" }, // lower right
      { y: 0.85, angle: -0.5, length: 0.35, thickness: 0.025, axis: "x" }, // middle left
      { y: 0.85, angle: 0.5, length: 0.35, thickness: 0.025, axis: "x" }, // middle right
      { y: 1.05, angle: -0.45, length: 0.4, thickness: 0.028, axis: "x" }, // upper left
      { y: 1.05, angle: 0.45, length: 0.4, thickness: 0.028, axis: "x" }, // upper right
      { y: 1.2, angle: 0, length: 0.32, thickness: 0.03, axis: "x" }, // top front
      { y: 1.2, angle: Math.PI, length: 0.32, thickness: 0.03, axis: "x" }, // top back
    ];

    branchPoints.forEach((point) => {
      makeBranch(
        0,
        point.y,
        0,
        point.angle,
        point.length,
        point.thickness,
        point.axis,
      );
    });

    // Enhanced leaf creation with more variety
    const makeLeafDetailed = (
      mat,
      px,
      py,
      pz,
      rx,
      ry,
      rz,
      sx = 1,
      sy = 1,
      sz = 1,
      isBranchTip = false,
    ) => {
      const geo = new THREE.SphereGeometry(0.22, 12, 8);
      const m = new THREE.Mesh(geo, mat);
      m.scale.set(sx, sy, sz);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      plant.add(m);

      // Add small stem connection if it's a branch tip leaf
      if (isBranchTip) {
        const connector = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.015, 0.08, 6),
          stemMat,
        );
        connector.position.set(px * 0.7, py - 0.05, pz * 0.7);
        connector.rotation.set(rx * 0.5, ry, rz * 0.5);
        connector.castShadow = true;
        plant.add(connector);
      }
    };

    // Central top cluster (dense foliage)
    const stemTop = 1.28;
    makeLeafDetailed(
      leafMat,
      0,
      stemTop + 0.15,
      0.12,
      -0.3,
      0,
      0,
      0.65,
      0.22,
      1.1,
      true,
    );
    makeLeafDetailed(
      leafDarkMat,
      0.12,
      stemTop + 0.12,
      -0.08,
      -0.25,
      0.4,
      0.15,
      0.62,
      0.21,
      1.05,
      true,
    );
    makeLeafDetailed(
      leafMat,
      -0.12,
      stemTop + 0.12,
      -0.08,
      -0.25,
      -0.4,
      -0.15,
      0.62,
      0.21,
      1.05,
      true,
    );
    makeLeafDetailed(
      leafDarkMat,
      0.08,
      stemTop + 0.1,
      -0.15,
      -0.2,
      0.7,
      0.1,
      0.58,
      0.2,
      1.0,
      true,
    );
    makeLeafDetailed(
      leafMat,
      -0.08,
      stemTop + 0.1,
      -0.15,
      -0.2,
      -0.7,
      -0.1,
      0.58,
      0.2,
      1.0,
      true,
    );
    makeLeafDetailed(
      leafDarkMat,
      0,
      stemTop + 0.08,
      -0.2,
      -0.15,
      Math.PI,
      0,
      0.6,
      0.19,
      1.02,
      true,
    );

    // Left side branch leaves
    makeLeafDetailed(
      leafMat,
      -0.28,
      1.05,
      0.05,
      -0.35,
      -0.3,
      -0.2,
      0.58,
      0.2,
      0.95,
    );
    makeLeafDetailed(
      leafDarkMat,
      -0.32,
      1.02,
      -0.08,
      -0.3,
      -0.5,
      -0.3,
      0.55,
      0.19,
      0.92,
    );
    makeLeafDetailed(
      leafMat,
      -0.35,
      0.98,
      0.12,
      -0.4,
      -0.2,
      -0.1,
      0.52,
      0.18,
      0.88,
    );
    makeLeafDetailed(
      leafDarkMat,
      -0.38,
      0.85,
      0.02,
      -0.45,
      -0.4,
      -0.25,
      0.5,
      0.17,
      0.85,
    );
    makeLeafDetailed(
      leafMat,
      -0.3,
      0.82,
      -0.12,
      -0.4,
      -0.6,
      -0.35,
      0.53,
      0.18,
      0.9,
    );

    // Right side branch leaves
    makeLeafDetailed(
      leafDarkMat,
      0.28,
      1.05,
      0.05,
      -0.35,
      0.3,
      0.2,
      0.58,
      0.2,
      0.95,
    );
    makeLeafDetailed(
      leafMat,
      0.32,
      1.02,
      -0.08,
      -0.3,
      0.5,
      0.3,
      0.55,
      0.19,
      0.92,
    );
    makeLeafDetailed(
      leafDarkMat,
      0.35,
      0.98,
      0.12,
      -0.4,
      0.2,
      0.1,
      0.52,
      0.18,
      0.88,
    );
    makeLeafDetailed(
      leafMat,
      0.38,
      0.85,
      0.02,
      -0.45,
      0.4,
      0.25,
      0.5,
      0.17,
      0.85,
    );
    makeLeafDetailed(
      leafDarkMat,
      0.3,
      0.82,
      -0.12,
      -0.4,
      0.6,
      0.35,
      0.53,
      0.18,
      0.9,
    );

    // Lower branch leaves (drooping)
    makeLeafDetailed(
      leafMat,
      -0.25,
      0.68,
      0.18,
      0.2,
      -0.5,
      -0.4,
      0.48,
      0.16,
      0.82,
    );
    makeLeafDetailed(
      leafDarkMat,
      -0.22,
      0.65,
      -0.15,
      0.25,
      -0.7,
      -0.5,
      0.46,
      0.15,
      0.8,
    );
    makeLeafDetailed(
      leafMat,
      0.25,
      0.68,
      0.18,
      0.2,
      0.5,
      0.4,
      0.48,
      0.16,
      0.82,
    );
    makeLeafDetailed(
      leafDarkMat,
      0.22,
      0.65,
      -0.15,
      0.25,
      0.7,
      0.5,
      0.46,
      0.15,
      0.8,
    );

    // Additional smaller leaves for extra fullness
    const extraLeaves = [
      {
        mat: leafMat,
        px: -0.18,
        py: 1.12,
        pz: 0.22,
        rx: -0.2,
        ry: -0.8,
        rz: -0.1,
        sx: 0.45,
        sy: 0.14,
        sz: 0.78,
      },
      {
        mat: leafDarkMat,
        px: 0.18,
        py: 1.12,
        pz: 0.22,
        rx: -0.2,
        ry: 0.8,
        rz: 0.1,
        sx: 0.45,
        sy: 0.14,
        sz: 0.78,
      },
      {
        mat: leafMat,
        px: -0.15,
        py: 0.95,
        pz: 0.28,
        rx: -0.15,
        ry: -0.6,
        rz: -0.2,
        sx: 0.42,
        sy: 0.13,
        sz: 0.72,
      },
      {
        mat: leafDarkMat,
        px: 0.15,
        py: 0.95,
        pz: 0.28,
        rx: -0.15,
        ry: 0.6,
        rz: 0.2,
        sx: 0.42,
        sy: 0.13,
        sz: 0.72,
      },
      {
        mat: leafMat,
        px: -0.2,
        py: 1.18,
        pz: -0.05,
        rx: -0.28,
        ry: -0.4,
        rz: -0.05,
        sx: 0.5,
        sy: 0.17,
        sz: 0.85,
      },
      {
        mat: leafDarkMat,
        px: 0.2,
        py: 1.18,
        pz: -0.05,
        rx: -0.28,
        ry: 0.4,
        rz: 0.05,
        sx: 0.5,
        sy: 0.17,
        sz: 0.85,
      },
    ];

    extraLeaves.forEach((leaf) => {
      makeLeafDetailed(
        leaf.mat,
        leaf.px,
        leaf.py,
        leaf.pz,
        leaf.rx,
        leaf.ry,
        leaf.rz,
        leaf.sx,
        leaf.sy,
        leaf.sz,
      );
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const overhead = new THREE.DirectionalLight(0xffffff, 1.1);
    overhead.position.set(0, 8, 4);
    overhead.castShadow = true;
    overhead.shadow.mapSize.set(2048, 2048);
    overhead.shadow.camera.left = -7;
    overhead.shadow.camera.right = 7;
    overhead.shadow.camera.top = 6;
    overhead.shadow.camera.bottom = -6;
    overhead.shadow.camera.far = 30;
    scene.add(overhead);
    const lampLight = new THREE.SpotLight(
      0xffffff,
      2.5,
      14,
      Math.PI * 0.22,
      0.3,
      1.2,
    );
    lampLight.position.set(3.8, 3.8, 0.5);
    lampLight.target.position.set(1.5, 0, 0.2);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(1024, 1024);
    scene.add(lampLight);
    scene.add(lampLight.target);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = DESK_Y - 0.09 - 2.8;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c2c,
      roughness: 1,
      metalness: 0,
    });
    const floorY = DESK_Y - 0.09 - 2.8;
    const wallH = 10,
      wallW = 24,
      wallD = 20;

    // BACK WALL
    const backWallZ = -2.1;
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallW, wallH),
      wallMat,
    );
    backWall.position.set(0, floorY + wallH / 2, backWallZ);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallD, wallH),
      wallMat,
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-wallW / 2, floorY + wallH / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallD, wallH),
      wallMat,
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(wallW / 2, floorY + wallH / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const fadedLineMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: 0.28,
    });
    const wallLine = (w, h, d, px, py, pz) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fadedLineMat);
      m.position.set(px, py, pz);
      scene.add(m);
    };
    // Back wall grid
    const bwZ = backWallZ + 0.02;
    for (let i = 0; i < 5; i++)
      wallLine(wallW, 0.025, 0.01, 0, floorY + 1.5 + i * 1.6, bwZ);
    for (let i = -4; i <= 4; i++)
      wallLine(0.025, wallH, 0.01, i * 2.5, floorY + wallH / 2, bwZ);
    const lwX = -wallW / 2 + 0.02;
    for (let i = 0; i < 5; i++)
      wallLine(0.01, 0.025, wallD, lwX, floorY + 1.5 + i * 1.6, 0);
    for (let i = -3; i <= 3; i++)
      wallLine(0.01, wallH, 0.025, lwX, floorY + wallH / 2, i * 2.8);
    const rwX = wallW / 2 - 0.02;
    for (let i = 0; i < 5; i++)
      wallLine(0.01, 0.025, wallD, rwX, floorY + 1.5 + i * 1.6, 0);
    for (let i = -3; i <= 3; i++)
      wallLine(0.01, wallH, 0.025, rwX, floorY + wallH / 2, i * 2.8);

    const floorGridMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: 0.12,
    });
    for (let i = -3; i <= 3; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(wallW, 0.01, 0.025),
        floorGridMat,
      );
      m.position.set(0, floorY + 0.005, i * 2.8);
      scene.add(m);
    }
    for (let i = -4; i <= 4; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.01, wallD),
        floorGridMat,
      );
      m.position.set(i * 2.5, floorY + 0.005, 0);
      scene.add(m);
    }

    const camStart = new THREE.Vector3(0, 3.2, 8);
    const camEnd = new THREE.Vector3(0, 1.52, 0.35);
    const lookStart = new THREE.Vector3(0, 0.2, 0);
    const lookEnd = new THREE.Vector3(0, 1.52, -1.5);

    let targetProgress = 0;
    let scrollProgress = 0;
    let glitchTriggered = false;
    let sectionActive = false;

    const syncTargetRef = (v) => {
      targetProgress = v;
      targetProgressRef.current = v;
    };

    resetProgressRef.current = () => {
      syncTargetRef(0);
      scrollProgress = 0;
      glitchTriggered = false;
    };

    const checkZoomOut = () => {
      if (!zoomingOutRef.current) return;
      if (targetProgress < targetProgressRef.current) {
        targetProgress = targetProgressRef.current;
        scrollProgress = targetProgressRef.current;
      }
      syncTargetRef(Math.max(0, targetProgress - 0.022));
      if (targetProgress <= 0 && scrollProgress < 0.01) {
        syncTargetRef(0);
        scrollProgress = 0;
        glitchTriggered = false;
        zoomingOutRef.current = false;
        isRestoringRef.current = false;
        if (textRef.current) textRef.current.style.transform = "translateY(0)";
      }
    };

    const applyProgress = (p) => {
      const txt = textRef.current;
      if (txt) txt.style.transform = `translateY(${p * -200}vh)`;
      screenMat.emissive.setHex(0x2255aa);
      screenMat.emissiveIntensity = Math.max(0, (p - 0.6) / 0.4) * 1.2;
      scene.background.lerpColors(
        new THREE.Color("#25263a"),
        new THREE.Color("#0d1a35"),
        Math.max(0, (p - 0.75) / 0.25),
      );
      if (p >= 0.99 && !glitchTriggered) {
        glitchTriggered = true;
        syncTargetRef(1);
        triggerGlitch();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionActive = entry.intersectionRatio >= 0.98;
      },
      { threshold: 0.98 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const onWheel = (e) => {
      if (isRestoringRef.current) return;
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;
      if (scrollingUp && targetProgress <= 0 && scrollProgress < 0.02) return;
      if (targetProgress >= 1 && scrollProgress > 0.98) return;
      if (!sectionActive && targetProgress <= 0) return;
      e.preventDefault();
      const delta = scrollingDown ? 0.35 : -0.35;
      syncTargetRef(Math.max(0, Math.min(1, targetProgress + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (isRestoringRef.current) return;
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (dy < 0 && targetProgress <= 0 && scrollProgress < 0.02) return;
      if (dy > 0 && targetProgress >= 1) return;
      if (!sectionActive && targetProgress <= 0) return;
      e.preventDefault();
      syncTargetRef(
        Math.max(
          0,
          Math.min(1, targetProgress + (dy / window.innerHeight) * 1.2),
        ),
      );
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    const onResize = () => {
      const nw = el.clientWidth,
        nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    let raf,
      t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.008;
      checkZoomOut();
      scrollProgress += (targetProgress - scrollProgress) * 0.06;
      applyProgress(scrollProgress);
      camera.position.lerpVectors(camStart, camEnd, scrollProgress);
      camera.lookAt(
        new THREE.Vector3().lerpVectors(lookStart, lookEnd, scrollProgress),
      );
      laptop.position.y = DESK_Y + 0.05 + Math.sin(t * 0.6) * 0.02;
      lampLight.intensity = 2.4 + Math.sin(t * 1.8) * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <style>{`
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
      `}</style>

      <GlitchOverlay active={glitching} onDone={onGlitchDone} />
      <WindowsDesktop
        visible={showDesktop}
        onBack={handleBack}
        onSignOut={handleSignOut}
      />

      <div
        ref={sectionRef}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          backgroundColor: "#25263a",
          overflow: "hidden",
        }}>
        <div
          ref={mountRef}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            pointerEvents: "none",
          }}>
          <span
            ref={textRef}
            style={{
              fontSize: "clamp(80px, 16vw, 220px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "transparent",
              WebkitTextStroke: "4px rgba(219,152,52,0.7)",
              userSelect: "none",
              lineHeight: 1,
              willChange: "transform",
              transition: "transform 0.05s linear",
            }}>
            PROJECTS
          </span>
        </div>
      </div>
    </>
  );
}

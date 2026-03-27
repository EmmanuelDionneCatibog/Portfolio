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

    // ─── Materials ───────────────────────────────────────────────────────────
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

    // ─── Helpers ─────────────────────────────────────────────────────────────
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

    // ─── Desk ────────────────────────────────────────────────────────────────
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

    // ─── Laptop ──────────────────────────────────────────────────────────────
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

    // ─── Papers ──────────────────────────────────────────────────────────────
    const paperDefs = [
      {
        x: -3,
        z: 0.2,
        ry: Math.PI / 2 + 0.05,
        pw: 1.35,
        pd: 1.05,
        yOffset: 0.012,
      },
      {
        x: -2.98,
        z: 0.21,
        ry: Math.PI / 2 + 0.12,
        pw: 1.3,
        pd: 1.0,
        yOffset: 0.024,
      },
      {
        x: -2.95,
        z: 0.19,
        ry: Math.PI / 2 - 0.08,
        pw: 1.28,
        pd: 0.98,
        yOffset: 0.036,
      },
      {
        x: -2.92,
        z: 0.22,
        ry: Math.PI / 2 + 0.22,
        pw: 1.25,
        pd: 0.95,
        yOffset: 0.048,
      },
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

    // ─── Lamp ────────────────────────────────────────────────────────────────
    const lamp = new THREE.Group();
    lamp.position.set(3.6, DESK_Y, -0.4);
    scene.add(lamp);
    lamp.add(cyl(0.3, 0.45, 0.07, 24, lampBaseMat, 0, 0.035, 0));
    lamp.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 0.11, 0));

    const lowerArm = new THREE.Group();
    lowerArm.position.set(0, 0.17, 0);
    lowerArm.rotation.z = -0.55;
    lamp.add(lowerArm);
    lowerArm.add(cyl(0.036, 0.036, 1.5, 10, lampArmMat, 0, 0.75, 0));
    lowerArm.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 1.5, 0));

    const upperArm = new THREE.Group();
    upperArm.position.set(0, 1.5, 0);
    upperArm.rotation.z = 1.1;
    lowerArm.add(upperArm);
    upperArm.add(cyl(0.032, 0.032, 1.2, 10, lampArmMat, 0, 0.6, 0));

    const head = new THREE.Group();
    head.position.set(-0.3, 1.2, 0);
    head.rotation.z = 1.4;
    upperArm.add(head);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.44, 24, 1, true),
      lampConeMat,
    );
    cone.rotation.x = Math.PI;
    cone.castShadow = true;
    cone.position.y = -0.22;
    head.add(cone);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      bulbMat,
    );
    bulb.position.y = -0.18;
    head.add(bulb);

    const connector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.15, 8),
      lampArmMat,
    );
    connector.position.y = -0.35;
    head.add(connector);

    // ─── Plant ───────────────────────────────────────────────────────────────
    const plant = new THREE.Group();
    plant.position.set(-2.7, DESK_Y, -1);
    scene.add(plant);

    const potBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.2, 0.45, 20),
      potMat,
    );
    potBody.position.y = 0.225;
    potBody.castShadow = true;
    potBody.receiveShadow = true;
    plant.add(potBody);

    const potRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.28, 0.06, 20),
      potRimMat,
    );
    potRim.position.y = 0.45 + 0.03;
    potRim.castShadow = true;
    plant.add(potRim);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.04, 20),
      soilMat,
    );
    soil.position.y = 0.47;
    plant.add(soil);

    plant.add(cyl(0.04, 0.045, 0.75, 12, stemMat, 0, 0.85, 0));

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
      if (rotationAxis === "x") branchGroup.rotation.x = angle;
      else if (rotationAxis === "z") branchGroup.rotation.z = angle;
      else if (rotationAxis === "y") branchGroup.rotation.y = angle;
      branchGroup.add(branchCyl);
      plant.add(branchGroup);
      return branchGroup;
    };

    const branchPoints = [
      { y: 0.65, angle: -0.4, length: 0.28, thickness: 0.022, axis: "x" },
      { y: 0.65, angle: 0.4, length: 0.28, thickness: 0.022, axis: "x" },
      { y: 0.85, angle: -0.5, length: 0.35, thickness: 0.025, axis: "x" },
      { y: 0.85, angle: 0.5, length: 0.35, thickness: 0.025, axis: "x" },
      { y: 1.05, angle: -0.45, length: 0.4, thickness: 0.028, axis: "x" },
      { y: 1.05, angle: 0.45, length: 0.4, thickness: 0.028, axis: "x" },
      { y: 1.2, angle: 0, length: 0.32, thickness: 0.03, axis: "x" },
      { y: 1.2, angle: Math.PI, length: 0.32, thickness: 0.03, axis: "x" },
    ];
    branchPoints.forEach((point) =>
      makeBranch(
        0,
        point.y,
        0,
        point.angle,
        point.length,
        point.thickness,
        point.axis,
      ),
    );

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
      if (isBranchTip) {
        const conn = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.015, 0.08, 6),
          stemMat,
        );
        conn.position.set(px * 0.7, py - 0.05, pz * 0.7);
        conn.rotation.set(rx * 0.5, ry, rz * 0.5);
        conn.castShadow = true;
        plant.add(conn);
      }
    };

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
    extraLeaves.forEach((leaf) =>
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
      ),
    );

    // ─── Lights ──────────────────────────────────────────────────────────────
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

    // ─── Floor & Walls ───────────────────────────────────────────────────────
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

    // ─── Grid lines ──────────────────────────────────────────────────────────
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

    // ═══════════════════════════════════════════════════════════════════════
    // HOME DECOR
    // ═══════════════════════════════════════════════════════════════════════

    // ── Bookshelf on left wall ───────────────────────────────────────────────
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x3d1f08,
      roughness: 0.75,
      metalness: 0.05,
    });
    const shelfPanelMat = new THREE.MeshStandardMaterial({
      color: 0x4a2810,
      roughness: 0.75,
    });

    const bookshelf = new THREE.Group();
    bookshelf.position.set(-10.8, floorY, -0.5);
    bookshelf.rotation.y = Math.PI / 2;
    scene.add(bookshelf);

    // Shelf unit sides, back, and shelves
    bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, -0.96, 2.0, 0)); // left side
    bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, 0.96, 2.0, 0)); // right side
    bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 0.05, 0)); // bottom
    bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 4.0, 0)); // top
    bookshelf.add(box(1.92, 4.0, 0.08, shelfPanelMat, 0, 2.0, -0.86)); // back panel
    // Shelves at intervals
    [1.1, 2.1, 3.0].forEach((sy) => {
      bookshelf.add(box(1.92, 0.08, 1.8, shelfMat, 0, sy, 0));
    });

    // Books on each shelf
    const bookColors = [
      0x8b1a1a, 0x1a4a8b, 0x2a7a2a, 0xb8860b, 0x6a0dad, 0xc0392b, 0x2980b9,
      0x27ae60, 0xe67e22, 0x8e44ad, 0xd4380d, 0x096dd9, 0x389e0d, 0xd48806,
      0x531dab,
    ];
    const shelfLevels = [0.18, 1.18, 2.18, 3.08];
    shelfLevels.forEach((sy, si) => {
      let xCursor = -0.85;
      const numBooks = 5 + (si % 3);
      for (let b = 0; b < numBooks && xCursor < 0.85; b++) {
        const bw = 0.1 + Math.random() * 0.08;
        const bh = 0.55 + Math.random() * 0.25;
        const tilt = (Math.random() - 0.5) * 0.08;
        const bMat = new THREE.MeshStandardMaterial({
          color: bookColors[(si * 5 + b) % bookColors.length],
          roughness: 0.8,
        });
        const book = box(
          bw - 0.015,
          bh,
          0.72,
          bMat,
          xCursor + bw / 2,
          sy + bh / 2,
          0,
          0,
          0,
          tilt,
        );
        bookshelf.add(book);
        // Spine highlight strip
        const spineMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.9,
          transparent: true,
          opacity: 0.18,
        });
        bookshelf.add(
          box(
            bw - 0.015,
            0.04,
            0.01,
            spineMat,
            xCursor + bw / 2,
            sy + bh * 0.7,
            -0.36,
          ),
        );
        xCursor += bw + 0.015;
      }
    });

    // Tiny vase on shelf
    const vaseMatS = new THREE.MeshStandardMaterial({
      color: 0x5c8a6e,
      roughness: 0.4,
      metalness: 0.2,
    });
    bookshelf.add(cyl(0.08, 0.06, 0.28, 12, vaseMatS, 0.7, 3.22, 0));
    bookshelf.add(cyl(0.13, 0.08, 0.04, 12, vaseMatS, 0.7, 3.38, 0));

    // Frame 1 — center
    const frameMat1 = new THREE.MeshStandardMaterial({
      color: 0x2c1a08,
      roughness: 0.6,
      metalness: 0.2,
    });
    const artMat1 = new THREE.MeshStandardMaterial({
      color: 0x0d1a2e,
      roughness: 0.95,
      emissive: 0x0a1828,
      emissiveIntensity: 0.3,
    });
    const frame1 = new THREE.Group();
    frame1.position.set(0, floorY + 5.5, backWallZ + 0.04);
    scene.add(frame1);
    frame1.add(box(2.0, 1.3, 0.06, frameMat1, 0, 0, 0)); // frame body
    frame1.add(box(1.78, 1.08, 0.04, artMat1, 0, 0, 0.02)); // canvas

    // Moon shape on art (glowing orb)
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e1,
      roughness: 0.3,
      emissive: 0xffe87c,
      emissiveIntensity: 0.6,
    });
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      moonMat,
    );
    moon.position.set(-0.28, 0.18, 0.05);
    moon.scale.set(1, 1, 0.15);
    frame1.add(moon);

    // Mountain silhouette inside frame
    const mtMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a40,
      roughness: 1,
    });
    [
      { x: -0.55, w: 0.5, h: 0.35 },
      { x: 0.1, w: 0.65, h: 0.5 },
      { x: 0.62, w: 0.4, h: 0.28 },
    ].forEach(({ x, w, h }) => {
      const geo = new THREE.ConeGeometry(w / 2, h, 3);
      const mt = new THREE.Mesh(geo, mtMat);
      mt.position.set(x, -0.28, 0.05);
      frame1.add(mt);
    });

    // Frame 2 — left of center
    const frameMat2 = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.5,
      metalness: 0.35,
    });
    const artMat2 = new THREE.MeshStandardMaterial({
      color: 0x1a0d0d,
      roughness: 0.95,
      emissive: 0x2a0a0a,
      emissiveIntensity: 0.15,
    });
    const frame2 = new THREE.Group();
    frame2.position.set(-3.8, floorY + 5.8, backWallZ + 0.04);
    scene.add(frame2);
    frame2.add(box(1.1, 0.9, 0.06, frameMat2, 0, 0, 0));
    frame2.add(box(0.92, 0.72, 0.04, artMat2, 0, 0, 0.02));

    const lineAccent = new THREE.MeshStandardMaterial({
      color: 0xdb9834,
      roughness: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    [-0.18, 0, 0.18].forEach((lx) => {
      frame2.add(box(0.04, 0.55, 0.01, lineAccent, lx, 0, 0.04));
    });

    // Frame 3 — right of center, portrait
    const frameMat3 = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const artMat3 = new THREE.MeshStandardMaterial({
      color: 0x050510,
      roughness: 0.98,
    });
    const frame3 = new THREE.Group();
    frame3.position.set(3.5, floorY + 5.6, backWallZ + 0.04);
    scene.add(frame3);
    frame3.add(box(0.85, 1.15, 0.06, frameMat3, 0, 0, 0));
    frame3.add(box(0.68, 0.98, 0.04, artMat3, 0, 0, 0.02));

    // Constellation dots inside frame 3
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.9,
    });
    const starPositions = [
      [0, 0.3],
      [-0.18, 0.1],
      [0.15, 0.05],
      [-0.08, -0.15],
      [0.2, -0.25],
      [-0.22, -0.3],
      [0.05, -0.38],
    ];
    starPositions.forEach(([sx, sy]) => {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        starMat,
      );
      star.position.set(sx, sy, 0.05);
      frame3.add(star);
    });

    // Curtains
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0x2a1840,
      roughness: 0.95,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const curtainRodMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.3,
      metalness: 0.9,
    });

    // Left curtain panel
    const makeWavyCurtain = (x, flip = false) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(x, floorY + wallH * 0.92, backWallZ + 0.06);
      scene.add(cGroup);

      // Curtain rod segment
      cGroup.add(box(2.2, 0.06, 0.06, curtainRodMat, 0, 0, 0));
      const finialMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.9,
      });
      cGroup.add(
        new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), finialMat),
      );
      const finial = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        finialMat,
      );
      finial.position.x = flip ? -1.1 : 1.1;
      cGroup.add(finial);

      // Curtain 
      const panelW = 0.35;
      const panelH = wallH * 0.85;
      for (let p = 0; p < 5; p++) {
        const px = (flip ? -1 : 1) * (p * (panelW + 0.02) - 0.7);
        const depth = Math.sin(p * 1.2) * 0.06;
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(panelW, panelH, 0.035),
          curtainMat,
        );
        panel.position.set(px, -panelH / 2, depth);
        panel.castShadow = true;
        cGroup.add(panel);
      }
    };
    makeWavyCurtain(-8.5, false);
    makeWavyCurtain(8.5, true);

    // Lamp 
    const floorLampGroup = new THREE.Group();
    floorLampGroup.position.set(9.5, floorY, -1.6);
    scene.add(floorLampGroup);

    const flLegMat = new THREE.MeshStandardMaterial({
      color: 0x333344,
      roughness: 0.3,
      metalness: 0.85,
    });
    const flShadeMat = new THREE.MeshStandardMaterial({
      color: 0xf5e6c8,
      roughness: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const flBulbMat = new THREE.MeshStandardMaterial({
      color: 0xfffce0,
      emissive: 0xfff5a0,
      emissiveIntensity: 1.4,
    });

    // Base
    floorLampGroup.add(cyl(0.28, 0.35, 0.08, 20, flLegMat, 0, 0.04, 0));
    // Pole
    floorLampGroup.add(cyl(0.038, 0.038, 4.2, 12, flLegMat, 0, 2.18, 0));
    // Shade
    const flShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 0.6, 24, 1, true),
      flShadeMat,
    );
    flShade.rotation.x = Math.PI;
    flShade.position.y = 4.5;
    floorLampGroup.add(flShade);
    // Shade top cap
    floorLampGroup.add(cyl(0.08, 0.08, 0.04, 16, flLegMat, 0, 4.82, 0));
    // Bulb
    const flBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      flBulbMat,
    );
    flBulb.position.y = 4.45;
    floorLampGroup.add(flBulb);

    // Warm point light from floor lamp
    const floorLampLight = new THREE.PointLight(0xfff3d0, 1.4, 10, 1.5);
    floorLampLight.position.set(9.5, floorY + 4.4, -1.6);
    scene.add(floorLampLight);

    // Sticky notes 
    const stickyColors = [0xfff176, 0xf48fb1, 0x80deea];
    [
      [2.8, DESK_Y + 0.04, 0.5, 0.05], // Lowered Y
      [-0.5, DESK_Y + 0.04, -0.9, -0.06], // Lowered Y
    ].forEach(([sx, sy, sz, rot], i) => {
      const sMat = new THREE.MeshStandardMaterial({
        color: stickyColors[i],
        roughness: 0.9,
      });
      const s = box(0.38, 0.005, 0.38, sMat, sx, sy, sz, 0, rot, 0);
      scene.add(s);
      // Tiny lines on sticky
      const lineMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.3,
      });
      [0.05, 0.11, 0.17].forEach((lz) => {
        const ln = box(
          0.28,
          0.004,
          0.012,
          lineMat,
          sx,
          sy + 0.003,
          sz - 0.08 + lz,
          0,
          rot,
          0,
        );
        scene.add(ln);
      });
    });

    // Pencil holder
    const holderGroup = new THREE.Group();
    holderGroup.position.set(-2.2, DESK_Y + 0.04, -0.7); // Moved left (x: -1.5 -> -2.2) and lowered Y
    scene.add(holderGroup);

    const holderMat = new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.7,
    });
    holderGroup.add(cyl(0.12, 0.1, 0.25, 16, holderMat, 0, 0.125, 0));

    // Pencils/pens
    const pencilColors = [0xffd700, 0xff6b6b, 0x6bcbff, 0xaaffaa, 0xffaaff];
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      const r = 0.06;
      const lean = 0.08;
      const pMat = new THREE.MeshStandardMaterial({
        color: pencilColors[p],
        roughness: 0.6,
      });
      const pencil = cyl(
        0.018,
        0.018,
        0.52,
        8,
        pMat,
        Math.sin(angle) * r,
        0.3,
        Math.cos(angle) * r,
        Math.sin(angle) * lean * -1.6,
        0,
        -Math.cos(angle) * lean * -1.6,
      );
      holderGroup.add(pencil);
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
      // Gently flicker floor lamp
      floorLampLight.intensity = 1.4 + Math.sin(t * 2.3 + 1) * 0.12;
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

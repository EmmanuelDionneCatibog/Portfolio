import * as THREE from "three";

// Helper functions
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
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, ch, seg), mat);
  m.position.set(px, py, pz);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

export function createDeskScene(scene) {
  const DESK_Y = 0;

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
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }),
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

  // ─── Desk ────────────────────────────────────────────────────────────────
  const deskGroup = new THREE.Group();
  scene.add(deskGroup);
  deskGroup.add(box(9, 0.18, 4, deskMat, 0, DESK_Y - 0.09, 0));
  [
    [-4.3, -1.5],
    [4.3, -1.5],
    [-4.3, 1.5],
    [4.3, 1.5],
  ].forEach(([x, z]) => {
    deskGroup.add(box(0.2, 2.8, 0.2, deskLegMat, x, DESK_Y - 0.09 - 1.4, z));
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
      cyl(0.055, 0.055, 0.38, 16, hingeMat, x, 0.055, -1.07, 0, 0, Math.PI / 2),
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

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), bulbMat);
  bulb.position.y = -0.18;
  head.add(bulb);

  const connector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.15, 8),
    lampArmMat,
  );
  connector.position.y = -0.35;
  head.add(connector);

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

  // ─── Paper Stack (Left Side) ─────────────────────────────────────────
  const paperStack = new THREE.Group();
  const papers = [
    {
      pw: 1.35,
      pd: 1.05,
      yOffset: 0.012,
      ry: Math.PI / 2 + 0.05,
      x: -3,
      z: 0.2,
    },
    {
      pw: 1.3,
      pd: 1.0,
      yOffset: 0.024,
      ry: Math.PI / 2 + 0.12,
      x: -2.98,
      z: 0.21,
    },
    {
      pw: 1.28,
      pd: 0.98,
      yOffset: 0.036,
      ry: Math.PI / 2 - 0.08,
      x: -2.95,
      z: 0.19,
    },
    {
      pw: 1.25,
      pd: 0.95,
      yOffset: 0.048,
      ry: Math.PI / 2 + 0.22,
      x: -2.92,
      z: 0.22,
    },
  ];
  papers.forEach((paper, i) => {
    const paperMesh = box(
      paper.pw,
      0.012,
      paper.pd,
      paperMats[i % paperMats.length],
      paper.x,
      DESK_Y + paper.yOffset,
      paper.z,
      0,
      paper.ry,
      0,
    );
    paperStack.add(paperMesh);
  });
  scene.add(paperStack);

  // ─── Sticky Note (Right Side) ─────────────────────────────────────────
  const stickyNote = new THREE.Group();
  const stickyMat = new THREE.MeshStandardMaterial({
    color: 0xfff176,
    roughness: 0.9,
  });
  const stickyMesh = box(
    0.38,
    0.005,
    0.38,
    stickyMat,
    2.8,
    DESK_Y,
    0.5,
    0,
    0.05,
    0,
  );
  stickyNote.add(stickyMesh);

  const lineMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.3,
  });
  [0.05, 0.11, 0.17].forEach((lz) => {
    const line = box(
      0.28,
      0.004,
      0.012,
      lineMat,
      2.8,
      DESK_Y + 0.043,
      0.5 - 0.08 + lz,
      0,
      0.05,
      0,
    );
    stickyNote.add(line);
  });
  scene.add(stickyNote);

  // ─── Pencil holder ────────────────────────────────────────────────
  const holderGroup = new THREE.Group();
  holderGroup.position.set(-2.2, DESK_Y + 0.04, -0.7);
  scene.add(holderGroup);

  const holderMat = new THREE.MeshStandardMaterial({
    color: 0x5c3317,
    roughness: 0.7,
  });
  holderGroup.add(cyl(0.12, 0.1, 0.25, 16, holderMat, 0, 0.125, 0));

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

  return { deskGroup, laptop, lampLight, screenMat, paperStack, stickyNote };
}

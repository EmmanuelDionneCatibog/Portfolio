import * as THREE from "three";

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

export function createRoomScene(scene) {
  const DESK_Y = 0;
  const floorY = DESK_Y - 0.09 - 2.8;
  const wallH = 10;
  const wallW = 24;
  const wallD = 20;
  const backWallZ = -2.1;

  // Root group so the whole room can be scaled uniformly
  const roomRoot = new THREE.Group();
  scene.add(roomRoot);

  // ─── Floor & Walls ───────────────────────────────────────────────────────
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = DESK_Y - 0.09 - 2.8;
  floor.receiveShadow = true;
  roomRoot.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c2c,
    roughness: 1,
    metalness: 0,
  });

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(wallW, wallH),
    wallMat,
  );
  backWall.position.set(0, floorY + wallH / 2, backWallZ);
  backWall.receiveShadow = true;
  roomRoot.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(wallD, wallH),
    wallMat,
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-wallW / 2, floorY + wallH / 2, 0);
  leftWall.receiveShadow = true;
  roomRoot.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(wallD, wallH),
    wallMat,
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(wallW / 2, floorY + wallH / 2, 0);
  rightWall.receiveShadow = true;
  roomRoot.add(rightWall);

  // ─── Grid lines ──────────────────────────────────────────────────────────
  const fadedLineMat = new THREE.MeshBasicMaterial({
    color: 0xdb9834,
    transparent: true,
    opacity: 0.28,
  });
  const wallLine = (w, h, d, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fadedLineMat);
    m.position.set(px, py, pz);
    roomRoot.add(m);
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
    roomRoot.add(m);
  }
  for (let i = -4; i <= 4; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.01, wallD),
      floorGridMat,
    );
    m.position.set(i * 2.5, floorY + 0.005, 0);
    roomRoot.add(m);
  }

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
  bookshelf.position.set(-5.6, floorY, -0.5);
  bookshelf.rotation.y = 0;
  roomRoot.add(bookshelf);

  bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, -0.96, 2.0, 0));
  bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, 0.96, 2.0, 0));
  bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 0.05, 0));
  bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 4.0, 0));
  bookshelf.add(box(1.92, 4.0, 0.08, shelfPanelMat, 0, 2.0, -0.86));
  [1.1, 2.1, 3.0].forEach((sy) => {
    bookshelf.add(box(1.92, 0.08, 1.8, shelfMat, 0, sy, 0));
  });

  const bookColors = [
    0x8b1a1a, 0x1a4a8b, 0x2a7a2a, 0xb8860b, 0x6a0dad, 0xc0392b, 0x2980b9,
    0x27ae60, 0xe67e22, 0x8e44ad, 0xd4380d, 0x096dd9, 0x389e0d, 0xd48806,
    0x531dab,
  ];
  const getRandomBookColor = (lastColor) => {
    let nextColor = bookColors[Math.floor(Math.random() * bookColors.length)];
    while (bookColors.length > 1 && nextColor === lastColor) {
      nextColor = bookColors[Math.floor(Math.random() * bookColors.length)];
    }
    return nextColor;
  };
  const shelfLevels = [0.18, 1.18, 2.18, 3.08];
  shelfLevels.forEach((sy, si) => {
    let xCursor = -0.85;
    const numBooks = 5 + (si % 3);
    let lastColor = null;
    for (let b = 0; b < numBooks && xCursor < 0.85; b++) {
      const bw = 0.1 + Math.random() * 0.08;
      const bh = 0.55 + Math.random() * 0.25;
      const tilt = (Math.random() - 0.5) * 0.08;
      const bookColor = getRandomBookColor(lastColor);
      lastColor = bookColor;
      const bMat = new THREE.MeshStandardMaterial({
        color: bookColor,
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

  const vaseMatS = new THREE.MeshStandardMaterial({
    color: 0x5c8a6e,
    roughness: 0.4,
    metalness: 0.2,
  });
  bookshelf.add(cyl(0.08, 0.06, 0.28, 12, vaseMatS, 0.7, 3.22, 0));
  bookshelf.add(cyl(0.13, 0.08, 0.04, 12, vaseMatS, 0.7, 3.38, 0));

  const decorBookColors = [0x7a2323, 0x1d3f73, 0x9a6b18, 0x385b32];
  decorBookColors.forEach((color, i) => {
    const accentMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
    });
    bookshelf.add(
      box(
        0.42,
        0.08,
        0.56,
        accentMat,
        -0.55 + i * 0.24,
        4.12 + i * 0.02,
        -0.05 + i * 0.02,
        0.02 * i,
        0.12 - i * 0.04,
        0,
      ),
    );
  });

  const planterMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.82,
  });
  const planterRimMat = new THREE.MeshStandardMaterial({
    color: 0x71431c,
    roughness: 0.78,
  });
  const plantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x3f7f45,
    roughness: 0.84,
    side: THREE.DoubleSide,
  });
  const cabinetStemMat = new THREE.MeshStandardMaterial({
    color: 0x2e5a2e,
    roughness: 0.8,
  });
  const cabinetPlant = new THREE.Group();
  cabinetPlant.position.set(-0.62, 4.1, 0.48);
  bookshelf.add(cabinetPlant);
  cabinetPlant.add(cyl(0.14, 0.11, 0.22, 18, planterMat, 0, 0.11, 0));
  cabinetPlant.add(cyl(0.16, 0.14, 0.035, 18, planterRimMat, 0, 0.235, 0));
  cabinetPlant.add(cyl(0.035, 0.04, 0.42, 10, cabinetStemMat, 0, 0.44, 0));
  [
    [-0.12, 0.52, 0.02, -0.28],
    [0.13, 0.58, -0.02, 0.32],
    [-0.1, 0.68, -0.04, -0.18],
    [0.12, 0.74, 0.03, 0.2],
    [0, 0.82, -0.05, 0],
  ].forEach(([px, py, pz, ry]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), plantLeafMat);
    leaf.scale.set(0.45, 0.14, 0.9);
    leaf.position.set(px, py, pz);
    leaf.rotation.set(-0.25, ry, 0);
    leaf.castShadow = true;
    cabinetPlant.add(leaf);
  });

  const sculptureMat = new THREE.MeshStandardMaterial({
    color: 0xb9bcc4,
    roughness: 0.34,
    metalness: 0.75,
  });
  const sculptureBaseMat = new THREE.MeshStandardMaterial({
    color: 0x272733,
    roughness: 0.68,
  });
  const sculpture = new THREE.Group();
  sculpture.position.set(0.5, 4.1, 0.38);
  bookshelf.add(sculpture);
  sculpture.add(box(0.42, 0.06, 0.28, sculptureBaseMat, 0, 0.03, 0));
  sculpture.add(cyl(0.03, 0.03, 0.34, 12, sculptureMat, 0, 0.22, 0));
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), sculptureMat);
  orb.position.set(0, 0.45, 0);
  orb.castShadow = true;
  sculpture.add(orb);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.024, 10, 24),
    sculptureMat,
  );
  ring.position.set(0, 0.45, 0);
  ring.rotation.set(Math.PI / 3.2, 0.2, 0.4);
  ring.castShadow = true;
  sculpture.add(ring);

  const floorPlantPotMat = new THREE.MeshStandardMaterial({
    color: 0x7a4725,
    roughness: 0.82,
  });
  const floorPlantRimMat = new THREE.MeshStandardMaterial({
    color: 0x5f3318,
    roughness: 0.78,
  });
  const floorPlantStemMat = new THREE.MeshStandardMaterial({
    color: 0x315f2a,
    roughness: 0.82,
  });
  const floorPlantLeafMat = new THREE.MeshStandardMaterial({
    color: 0x4c8d3f,
    roughness: 0.86,
    side: THREE.DoubleSide,
  });
  const floorPlantLeafDarkMat = new THREE.MeshStandardMaterial({
    color: 0x32652b,
    roughness: 0.88,
    side: THREE.DoubleSide,
  });
  const floorPlant = new THREE.Group();
  floorPlant.position.set(6.2, floorY, 0.25);
  roomRoot.add(floorPlant);
  floorPlant.add(cyl(0.46, 0.34, 0.78, 22, floorPlantPotMat, 0, 0.39, 0));
  floorPlant.add(cyl(0.5, 0.46, 0.08, 22, floorPlantRimMat, 0, 0.78, 0));
  floorPlant.add(cyl(0.4, 0.4, 0.08, 20, shelfPanelMat, 0, 0.79, 0));
  floorPlant.add(cyl(0.065, 0.09, 2.45, 12, floorPlantStemMat, 0, 1.98, 0));
  [
    { x: -0.42, y: 1.45, z: 0.1, ry: -0.9, rz: -0.28, s: 1.45, mat: floorPlantLeafMat },
    { x: 0.46, y: 1.58, z: -0.06, ry: 0.85, rz: 0.26, s: 1.52, mat: floorPlantLeafDarkMat },
    { x: -0.28, y: 1.95, z: -0.16, ry: -0.5, rz: -0.18, s: 1.35, mat: floorPlantLeafDarkMat },
    { x: 0.26, y: 2.15, z: 0.18, ry: 0.42, rz: 0.18, s: 1.4, mat: floorPlantLeafMat },
    { x: -0.18, y: 2.42, z: 0.12, ry: -0.18, rz: -0.06, s: 1.3, mat: floorPlantLeafMat },
    { x: 0.16, y: 2.62, z: -0.12, ry: 0.2, rz: 0.08, s: 1.25, mat: floorPlantLeafDarkMat },
    { x: -0.12, y: 2.88, z: -0.04, ry: Math.PI + 0.18, rz: -0.02, s: 1.16, mat: floorPlantLeafMat },
    { x: 0.1, y: 3.08, z: 0.08, ry: Math.PI - 0.16, rz: 0.04, s: 1.12, mat: floorPlantLeafDarkMat },
    { x: -0.04, y: 3.26, z: -0.06, ry: 0, rz: -0.03, s: 1.04, mat: floorPlantLeafMat },
    { x: 0.02, y: 3.46, z: 0.02, ry: Math.PI, rz: 0.02, s: 0.96, mat: floorPlantLeafDarkMat },
  ].forEach(({ x, y, z, ry, rz, s, mat }) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), mat);
    leaf.scale.set(0.5 * s, 0.14 * s, 1.95 * s);
    leaf.position.set(x, y, z);
    leaf.rotation.set(-0.22, ry, rz);
    leaf.castShadow = true;
    floorPlant.add(leaf);
  });

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x5a341b,
    roughness: 0.82,
  });
  const crate = new THREE.Group();
  crate.position.set(7.8, floorY, 2.85);
  crate.rotation.y = -0.18;
  roomRoot.add(crate);
  crate.add(box(1.1, 0.1, 0.9, crateMat, 0, 0.05, 0));
  crate.add(box(1.1, 0.8, 0.08, crateMat, 0, 0.45, -0.41));
  crate.add(box(1.1, 0.8, 0.08, crateMat, 0, 0.45, 0.41));
  crate.add(box(0.08, 0.8, 0.9, crateMat, -0.51, 0.45, 0));
  crate.add(box(0.08, 0.8, 0.9, crateMat, 0.51, 0.45, 0));
  decorBookColors.slice(0, 3).forEach((color, i) => {
    crate.add(
      box(
        0.18,
        0.56 + i * 0.05,
        0.58,
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
        -0.28 + i * 0.23,
        0.38 + i * 0.03,
        0,
        0,
        0,
        (i - 1) * 0.05,
      ),
    );
  });

  // ── Framed art on back wall ──────────────────────────────────────────────
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
  roomRoot.add(frame1);
  frame1.add(box(2.0, 1.3, 0.06, frameMat1, 0, 0, 0));
  frame1.add(box(1.78, 1.08, 0.04, artMat1, 0, 0, 0.02));

  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e1,
    roughness: 0.3,
    emissive: 0xffe87c,
    emissiveIntensity: 0.6,
  });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), moonMat);
  moon.position.set(-0.28, 0.18, 0.05);
  moon.scale.set(1, 1, 0.15);
  frame1.add(moon);

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
  frame2.position.set(-3.8, floorY + 5.4, backWallZ + 0.04);
  roomRoot.add(frame2);
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
  roomRoot.add(frame3);
  frame3.add(box(0.85, 1.15, 0.06, frameMat3, 0, 0, 0));
  frame3.add(box(0.68, 0.98, 0.04, artMat3, 0, 0, 0.02));

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
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), starMat);
    star.position.set(sx, sy, 0.05);
    frame3.add(star);
  });

  return { roomRoot, floorY, backWallZ, wallH, wallW };
}

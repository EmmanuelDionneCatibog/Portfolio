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

  const shelfLevels = [0.18, 1.18, 2.18, 3.08];
  const leftBookColors = [
    0x8b1a1a, 0x1a4a8b, 0x2a7a2a, 0xb8860b, 0x6a0dad, 0xc0392b, 0x2980b9,
    0x27ae60, 0xe67e22, 0x8e44ad, 0xd4380d, 0x096dd9, 0x389e0d, 0xd48806,
    0x531dab,
  ];
  const rightBookColors = [
    0x7b2c3b, 0x2f4858, 0x586f7c, 0xbc6c25, 0x6b705c, 0x9a031e, 0x355070,
    0x588157, 0xe09f3e, 0x7f5539, 0x8338ec, 0x3a86ff, 0xff006e, 0xfb5607,
    0x6d597a,
  ];
  const sculptureMat = new THREE.MeshStandardMaterial({
    color: 0xb9bcc4,
    roughness: 0.34,
    metalness: 0.75,
  });
  const sculptureBaseMat = new THREE.MeshStandardMaterial({
    color: 0x272733,
    roughness: 0.68,
  });

  const buildBookshelf = ({
    x,
    z,
    mirror = false,
    bookColors,
    decorColors,
    vaseColor,
  }) => {
    const bookshelf = new THREE.Group();
    bookshelf.position.set(x, floorY, z);
    if (mirror) bookshelf.scale.x = -1;
    roomRoot.add(bookshelf);

    bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, -0.96, 2.0, 0));
    bookshelf.add(box(0.12, 4.0, 1.8, shelfMat, 0.96, 2.0, 0));
    bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 0.05, 0));
    bookshelf.add(box(1.92, 0.1, 1.8, shelfMat, 0, 4.0, 0));
    bookshelf.add(box(1.92, 4.0, 0.08, shelfPanelMat, 0, 2.0, -0.86));
    [1.1, 2.1, 3.0].forEach((sy) => {
      bookshelf.add(box(1.92, 0.08, 1.8, shelfMat, 0, sy, 0));
    });

    const getRandomBookColor = (lastColor) => {
      let nextColor = bookColors[Math.floor(Math.random() * bookColors.length)];
      while (bookColors.length > 1 && nextColor === lastColor) {
        nextColor = bookColors[Math.floor(Math.random() * bookColors.length)];
      }
      return nextColor;
    };

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

    if (!mirror) {
      const vaseMatS = new THREE.MeshStandardMaterial({
        color: vaseColor,
        roughness: 0.4,
        metalness: 0.2,
      });
      bookshelf.add(cyl(0.08, 0.06, 0.28, 12, vaseMatS, 0.7, 3.22, 0));
      bookshelf.add(cyl(0.13, 0.08, 0.04, 12, vaseMatS, 0.7, 3.38, 0));

      decorColors.forEach((color, i) => {
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
            4.09 + i * 0.02,
            -0.05 + i * 0.02,
            0.02 * i,
            0.12 - i * 0.04,
            0,
          ),
        );
      });

      const sculpture = new THREE.Group();
      sculpture.position.set(0.5, 4.05, 0.38);
      bookshelf.add(sculpture);
      sculpture.add(box(0.42, 0.06, 0.28, sculptureBaseMat, 0, 0.03, 0));
      sculpture.add(cyl(0.03, 0.03, 0.34, 12, sculptureMat, 0, 0.22, 0));
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        sculptureMat,
      );
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
    }
  };

  buildBookshelf({
    x: -5.6,
    z: -0.5,
    bookColors: leftBookColors,
    decorColors: [0x7a2323, 0x1d3f73, 0x9a6b18, 0x385b32],
    vaseColor: 0x5c8a6e,
  });

  buildBookshelf({
    x: 5.6,
    z: -0.5,
    mirror: true,
    bookColors: rightBookColors,
    decorColors: [0x264653, 0x9c6644, 0x6b705c, 0xb56576],
    vaseColor: 0x6c7f93,
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

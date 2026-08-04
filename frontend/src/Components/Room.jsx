import * as THREE from "three";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const brighten = (hex, deltaL) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, deltaL);
  return c;
};

const makeBookCoverTexture = ({
  baseColor,
  seed = Math.random() * 1e9,
  w = 96,
  h = 256,
}) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const base = new THREE.Color(baseColor);
  const accent = base.clone().offsetHSL(0, -0.08, 0.12);
  const accent2 = base.clone().offsetHSL(0, -0.06, 0.06);

  // Subtle vertical lighting gradient (gives "roundness").
  const top = brighten(baseColor, 0.08);
  const mid = new THREE.Color(baseColor);
  const bot = brighten(baseColor, -0.08);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `#${top.getHexString()}`);
  grad.addColorStop(0.5, `#${mid.getHexString()}`);
  grad.addColorStop(1, `#${bot.getHexString()}`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Edge vignette to pop silhouette a bit.
  const edge = ctx.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, "rgba(0,0,0,0.22)");
  edge.addColorStop(0.12, "rgba(0,0,0,0.0)");
  edge.addColorStop(0.88, "rgba(0,0,0,0.0)");
  edge.addColorStop(
    1,
    `rgba(${Math.round(accent.r * 255)},${Math.round(accent.g * 255)},${Math.round(accent.b * 255)},0.07)`,
  );
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);

  // Small title band + thin lines (simple detail).
  const bandY = Math.floor(h * (0.18 + ((seed % 1000) / 1000) * 0.55));
  const bandH = Math.floor(h * 0.12);
  ctx.fillStyle = `rgba(${Math.round(accent2.r * 255)},${Math.round(accent2.g * 255)},${Math.round(accent2.b * 255)},0.18)`;
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, bandY - 1, w, 1);
  ctx.fillRect(0, bandY + bandH, w, 1);

  // Fine noise/grain (texture so it doesn't look flat).
  const noise = ctx.getImageData(0, 0, w, h);
  const data = noise.data;
  let s = seed | 0;
  const rand = () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 28; // [-14..14]
    data[i] = clamp01((data[i] + n) / 255) * 255;
    data[i + 1] = clamp01((data[i + 1] + n) / 255) * 255;
    data[i + 2] = clamp01((data[i + 2] + n) / 255) * 255;
    // alpha unchanged
  }
  ctx.putImageData(noise, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
};

const makeBookMaterials = ({ baseColor, seed }) => {
  const coverTex = makeBookCoverTexture({ baseColor, seed });

  const pagesColor = brighten(baseColor, -0.22).getHex();
  const pagesMat = new THREE.MeshStandardMaterial({
    color: pagesColor,
    roughness: 0.95,
    metalness: 0,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: brighten(baseColor, -0.12).getHex(),
    roughness: 0.9,
    metalness: 0.02,
  });

  const coverMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: coverTex,
    roughness: 0.7,
    metalness: 0.05,
  });

  // BoxGeometry groups: +x, -x, +y, -y, +z, -z
  // We want the visible "spine/cover" to face the camera (+z).
  return [pagesMat, pagesMat, pagesMat, pagesMat, coverMat, backMat];
};

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
  const DESK_X = -5.4;
  const floorY = DESK_Y - 0.09 - 2.8;
  const wallH = 10;
  const wallW = 24;
  const wallD = 20;
  // Room layout (matches the top-down sketch):
  // - Back wall close behind the computer area
  // - Deep room extending forward to the door/cabinet
  const backWallZ = -2.1;
  const frontWallZ = backWallZ + wallD;
  const roomCenterZ = (backWallZ + frontWallZ) / 2;

  const makeRng = (seed) => {
    let s = seed | 0;
    return () => {
      // xorshift32
      s ^= s << 13;
      s ^= s >> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  };

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
  floor.position.z = roomCenterZ;
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
  leftWall.position.set(-wallW / 2, floorY + wallH / 2, roomCenterZ);
  leftWall.receiveShadow = true;
  roomRoot.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(wallD, wallH),
    wallMat,
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(wallW / 2, floorY + wallH / 2, roomCenterZ);
  rightWall.receiveShadow = true;
  roomRoot.add(rightWall);

  // Close the room when the camera turns around.
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(wallW, wallH),
    wallMat,
  );
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, floorY + wallH / 2, frontWallZ);
  frontWall.receiveShadow = true;
  roomRoot.add(frontWall);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: 0x141422,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = floorY + wallH;
  ceiling.position.z = roomCenterZ;
  ceiling.receiveShadow = true;
  roomRoot.add(ceiling);

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
    wallLine(0.01, 0.025, wallD, lwX, floorY + 1.5 + i * 1.6, roomCenterZ);
  for (let i = -3; i <= 3; i++)
    wallLine(
      0.01,
      wallH,
      0.025,
      lwX,
      floorY + wallH / 2,
      roomCenterZ + i * 2.8,
    );
  const rwX = wallW / 2 - 0.02;
  for (let i = 0; i < 5; i++)
    wallLine(0.01, 0.025, wallD, rwX, floorY + 1.5 + i * 1.6, roomCenterZ);
  for (let i = -3; i <= 3; i++)
    wallLine(
      0.01,
      wallH,
      0.025,
      rwX,
      floorY + wallH / 2,
      roomCenterZ + i * 2.8,
    );

  const floorGridMat = new THREE.MeshBasicMaterial({
    color: 0xdb9834,
    transparent: true,
    opacity: 0.12,
  });
  for (let i = 0; i <= Math.floor(wallD / 2.8); i++) {
    const z = backWallZ + 1.4 + i * 2.8;
    if (z > frontWallZ - 1.2) break;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(wallW, 0.01, 0.025),
      floorGridMat,
    );
    m.position.set(0, floorY + 0.005, z);
    roomRoot.add(m);
  }
  for (let i = -4; i <= 4; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.01, wallD),
      floorGridMat,
    );
    m.position.set(i * 2.5, floorY + 0.005, roomCenterZ);
    roomRoot.add(m);
  }

  // ─── Furniture + extra detail (fills out the room) ────────────────────────
  {
    // Door on the front wall
    const doorGroup = new THREE.Group();
    doorGroup.position.set(9.9, floorY + 2.35, frontWallZ - 0.06);
    roomRoot.add(doorGroup);

    const doorFrameMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3c,
      roughness: 0.8,
      metalness: 0.1,
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x5a3a1a,
      roughness: 0.75,
      metalness: 0.05,
    });
    const knobMat = new THREE.MeshStandardMaterial({
      color: 0xd6a34a,
      roughness: 0.25,
      metalness: 0.85,
    });

    doorGroup.add(box(2.32, 4.96, 0.12, doorFrameMat, 0, 0, -0.03));
    doorGroup.add(box(2.08, 4.72, 0.1, doorMat, 0, 0, 0));
    // Simple inset panels
    doorGroup.add(box(1.6, 1.4, 0.04, doorFrameMat, 0, 1.1, 0.055));
    doorGroup.add(box(1.6, 1.6, 0.04, doorFrameMat, 0, -0.9, 0.055));
    doorGroup.add(
      cyl(0.07, 0.07, 0.18, 14, knobMat, 0.78, -0.15, 0.07, 0, 0, Math.PI / 2),
    );

    // Bed against the left wall (rotated CCW)
    const BED_W = 7.4;
    const BED_L = 10.2;
    const bedGroup = new THREE.Group();
    bedGroup.rotation.y = Math.PI / 2;
    bedGroup.position.set(
      -wallW / 2 + BED_L / 2 + 0.18,
      floorY,
      backWallZ + 11,
    );
    roomRoot.add(bedGroup);

    const bedFrameMat = new THREE.MeshStandardMaterial({
      color: 0x2b1a0d,
      roughness: 0.85,
      metalness: 0.05,
    });
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
    });
    const pillowMat = new THREE.MeshStandardMaterial({
      color: 0xe8edf6,
      roughness: 0.9,
    });

    bedGroup.add(box(BED_W, 0.36, BED_L, bedFrameMat, 0, 0.18, 0));
    bedGroup.add(
      box(BED_W - 0.35, 0.42, BED_L - 0.35, sheetMat, 0, 0.58, -0.04),
    );
    bedGroup.add(box(BED_W, 1.4, 0.22, bedFrameMat, 0, 0.92, -BED_L / 2 + 0.2)); // headboard
    bedGroup.add(
      box(
        2.6,
        0.25,
        1.2,
        pillowMat,
        -1.55,
        0.84,
        -BED_L / 2 + 1.35,
        0.02,
        0.08,
        0,
      ),
    );
    bedGroup.add(
      box(
        2.6,
        0.25,
        1.2,
        pillowMat,
        1.55,
        0.84,
        -BED_L / 2 + 1.35,
        -0.02,
        -0.06,
        0,
      ),
    );
    bedGroup.add(
      box(BED_W - 0.4, 0.18, 3.9, sheetMat, 0, 0.85, 2.2, 0.03, 0, 0),
    );

    // Rug to break up the floor (under bed zone)
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(10.5, 6.8),
      new THREE.MeshStandardMaterial({
        color: 0x1a0f0f,
        roughness: 1,
        metalness: 0,
      }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-wallW / 2 + 5.6, floorY + 0.008, backWallZ + 11);
    rug.receiveShadow = true;
    roomRoot.add(rug);

    // Ceiling gridlines (aligned with floor gridlines).
    const roofGridMat = floorGridMat.clone();
    roofGridMat.opacity = 0.08;
    const roofGridY = floorY + wallH - 0.03;
    for (let i = -3; i <= 3; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(wallW, 0.01, 0.025),
        roofGridMat,
      );
      m.position.set(0, roofGridY, i * 2.8);
      roomRoot.add(m);
    }
    for (let i = -4; i <= 4; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.01, wallD),
        roofGridMat,
      );
      m.position.set(i * 2.5, roofGridY, 0);
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
        let nextColor =
          bookColors[Math.floor(Math.random() * bookColors.length)];
        while (bookColors.length > 1 && nextColor === lastColor) {
          nextColor = bookColors[Math.floor(Math.random() * bookColors.length)];
        }
        return nextColor;
      };

      shelfLevels.forEach((sy, si) => {
        const rand = makeRng(
          (mirror ? 0x6d597a : 0x531dab) ^
            ((si + 1) * 1103515245) ^
            ((x * 97) | 0),
        );

        let xCursor = -0.85 + (rand() - 0.5) * 0.08;
        const numBooks = 4 + (si % 3) + (mirror ? 1 : 0);
        let lastColor = null;

        // Occasionally add a horizontal stack for variety.
        const stackChance = mirror ? 0.55 : 0.32;
        const addStack = rand() < stackChance && si !== 0;
        const stackSide = mirror ? -1 : 1;
        if (addStack) {
          const stackCount = 2 + Math.floor(rand() * 2);
          const stackW = 0.62 + rand() * 0.2;
          const stackX = 0.55 * stackSide;
          for (let s = 0; s < stackCount; s++) {
            const bookColor = getRandomBookColor(lastColor);
            lastColor = bookColor;
            const seed =
              (si + 1) * 100000 + (s + 20) * 97 + (mirror ? 1337 : 17);
            const bMat = makeBookMaterials({ baseColor: bookColor, seed });
            bookshelf.add(
              box(
                stackW,
                0.1 + rand() * 0.03,
                0.72 + (rand() - 0.5) * 0.05,
                bMat,
                stackX,
                sy + 0.06 + s * 0.11,
                (rand() - 0.5) * 0.08,
                0,
                0,
                (rand() - 0.5) * 0.14,
              ),
            );
          }
        }

        for (let b = 0; b < numBooks && xCursor < 0.85; b++) {
          const bw = 0.1 + rand() * 0.09;
          const bh = 0.55 + rand() * 0.28;
          const tilt = (rand() - 0.5) * 0.14;
          const yaw = (rand() - 0.5) * 0.08;
          const zShift = (rand() - 0.5) * 0.08;
          const yJitter = (rand() - 0.5) * 0.02;
          const bookColor = getRandomBookColor(lastColor);
          lastColor = bookColor;
          const seed = (si + 1) * 100000 + b * 97 + (mirror ? 99991 : 12347);
          const bMat = makeBookMaterials({ baseColor: bookColor, seed });
          const book = box(
            bw - 0.015,
            bh,
            0.72,
            bMat,
            xCursor + bw / 2,
            sy + bh / 2 + yJitter,
            zShift,
            0,
            yaw,
            tilt * (mirror ? -1 : 1),
          );
          bookshelf.add(book);

          // Soft highlight strip on the visible face so books feel less "flat".
          const highlightColor = brighten(bookColor, 0.18).getHex();
          const highlightMat = new THREE.MeshStandardMaterial({
            color: highlightColor,
            roughness: 0.2,
            metalness: 0,
            transparent: true,
            opacity: 0.08,
            depthWrite: false,
          });
          bookshelf.add(
            box(
              Math.min(0.03, Math.max(0.016, (bw - 0.015) * 0.22)),
              bh * 0.88,
              0.006,
              highlightMat,
              xCursor + bw / 2 - (bw - 0.015) * 0.28,
              sy + bh / 2 + yJitter,
              0.36 + zShift * 0.4 + 0.004,
            ),
          );
          xCursor += bw + 0.015 + rand() * 0.012;
        }
      });

      const decorSide = mirror ? -1 : 1;
      const decorRand = makeRng(
        (mirror ? 0x2f4858 : 0x1a4a8b) ^ ((x * 100) | 0),
      );

      const vaseMatS = new THREE.MeshStandardMaterial({
        color: vaseColor,
        roughness: 0.4,
        metalness: 0.2,
      });
      bookshelf.add(
        cyl(0.08, 0.06, 0.28, 12, vaseMatS, 0.7 * decorSide, 3.22, 0.02),
      );
      bookshelf.add(
        cyl(0.13, 0.08, 0.04, 12, vaseMatS, 0.7 * decorSide, 3.38, 0.02),
      );

      decorColors.forEach((color, i) => {
        const accentMat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.78,
        });
        const xBase = (-0.55 + i * 0.24) * decorSide;
        bookshelf.add(
          box(
            0.42,
            0.08,
            0.56,
            accentMat,
            xBase + (decorRand() - 0.5) * 0.05,
            4.09 + i * 0.02,
            -0.05 + i * 0.02,
            0.02 * i,
            (0.12 - i * 0.04) * decorSide,
            0,
          ),
        );
      });

      const sculpture = new THREE.Group();
      sculpture.position.set(0.5 * -decorSide, 4.05, 0.38);
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
    };

    buildBookshelf({
      x: -10.85,
      z: backWallZ + 0.85,
      bookColors: leftBookColors,
      decorColors: [0x7a2323, 0x1d3f73, 0x9a6b18, 0x385b32],
      vaseColor: 0x5c8a6e,
    });

    buildBookshelf({
      x: 0.25,
      z: backWallZ + 0.85,
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
    frame1.position.set(DESK_X, floorY + 5.3, backWallZ + 0.04);
    roomRoot.add(frame1);
    frame1.add(box(2.0, 1.3, 0.06, frameMat1, 0, 0, 0));
    frame1.add(box(1.78, 1.08, 0.04, artMat1, 0, 0, 0.02));

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
    frame2.position.set(DESK_X - 2.8, floorY + 5.3, backWallZ + 0.04);
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
    frame3.position.set(-2.6, floorY + 5.3, backWallZ + 0.04);
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
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        starMat,
      );
      star.position.set(sx, sy, 0.05);
      frame3.add(star);
    });

    return { roomRoot, floorY, backWallZ, wallH, wallW };
  }
}

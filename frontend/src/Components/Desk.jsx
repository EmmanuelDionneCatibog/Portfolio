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

const addKeyboardKey = (
  parent,
  {
    width,
    depth,
    x,
    z,
    y,
    material,
    height = 0.04,
    inset = 0.018,
  },
) => {
  parent.add(box(Math.max(0.04, width - inset), height, depth, material, x, y, z));
};

const createWoodTexture = (baseHex, grainHex) => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = `#${baseHex.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    const alpha = 0.06 + ((Math.sin(y * 0.12) + 1) * 0.5) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y, size, 1);
  }

  ctx.strokeStyle = `#${grainHex.toString(16).padStart(6, "0")}`;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 34; i++) {
    const y = (i / 34) * size;
    ctx.globalAlpha = 0.18 + (i % 4) * 0.03;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 24) {
      const offset = Math.sin((x + i * 13) * 0.05) * 4;
      ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8, 1.4);
  texture.anisotropy = 4;
  return texture;
};

export function createDeskScene(scene) {
  const DESK_Y = 0;
  const deskWoodMap = createWoodTexture(0x3d1f08, 0x6a3a16);
  const deskLegWoodMap = createWoodTexture(0x4a2810, 0x73401a);

  // Materials
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
    color: 0x3d1f08,
    roughness: 0.75,
    map: deskWoodMap,
  });
  const deskLegMat = new THREE.MeshStandardMaterial({
    color: 0x4a2810,
    roughness: 0.75,
    map: deskLegWoodMap,
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

  // Root group — scale this to make the whole scene responsive
  const sceneRoot = new THREE.Group();
  scene.add(sceneRoot);

  // Desk
  const deskGroup = new THREE.Group();
  sceneRoot.add(deskGroup);
  deskGroup.add(box(9, 0.18, 4, deskMat, 0, DESK_Y - 0.09, 0));
  [
    [-4.3, -1.5],
    [4.3, -1.5],
    [-4.3, 1.5],
    [4.3, 1.5],
  ].forEach(([x, z]) => {
    deskGroup.add(box(0.2, 2.8, 0.2, deskLegMat, x, DESK_Y - 0.09 - 1.4, z));
  });

  // Laptop
  const laptop = new THREE.Group();
  laptop.position.set(0, DESK_Y + 0.05, 0);
  sceneRoot.add(laptop);
  const base = new THREE.Group();
  laptop.add(base);
  base.add(box(3.4, 0.1, 2.2, bodyMat));
  base.add(
    box(
      2.96,
      0.012,
      1.42,
      new THREE.MeshStandardMaterial({
        color: 0x131323,
        roughness: 0.5,
        metalness: 0.5,
      }),
      0,
      0.056,
      -0.2,
    ),
  );

  const keyY = 0.077;
  const unitW = 0.164;
  const unitGap = 0.034;
  const alphaDepth = 0.155;
  const keyboardLeft = -1.42;
  const keyboardRight = 1.4;
  const getWidthFromUnits = (units, gap = unitGap) =>
    units * unitW + (units - 1) * gap;
  const getSpecWidth = (spec, gap = unitGap) =>
    typeof spec === "number" ? getWidthFromUnits(spec, gap) : spec.width;
  const getRowWidthExcludingLast = (specs, gap = unitGap) =>
    specs.slice(0, -1).reduce((total, spec) => total + getSpecWidth(spec, gap), 0) +
    Math.max(0, specs.length - 1) * gap;

  const addRow = (z, specs, options = {}) => {
    const {
      left = keyboardLeft,
      gap = unitGap,
      keyDepth = alphaDepth,
      keyHeight = 0.04,
      inset = 0.018,
    } = options;
    let cursor = left;
    specs.forEach((spec) => {
      const width = getSpecWidth(spec, gap);
      const centerX = cursor + width / 2;
      addKeyboardKey(base, {
        width,
        depth: keyDepth,
        x: centerX,
        z,
        y: keyY,
        material: keyMat,
        height: keyHeight,
        inset,
      });
      cursor += width + gap;
    });
  };

  addRow(-0.6, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5]);
  const secondRow = [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  secondRow[secondRow.length - 1] = {
    width: keyboardRight - (keyboardLeft + getRowWidthExcludingLast(secondRow)),
  };
  addRow(-0.37, secondRow);

  const thirdRow = [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  thirdRow[thirdRow.length - 1] = {
    width: keyboardRight - (keyboardLeft + getRowWidthExcludingLast(thirdRow)),
  };
  addRow(-0.14, thirdRow);

  const fourthRow = [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  fourthRow.splice(fourthRow.length - 1, 0, 1);
  fourthRow[fourthRow.length - 1] = {
    width: keyboardRight - (keyboardLeft + getRowWidthExcludingLast(fourthRow)),
  };
  addRow(0.09, fourthRow);

  const bottomZ = 0.33;
  const bottomRow = [1.25, 1.25, 1.25, 6.2, 1, 1, 1, 1];
  bottomRow[bottomRow.length - 1] = {
    width: keyboardRight - (keyboardLeft + getRowWidthExcludingLast(bottomRow)),
  };
  addRow(bottomZ, bottomRow, {
    keyDepth: 0.145,
  });

  base.add(
    box(
      0.95,
      0.005,
      0.76,
      new THREE.MeshStandardMaterial({
        color: 0x181828,
        roughness: 0.12,
        metalness: 0.55,
      }),
      0,
      0.059,
      0.7,
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

  // Lamp
  const lamp = new THREE.Group();
  lamp.position.set(3.6, DESK_Y, -1.2);
  lamp.rotation.y = Math.PI / 9;
  sceneRoot.add(lamp);
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
  lampLight.position.set(3.8, 3.8, -0.3);
  lampLight.target.position.set(1.5, 0, 0.2);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  scene.add(lampLight);
  scene.add(lampLight.target);

  // Desk decor
  const deskDecorMat = new THREE.MeshStandardMaterial({
    color: 0x355c7d,
    roughness: 0.68,
    metalness: 0.12,
  });
  const pencilMatYellow = new THREE.MeshStandardMaterial({
    color: 0xe1b53a,
    roughness: 0.7,
  });
  const pencilMatBlue = new THREE.MeshStandardMaterial({
    color: 0x4f86d9,
    roughness: 0.7,
  });
  const pencilMatPink = new THREE.MeshStandardMaterial({
    color: 0xe38ca6,
    roughness: 0.7,
  });
  const pencilTipMat = new THREE.MeshStandardMaterial({
    color: 0xd9c0a1,
    roughness: 0.9,
  });
  const graphiteMat = new THREE.MeshStandardMaterial({
    color: 0x2c2c30,
    roughness: 0.95,
  });
  const deskCup = new THREE.Group();
  deskCup.position.set(-2.7, DESK_Y, -1);
  sceneRoot.add(deskCup);

  const cupBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.21, 0.42, 24),
    deskDecorMat,
  );
  cupBody.position.y = 0.21;
  cupBody.castShadow = true;
  cupBody.receiveShadow = true;
  deskCup.add(cupBody);

  const cupRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.225, 0.03, 10, 28),
    potRimMat,
  );
  cupRim.position.y = 0.42;
  cupRim.rotation.x = Math.PI / 2;
  cupRim.castShadow = true;
  deskCup.add(cupRim);

  const pencilEraser = (x, z, h, rx, rz, bodyMat) => {
    const pencil = new THREE.Group();
    pencil.position.set(x, 0.4, z);
    pencil.rotation.set(rx, 0, rz);

    const body = cyl(0.03, 0.03, h, 6, bodyMat, 0, h / 2, 0);
    pencil.add(body);

    const ferrule = cyl(0.032, 0.032, 0.05, 10, hingeMat, 0, h + 0.025, 0);
    pencil.add(ferrule);

    const eraser = cyl(0.028, 0.028, 0.06, 10, pencilMatPink, 0, h + 0.08, 0);
    pencil.add(eraser);

    const woodTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.08, 8),
      pencilTipMat,
    );
    woodTip.position.y = -0.04;
    woodTip.rotation.x = Math.PI;
    pencil.add(woodTip);

    const lead = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.03, 8),
      graphiteMat,
    );
    lead.position.y = -0.095;
    lead.rotation.x = Math.PI;
    pencil.add(lead);

    deskCup.add(pencil);
  };

  pencilEraser(-0.06, 0.02, 0.7, -0.05, 0.16, pencilMatYellow);
  pencilEraser(0.02, -0.04, 0.76, 0.08, -0.12, pencilMatBlue);
  pencilEraser(0.08, 0.03, 0.64, -0.03, -0.24, leafDarkMat);

  // Paper Stack
  const paperStack = new THREE.Group();
  const papers = [
    {
      pw: 1.7,
      pd: 1.32,
      yOffset: 0.012,
      ry: Math.PI / 2 + 0.05,
      x: -3,
      z: 0.2,
    },
    {
      pw: 1.64,
      pd: 1.26,
      yOffset: 0.024,
      ry: Math.PI / 2 + 0.12,
      x: -2.98,
      z: 0.21,
    },
    {
      pw: 1.6,
      pd: 1.22,
      yOffset: 0.036,
      ry: Math.PI / 2 - 0.08,
      x: -2.95,
      z: 0.19,
    },
    {
      pw: 1.56,
      pd: 1.18,
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
  sceneRoot.add(paperStack);

  // Folder
  const folderGroup = new THREE.Group();
  folderGroup.position.set(3.0, DESK_Y, 0.3);
  sceneRoot.add(folderGroup);

  const folderMat = new THREE.MeshStandardMaterial({
    color: 0xc8924a,
    roughness: 0.85,
    metalness: 0.0,
  });
  const folderInnerMat = new THREE.MeshStandardMaterial({
    color: 0xa06828,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const fw = 1.58,
    fh = 0.008,
    fd = 1.82;
  folderGroup.add(box(fw, fh, fd, folderMat, 0, fh / 2, 0));

  const tabW = 0.1,
    tabD = fd * 0.3;
  folderGroup.add(
    box(
      tabW,
      fh,
      tabD,
      folderMat,
      fw / 2 + tabW / 2,
      fh / 2,
      -(fd / 2 - tabD / 2),
    ),
  );

  const folderTopPivot = new THREE.Group();
  folderTopPivot.position.set(-fw / 2, fh, 0);
  folderGroup.add(folderTopPivot);

  const coverShape = new THREE.Shape();
  coverShape.moveTo(0, fd / 2);
  coverShape.lineTo(fw - tabW, fd / 2);
  coverShape.lineTo(fw - tabW, fd / 2 - tabD);
  coverShape.lineTo(fw, fd / 2 - tabD);
  coverShape.lineTo(fw, -fd / 2);
  coverShape.lineTo(0, -fd / 2);
  coverShape.lineTo(0, fd / 2);

  const extrudeSettings = { depth: fh, bevelEnabled: false };
  const topCoverGeo = new THREE.ExtrudeGeometry(coverShape, extrudeSettings);
  topCoverGeo.rotateX(-Math.PI / 2);
  topCoverGeo.translate(0, fh, 0);

  const topCover = new THREE.Mesh(topCoverGeo, folderMat);
  topCover.castShadow = true;
  topCover.receiveShadow = true;
  folderTopPivot.add(topCover);

  const innerShape = new THREE.Shape();
  innerShape.moveTo(0, fd / 2);
  innerShape.lineTo(fw - tabW, fd / 2);
  innerShape.lineTo(fw - tabW, fd / 2 - tabD);
  innerShape.lineTo(fw, fd / 2 - tabD);
  innerShape.lineTo(fw, -fd / 2);
  innerShape.lineTo(0, -fd / 2);
  innerShape.lineTo(0, fd / 2);

  const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
    depth: 0.002,
    bevelEnabled: false,
  });
  innerGeo.rotateX(-Math.PI / 2);
  innerGeo.translate(0, 0.0005, 0);

  const topInner = new THREE.Mesh(innerGeo, folderInnerMat);
  folderTopPivot.add(topInner);

  const paperInsideMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e8,
    roughness: 0.9,
  });
  const paperInside = box(
    fw - 0.3,
    0.002,
    fd - 0.3,
    paperInsideMat,
    0,
    fh + 0.001,
    0,
  );
  folderGroup.add(paperInside);

  return {
    sceneRoot,
    deskGroup,
    laptop,
    lampLight,
    screenMat,
    paperStack,
    folderGroup,
    folderTopPivot,
  };
}

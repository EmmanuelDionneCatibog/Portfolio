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

  // Instant back (unused externally but kept for completeness)
  const handleBack = () => {
    isRestoringRef.current = true;
    setShowDesktop(false);
    glitchFiredRef.current = false;
    if (resetProgressRef.current) resetProgressRef.current();
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 300);
  };

  // Sign out: hide desktop, then animate camera zooming back out to overview
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

    // ── MATERIALS ──
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

    // ── HELPERS ──
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

    // ── DESK ──
    const desk = new THREE.Group();
    scene.add(desk);
    desk.add(box(9, 0.18, 4, deskMat, 0, DESK_Y - 0.09, 0));
    [
      [-4.3, -1.5],
      [4.3, -1.5],
      [-4.3, 0.8],
      [4.3, 0.8],
    ].forEach(([x, z]) => {
      desk.add(box(0.2, 2.8, 0.2, deskLegMat, x, DESK_Y - 0.09 - 1.4, z));
    });

    // ── LAPTOP ──
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

    // ── PAPERS ──
    const paperDefs = [
      { x: 2.4, z: -0.2, ry: 0.15, pw: 1.3, pd: 0.95 },
      { x: 3.1, z: 0.5, ry: -0.3, pw: 1.2, pd: 0.9 },
      { x: 2.0, z: 0.9, ry: 0.5, pw: 1.1, pd: 0.85 },
      { x: 3.5, z: -0.7, ry: -0.1, pw: 1.4, pd: 1.0 },
      { x: -3.0, z: 0.5, ry: -0.4, pw: 1.2, pd: 0.9 },
      { x: -3.6, z: -0.2, ry: 0.2, pw: 1.1, pd: 0.95 },
    ];
    paperDefs.forEach(({ x, z, ry, pw, pd }, i) => {
      scene.add(
        box(
          pw,
          0.012,
          pd,
          paperMats[i % paperMats.length],
          x,
          DESK_Y + 0.012,
          z,
          0,
          ry,
          0,
        ),
      );
    });

    // ── LAMP ──
    const lamp = new THREE.Group();
    lamp.position.set(3.6, DESK_Y, 0.2);
    scene.add(lamp);
    lamp.add(cyl(0.3, 0.38, 0.07, 24, lampBaseMat, 0, 0.035, 0));
    lamp.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 0.11, 0));
    const lowerArm = new THREE.Group();
    lowerArm.position.set(0, 0.17, 0);
    lowerArm.rotation.z = -0.22;
    lamp.add(lowerArm);
    lowerArm.add(cyl(0.036, 0.036, 1.5, 10, lampArmMat, 0, 0.75, 0));
    lowerArm.add(cyl(0.055, 0.055, 0.12, 12, lampArmMat, 0, 1.5, 0));
    const upperArm = new THREE.Group();
    upperArm.position.set(0, 1.5, 0);
    upperArm.rotation.z = 0.44;
    lowerArm.add(upperArm);
    upperArm.add(cyl(0.032, 0.032, 1.2, 10, lampArmMat, 0, 0.6, 0));
    const head = new THREE.Group();
    head.position.set(0, 1.2, 0);
    head.rotation.z = 1.15;
    upperArm.add(head);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.44, 24, 1, true),
      lampConeMat,
    );
    cone.rotation.z = Math.PI;
    cone.castShadow = true;
    head.add(cone);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      bulbMat,
    );
    bulb.position.y = -0.18;
    head.add(bulb);

    // ── LIGHTS ──
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

    // ── FLOOR ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = DESK_Y - 0.09 - 2.8;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── ROOM WALLS ──
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c2c,
      roughness: 1,
      metalness: 0,
    });
    const floorY = DESK_Y - 0.09 - 2.8;
    const wallH = 10;
    const wallW = 24;
    const wallD = 20;

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallW, wallH),
      wallMat,
    );
    backWall.position.set(0, floorY + wallH / 2, -wallD / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallD, wallH),
      wallMat,
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-wallW / 2, floorY + wallH / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(wallD, wallH),
      wallMat,
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(wallW / 2, floorY + wallH / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // ── ORANGE WALL LINES ──
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xdb9834 });
    const lineOpacity = 0.28;
    const fadedLineMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: lineOpacity,
    });

    // Helper: thin horizontal line on a wall
    const wallLine = (w, h, d, px, py, pz, ry = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fadedLineMat);
      m.position.set(px, py, pz);
      m.rotation.y = ry;
      scene.add(m);
    };

    // Back wall — horizontal lines
    const bwZ = -wallD / 2 + 0.02;
    for (let i = 0; i < 5; i++) {
      const ly = floorY + 1.5 + i * 1.6;
      wallLine(wallW, 0.025, 0.01, 0, ly, bwZ);
    }
    // Back wall — vertical lines
    for (let i = -4; i <= 4; i++) {
      wallLine(0.025, wallH, 0.01, i * 2.5, floorY + wallH / 2, bwZ);
    }

    // Left wall — horizontal lines (angled in perspective, just flat planes)
    const lwX = -wallW / 2 + 0.02;
    for (let i = 0; i < 5; i++) {
      const ly = floorY + 1.5 + i * 1.6;
      wallLine(0.01, 0.025, wallD, lwX, ly, 0);
    }
    // Left wall — vertical lines
    for (let i = -3; i <= 3; i++) {
      wallLine(0.01, wallH, 0.025, lwX, floorY + wallH / 2, i * 2.8);
    }

    // Right wall — horizontal lines
    const rwX = wallW / 2 - 0.02;
    for (let i = 0; i < 5; i++) {
      const ly = floorY + 1.5 + i * 1.6;
      wallLine(0.01, 0.025, wallD, rwX, ly, 0);
    }
    // Right wall — vertical lines
    for (let i = -3; i <= 3; i++) {
      wallLine(0.01, wallH, 0.025, rwX, floorY + wallH / 2, i * 2.8);
    }

    // ── FLOOR GRID LINES ──
    const floorGridMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: 0.24,
    });

    for (let i = -3; i <= 3; i++) {
      const lz = i * 2.8;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(wallW, 0.01, 0.025),
        floorGridMat,
      );
      m.position.set(0, floorY + 0.005, lz);
      scene.add(m);
    }

    for (let i = -4; i <= 4; i++) {
      const lx = i * 2.5;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.01, wallD),
        floorGridMat,
      );
      m.position.set(lx, floorY + 0.005, 0);
      scene.add(m);
    }

    // ── CAMERA WAYPOINTS ──
    const camStart = new THREE.Vector3(0, 3.2, 8);
    const camEnd = new THREE.Vector3(0, 1.52, 0.35);
    const lookStart = new THREE.Vector3(0, 0.2, 0);
    const lookEnd = new THREE.Vector3(0, 1.52, -1.5);

    // ── VIRTUAL SCROLL STATE ──
    let targetProgress = 0;
    let scrollProgress = 0;
    let glitchTriggered = false;

    // Keep ref in sync so handleSignOut can seed the correct starting value
    const syncTargetRef = (v) => {
      targetProgress = v;
      targetProgressRef.current = v;
    };

    resetProgressRef.current = () => {
      syncTargetRef(0);
      scrollProgress = 0;
      glitchTriggered = false;
    };

    // Drives reverse zoom (sign out animation)
    const checkZoomOut = () => {
      if (!zoomingOutRef.current) return;
      // On first frame, seed from ref so we start at the correct progress (not 0)
      if (targetProgress < targetProgressRef.current) {
        targetProgress = targetProgressRef.current;
        scrollProgress = targetProgressRef.current;
      }
      // Decrease target — scrollProgress will lerp toward it smoothly in animate loop
      syncTargetRef(Math.max(0, targetProgress - 0.022));
      // Only clean up once scrollProgress has actually eased close to 0
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
        syncTargetRef(1); // make sure ref is at 1 before sign-out zoom
        triggerGlitch();
      }
    };

    // ── INPUT HANDLERS ──
    const onWheel = (e) => {
      if (isRestoringRef.current) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.35 : -0.35;
      syncTargetRef(Math.max(0, Math.min(1, targetProgress + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (isRestoringRef.current) return;
      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
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

    // ── ANIMATE ──
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

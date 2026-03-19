import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LaptopSection() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#25263a");

    // --- Camera ---
    const w = el.clientWidth;
    const h = el.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.8, 5.5);
    camera.lookAt(0, 0.4, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // --- Lights ---
    // Ambient — very dim so the orange light does most of the work
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    // Main orange point light above + in front
    const orange = new THREE.PointLight(0xdb9834, 6, 18);
    orange.position.set(0, 5, 3);
    orange.castShadow = true;
    scene.add(orange);

    // Subtle fill from below (warm)
    const fill = new THREE.PointLight(0xb06010, 1.5, 12);
    fill.position.set(-3, -1, 2);
    scene.add(fill);

    // Rim from behind to separate laptop from bg
    const rim = new THREE.PointLight(0xff9900, 1.2, 10);
    rim.position.set(0, 3, -4);
    scene.add(rim);

    // --- Materials ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.35,
      metalness: 0.8,
    });
    const screenBezMat = new THREE.MeshStandardMaterial({
      color: 0x111120,
      roughness: 0.2,
      metalness: 0.9,
    });
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a1a,
      roughness: 0.05,
      metalness: 0.1,
      emissive: new THREE.Color(0xdb9834),
      emissiveIntensity: 0.08,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x222233,
      roughness: 0.6,
      metalness: 0.3,
    });
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      roughness: 0.3,
      metalness: 0.9,
    });

    // Helper
    const box = (w, h, d, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // --- Laptop group ---
    const laptop = new THREE.Group();
    scene.add(laptop);

    // BASE (bottom half)
    const base = new THREE.Group();
    laptop.add(base);

    // Main base body
    const baseBody = box(3.2, 0.12, 2.1, bodyMat, 0, 0, 0);
    base.add(baseBody);

    // Slightly rounded edge illusion via chamfer strips
    const chamferMat = new THREE.MeshStandardMaterial({
      color: 0x222235,
      roughness: 0.4,
      metalness: 0.8,
    });
    [-1.6, 1.6].forEach((x) => {
      const c = box(0.04, 0.1, 2.1, chamferMat, x, 0, 0);
      base.add(c);
    });
    [-1.05, 1.05].forEach((z) => {
      const c = box(3.2, 0.1, 0.04, chamferMat, 0, 0, z);
      base.add(c);
    });

    // Keyboard area (recessed panel)
    const kbPanel = box(
      2.9,
      0.01,
      1.7,
      new THREE.MeshStandardMaterial({
        color: 0x151525,
        roughness: 0.5,
        metalness: 0.5,
      }),
      0,
      0.065,
      -0.1,
    );
    base.add(kbPanel);

    // Keys — rows
    const keyRows = [
      { z: -0.72, count: 13, w: 0.17 },
      { z: -0.48, count: 12, w: 0.19 },
      { z: -0.24, count: 11, w: 0.21 },
      { z: 0.0, count: 10, w: 0.23 },
      { z: 0.24, count: 4, w: 0.5 }, // spacebar row simplified
    ];
    keyRows.forEach(({ z, count, w: kw }) => {
      const totalW = count * kw + (count - 1) * 0.04;
      for (let i = 0; i < count; i++) {
        const kx = -totalW / 2 + i * (kw + 0.04) + kw / 2;
        const key = box(kw - 0.02, 0.04, 0.17, keyMat, kx, 0.085, z);
        base.add(key);
      }
    });

    // Touchpad
    const touchpad = box(
      0.9,
      0.005,
      0.55,
      new THREE.MeshStandardMaterial({
        color: 0x1a1a2f,
        roughness: 0.15,
        metalness: 0.6,
      }),
      0,
      0.068,
      0.55,
    );
    base.add(touchpad);

    // Hinge cylinders
    const hingeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 16);
    [-0.7, 0.7].forEach((x) => {
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(x, 0.06, -1.02);
      hinge.castShadow = true;
      base.add(hinge);
    });

    // LID (screen half) — pivots from back edge
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.06, -1.02);
    base.add(lidPivot);

    const lid = new THREE.Group();
    lid.position.set(0, 0, 0); // relative to pivot
    lidPivot.add(lid);

    // Lid open angle
    lidPivot.rotation.x = -Math.PI * 0.42;

    // Lid shell
    const lidShell = box(3.2, 0.09, 2.1, screenBezMat, 0, 0, 1.05);
    lid.add(lidShell);

    // Screen bezel (inner dark frame)
    const bezel = box(
      2.85,
      0.02,
      1.82,
      new THREE.MeshStandardMaterial({
        color: 0x0d0d1a,
        roughness: 0.3,
        metalness: 0.2,
      }),
      0,
      0.055,
      1.05,
    );
    lid.add(bezel);

    // Screen display
    const screen = box(2.6, 0.01, 1.6, screenMat, 0, 0.066, 1.05);
    lid.add(screen);

    // Screen glow — orange tint plane just in front of screen
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    });
    const glow = box(2.6, 0.001, 1.6, glowMat, 0, 0.075, 1.05);
    lid.add(glow);

    // Logo mark on back of lid (subtle circle)
    const logoGeo = new THREE.RingGeometry(0.12, 0.16, 32);
    const logoMat = new THREE.MeshBasicMaterial({
      color: 0xdb9834,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.rotation.x = Math.PI / 2;
    logo.position.set(0, -0.046, 1.05);
    lid.add(logo);

    // Shadow plane
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x1c1c2c, roughness: 1 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.06;
    shadow.receiveShadow = true;
    scene.add(shadow);

    // --- Resize ---
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- Animation ---
    let frame;
    let t = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.008;
      // Gentle auto-rotate
      laptop.rotation.y = Math.sin(t * 0.4) * 0.35;
      // Subtle float
      laptop.position.y = Math.sin(t * 0.7) * 0.06;
      // Orange light pulse
      orange.intensity = 5.5 + Math.sin(t * 1.2) * 0.8;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section
      id="projects"
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#25263a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Three.js canvas */}
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* Text overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          pointerEvents: "none",
          marginTop: "auto",
          paddingBottom: "clamp(32px, 6vh, 60px)",
          alignSelf: "flex-end",
          width: "100%",
        }}>
        <p
          style={{
            color: "#d7c6ac",
            fontSize: "clamp(13px, 1.4vw, 16px)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}>
          What I build
        </p>
        <h2
          style={{
            color: "#db9834",
            fontSize: "clamp(28px, 5vw, 56px)",
            margin: 0,
            fontWeight: 700,
            lineHeight: 1.1,
          }}>
          Projects
        </h2>
      </div>
    </section>
  );
}

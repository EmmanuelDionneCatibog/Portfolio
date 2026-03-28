import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import GlitchOverlay from "./GlitchOverlay";
import WindowsDesktop from "./WindowsDesktop";
import { createDeskScene } from "./Desk";
import { createRoomScene } from "./Room";

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

  const handleShutdown = () => {
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    // Create desk objects and get references to animated elements
    const { deskGroup, laptop, lampLight, screenMat, paperStack, stickyNote } =
      createDeskScene(scene);

    // Create room objects and get references
    const { floorLampLight, floorY, backWallZ, wallH, wallW } =
      createRoomScene(scene);

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

    // ─── Post-processing for outline effect ──────────────────────────────────
    const composer = new EffectComposer(renderer);

    // Add render pass with original colors
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Create outline pass
    const outlinePass = new OutlinePass(new THREE.Vector2(w, h), scene, camera);
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.5;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0xffffff);
    composer.addPass(outlinePass);

    // Add gamma correction to fix brightness
    const gammaPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);

    // Make sure the output goes to screen
    gammaPass.renderToScreen = true;

    // Collect all meshes from paper stack for outlining
    const paperMeshes = [];
    if (paperStack) {
      paperStack.traverse((child) => {
        if (child.isMesh) {
          paperMeshes.push(child);
        }
      });
    }

    // Collect all meshes from sticky note for outlining
    const stickyMeshes = [];
    if (stickyNote) {
      stickyNote.traverse((child) => {
        if (child.isMesh) {
          stickyMeshes.push(child);
        }
      });
    }

    // Collect all meshes from laptop for outlining
    const laptopMeshes = [];
    if (laptop) {
      laptop.traverse((child) => {
        if (child.isMesh) {
          laptopMeshes.push(child);
        }
      });
    }

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Track currently hovered object
    let currentHovered = null;

    // Mouse move handler
    const onMouseMove = (event) => {
      // Calculate mouse position in normalized coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray
      raycaster.setFromCamera(mouse, camera);

      // Check all meshes from all groups
      const allMeshes = [...paperMeshes, ...stickyMeshes, ...laptopMeshes];
      const intersects = raycaster.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;

        // Find which group this mesh belongs to
        let hoveredGroup = null;
        if (paperMeshes.includes(hoveredMesh)) {
          hoveredGroup = "paper";
        } else if (stickyMeshes.includes(hoveredMesh)) {
          hoveredGroup = "sticky";
        } else if (laptopMeshes.includes(hoveredMesh)) {
          hoveredGroup = "laptop";
        }

        if (currentHovered !== hoveredGroup) {
          // Clear previous outline
          outlinePass.selectedObjects = [];

          // Set new outline based on what's hovered
          if (hoveredGroup === "paper") {
            outlinePass.selectedObjects = paperMeshes;
          } else if (hoveredGroup === "sticky") {
            outlinePass.selectedObjects = stickyMeshes;
          } else if (hoveredGroup === "laptop") {
            outlinePass.selectedObjects = laptopMeshes;
          }

          currentHovered = hoveredGroup;
        }
      } else if (currentHovered !== null) {
        // No intersection, clear outline
        outlinePass.selectedObjects = [];
        currentHovered = null;
      }
    };

    // Add mouse move listener
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // Handle window resize for composer
    const onResize = () => {
      const nw = el.clientWidth,
        nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    };

    window.addEventListener("resize", onResize);

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
      if (screenMat) {
        screenMat.emissive.setHex(0x2255aa);
        screenMat.emissiveIntensity = Math.max(0, (p - 0.6) / 0.4) * 1.2;
      }
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

    let raf,
      t = 0;
    const DESK_Y = 0;
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
      // Removed the laptop movement animation
      // if (laptop) laptop.position.y = DESK_Y + 0.05 + Math.sin(t * 0.6) * 0.02;
      if (lampLight) lampLight.intensity = 2.4 + Math.sin(t * 1.8) * 0.2;
      if (floorLampLight)
        floorLampLight.intensity = 1.4 + Math.sin(t * 2.3 + 1) * 0.12;

      // Render using composer
      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
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
        onShutdown={handleShutdown}
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

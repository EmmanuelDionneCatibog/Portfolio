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
import CertificateCarousel from "./CertificateCarousel";

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
  const [showCarousel, setShowCarousel] = useState(false);
  const [hoverLabel, setHoverLabel] = useState(null);
  const labelPosRef = useRef(null);

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

    const {
      deskGroup,
      laptop,
      lampLight,
      screenMat,
      paperStack,
      folderGroup,
      folderTopPivot,
    } = createDeskScene(scene);

    const { floorLampLight, floorY, backWallZ, wallH, wallW } =
      createRoomScene(scene);

    // Lights
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

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(new THREE.Vector2(w, h), scene, camera);
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.5;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0xffffff);
    composer.addPass(outlinePass);

    const gammaPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);
    gammaPass.renderToScreen = true;

    const paperMeshes = [];
    if (paperStack) {
      paperStack.traverse((child) => {
        if (child.isMesh) paperMeshes.push(child);
      });
    }

    const paperOrigins = paperMeshes.map((m) => ({
      y: m.position.y,
      ry: m.rotation.y,
    }));

    const paperTargets = paperMeshes.map((m, i) => {
      if (i < paperMeshes.length - 2) {
        return { y: m.position.y, ry: m.rotation.y };
      }
      const t2 = i - (paperMeshes.length - 2);
      return {
        y: m.position.y + 0.35 + t2 * 0.2,
        ry: m.rotation.y + (t2 === 0 ? -0.2 : 0.2),
      };
    });

    let paperHoverProgress = 0;
    let folderHoverProgress = 0;

    const laptopMeshes = [];
    if (laptop) {
      laptop.traverse((child) => {
        if (child.isMesh) laptopMeshes.push(child);
      });
    }

    const folderMeshes = [];
    if (folderGroup) {
      folderGroup.traverse((child) => {
        if (child.isMesh) folderMeshes.push(child);
      });
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHovered = null;

    const labelAnchors = {
      laptop: new THREE.Vector3(0, 0, 0),
      paper: new THREE.Vector3(-3, 0.4, 0.2),
      folder: new THREE.Vector3(3, 0.4, 0.6),
    };
    const labelTexts = {
      laptop: "Projects",
      paper: "Certifications",
      folder: "Work Experience",
    };

    let scrollProgress = 0;
    let targetProgress = 0;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (scrollProgress < 0.3) {
        outlinePass.selectedObjects = [];
        currentHovered = null;
        renderer.domElement.style.cursor = "default";
        labelPosRef.current = null;
        setHoverLabel(null);
        return;
      }

      const allMeshes = [...paperMeshes, ...laptopMeshes, ...folderMeshes];
      const intersects = raycaster.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        let hoveredGroup = null;
        if (paperMeshes.includes(hoveredMesh)) hoveredGroup = "paper";
        else if (laptopMeshes.includes(hoveredMesh)) hoveredGroup = "laptop";
        else if (folderMeshes.includes(hoveredMesh)) hoveredGroup = "folder";

        if (currentHovered !== hoveredGroup) {
          outlinePass.selectedObjects = [];
          if (hoveredGroup === "paper")
            outlinePass.selectedObjects = paperMeshes;
          else if (hoveredGroup === "laptop")
            outlinePass.selectedObjects = laptopMeshes;
          else if (hoveredGroup === "folder")
            outlinePass.selectedObjects = folderMeshes;
          currentHovered = hoveredGroup;
        }

        renderer.domElement.style.cursor =
          hoveredGroup === "laptop" ? "pointer" : "default";
        labelPosRef.current = hoveredGroup ? { group: hoveredGroup } : null;
      } else if (currentHovered !== null) {
        outlinePass.selectedObjects = [];
        currentHovered = null;
        renderer.domElement.style.cursor = "default";
        labelPosRef.current = null;
        setHoverLabel(null);
      }
    };

    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const laptopIntersects = raycaster.intersectObjects(laptopMeshes);
      if (laptopIntersects.length > 0 && scrollProgress >= 0.3) {
        syncTargetRef(1);
      }

      const paperIntersects = raycaster.intersectObjects(paperMeshes);
      if (paperIntersects.length > 0 && scrollProgress >= 0.3) {
        setShowCarousel(true);
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

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
      if (lampLight) lampLight.intensity = 2.4 + Math.sin(t * 1.8) * 0.2;
      if (floorLampLight)
        floorLampLight.intensity = 1.4 + Math.sin(t * 2.3 + 1) * 0.12;

      const paperHovered = currentHovered === "paper";
      paperHoverProgress +=
        ((paperHovered ? 1 : 0) - paperHoverProgress) * 0.08;
      paperMeshes.forEach((m, i) => {
        m.position.y =
          paperOrigins[i].y +
          (paperTargets[i].y - paperOrigins[i].y) * paperHoverProgress;
        m.rotation.y =
          paperOrigins[i].ry +
          (paperTargets[i].ry - paperOrigins[i].ry) * paperHoverProgress;
      });

      const folderHovered = currentHovered === "folder";
      folderHoverProgress +=
        ((folderHovered ? 1 : 0) - folderHoverProgress) * 0.07;
      if (folderTopPivot) {
        folderTopPivot.rotation.z = folderHoverProgress * Math.PI * 0.25;
      }

      composer.render();

      if (labelPosRef.current) {
        const { group } = labelPosRef.current;
        const anchor = labelAnchors[group].clone();
        anchor.project(camera);
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (anchor.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-anchor.y * 0.5 + 0.5) * rect.height + rect.top;
        setHoverLabel({ text: labelTexts[group], x, y });
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("click", onClick);
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

      <CertificateCarousel
        isOpen={showCarousel}
        onClose={() => setShowCarousel(false)}
      />

      {hoverLabel && (
        <div
          style={{
            position: "fixed",
            left: hoverLabel.x,
            top: hoverLabel.y,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 50,
            color: "#db9834",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
            textShadow: "0 0 12px rgba(219,152,52,0.6)",
            background: "rgba(13,15,24,0.7)",
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid rgba(219,152,52,0.3)",
            whiteSpace: "nowrap",
          }}>
          {hoverLabel.text}
        </div>
      )}

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

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import GlitchOverlay from "../Components/GlitchOverlay";
import WindowsDesktop from "./WindowsDesktop";
import { createDeskScene } from "../Components/Desk";
import { createRoomScene } from "../Components/Room";
import CertificateCarousel from "../Components/CertificateCarousel";
import "../styles/projects-page.css";

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 900;

function getSceneScale(width, height) {
  const widthScale = width / BASE_WIDTH;
  const heightScale = height / BASE_HEIGHT;
  return Math.max(0.34, Math.min(1, Math.min(widthScale, heightScale)));
}

function getFov(width, height) {
  const widthRatio = Math.max(0, (BASE_WIDTH - width) / BASE_WIDTH);
  const heightRatio = Math.max(0, (BASE_HEIGHT - height) / BASE_HEIGHT);
  const extra = widthRatio * 18 + heightRatio * 24;
  return Math.min(42 + extra, 76);
}

// ── Camera path helpers ───────────────────────────────────────────────────
const CAM_START_FULL = new THREE.Vector3(0, 3.05, 7.35);
const LOOK_START_FULL = new THREE.Vector3(0, 0.2, 0);
const CAM_END_FULL = new THREE.Vector3(0, 1.52, 0.35);
const LOOK_END_FULL = new THREE.Vector3(0, 1.52, -1.5);

function buildCameraPath(width, height) {
  const s = getSceneScale(width, height);
  const compactWidth = width < 768;
  const compactHeight = height < 720;
  const cameraLift = compactHeight ? 0.16 + (720 - height) / 2200 : 0;
  const cameraPull = compactWidth ? (768 - width) / 420 : 0;
  const lookLift = compactHeight ? 0.08 + (720 - height) / 3200 : 0;

  return {
    camStart: CAM_START_FULL.clone()
      .multiplyScalar(s)
      .add(new THREE.Vector3(0, cameraLift, cameraPull)),
    lookStart: LOOK_START_FULL.clone()
      .multiplyScalar(s)
      .add(new THREE.Vector3(0, lookLift, 0)),
    camEnd: new THREE.Vector3(
      0,
      CAM_END_FULL.y * s + cameraLift * 0.2,
      CAM_END_FULL.z * s + cameraPull * 0.08,
    ),
    lookEnd: new THREE.Vector3(
      0,
      LOOK_END_FULL.y * s + lookLift * 0.18,
      LOOK_END_FULL.z * s,
    ),
  };
}

export default function ProjectsPage() {
  const mountRef = useRef(null);
  const sectionRef = useRef(null);

  const glitchFiredRef = useRef(false);
  const savedScrollY = useRef(0);
  const isRestoringRef = useRef(false);
  const resetProgressRef = useRef(null);
  const zoomingOutRef = useRef(false);
  const targetProgressRef = useRef(0);

  // Live camera-path refs — updated on resize so the animation loop always
  // reads the correct scaled values without restarting.
  const camStartRef = useRef(CAM_START_FULL.clone());
  const lookStartRef = useRef(LOOK_START_FULL.clone());
  const camEndRef = useRef(CAM_END_FULL.clone());
  const lookEndRef = useRef(LOOK_END_FULL.clone());

  const [glitching, setGlitching] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [hoverLabel, setHoverLabel] = useState(null);
  const labelPosRef = useRef(null);

  const triggerGlitch = () => {
    if (glitchFiredRef.current || isRestoringRef.current) return;
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

    const w = el.clientWidth;
    const h = el.clientHeight;

    // Initialise path for current viewport
    const initPath = buildCameraPath(w, h);
    camStartRef.current.copy(initPath.camStart);
    lookStartRef.current.copy(initPath.lookStart);
    camEndRef.current.copy(initPath.camEnd);
    lookEndRef.current.copy(initPath.lookEnd);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#25263a");

    const camera = new THREE.PerspectiveCamera(getFov(w, h), w / h, 0.1, 100);
    camera.position.copy(camStartRef.current);
    camera.lookAt(lookStartRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    const {
      sceneRoot: deskRoot,
      laptop,
      lampLight,
      screenMat,
      paperStack,
      folderGroup,
      folderTopPivot,
    } = createDeskScene(scene);

    const { roomRoot } = createRoomScene(scene);

    const applySceneScale = (width, height) => {
      const s = getSceneScale(width, height);
      deskRoot.scale.setScalar(s);
      roomRoot.scale.setScalar(s);

      // Rebuild and store camera path so the animation loop picks it up
      const p = buildCameraPath(width, height);
      camStartRef.current.copy(p.camStart);
      lookStartRef.current.copy(p.lookStart);
      camEndRef.current.copy(p.camEnd);
      lookEndRef.current.copy(p.lookEnd);
    };

    // Apply initial scale
    applySceneScale(w, h);

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

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const outlinePass = new OutlinePass(new THREE.Vector2(w, h), scene, camera);
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.5;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0xffffff);
    composer.addPass(outlinePass);

    const gammaPass = new ShaderPass(GammaCorrectionShader);
    gammaPass.renderToScreen = true;
    composer.addPass(gammaPass);

    // Mesh collections for hover / raycasting
    const paperMeshes = [];
    const laptopMeshes = [];
    const folderMeshes = [];
    paperStack?.traverse((c) => {
      if (c.isMesh) paperMeshes.push(c);
    });
    laptop?.traverse((c) => {
      if (c.isMesh) laptopMeshes.push(c);
    });
    folderGroup?.traverse((c) => {
      if (c.isMesh) folderMeshes.push(c);
    });

    const paperOrigins = paperMeshes.map((m) => ({
      y: m.position.y,
      ry: m.rotation.y,
    }));
    const paperTargets = paperMeshes.map((m, i) => {
      if (i < paperMeshes.length - 2)
        return { y: m.position.y, ry: m.rotation.y };
      const t2 = i - (paperMeshes.length - 2);
      return {
        y: m.position.y + 0.35 + t2 * 0.2,
        ry: m.rotation.y + (t2 === 0 ? -0.2 : 0.2),
      };
    });

    let paperHoverProgress = 0;
    let folderHoverProgress = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHovered = null;

    // Label anchors are in LOCAL scene space (before scale).
    // In the animation loop we scale them by `s` before projecting.
    const labelAnchorsLocal = {
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

    const syncTargetRef = (v) => {
      targetProgress = v;
      targetProgressRef.current = v;
    };

    resetProgressRef.current = () => {
      syncTargetRef(0);
      scrollProgress = 0;
      glitchTriggered = false;
    };

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = ((event.clientY - rect.top) / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([
        ...paperMeshes,
        ...laptopMeshes,
        ...folderMeshes,
      ]);
      if (intersects.length > 0) {
        const hm = intersects[0].object;
        let hg = null;
        if (paperMeshes.includes(hm)) hg = "paper";
        else if (laptopMeshes.includes(hm)) hg = "laptop";
        else if (folderMeshes.includes(hm)) hg = "folder";

        if (currentHovered !== hg) {
          outlinePass.selectedObjects = [];
          if (hg === "paper") outlinePass.selectedObjects = paperMeshes;
          if (hg === "laptop") outlinePass.selectedObjects = laptopMeshes;
          if (hg === "folder") outlinePass.selectedObjects = folderMeshes;
          currentHovered = hg;
        }
        renderer.domElement.style.cursor =
          hg === "laptop" ? "pointer" : "default";
        labelPosRef.current = hg ? { group: hg } : null;
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
      mouse.y = ((event.clientY - rect.top) / rect.height) * -2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.intersectObjects(laptopMeshes).length > 0) syncTargetRef(1);
      if (raycaster.intersectObjects(paperMeshes).length > 0)
        setShowCarousel(true);
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

    const onResize = () => {
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      renderer.setSize(nw, nh);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(nw, nh);
      outlinePass.resolution.set(nw, nh);
      camera.aspect = nw / nh;
      camera.fov = getFov(nw, nh);
      camera.updateProjectionMatrix();
      applySceneScale(nw, nh);
    };
    window.addEventListener("resize", onResize);

    let glitchTriggered = false;
    let sectionActive = false;

    const applyProgress = (p) => {
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
      }
    };

    const observer = new IntersectionObserver(
      ([e]) => {
        sectionActive = e.intersectionRatio >= 0.98;
      },
      { threshold: 0.98 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const onWheel = (e) => {
      if (isRestoringRef.current) return;
      if (e.deltaY < 0 && targetProgress <= 0 && scrollProgress < 0.02) return;
      if (targetProgress >= 1 && scrollProgress > 0.98) return;
      if (!sectionActive && targetProgress <= 0) return;
      e.preventDefault();
      syncTargetRef(
        Math.max(
          0,
          Math.min(1, targetProgress + (e.deltaY > 0 ? 0.35 : -0.35)),
        ),
      );
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

      // Camera uses live refs — always correct after a resize
      camera.position.lerpVectors(
        camStartRef.current,
        camEndRef.current,
        scrollProgress,
      );
      camera.lookAt(
        new THREE.Vector3().lerpVectors(
          lookStartRef.current,
          lookEndRef.current,
          scrollProgress,
        ),
      );

      if (lampLight) lampLight.intensity = 2.4 + Math.sin(t * 1.8) * 0.2;

      // Paper hover
      paperHoverProgress +=
        ((currentHovered === "paper" ? 1 : 0) - paperHoverProgress) * 0.08;
      paperMeshes.forEach((m, i) => {
        m.position.y =
          paperOrigins[i].y +
          (paperTargets[i].y - paperOrigins[i].y) * paperHoverProgress;
        m.rotation.y =
          paperOrigins[i].ry +
          (paperTargets[i].ry - paperOrigins[i].ry) * paperHoverProgress;
      });

      // Folder hover
      folderHoverProgress +=
        ((currentHovered === "folder" ? 1 : 0) - folderHoverProgress) * 0.07;
      if (folderTopPivot)
        folderTopPivot.rotation.z = folderHoverProgress * Math.PI * 0.25;

      composer.render();

      // Hover label — scale local anchor into world space before projecting
      if (labelPosRef.current) {
        const { group } = labelPosRef.current;
        const s = getSceneScale(el.clientWidth, el.clientHeight);
        const worldAnchor = labelAnchorsLocal[group].clone().multiplyScalar(s);
        worldAnchor.project(camera);
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (worldAnchor.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-worldAnchor.y * 0.5 + 0.5) * rect.height + rect.top;
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
          className="projects-hover-label"
          style={{
            "--projects-hover-x": `${hoverLabel.x}px`,
            "--projects-hover-y": `${hoverLabel.y}px`,
          }}>
          {hoverLabel.text}
        </div>
      )}

      <div ref={sectionRef} className="projects-page-section">
        <div ref={mountRef} className="projects-page-canvas" />
      </div>
    </>
  );
}


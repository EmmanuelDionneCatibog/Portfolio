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
import "../styles/certificate-carousel.css";

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
const CAM_END_FULL = new THREE.Vector3(0, 1.6, 0.62);
const LOOK_END_FULL = new THREE.Vector3(0, 1.5, -1.28);
const ZOOM_STAGE_PREVIEW = 0.3;
const ZOOM_STAGE_DESKTOP = 1;

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
  const scrollProgressRef = useRef(0);
  const showDesktopRef = useRef(false);

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
  const [paperNav, setPaperNav] = useState(null);
  const labelPosRef = useRef(null);
  const paperNavRef = useRef(null);

  // Temporary toggle so you can focus on the paper animation.
  // Flip to `true` (or wire to a debug key) when you want the carousel back.
  const isCertificateCarouselEnabled = () => false;

  const cyclePapersRef = useRef(null);

  const PAPER_CERTIFICATES = [
    { src: "/DeviceManagement.jpg", title: "Device Management Certification" },
    { src: "/Python.jpg", title: "Python Certification" },
    { src: "/Database.jpg", title: "Database Certification" },
  ];

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
    zoomingOutRef.current = false;
    setGlitching(false);
    setShowDesktop(false);
    glitchFiredRef.current = false;
    if (resetProgressRef.current) resetProgressRef.current();
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 300);
  };

  const handleShutdown = () => {
    setShowDesktop(false);
    setGlitching(false);
    glitchFiredRef.current = false;
    isRestoringRef.current = true;
    zoomingOutRef.current = true;
  };

  useEffect(() => {
    showDesktopRef.current = showDesktop;
    document.body.classList.toggle("desktop-open", showDesktop);
    return () => document.body.classList.remove("desktop-open");
  }, [showDesktop]);

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
    let paperFlight = null;
    const PAPER_SHOOT_MS = 280;
    const PAPER_RETURN_END_MS = 1040;
    const PAPER_STAGGER_MS = 70;
    const PAPER_FLOAT_HOLD_MS = 800;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
    const easeInOutCubic = (x) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const getTopPaperMeshes = (count = 1) => {
      if (paperMeshes.length === 0) return [];
      return [...paperMeshes]
        .sort((a, b) => b.position.y - a.position.y)
        .slice(0, Math.max(0, count));
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHovered = null;

    // Certificate textures (used as an overlay on the front paper)
    const certificateLoader = new THREE.TextureLoader();
    const certificateSources = ["/DeviceManagement.jpg", "/Python.jpg", "/Database.jpg"];
    const certificateTextures = [null, null, null];
    certificateSources.forEach((src, i) => {
      certificateLoader.load(src, (tex) => {
        certificateTextures[i] = tex;
        if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
        // Mirror vertically (top/bottom flip) only.
        tex.center.set(0.5, 0.5);
        tex.rotation = 0;
        // Mirror vertically.
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, -1);
        tex.offset.set(0, 1);
        tex.needsUpdate = true;
      });
    });

    const ensureCertificateOverlays = () => {
      if (!paperFlight?.papers?.length) return;

      paperFlight.papers.forEach((p) => {
        const idx = p.certIndex ?? 0;
        const tex = certificateTextures[idx];
        if (!tex) return;

        if (p.overlay) {
          // If it's already using the right texture, keep it.
          if (p.overlay.material?.map === tex) return;
          p.mesh.remove(p.overlay);
          p.overlay.geometry.dispose();
          p.overlay.material.dispose();
          p.overlay = null;
        }

        const geoParams = p.mesh.geometry?.parameters;
        const width = geoParams?.width ?? 1.7;
        const height = geoParams?.height ?? 0.012;
        const depth = geoParams?.depth ?? 1.32;

        // Match the paper's top face orientation:
        // the paper box uses Y as thickness, so its top face is the XZ plane.
        // Rotate so the plane lies on XZ and then offset toward the camera.
        const overlayGeo = new THREE.PlaneGeometry(width * 0.975, depth * 0.975);
        overlayGeo.rotateX(-Math.PI / 2);
        const overlayMat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const overlay = new THREE.Mesh(overlayGeo, overlayMat);
        // Offset toward the camera. Depending on the paper's facing, the "front"
        // normal can be +Y or -Y after billboarding, so put it slightly in front
        // by pushing along the local axis that points to the camera.
        const camWorldPos = new THREE.Vector3();
        camera.getWorldPosition(camWorldPos);
        const camLocalPos = p.mesh.worldToLocal(camWorldPos.clone());
        const towardCam = camLocalPos.normalize();
        overlay.position.copy(towardCam.multiplyScalar(height / 2 + 0.06));
        overlay.renderOrder = 10;
        p.mesh.add(overlay);
        p.overlay = overlay;
      });
    };

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
    let zoomAnimation = null;
    let zoomOutStarted = false;

    const syncTargetRef = (v) => {
      targetProgress = v;
      targetProgressRef.current = v;
    };

    const setScrollProgress = (v) => {
      scrollProgress = v;
      scrollProgressRef.current = v;
    };

    const startZoomAnimation = (to, duration = 900) => {
      const from = scrollProgress;
      if (Math.abs(from - to) < 0.001) {
        syncTargetRef(to);
        setScrollProgress(to);
        zoomAnimation = null;
        return;
      }
      syncTargetRef(to);
      zoomAnimation = {
        from,
        to,
        duration,
        startAt: performance.now(),
      };
    };

    const isZoomAnimationLocked = () => zoomAnimation !== null;

    resetProgressRef.current = () => {
      syncTargetRef(0);
      setScrollProgress(0);
      zoomAnimation = null;
      zoomOutStarted = false;
      glitchTriggered = false;
    };

    const getNextZoomInTarget = () => {
      if (scrollProgress < ZOOM_STAGE_PREVIEW - 0.02) return ZOOM_STAGE_PREVIEW;
      return ZOOM_STAGE_DESKTOP;
    };

    const getNextZoomOutTarget = () => {
      if (scrollProgress > ZOOM_STAGE_PREVIEW + 0.02) return ZOOM_STAGE_PREVIEW;
      return 0;
    };

    const onMouseMove = (event) => {
      // Don't show hover outlines while the papers are flying / parked in front.
      if (paperFlight) return;
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

      const paperHits = raycaster.intersectObjects(paperMeshes);

      // Keep papers in front until user clicks outside them.
      // When dismissing, don't trigger any other click actions.
      if (paperHits.length === 0 && paperFlight?.phase === "front") {
        // Hide certificates immediately when dismissing.
        paperFlight.papers.forEach((p) => {
          if (p.overlay) {
            p.mesh.remove(p.overlay);
            p.overlay.geometry.dispose();
            p.overlay.material.dispose();
            p.overlay = null;
          }
        });
        paperFlight.phase = "dismiss";
        paperFlight.dismissAt = performance.now();
        paperFlight.didHideOverlays = true;
        // Reverse from the *current* positions so dismiss is smooth.
        paperFlight.papers.forEach((p) => {
          p.dismissFromPos = p.mesh.position.clone();
          p.dismissFromQuat = p.mesh.quaternion.clone();
        });
        outlinePass.selectedObjects = [];
        renderer.domElement.style.cursor = "default";
        if (paperNavRef.current?.visible) {
          paperNavRef.current = { x: 0, y: 0, visible: false };
          setPaperNav(null);
        }
        // Ensure the stack fully settles back (no lingering hover/floating state)
        currentHovered = null;
        outlinePass.selectedObjects = [];
        labelPosRef.current = null;
        setHoverLabel(null);
        return;
      }

      // While papers are active, block other click interactions (like laptop zoom).
      if (paperFlight) return;
      if (raycaster.intersectObjects(laptopMeshes).length > 0) {
        const currentProgress = Math.max(
          targetProgressRef.current,
          scrollProgressRef.current,
        );

        if (
          !showDesktopRef.current &&
          !isRestoringRef.current &&
          currentProgress >= ZOOM_STAGE_DESKTOP - 0.02
        ) {
          glitchTriggered = true;
          glitchFiredRef.current = false;
          triggerGlitch();
        } else {
          startZoomAnimation(ZOOM_STAGE_DESKTOP);
        }
      }

      if (paperHits.length > 0) {
        if (!paperFlight) {
          const topPapers = getTopPaperMeshes(3);
          if (topPapers.length > 0) {
            const startAt = performance.now();

            // Shared base position just in front of the camera (world space),
            // converted per-mesh into its local parent space.
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
              camera.quaternion,
            );
            const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
              camera.quaternion,
            );
            const baseFrontWorld = camera.position
              .clone()
              // Further away from camera so it's less "in your face"
              .add(camDir.multiplyScalar(3.0))
              // Slightly below center
              .add(camUp.clone().multiplyScalar(-0.18))
              // Centered
              .add(camRight.clone().multiplyScalar(0));

            const yToMinusZ = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, 0, -1),
            );

            paperFlight = {
              startAt,
              phase: "enter",
              dismissAt: null,
              cycleAt: null,
              baseFrontWorld,
              camDirWorld: camDir.clone(),
              camRightWorld: camRight.clone(),
              camUpWorld: camUp.clone(),
              papers: topPapers.map((mesh, i) => {
                const paperIndex = paperMeshes.indexOf(mesh);
                const startPos = mesh.position.clone();
                const startRot = mesh.rotation.clone();
                const startQuat = mesh.quaternion.clone();
                // Stack: tiny vertical offset + tiny depth offset per sheet
                const frontWorld = baseFrontWorld
                  .clone()
                  .add(camUp.clone().multiplyScalar(i * 0.012))
                  .add(camDir.clone().multiplyScalar(i * 0.008));
                const frontPos = mesh.parent.worldToLocal(frontWorld);
                return {
                  mesh,
                  paperIndex,
                  startPos,
                  startRot,
                  startQuat,
                  offPos: startPos
                    .clone()
                    .add(new THREE.Vector3(-9 - i * 0.6, 0, 0)),
                  frontPos,
                  targetQuat: camera.quaternion.clone().multiply(yToMinusZ),
                  returnStartQuat: null,
                  didReturnStart: false,
                  overlay: null,
                  certIndex: i,
                };
              }),
            };
          }
        }
        // Remove outline highlight on click (especially noticeable while flying).
        outlinePass.selectedObjects = [];
        renderer.domElement.style.cursor = "default";
        // Hide hover label ("CERTIFICATIONS") while papers are active.
        labelPosRef.current = null;
        setHoverLabel(null);
        if (isCertificateCarouselEnabled()) setShowCarousel(true);
      }
    };

    const beginCycle = (dir) => {
      if (!paperFlight || paperFlight.phase !== "front") return;

      const current = paperFlight.papers.slice();
      const moving =
        dir === "next" ? current[0] : current[current.length - 1];
      const nextOrder =
        dir === "next"
          ? [...current.slice(1), current[0]]
          : [current[current.length - 1], ...current.slice(0, -1)];

      paperFlight.cycleDir = dir;
      paperFlight.cycleMovingMesh = moving?.mesh ?? null;
      paperFlight.cycleNextOrder = nextOrder;
      paperFlight.cycleAt = performance.now();
      paperFlight.phase = "cycle";

      // Prepare from/to transforms for each mesh based on the *next* ordering.
      const baseFrontWorld = paperFlight.baseFrontWorld;
      const camDir = paperFlight.camDirWorld;
      const camUp = paperFlight.camUpWorld;
      nextOrder.forEach((p, i) => {
        const frontWorld = baseFrontWorld
          .clone()
          .add(camUp.clone().multiplyScalar(i * 0.012))
          .add(camDir.clone().multiplyScalar(i * 0.008));
        p.cycleToPos = p.mesh.parent.worldToLocal(frontWorld);
        p.cycleToQuat = p.targetQuat.clone();
      });
      current.forEach((p) => {
        p.cycleFromPos = p.mesh.position.clone();
        p.cycleFromQuat = p.mesh.quaternion.clone();
      });

      // Overlays stay attached to each paper; no swapping needed.
    };

    cyclePapersRef.current = beginCycle;

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
      if (p >= ZOOM_STAGE_DESKTOP - 0.01 && !glitchTriggered) {
        glitchTriggered = true;
        syncTargetRef(ZOOM_STAGE_DESKTOP);
        triggerGlitch();
      }
    };

    const checkZoomOut = () => {
      if (!zoomingOutRef.current) return;
      if (!zoomOutStarted) {
        zoomOutStarted = true;
        startZoomAnimation(0, 950);
      }
      if (
        zoomOutStarted &&
        targetProgress <= 0 &&
        scrollProgress < 0.01 &&
        !zoomAnimation
      ) {
        syncTargetRef(0);
        setScrollProgress(0);
        glitchTriggered = false;
        zoomOutStarted = false;
        zoomingOutRef.current = false;
        isRestoringRef.current = false;
      }
    };

    const isMidZoomAnimation = () => {
      return isZoomAnimationLocked();
    };

    const observer = new IntersectionObserver(
      ([e]) => {
        sectionActive = e.intersectionRatio >= 0.98;
      },
      { threshold: 0.98 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const onWheel = (e) => {
      if (paperFlight) {
        e.preventDefault();
        return;
      }
      if (isRestoringRef.current) return;
      if (isMidZoomAnimation()) {
        e.preventDefault();
        return;
      }
      if (e.deltaY < 0 && targetProgress <= 0 && scrollProgress < 0.02) return;
      if (!sectionActive && targetProgress <= 0) return;
      if (e.deltaY > 0 && scrollProgress < ZOOM_STAGE_DESKTOP - 0.02) {
        e.preventDefault();
        startZoomAnimation(getNextZoomInTarget());
        return;
      }
      if (e.deltaY < 0 && scrollProgress > 0.02) {
        e.preventDefault();
        startZoomAnimation(getNextZoomOutTarget(), 850);
        return;
      }
      if (
        targetProgress >= ZOOM_STAGE_DESKTOP &&
        scrollProgress > ZOOM_STAGE_DESKTOP - 0.02
      )
        return;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (paperFlight) {
        e.preventDefault();
        return;
      }
      if (isRestoringRef.current) return;
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (isMidZoomAnimation()) {
        e.preventDefault();
        return;
      }
      if (dy < 0 && targetProgress <= 0 && scrollProgress < 0.02) return;
      if (!sectionActive && targetProgress <= 0) return;
      if (Math.abs(dy) < 16) return;
      if (dy > 0 && scrollProgress < ZOOM_STAGE_DESKTOP - 0.02) {
        e.preventDefault();
        startZoomAnimation(getNextZoomInTarget());
        return;
      }
      if (dy < 0 && scrollProgress > 0.02) {
        e.preventDefault();
        startZoomAnimation(getNextZoomOutTarget(), 850);
        return;
      }
      if (dy > 0 && targetProgress >= ZOOM_STAGE_DESKTOP) return;
      e.preventDefault();
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    let raf,
      t = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.008;

      checkZoomOut();
      if (zoomAnimation) {
        const elapsed = performance.now() - zoomAnimation.startAt;
        const rawProgress = Math.min(1, elapsed / zoomAnimation.duration);
        const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
        const nextProgress =
          zoomAnimation.from +
          (zoomAnimation.to - zoomAnimation.from) * easedProgress;
        setScrollProgress(nextProgress);
        if (rawProgress >= 1) {
          setScrollProgress(zoomAnimation.to);
          zoomAnimation = null;
        }
      } else {
        setScrollProgress(targetProgress);
      }
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
        if (paperFlight?.papers?.some((p) => p.mesh === m)) return;
        m.position.y =
          paperOrigins[i].y +
          (paperTargets[i].y - paperOrigins[i].y) * paperHoverProgress;
        m.rotation.y =
          paperOrigins[i].ry +
          (paperTargets[i].ry - paperOrigins[i].ry) * paperHoverProgress;
      });

      // Paper "fly off left then pop back in front of camera"
      if (paperFlight) {
        const now = performance.now();

        const returnDur = PAPER_RETURN_END_MS - PAPER_SHOOT_MS;

        if (paperFlight.phase === "enter") {
          let allDone = true;
          paperFlight.papers.forEach((p, idx) => {
            const elapsed = now - paperFlight.startAt - idx * PAPER_STAGGER_MS;
            if (elapsed <= 0) {
              allDone = false;
              return;
            }

            // Phase 1: shoot left (stack -> offscreen)
            if (elapsed < PAPER_SHOOT_MS) {
              allDone = false;
              const t = easeOutCubic(elapsed / PAPER_SHOOT_MS);
              p.mesh.position.lerpVectors(p.startPos, p.offPos, t);
              p.mesh.rotation.z = p.startRot.z + t * 0.9;
              p.mesh.rotation.x = p.startRot.x + t * 0.25;
              return;
            }

            // Phase 2: fly to center (offscreen -> frontPos) + become upright
            if (elapsed < PAPER_RETURN_END_MS) {
              allDone = false;
              const t = easeInOutCubic((elapsed - PAPER_SHOOT_MS) / returnDur);
              p.mesh.position.lerpVectors(p.offPos, p.frontPos, t);

              if (!p.didReturnStart) {
                p.didReturnStart = true;
                p.returnStartQuat = p.mesh.quaternion.clone();
              }

              if (p.returnStartQuat) {
                p.mesh.quaternion.copy(p.returnStartQuat).slerp(p.targetQuat, t);
              } else {
                p.mesh.quaternion.copy(p.targetQuat);
              }

              return;
            }

            // Done: keep in front
            p.mesh.position.copy(p.frontPos);
            p.mesh.quaternion.copy(p.targetQuat);
          });

          if (allDone) {
            paperFlight.phase = "front";
            ensureCertificateOverlays();
          }
        } else if (paperFlight.phase === "cycle") {
          const elapsed = now - (paperFlight.cycleAt ?? now);
          const dur = 360;
          const t = easeInOutCubic(Math.min(1, elapsed / dur));
          const sideBump = Math.sin(Math.PI * t);

          const camDir = paperFlight.camDirWorld ?? new THREE.Vector3(0, 0, -1);
          const camUp = paperFlight.camUpWorld ?? new THREE.Vector3(0, 1, 0);
          const camRight =
            paperFlight.camRightWorld ?? new THREE.Vector3(1, 0, 0);

          const sideDir = (paperFlight.cycleDir ?? "next") === "next" ? 1 : -1;
          const movingMesh = paperFlight.cycleMovingMesh;

          paperFlight.papers.forEach((p) => {
            const pos = p.cycleFromPos.clone().lerp(p.cycleToPos, t);
            if (movingMesh && p.mesh === movingMesh) {
              // Make the sheet swing fully to the side first (fully visible),
              // then only later move into the back/front of the stack.
              const split = 0.6;
              const sideT = Math.min(1, t / split);
              const backT = t < split ? 0 : (t - split) / (1 - split);
              const sideEase = easeOutCubic(sideT);
              const backEase = easeInOutCubic(backT);

              const maxSide = 0.92;
              const maxUp = 0.14;
              const maxBack = 0.48;

              const sideAmt = maxSide * sideEase * (1 - backEase) * sideDir;
              const upAmt = maxUp * sideEase * (1 - backEase);
              pos.add(camRight.clone().multiplyScalar(sideAmt));
              pos.add(camUp.clone().multiplyScalar(upAmt));
              pos.add(camDir.clone().multiplyScalar(maxBack * backEase));
            }
            p.mesh.position.copy(pos);
            p.mesh.quaternion.copy(p.cycleFromQuat).slerp(p.cycleToQuat, t);
          });

          // Keep certificate overlays present while cycling
          ensureCertificateOverlays();

          if (t >= 1) {
            // Apply the new ordering
            if (paperFlight.cycleNextOrder)
              paperFlight.papers = paperFlight.cycleNextOrder;
            paperFlight.cycleNextOrder = null;
            paperFlight.cycleMovingMesh = null;

            // Persist the new "front" target positions for dismiss/next cycles.
            paperFlight.papers.forEach((p) => {
              if (p.cycleToPos) p.frontPos = p.cycleToPos.clone();
            });

            ensureCertificateOverlays();
            paperFlight.phase = "front";
          }
        } else if (paperFlight.phase === "dismiss") {
          // Safety: ensure overlays are hidden while returning to the desk.
          if (!paperFlight.didHideOverlays) {
            paperFlight.papers.forEach((p) => {
              if (p.overlay) {
                p.mesh.remove(p.overlay);
                p.overlay.geometry.dispose();
                p.overlay.material.dispose();
                p.overlay = null;
              }
            });
            paperFlight.didHideOverlays = true;
          }
          let allDone = true;
          paperFlight.papers.forEach((p, idx) => {
            const baseAt = paperFlight.dismissAt ?? now;
            const elapsed = now - baseAt - idx * PAPER_STAGGER_MS;
            if (elapsed <= 0) {
              allDone = false;
              return;
            }

            // Reverse Phase 2: center -> offscreen
            if (elapsed < returnDur) {
              allDone = false;
              const t = easeInOutCubic(elapsed / returnDur);
              const fromPos = p.dismissFromPos ?? p.frontPos;
              const fromQuat = p.dismissFromQuat ?? p.targetQuat;
              p.mesh.position.lerpVectors(fromPos, p.offPos, t);
              p.mesh.quaternion.copy(fromQuat).slerp(p.startQuat, t);
              return;
            }

            // Reverse Phase 1: offscreen -> "floating stack" (above desk)
            const floatDur = 340;
            const t2Raw = Math.min(1, Math.max(0, (elapsed - returnDur) / floatDur));
            const t2 = easeInOutCubic(t2Raw);
            const floatPos = p.startPos.clone();
            if (typeof p.paperIndex === "number" && p.paperIndex >= 0) {
              floatPos.y = paperTargets[p.paperIndex].y;
            } else {
              floatPos.y += 0.18;
            }
            p.mesh.position.lerpVectors(p.offPos, floatPos, t2);
            p.mesh.rotation.copy(p.startRot);
            if (typeof p.paperIndex === "number" && p.paperIndex >= 0) {
              p.mesh.rotation.y = paperTargets[p.paperIndex].ry;
            }
            if (t2Raw < 1) {
              allDone = false;
              return;
            }

            // Hold the floating pose for a bit before settling down.
            const holdRaw = Math.min(
              1,
              Math.max(
                0,
                (elapsed - returnDur - floatDur) / PAPER_FLOAT_HOLD_MS,
              ),
            );
            if (holdRaw < 1) {
              // Stay at hover target during hold.
              p.mesh.position.copy(floatPos);
              allDone = false;
              return;
            }

          });

          if (allDone) {
            // Hand off to the existing hover animation for the "float down":
            // keep hovered pose (progress=1), then let it ease back to rest (0)
            // because the mouse is not hovering the stack.
            currentHovered = null;
            paperHoverProgress = 1;

            paperFlight.papers.forEach((p) => {
              if (p.overlay) {
                p.mesh.remove(p.overlay);
                p.overlay.geometry.dispose();
                p.overlay.material.dispose();
                p.overlay = null;
              }
            });
            outlinePass.selectedObjects = [];
            renderer.domElement.style.cursor = "default";
            paperFlight = null;
          }
        }
      }

      // Ensure the "CERTIFICATIONS" hover label doesn't linger behind.
      if (paperFlight && hoverLabel) setHoverLabel(null);

      // Folder hover
      folderHoverProgress +=
        ((currentHovered === "folder" ? 1 : 0) - folderHoverProgress) * 0.07;
      if (folderTopPivot)
        folderTopPivot.rotation.z = folderHoverProgress * Math.PI * 0.25;

      composer.render();

      // Paper nav arrows (screen-space) while papers are in front
      if (paperFlight?.phase === "front") {
        // Anchor arrows to the *stack center* (not the moving paper), so they
        // don't shift during page-turn animations.
        const baseWorld = paperFlight.baseFrontWorld;
        const centerNdc = baseWorld.clone().project(camera);
        const rect = renderer.domElement.getBoundingClientRect();
        const centerX = (centerNdc.x * 0.5 + 0.5) * rect.width + rect.left;
        const centerY = (-centerNdc.y * 0.5 + 0.5) * rect.height + rect.top;

        // Approximate paper half-width in screen space by projecting a point
        // offset along camera-right.
        const camRight = paperFlight.camRightWorld ?? new THREE.Vector3(1, 0, 0);
        const halfWWorld = 0.85; // ~ paper width / 2 (1.7/2)
        const rightEdgeNdc = baseWorld
          .clone()
          .add(camRight.clone().multiplyScalar(halfWWorld))
          .project(camera);
        const rightEdgeX =
          (rightEdgeNdc.x * 0.5 + 0.5) * rect.width + rect.left;
        const halfWpx = Math.abs(rightEdgeX - centerX);

        const edgePad = 2; // closer
        const next = {
          x: centerX,
          y: centerY,
          leftX: centerX - halfWpx - edgePad,
          rightX: centerX + halfWpx + edgePad,
          visible: true,
        };
          const prev = paperNavRef.current;
          if (
            !prev ||
            prev.visible !== next.visible ||
            Math.abs((prev.x ?? 0) - next.x) > 0.5 ||
            Math.abs((prev.y ?? 0) - next.y) > 0.5 ||
            Math.abs((prev.leftX ?? 0) - next.leftX) > 0.5 ||
            Math.abs((prev.rightX ?? 0) - next.rightX) > 0.5
          ) {
            paperNavRef.current = next;
            setPaperNav(next);
          }
      } else if (paperFlight?.phase !== "cycle" && paperNavRef.current?.visible) {
        paperNavRef.current = { x: 0, y: 0, visible: false };
        setPaperNav(null);
      }

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

      {paperNav?.visible && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 900,
          }}>
          <button
            className="cc-arrow cc-arrow-left"
            onClick={() => cyclePapersRef.current?.("prev")}
            aria-label="Previous"
            style={{
              position: "absolute",
              left: `${paperNav.leftX ?? paperNav.x - 190}px`,
              top: `${paperNav.y}px`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className="cc-arrow cc-arrow-right"
            onClick={() => cyclePapersRef.current?.("next")}
            aria-label="Next"
            style={{
              position: "absolute",
              left: `${paperNav.rightX ?? paperNav.x + 190}px`,
              top: `${paperNav.y}px`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 18L15 12L9 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div ref={sectionRef} className="projects-page-section">
        <div ref={mountRef} className="projects-page-canvas" />
      </div>
    </>
  );
}

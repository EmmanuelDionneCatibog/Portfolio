import { useEffect, useRef } from "react";

export default function GlitchOverlay({ active, onDone }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Capture the current screen content to distort
    // We'll use pixel manipulation to simulate real screen corruption
    let frame = 0;
    const totalFrames = 50; // longer = more dramatic

    // Pre-generate a noise texture to sample from
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = w;
    noiseCanvas.height = h;
    const nctx = noiseCanvas.getContext("2d");
    const noiseData = nctx.createImageData(w, h);
    for (let i = 0; i < noiseData.data.length; i += 4) {
      const v = Math.random() * 255;
      noiseData.data[i] = v;
      noiseData.data[i + 1] = v;
      noiseData.data[i + 2] = v;
      noiseData.data[i + 3] = 255;
    }
    nctx.putImageData(noiseData, 0, 0);

    const draw = () => {
      frame++;
      const progress = frame / totalFrames; // 0→1

      // Black base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // ── 1. SCANLINES — fine horizontal lines across full screen ──
      const scanlineGap = 3;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      for (let y = 0; y < h; y += scanlineGap) {
        ctx.fillRect(0, y, w, 1);
      }

      // ── 2. HORIZONTAL BLOCK TEARS — large displaced rectangles ──
      const tears = 6 + Math.floor(Math.random() * 8);
      for (let i = 0; i < tears; i++) {
        const ty = Math.floor(Math.random() * h);
        const th = 2 + Math.floor(Math.random() * 28);
        const shift = (Math.random() - 0.5) * 180;
        const bright = 30 + Math.floor(Math.random() * 60);
        ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
        ctx.fillRect(shift, ty, w, th);
      }

      // ── 3. RGB CHANNEL SPLIT — draw same stripe offset in R, G, B ──
      const rgbBands = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < rgbBands; i++) {
        const by = Math.floor(Math.random() * h);
        const bh = 1 + Math.floor(Math.random() * 8);
        const shift = 8 + Math.random() * 20;
        // Red channel — shifted left
        ctx.fillStyle = `rgba(255,0,0,${0.4 + Math.random() * 0.4})`;
        ctx.fillRect(-shift, by, w, bh);
        // Green channel — centered
        ctx.fillStyle = `rgba(0,255,0,${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(0, by + 1, w, bh);
        // Blue channel — shifted right
        ctx.fillStyle = `rgba(0,100,255,${0.4 + Math.random() * 0.4})`;
        ctx.fillRect(shift, by + 2, w, bh);
      }

      // ── 4. PIXEL CORRUPTION BLOCKS — small random colored squares ──
      const blocks = 20 + Math.floor(Math.random() * 30);
      for (let i = 0; i < blocks; i++) {
        const bx = Math.floor(Math.random() * w);
        const by = Math.floor(Math.random() * h);
        const bw = 2 + Math.floor(Math.random() * 12);
        const bh2 = 2 + Math.floor(Math.random() * 6);
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.fillRect(bx, by, bw, bh2);
      }

      // ── 5. VERTICAL SYNC LINES — thin vertical bars ──
      const vbars = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < vbars; i++) {
        const vx = Math.floor(Math.random() * w);
        const vw = 1 + Math.floor(Math.random() * 3);
        ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`;
        ctx.fillRect(vx, 0, vw, h);
      }

      // ── 6. NOISE OVERLAY — subtle static grain ──
      ctx.globalAlpha = 0.06 + Math.random() * 0.08;
      ctx.drawImage(noiseCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // ── 7. FULL-SCREEN FLASH SPIKES — random bright frames ──
      if (Math.random() < 0.12) {
        ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.18})`;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 8. SCREEN OFF FLICKER — occasionally go near-black ──
      if (Math.random() < 0.08) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, w, h);
      }

      // ── 9. WHITEOUT AT END ──
      if (progress > 0.78) {
        const a = (progress - 0.78) / 0.22;
        // Ease in — not linear, more dramatic
        const eased = a * a;
        ctx.fillStyle = `rgba(255,255,255,${eased})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (frame < totalFrames) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
        onDone();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        pointerEvents: "none",
        display: active ? "block" : "none",
      }}
    />
  );
}

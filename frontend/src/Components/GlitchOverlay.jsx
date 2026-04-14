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
    let frame = 0;
    const totalFrames = 42;

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

    const drawBand = (x, y, bandWidth, bandHeight, shift, alpha = 1) => {
      const drawX = x + shift;

      ctx.fillStyle = `rgba(245,245,245,${0.18 * alpha})`;
      ctx.fillRect(drawX, y, bandWidth, bandHeight);

      ctx.fillStyle = `rgba(255,40,80,${0.22 * alpha})`;
      ctx.fillRect(drawX - 10, y, bandWidth, Math.max(1, bandHeight - 1));

      ctx.fillStyle = `rgba(60,255,190,${0.16 * alpha})`;
      ctx.fillRect(drawX + 7, y + 1, bandWidth, Math.max(1, bandHeight - 1));

      ctx.fillStyle = `rgba(70,120,255,${0.2 * alpha})`;
      ctx.fillRect(drawX + 14, y + 2, bandWidth, Math.max(1, bandHeight - 2));
    };

    const draw = () => {
      frame++;
      const progress = frame / totalFrames;
      const fadeOut = progress > 0.72 ? (progress - 0.72) / 0.28 : 0;
      const intensity = 1 - fadeOut * 0.7;

      ctx.fillStyle = "#060608";
      ctx.fillRect(0, 0, w, h);

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.08,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.7, "rgba(0,0,0,0.2)");
      vignette.addColorStop(1, "rgba(0,0,0,0.62)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.018 * intensity})`;
        ctx.fillRect(0, y, w, 1);
      }

      const darkBands = 7 + Math.floor(Math.random() * 8);
      for (let i = 0; i < darkBands; i++) {
        const ty = Math.floor(Math.random() * h);
        const th = 8 + Math.floor(Math.random() * 36);
        ctx.fillStyle = `rgba(0,0,0,${(0.18 + Math.random() * 0.34) * intensity})`;
        ctx.fillRect(0, ty, w, th);
      }

      const smearColumns = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < smearColumns; i++) {
        const columnX = Math.random() * w;
        const columnWidth = 18 + Math.random() * 42;
        const slices = 10 + Math.floor(Math.random() * 10);

        for (let s = 0; s < slices; s++) {
          const sliceY = Math.random() * h;
          const sliceH = 3 + Math.random() * 14;
          const sliceShift = (Math.random() - 0.5) * 55;

          ctx.fillStyle = `rgba(255,255,255,${(0.08 + Math.random() * 0.1) * intensity})`;
          ctx.fillRect(columnX + sliceShift, sliceY, columnWidth, sliceH);

          ctx.fillStyle = `rgba(255,0,90,${(0.12 + Math.random() * 0.12) * intensity})`;
          ctx.fillRect(columnX + sliceShift - 7, sliceY, columnWidth, sliceH);

          ctx.fillStyle = `rgba(60,255,210,${(0.08 + Math.random() * 0.08) * intensity})`;
          ctx.fillRect(columnX + sliceShift + 6, sliceY + 1, columnWidth, sliceH);
        }
      }

      const tearBands = 22 + Math.floor(Math.random() * 18);
      for (let i = 0; i < tearBands; i++) {
        const ty = Math.floor(Math.random() * h);
        const th = 1 + Math.floor(Math.random() * 7);
        const segmentCount = 1 + Math.floor(Math.random() * 4);

        for (let s = 0; s < segmentCount; s++) {
          const segmentWidth = 24 + Math.random() * (w * 0.22);
          const tx = Math.random() * (w - segmentWidth);
          const shift = (Math.random() - 0.5) * (24 + Math.random() * 70);
          const alpha = intensity * (0.55 + Math.random() * 0.7);
          drawBand(tx, ty, segmentWidth, th, shift, alpha);
        }
      }

      const specks = 18 + Math.floor(Math.random() * 18);
      for (let i = 0; i < specks; i++) {
        const bx = Math.random() * w;
        const by = Math.random() * h;
        const bw = 8 + Math.random() * 28;
        const bh = 1 + Math.random() * 3;

        ctx.fillStyle = `rgba(255,255,255,${(0.07 + Math.random() * 0.1) * intensity})`;
        ctx.fillRect(bx, by, bw, bh);
      }

      ctx.globalAlpha = 0.04 + Math.random() * 0.06;
      ctx.drawImage(noiseCanvas, 0, 0);
      ctx.globalAlpha = 1;

      if (Math.random() < 0.18) {
        ctx.fillStyle = `rgba(255,255,255,${(0.03 + Math.random() * 0.06) * intensity})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (Math.random() < 0.15) {
        ctx.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.18})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (progress > 0.78) {
        const a = (progress - 0.78) / 0.22;
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

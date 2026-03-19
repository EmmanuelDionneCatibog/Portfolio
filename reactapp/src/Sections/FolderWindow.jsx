import { useEffect, useRef, useState } from "react";

const btnStyle = (bg) => ({
  width: "24px",
  height: "20px",
  background: bg,
  border: "none",
  borderRadius: "3px",
  color: "#d7c6ac",
  fontSize: "11px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export default function FolderWindow({
  project,
  onClose,
  onMinimize,
  zIndex,
  onFocus,
}) {
  const winRef = useRef(null);
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragOff = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const [pos, setPos] = useState({
    x: 80 + Math.random() * 120,
    y: 60 + Math.random() * 60,
  });
  const [size, setSize] = useState({ w: 620, h: 440 });
  const [full, setFull] = useState(false);

  // Drag title bar
  const onTitleMouseDown = (e) => {
    if (full) return;
    e.preventDefault();
    dragging.current = true;
    dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus();
  };

  // Resize handle
  const onResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = {
      mx: e.clientX,
      my: e.clientY,
      w: size.w,
      h: size.h,
    };
    onFocus();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) {
        setPos({
          x: e.clientX - dragOff.current.x,
          y: e.clientY - dragOff.current.y,
        });
      }
      if (resizing.current) {
        const dw = e.clientX - resizeStart.current.mx;
        const dh = e.clientY - resizeStart.current.my;
        setSize({
          w: Math.max(360, resizeStart.current.w + dw),
          h: Math.max(260, resizeStart.current.h + dh),
        });
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pos]);

  const containerStyle = full
    ? { position: "fixed", inset: 0, zIndex, borderRadius: 0 }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        borderRadius: "8px",
      };

  return (
    <div
      ref={winRef}
      onMouseDown={onFocus}
      style={{
        ...containerStyle,
        backgroundColor: "#1c1c2c",
        border: "1px solid rgba(219,152,52,0.3)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}>
      {/* Title bar */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#25263a",
          borderBottom: "1px solid rgba(219,152,52,0.2)",
          cursor: full ? "default" : "move",
          flexShrink: 0,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="12" viewBox="0 0 52 44" fill="none">
            <path
              d="M2 8C2 5.79 3.79 4 6 4H20L24 10H46C48.21 10 50 11.79 50 14V38C50 40.21 48.21 42 46 42H6C3.79 42 2 40.21 2 38V8Z"
              fill="#db9834"
            />
            <path
              d="M2 14H50V38C50 40.21 48.21 42 46 42H6C3.79 42 2 40.21 2 38V14Z"
              fill="#d7c6ac"
              opacity="0.8"
            />
          </svg>
          <span style={{ color: "#d7c6ac", fontSize: "13px", fontWeight: 500 }}>
            {project.name}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: "6px" }}
          onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={onMinimize}
            style={btnStyle("#25263a")}
            title="Minimize">
            ─
          </button>
          <button
            onClick={() => setFull((f) => !f)}
            style={btnStyle("#25263a")}
            title={full ? "Restore" : "Maximize"}>
            {full ? "❐" : "□"}
          </button>
          <button
            onClick={onClose}
            style={btnStyle("rgba(200,40,40,0.75)")}
            title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Address bar */}
      <div
        style={{
          padding: "7px 14px",
          background: "#1a1a2a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}>
        <span style={{ color: "rgba(215,198,172,0.4)", fontSize: "11px" }}>
          📁
        </span>
        <span style={{ color: "rgba(215,198,172,0.5)", fontSize: "12px" }}>
          This PC › Projects › {project.name}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "24px 28px 28px",
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#db9834",
            fontWeight: 600,
          }}>
          {project.tag}
        </span>
        <h2
          style={{
            margin: "10px 0 12px",
            color: "#d7c6ac",
            fontSize: "20px",
            fontWeight: 700,
          }}>
          {project.name}
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            color: "rgba(215,198,172,0.65)",
            fontSize: "14px",
            lineHeight: 1.7,
          }}>
          {project.desc}
        </p>
        <button
          style={{
            padding: "9px 20px",
            background: "transparent",
            border: "1.5px solid rgba(219,152,52,0.6)",
            borderRadius: "5px",
            color: "#db9834",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.04em",
            fontFamily: "system-ui, sans-serif",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#db9834";
            e.currentTarget.style.color = "#25263a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#db9834";
          }}>
          Open Project →
        </button>
      </div>

      {/* Resize handle */}
      {!full && (
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "16px",
            height: "16px",
            cursor: "se-resize",
            background:
              "linear-gradient(135deg, transparent 50%, rgba(219,152,52,0.4) 50%)",
          }}
        />
      )}
    </div>
  );
}

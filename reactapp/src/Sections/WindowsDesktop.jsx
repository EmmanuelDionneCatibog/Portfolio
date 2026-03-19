import { useEffect, useRef, useState } from "react";
import FolderIcon from "./FolderIcon";
import FolderWindow from "./FolderWindow";

export const PROJECTS = [
  {
    name: "Chess AI",
    desc: "A chess engine built with minimax and alpha-beta pruning. Supports multiple difficulty levels.",
    tag: "Python / ML",
  },
  {
    name: "Portfolio",
    desc: "This very site — built with React, Three.js, and a lot of scroll animations.",
    tag: "React / Three.js",
  },
  {
    name: "Game Client",
    desc: "A multiplayer game lobby and matchmaking system with real-time updates via WebSockets.",
    tag: "Node / WS",
  },
  {
    name: "Data Dashboard",
    desc: "An analytics dashboard visualizing large datasets with D3.js and CSV ingestion.",
    tag: "D3 / React",
  },
  {
    name: "CLI Toolkit",
    desc: "A command-line developer toolkit with file scaffolding, linting and build automation.",
    tag: "Node / CLI",
  },
  {
    name: "Mobile App",
    desc: "A cross-platform mobile app for tracking study sessions and goals, built with React Native.",
    tag: "React Native",
  },
];

export default function WindowsDesktop({ visible, onBack, onSignOut }) {
  const [windows, setWindows] = useState([]);
  const [zOrders, setZOrders] = useState([]);
  const [time, setTime] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openWindow = (projIdx) => {
    const id = nextId.current++;
    setWindows((w) => [...w, { id, projIdx, minimized: false }]);
    setZOrders((z) => [...z, id]);
  };

  const closeWindow = (id) => {
    setWindows((w) => w.filter((x) => x.id !== id));
    setZOrders((z) => z.filter((x) => x !== id));
  };
  const minimizeWindow = (id) => {
    setWindows((w) =>
      w.map((x) => (x.id === id ? { ...x, minimized: true } : x)),
    );
  };
  const focusWindow = (id) => {
    setZOrders((z) => [...z.filter((x) => x !== id), id]);
  };
  const restoreWindow = (id) => {
    setWindows((w) =>
      w.map((x) => (x.id === id ? { ...x, minimized: false } : x)),
    );
    focusWindow(id);
  };
  const getZ = (id) => 10 + zOrders.indexOf(id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
      onClick={() => setStartOpen(false)}>
      {/* Wallpaper */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #0d1520 0%, #25263a 45%, #1a1530 100%)",
        }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(219,152,52,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(219,152,52,0.03) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Desktop icons — left column */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 5,
        }}
        onClick={(e) => e.stopPropagation()}>
        {PROJECTS.map((proj, i) => (
          <FolderIcon key={i} name={proj.name} onClick={() => openWindow(i)} />
        ))}
      </div>

      {/* Windows */}
      {windows.map(
        (win) =>
          !win.minimized && (
            <FolderWindow
              key={win.id}
              project={PROJECTS[win.projIdx]}
              zIndex={getZ(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
            />
          ),
      )}

      {/* ── TASKBAR ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "44px",
          background: "rgba(13,15,24,0.92)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(219,152,52,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 200,
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* Start button */}
        <button
          onClick={() => setStartOpen((s) => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            background: startOpen
              ? "rgba(219,152,52,0.2)"
              : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(219,152,52,0.25)",
            borderRadius: "5px",
            color: "#d7c6ac",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            transition: "background 0.15s",
          }}>
          <span style={{ fontSize: "16px" }}>⊞</span>
        </button>

        {/* Open window tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            flex: 1,
            marginLeft: "16px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}>
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() =>
                win.minimized ? restoreWindow(win.id) : focusWindow(win.id)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                background: win.minimized
                  ? "rgba(219,152,52,0.08)"
                  : "rgba(219,152,52,0.18)",
                border: "1px solid rgba(219,152,52,0.25)",
                borderRadius: "4px",
                color: "#d7c6ac",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
              <svg width="10" height="9" viewBox="0 0 52 44" fill="none">
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
              {PROJECTS[win.projIdx].name}
            </button>
          ))}
        </div>

        {/* Clock + tray */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}>
          <span style={{ color: "rgba(215,198,172,0.4)", fontSize: "16px" }}>
            🔊
          </span>
          <span style={{ color: "rgba(215,198,172,0.4)", fontSize: "16px" }}>
            📶
          </span>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ color: "#d7c6ac", fontSize: "13px", fontWeight: 500 }}>
              {time}
            </div>
            <div style={{ color: "rgba(215,198,172,0.5)", fontSize: "11px" }}>
              {new Date().toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Start menu */}
      {startOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "10px",
            width: "320px",
            background: "rgba(13,15,24,0.96)",
            border: "1px solid rgba(219,152,52,0.2)",
            borderRadius: "10px",
            padding: "20px",
            zIndex: 300,
            backdropFilter: "blur(16px)",
          }}
          onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              color: "#d7c6ac",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "14px",
              letterSpacing: "0.04em",
            }}>
            Dionne Catibog
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(219,152,52,0.15)",
              paddingTop: "12px",
            }}>
            {["Documents", "Projects", "Settings", "Sign out"].map(
              (item, i) => (
                <div
                  key={i}
                  onClick={
                    item === "Sign out"
                      ? (e) => {
                          e.stopPropagation();
                          onSignOut();
                        }
                      : undefined
                  }
                  style={{
                    padding: "9px 12px",
                    borderRadius: "5px",
                    color: i === 3 ? "#db9834" : "rgba(215,198,172,0.8)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(219,152,52,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }>
                  <span>{["📄", "📁", "⚙️", "🚪"][i]}</span> {item}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

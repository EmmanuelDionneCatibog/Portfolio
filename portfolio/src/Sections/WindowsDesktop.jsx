import { useEffect, useRef, useState } from "react";
import FolderIcon from "../Components/FolderIcon";
import FolderWindow, { VideoPlayerWindow } from "../Components/FolderWindow";
import { PROJECTS } from "./constants";

export default function WindowsDesktop({ visible, onShutdown }) {
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
    setWindows((w) => [
      ...w,
      { id, type: "folder", projIdx, minimized: false },
    ]);
    setZOrders((z) => [...z, id]);
  };

  const openVideo = (src, title) => {
    const id = nextId.current++;
    setWindows((w) => [
      ...w,
      { id, type: "video", src, title, minimized: false },
    ]);
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
    <>
      {/* Responsive styles for the desktop environment */}
      <style>{`
        .wd-root {
          position: fixed;
          inset: 0;
          z-index: 100;
          transition: opacity 0.4s ease;
          overflow: hidden;
          font-family: system-ui, sans-serif;
        }
        .wd-taskbar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: clamp(36px, 5vh, 44px);
          background: rgba(13,15,24,0.92);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(219,152,52,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(8px, 1.5vw, 16px);
          z-index: 200;
        }
        .wd-start-btn {
          display: flex;
          align-items: center;
          gap: clamp(4px, 0.6vw, 8px);
          padding: clamp(3px, 0.4vh, 5px) clamp(8px, 1vw, 14px);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(219,152,52,0.25);
          border-radius: 5px;
          color: #d7c6ac;
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 600;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .wd-start-btn.open {
          background: rgba(219,152,52,0.2);
        }
        .wd-tab-list {
          display: flex;
          gap: clamp(2px, 0.4vw, 4px);
          align-items: center;
          flex: 1;
          margin-left: clamp(8px, 1.2vw, 16px);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .wd-tab-list::-webkit-scrollbar { display: none; }
        .wd-tab-btn {
          display: flex;
          align-items: center;
          gap: clamp(3px, 0.5vw, 6px);
          padding: clamp(3px, 0.4vh, 4px) clamp(6px, 0.9vw, 12px);
          background: rgba(219,152,52,0.18);
          border: 1px solid rgba(219,152,52,0.25);
          border-radius: 4px;
          color: #d7c6ac;
          font-size: clamp(10px, 0.9vw, 12px);
          cursor: pointer;
          white-space: nowrap;
          max-width: clamp(100px, 14vw, 160px);
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 0;
        }
        .wd-tab-btn.minimized {
          background: rgba(219,152,52,0.08);
        }
        .wd-tray {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1vw, 12px);
          flex-shrink: 0;
        }
        .wd-tray-icon {
          color: rgba(215,198,172,0.4);
          font-size: clamp(13px, 1.4vw, 16px);
        }
        .wd-clock {
          text-align: right;
        }
        .wd-clock-time {
          color: #d7c6ac;
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 500;
          white-space: nowrap;
        }
        .wd-clock-date {
          color: rgba(215,198,172,0.5);
          font-size: clamp(9px, 0.85vw, 11px);
          white-space: nowrap;
        }
        .wd-icons-col {
          position: absolute;
          top: clamp(40px, 6vh, 60px);
          left: clamp(10px, 1.5vw, 20px);
          display: flex;
          flex-direction: column;
          gap: clamp(4px, 0.6vh, 8px);
          z-index: 5;
        }
        .wd-start-menu {
          position: absolute;
          bottom: clamp(40px, 5.5vh, 48px);
          left: clamp(6px, 1vw, 10px);
          width: clamp(200px, 28vw, 320px);
          background: rgba(13,15,24,0.96);
          border: 1px solid rgba(219,152,52,0.2);
          border-radius: 10px;
          padding: clamp(12px, 1.5vw, 20px);
          z-index: 300;
          backdrop-filter: blur(16px);
        }
        .wd-start-menu-title {
          color: #d7c6ac;
          font-size: clamp(11px, 1vw, 14px);
          font-weight: 600;
          margin-bottom: clamp(8px, 1.2vh, 14px);
          letter-spacing: 0.04em;
        }
        .wd-start-menu-divider {
          border-top: 1px solid rgba(219,152,52,0.15);
          padding-top: clamp(6px, 1vh, 12px);
        }
        .wd-start-menu-item {
          padding: clamp(6px, 0.8vh, 9px) clamp(8px, 1vw, 12px);
          border-radius: 5px;
          font-size: clamp(11px, 1vw, 13px);
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: clamp(6px, 0.8vw, 10px);
        }
      `}</style>

      <div
        className="wd-root"
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
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
        <div className="wd-icons-col" onClick={(e) => e.stopPropagation()}>
          {PROJECTS.map((proj, i) => (
            <FolderIcon
              key={i}
              name={proj.name}
              onClick={() => openWindow(i)}
            />
          ))}
        </div>

        {/* Windows */}
        {windows.map((win) => {
          if (win.minimized) return null;
          if (win.type === "video") {
            return (
              <VideoPlayerWindow
                key={win.id}
                src={win.src}
                title={win.title}
                zIndex={getZ(win.id)}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
              />
            );
          }
          return (
            <FolderWindow
              key={win.id}
              project={PROJECTS[win.projIdx]}
              zIndex={getZ(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              onOpenVideo={openVideo}
            />
          );
        })}

        {/* ── TASKBAR ── */}
        <div className="wd-taskbar" onClick={(e) => e.stopPropagation()}>
          {/* Start button */}
          <button
            className={`wd-start-btn${startOpen ? " open" : ""}`}
            onClick={() => setStartOpen((s) => !s)}>
            <span style={{ fontSize: "clamp(13px, 1.3vw, 16px)" }}>⊞</span>{" "}
            Start
          </button>

          {/* Open window tabs */}
          <div className="wd-tab-list">
            {windows.map((win) => (
              <button
                key={win.id}
                className={`wd-tab-btn${win.minimized ? " minimized" : ""}`}
                onClick={() =>
                  win.minimized ? restoreWindow(win.id) : focusWindow(win.id)
                }>
                <svg
                  width="10"
                  height="9"
                  viewBox="0 0 52 44"
                  fill="none"
                  style={{ flexShrink: 0 }}>
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
                {win.type === "video" ? win.title : PROJECTS[win.projIdx].name}
              </button>
            ))}
          </div>

          {/* Clock + tray */}
          <div className="wd-tray">
            <span className="wd-tray-icon">🔊</span>
            <span className="wd-tray-icon">📶</span>
            <div className="wd-clock">
              <div className="wd-clock-time">{time}</div>
              <div className="wd-clock-date">
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
          <div className="wd-start-menu" onClick={(e) => e.stopPropagation()}>
            <div className="wd-start-menu-title">Dionne Catibog</div>
            <div className="wd-start-menu-divider">
              {["Documents", "Projects", "Settings", "Shutdown"].map(
                (item, i) => (
                  <div
                    key={i}
                    className="wd-start-menu-item"
                    onClick={
                      item === "Shutdown"
                        ? (e) => {
                            e.stopPropagation();
                            onShutdown();
                          }
                        : undefined
                    }
                    style={{
                      color: i === 3 ? "#db9834" : "rgba(215,198,172,0.8)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(219,152,52,0.12)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }>
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

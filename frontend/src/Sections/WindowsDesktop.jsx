import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import FolderIcon from "../Components/FolderIcon";
import FolderWindow, { VideoPlayerWindow } from "../Components/FolderWindow";
import StickyNotesLayer, {
  StickyNotesTaskbarTabs,
  createStickyNote,
} from "../Components/StickyNotesLayer";
import { PROJECTS } from "./constants";

function TrayVolumeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.25 5.4H4.2L6.55 3.2V10.8L4.2 8.6H2.25V5.4Z"
        fill="currentColor"
      />
      <path
        d="M8.15 5.15C8.8 5.6 9.2 6.28 9.2 7C9.2 7.72 8.8 8.4 8.15 8.85"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M9.55 3.95C10.58 4.7 11.2 5.8 11.2 7C11.2 8.2 10.58 9.3 9.55 10.05"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrayWifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.1 5.3C4.95 2.95 9.05 2.95 11.9 5.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M3.95 7.15C5.78 5.65 8.22 5.65 10.05 7.15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M5.8 9.05C6.48 8.48 7.52 8.48 8.2 9.05"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="10.95" r="1.05" fill="currentColor" />
    </svg>
  );
}

function FolderTaskIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 52 44" fill="none" style={{ flexShrink: 0 }}>
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
  );
}

function VideoTaskIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1.2" y="2" width="11.6" height="10" rx="1.4" fill="#db9834" />
      <polygon points="5.5,4.7 9.2,7 5.5,9.3" fill="#25263a" />
    </svg>
  );
}

function StickyTaskIcon({ stacked = false }) {
  return (
    <svg
      width={stacked ? "13" : "10"}
      height={stacked ? "12" : "10"}
      viewBox={stacked ? "0 0 13 12" : "0 0 10 10"}
      fill="none"
      style={{ flexShrink: 0 }}>
      {stacked && (
        <>
          <path
            d="M3 1.4H11V9.4H3V1.4Z"
            fill="#f2e9a7"
            stroke="#a79644"
            strokeWidth="0.8"
          />
          <path
            d="M1 2.6H9V10.6H1V2.6Z"
            fill="#dff0b8"
            stroke="#8fa15e"
            strokeWidth="0.8"
          />
          <path
            d="M2.2 4.7H7.8"
            stroke="#7a845b"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </>
      )}
      {!stacked && (
        <>
          <path d="M1 1H9V9H1V1Z" fill="#dff0b8" stroke="#8fa15e" strokeWidth="0.8" />
          <path d="M2.2 3H7.8" stroke="#7a845b" strokeWidth="0.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function TaskbarItemIcon({ type, stacked = false }) {
  if (type === "video") return <VideoTaskIcon />;
  if (type === "sticky") return <StickyTaskIcon stacked={stacked} />;
  return <FolderTaskIcon />;
}

function StickyPreviewCard({ item, onClick }) {
  return (
    <button
      className={`wd-window-preview-card sticky${item.minimized ? " minimized" : ""}${item.active ? " active" : ""}`}
      onClick={onClick}
      title={item.title}>
      <div className="wd-window-preview-card-head">{item.title}</div>
      <div className="wd-window-preview-frame sticky">
        <div className="wd-sticky-preview-paper">
          <div className="wd-sticky-preview-paper-line short" />
          <div className="wd-sticky-preview-paper-line" />
          <div className="wd-sticky-preview-paper-line mid" />
          <div className="wd-sticky-preview-paper-content">{item.previewText}</div>
        </div>
      </div>
    </button>
  );
}

function TaskbarWindowPreviewCard({ item, onClick }) {
  const renderPreview = () => {
    if (item.type === "video") {
      return (
        <div className="wd-window-preview-screen video">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="12" fill="rgba(0,0,0,0.28)" />
            <polygon points="10,8 19,13 10,18" fill="#f4ebd7" />
          </svg>
        </div>
      );
    }

    if (item.type === "folder") {
      return item.previewImage ? (
        <img
          className="wd-window-preview-image"
          src={item.previewImage}
          alt={item.title}
        />
      ) : (
        <div className="wd-window-preview-screen folder">
          <TaskbarItemIcon type="folder" />
        </div>
      );
    }

    return (
      <div className="wd-window-preview-screen">
        <TaskbarItemIcon type={item.type} />
      </div>
    );
  };

  return (
    <button
      className={`wd-window-preview-card${item.minimized ? " minimized" : ""}${item.active ? " active" : ""}`}
      onClick={onClick}
      title={item.title}>
      <div className="wd-window-preview-card-head">{item.title}</div>
      <div className="wd-window-preview-frame">{renderPreview()}</div>
    </button>
  );
}

function TaskbarGroupedButton({ group, onPreviewOpen, onPreviewClose }) {
  const closeTimerRef = useRef(null);
  const buttonClassName = `wd-tab-btn${group.allMinimized ? " minimized" : ""}${group.hasActive ? " active" : ""}`;

  const openPreview = (event) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    onPreviewOpen({
      key: group.key,
      items: group.items,
      anchorRect: rect,
      placement: "top",
    });
  };

  const closePreviewSoon = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      onPreviewClose(group.key);
      closeTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="wd-taskbar-group"
      onMouseEnter={openPreview}
      onMouseLeave={closePreviewSoon}
      onFocus={openPreview}
      onBlur={closePreviewSoon}>
      <button
        className={buttonClassName}
        onClick={group.onPrimaryClick}
        title={group.items.map((item) => item.title).join(" | ")}>
        <TaskbarItemIcon type={group.type} />
      </button>
    </div>
  );
}

function getPreviewPosition(anchorRect, previewSize, placement = "top") {
  const margin = 12;
  const gap = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.left + anchorRect.width / 2 - previewSize.width / 2;
  let top = anchorRect.top - previewSize.height - gap;

  if (placement === "right") {
    left = anchorRect.right + gap;
    top = anchorRect.top + anchorRect.height / 2 - previewSize.height / 2;

    if (left + previewSize.width > viewportWidth - margin) {
      left = anchorRect.left - previewSize.width - gap;
    }
  } else if (top < margin) {
    top = anchorRect.bottom + gap;
  }

  left = Math.min(
    viewportWidth - previewSize.width - margin,
    Math.max(margin, left),
  );
  top = Math.min(
    viewportHeight - previewSize.height - margin,
    Math.max(margin, top),
  );

  return { left, top };
}

export default function WindowsDesktop({ visible, onShutdown }) {
  const [windows, setWindows] = useState([]);
  const [zOrders, setZOrders] = useState([]);
  const [time, setTime] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const [previewState, setPreviewState] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [stickyNotes, setStickyNotes] = useState(() => [createStickyNote(0)]);
  const [activeStickyId, setActiveStickyId] = useState(0);
  const nextId = useRef(0);
  const previewRef = useRef(null);
  const previewCloseTimerRef = useRef(null);

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

  useEffect(() => {
    if (!stickyNotes.length) {
      const replacement = createStickyNote(0);
      setStickyNotes([replacement]);
      setActiveStickyId(replacement.id);
      return;
    }

    if (!stickyNotes.some((note) => note.id === activeStickyId)) {
      setActiveStickyId(stickyNotes[0].id);
    }
  }, [activeStickyId, stickyNotes]);

  useEffect(() => {
    const clearPreview = () => {
      setPreviewState(null);
      setPreviewPosition(null);
    };

    window.addEventListener("scroll", clearPreview, true);
    window.addEventListener("resize", clearPreview);
    return () => {
      window.removeEventListener("scroll", clearPreview, true);
      window.removeEventListener("resize", clearPreview);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewCloseTimerRef.current) {
        window.clearTimeout(previewCloseTimerRef.current);
      }
    };
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
  const restoreStickyNote = (id) => {
    setStickyNotes((notes) =>
      notes.map((note) =>
        note.id === id ? { ...note, minimized: false, closed: false } : note,
      ),
    );
    setActiveStickyId(id);
  };

  const minimizeStickyNote = (id) => {
    setStickyNotes((notes) =>
      notes.map((note) =>
        note.id === id ? { ...note, minimized: true, maximized: false } : note,
      ),
    );
  };

  const stickyTaskbarItems = StickyNotesTaskbarTabs({
    stickyNotes,
    activeStickyId,
    onRestore: restoreStickyNote,
    onMinimize: minimizeStickyNote,
  }).map((item) => ({
    ...item,
    onPreviewClick: () => restoreStickyNote(Number(item.id.replace("sticky-", ""))),
  }));

  const taskbarGroups = useMemo(() => {
    const windowItems = windows.map((win) => ({
      id: `window-${win.id}`,
      type: win.type,
      title: win.type === "video" ? win.title : PROJECTS[win.projIdx].name,
      previewImage:
        win.type === "folder"
          ? PROJECTS[win.projIdx].logo ||
            PROJECTS[win.projIdx].icon ||
            PROJECTS[win.projIdx].image ||
            null
          : null,
      minimized: win.minimized,
      active: !win.minimized && zOrders[zOrders.length - 1] === win.id,
      onClick: () => (win.minimized ? restoreWindow(win.id) : focusWindow(win.id)),
      onPreviewClick: () =>
        win.minimized ? restoreWindow(win.id) : focusWindow(win.id),
    }));

    const items = [...windowItems, ...stickyTaskbarItems];
    const grouped = items.reduce((map, item) => {
      if (!map.has(item.type)) {
        map.set(item.type, []);
      }
      map.get(item.type).push(item);
      return map;
    }, new Map());

    return Array.from(grouped.entries()).map(([type, groupItems]) => {
      const primaryItem =
        groupItems.find((item) => item.active) ||
        groupItems.find((item) => !item.minimized) ||
        groupItems[groupItems.length - 1];

      return {
        key: type,
        type,
        items: groupItems,
        allMinimized: groupItems.every((item) => item.minimized),
        hasActive: groupItems.some((item) => item.active),
        onPrimaryClick: primaryItem.onClick,
      };
    });
  }, [activeStickyId, stickyTaskbarItems, windows, zOrders]);

  const desktopItems = useMemo(
    () =>
      PROJECTS.map((proj, i) => ({
        id: `desktop-folder-${i}`,
        type: "folder",
        title: proj.name,
        previewImage: proj.logo || proj.icon || proj.image || null,
        minimized: false,
        active: false,
        onClick: () => openWindow(i),
        onPreviewClick: () => openWindow(i),
      })),
    [],
  );

  const clearPreviewCloseTimer = () => {
    if (previewCloseTimerRef.current) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
  };

  const openPreview = ({ key, items, anchorRect, placement }) => {
    clearPreviewCloseTimer();
    setPreviewPosition(null);
    setPreviewState({ key, items, anchorRect, placement });
  };

  const closePreview = (key) => {
    setPreviewState((current) => {
      if (!current || (key && current.key !== key)) return current;
      return null;
    });
    setPreviewPosition(null);
  };

  const schedulePreviewClose = (key) => {
    clearPreviewCloseTimer();
      previewCloseTimerRef.current = window.setTimeout(() => {
      closePreview(key);
    }, 220);
  };

  useLayoutEffect(() => {
    if (!previewState || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    setPreviewPosition(
      getPreviewPosition(
        previewState.anchorRect,
        { width: rect.width, height: rect.height },
        previewState.placement,
      ),
    );
  }, [previewState]);

  const renderPreviewItems = (items) => (
    <div className="wd-window-preview-grid">
      {items.map((item) =>
        item.type === "sticky" ? (
          <StickyPreviewCard
            key={item.id}
            item={item}
            onClick={() => {
              item.onPreviewClick?.();
              closePreview();
            }}
          />
        ) : (
          <TaskbarWindowPreviewCard
            key={item.id}
            item={item}
            onClick={() => {
              item.onPreviewClick?.();
              closePreview();
            }}
          />
        ),
      )}
    </div>
  );

  return (
    <>
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
          width: clamp(34px, 4.6vh, 40px);
          height: clamp(30px, 4.2vh, 36px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          transition:
            background 0.16s ease,
            box-shadow 0.16s ease,
            transform 0.16s ease;
          flex-shrink: 0;
        }
        .wd-start-btn:hover {
          background: rgba(255,255,255,0.08);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .wd-start-btn.open {
          background: rgba(219,152,52,0.16);
          box-shadow:
            inset 0 0 0 1px rgba(219,152,52,0.22),
            0 0 18px rgba(219,152,52,0.14);
        }
        .wd-start-btn:active {
          transform: translateY(1px) scale(0.98);
        }
        .wd-start-icon {
          width: clamp(16px, 2.1vh, 20px);
          height: clamp(16px, 2.1vh, 20px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 2px;
          transform: perspective(24px) rotateY(-12deg);
          filter: drop-shadow(0 1px 0 rgba(0,0,0,0.25));
        }
        .wd-start-icon-pane {
          border-radius: 1px;
          background: linear-gradient(180deg, #7ec3ff 0%, #2f86ff 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 0 0 1px rgba(17,45,89,0.28);
        }
        .wd-start-btn.open .wd-start-icon-pane {
          background: linear-gradient(180deg, #ffd196 0%, #db9834 100%);
        }
        .wd-tab-list {
          display: flex;
          gap: clamp(2px, 0.4vw, 4px);
          align-items: center;
          flex: 1;
          margin-left: clamp(8px, 1.2vw, 16px);
          overflow-x: auto;
          overflow-y: visible;
          scrollbar-width: none;
        }
        .wd-tab-list::-webkit-scrollbar {
          display: none;
        }
        .wd-tab-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: clamp(30px, 3.8vh, 36px);
          height: clamp(28px, 3.6vh, 34px);
          padding: 0;
          background: rgba(219,152,52,0.18);
          border: 1px solid rgba(219,152,52,0.25);
          border-radius: 4px;
          color: #d7c6ac;
          cursor: pointer;
          flex-shrink: 0;
        }
        .wd-tab-btn.minimized {
          background: rgba(219,152,52,0.08);
        }
        .wd-tab-btn.active {
          background: rgba(219,152,52,0.28);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .wd-taskbar-group {
          position: relative;
          display: flex;
          flex-shrink: 0;
          isolation: isolate;
        }
        .wd-taskbar-preview {
          position: fixed;
          min-width: 220px;
          max-width: min(520px, calc(100vw - 24px));
          padding: 10px;
          border-radius: 14px;
          background: rgba(17,20,30,0.97);
          border: 1px solid rgba(219,152,52,0.22);
          box-shadow: 0 18px 36px rgba(0,0,0,0.42);
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 320;
          pointer-events: auto;
        }
        .wd-taskbar-preview-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.04);
          color: #d7c6ac;
          cursor: pointer;
          text-align: left;
        }
        .wd-taskbar-preview-item:hover,
        .wd-taskbar-preview-item.active {
          background: rgba(219,152,52,0.16);
          border-color: rgba(219,152,52,0.2);
        }
        .wd-taskbar-preview-item.minimized {
          opacity: 0.72;
        }
        .wd-taskbar-preview-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wd-window-preview-grid {
          display: flex;
          gap: 10px;
          align-items: stretch;
          flex-wrap: nowrap;
        }
        .wd-window-preview-card {
          width: min(230px, calc(50vw - 30px));
          min-width: 180px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: #f4ebd7;
          padding: 10px;
          cursor: pointer;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wd-window-preview-card:hover,
        .wd-window-preview-card.active {
          background: rgba(219,152,52,0.16);
          border-color: rgba(219,152,52,0.24);
        }
        .wd-window-preview-card.minimized {
          opacity: 0.74;
        }
        .wd-window-preview-card-head {
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wd-window-preview-frame {
          height: 116px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          background: linear-gradient(180deg, rgba(52,42,36,0.95) 0%, rgba(32,26,24,0.98) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .wd-window-preview-frame.sticky {
          padding: 8px;
          background: linear-gradient(180deg, rgba(36,34,30,0.95) 0%, rgba(27,23,20,0.98) 100%);
        }
        .wd-window-preview-screen {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(244,235,215,0.82);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%),
            radial-gradient(circle at 30% 20%, rgba(219,152,52,0.22), transparent 42%),
            #251f1e;
        }
        .wd-window-preview-screen.folder svg,
        .wd-window-preview-screen.video svg {
          width: 34px;
          height: 34px;
        }
        .wd-window-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .wd-sticky-preview-paper {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(180deg, #fff6cc 0%, #f8efb2 100%);
          border: 1px solid rgba(143,126,67,0.24);
          padding: 10px 10px 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
          overflow: hidden;
          color: #685f34;
        }
        .wd-sticky-preview-paper-line {
          height: 3px;
          border-radius: 999px;
          background: rgba(113,105,64,0.16);
          margin-bottom: 8px;
          width: 100%;
        }
        .wd-sticky-preview-paper-line.short {
          width: 62%;
        }
        .wd-sticky-preview-paper-line.mid {
          width: 78%;
        }
        .wd-sticky-preview-paper-content {
          margin-top: 12px;
          font-size: 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          white-space: normal;
          word-break: break-word;
        }
        .wd-tray {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1vw, 12px);
          flex-shrink: 0;
        }
        .wd-tray-icon {
          width: clamp(24px, 3.2vh, 28px);
          height: clamp(24px, 3.2vh, 28px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(215,198,172,0.62);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 7px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .wd-tray-icon svg {
          width: clamp(13px, 1.4vw, 15px);
          height: clamp(13px, 1.4vw, 15px);
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
          flex-wrap: wrap;
          gap: clamp(4px, 0.6vh, 8px);
          z-index: 5;
          max-height: calc(100vh - clamp(96px, 12vh, 124px));
          max-width: min(100vw - 20px, 520px);
        }
        @media (max-width: 720px) {
          .wd-taskbar {
            padding: 0 8px;
            gap: 8px;
          }
          .wd-start-btn,
          .wd-tab-list,
          .wd-tray {
            flex: 1 1 0;
            min-width: 0;
          }
          .wd-start-btn {
            justify-content: center;
          }
          .wd-tab-list {
            margin-left: 0;
            justify-content: center;
          }
          .wd-tray {
            justify-content: center;
            gap: 8px;
          }
          .wd-icons-col {
            top: clamp(16px, 3vh, 28px);
            left: clamp(8px, 2vw, 12px);
            right: auto;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            align-items: flex-start;
            justify-items: initial;
            max-height: none;
            max-width: min(180px, calc(100vw - 24px));
            gap: 8px;
          }
        }
        @media (max-width: 520px) {
          .wd-taskbar {
            padding: 0 6px;
            gap: 6px;
          }
          .wd-start-btn {
            width: 34px;
          }
          .wd-tab-btn {
            width: 30px;
          }
          .wd-window-preview-grid {
            flex-wrap: wrap;
          }
          .wd-window-preview-card {
            width: 100%;
            min-width: 0;
          }
          .wd-tray {
            gap: 6px;
          }
          .wd-clock-time {
            font-size: 10px;
          }
          .wd-clock-date {
            font-size: 8px;
          }
          .wd-start-menu {
            width: calc(100vw - 16px);
            left: 8px;
            right: 8px;
            bottom: 48px;
          }
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
        onClick={() => {
          setStartOpen(false);
          closePreview();
        }}>
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

        <div className="wd-icons-col" onClick={(e) => e.stopPropagation()}>
          {PROJECTS.map((proj, i) => (
            <FolderIcon
              key={i}
              name={proj.name}
              onClick={() => openWindow(i)}
            />
          ))}
        </div>

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

        <StickyNotesLayer
          stickyNotes={stickyNotes}
          setStickyNotes={setStickyNotes}
          activeStickyId={activeStickyId}
          setActiveStickyId={setActiveStickyId}
        />

        <div className="wd-taskbar" onClick={(e) => e.stopPropagation()}>
          <button
            className={`wd-start-btn${startOpen ? " open" : ""}`}
            onClick={() => setStartOpen((s) => !s)}
            aria-label="Open Start menu"
            title="Start">
            <span className="wd-start-icon" aria-hidden="true">
              <span className="wd-start-icon-pane" />
              <span className="wd-start-icon-pane" />
              <span className="wd-start-icon-pane" />
              <span className="wd-start-icon-pane" />
            </span>
          </button>

          <div className="wd-tab-list">
            {taskbarGroups.map((group) => (
              <TaskbarGroupedButton
                key={group.key}
                group={group}
                onPreviewOpen={openPreview}
                onPreviewClose={schedulePreviewClose}
              />
            ))}
          </div>

          <div className="wd-tray">
            <span className="wd-tray-icon" aria-label="Volume">
              <TrayVolumeIcon />
            </span>
            <span className="wd-tray-icon" aria-label="Wi-Fi">
              <TrayWifiIcon />
            </span>
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

        {previewState && (
          <div
            ref={previewRef}
            className="wd-taskbar-preview"
            style={{
              left: previewPosition?.left ?? -9999,
              top: previewPosition?.top ?? -9999,
              visibility: previewPosition ? "visible" : "hidden",
            }}
            onMouseEnter={clearPreviewCloseTimer}
            onMouseLeave={() => schedulePreviewClose(previewState.key)}
            onClick={(event) => event.stopPropagation()}>
            {renderPreviewItems(previewState.items)}
          </div>
        )}

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

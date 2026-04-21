import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/sticky-notes.css";

const STICKY_MIN_WIDTH = 260;
const STICKY_MIN_HEIGHT = 220;
const STICKY_DEFAULT_SIZE = { w: 334, h: 312 };
const STICKY_HISTORY_SIZE = { w: 360, h: 620 };
const STICKY_HISTORY_MIN_HEIGHT = 260;
const STICKY_HISTORY_ROW_HEIGHT = 92;
const STICKY_HISTORY_CHROME_HEIGHT = 108;

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function getStickyPosition(id) {
  const viewport = getViewportSize();
  return {
    x: Math.max(16, viewport.width - 370 - (id % 3) * 24),
    y: Math.max(24, 28 + (id % 4) * 18),
  };
}

function clampStickyPosition(position, size) {
  const viewport = getViewportSize();
  return {
    x: Math.min(
      Math.max(12, position.x),
      Math.max(12, viewport.width - size.w - 12),
    ),
    y: Math.min(
      Math.max(12, position.y),
      Math.max(12, viewport.height - size.h - 56),
    ),
  };
}

function clampStickySize(size) {
  const viewport = getViewportSize();
  return {
    w: Math.min(
      Math.max(STICKY_MIN_WIDTH, size.w),
      Math.max(STICKY_MIN_WIDTH, viewport.width - 24),
    ),
    h: Math.min(
      Math.max(STICKY_MIN_HEIGHT, size.h),
      Math.max(STICKY_MIN_HEIGHT, viewport.height - 68),
    ),
  };
}

function getStickyHistoryPosition(noteCount = 1) {
  const viewport = getViewportSize();
  const historySize = getStickyHistorySize(noteCount, viewport);
  return {
    x: Math.max(12, viewport.width - historySize.w - 18),
    y: 28,
  };
}

function getStickyHistorySize(noteCount = 1, viewport = getViewportSize()) {
  const desiredHeight = Math.min(
    STICKY_HISTORY_SIZE.h,
    STICKY_HISTORY_CHROME_HEIGHT + Math.max(1, noteCount) * STICKY_HISTORY_ROW_HEIGHT,
  );
  return {
    w: Math.min(STICKY_HISTORY_SIZE.w, Math.max(280, viewport.width - 24)),
    h: Math.min(
      desiredHeight,
      Math.max(STICKY_HISTORY_MIN_HEIGHT, viewport.height - 84),
    ),
  };
}

export function createStickyNote(id) {
  return {
    id,
    title: "Sticky Note",
    content: "",
    closed: false,
    minimized: false,
    maximized: false,
    updatedAt: new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    position: getStickyPosition(id),
    size: STICKY_DEFAULT_SIZE,
  };
}

function StickyControlIcon({ type }) {
  const color = "#354132";

  if (type === "plus") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1.7V10.3" stroke={color} strokeWidth="1.15" />
        <path d="M1.7 6H10.3" stroke={color} strokeWidth="1.15" />
      </svg>
    );
  }

  if (type === "minimize") {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M2 7.5H9" stroke={color} strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === "maximize") {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <rect
          x="2.2"
          y="2.2"
          width="6.6"
          height="6.6"
          stroke={color}
          strokeWidth="1.1"
        />
      </svg>
    );
  }

  if (type === "more") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="3.3" cy="7" r="1" fill={color} />
        <circle cx="7" cy="7" r="1" fill={color} />
        <circle cx="10.7" cy="7" r="1" fill={color} />
      </svg>
    );
  }

  if (type === "search") {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="6.5" cy="6.5" r="4.25" stroke={color} strokeWidth="1.2" />
        <path d="M9.8 9.8L12.7 12.7" stroke={color} strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2.2 2.2L8.8 8.8" stroke={color} strokeWidth="1.15" />
      <path d="M8.8 2.2L2.2 8.8" stroke={color} strokeWidth="1.15" />
    </svg>
  );
}

function StickyToolbarIcon({ type }) {
  if (type === "bold") return <span style={{ fontWeight: 700 }}>B</span>;
  if (type === "italic") return <span style={{ fontStyle: "italic" }}>I</span>;
  if (type === "underline") {
    return <span style={{ textDecoration: "underline" }}>U</span>;
  }
  if (type === "strike") {
    return <span style={{ textDecoration: "line-through" }}>ab</span>;
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="2.2" height="2.2" rx="0.5" fill="currentColor" />
      <rect x="2" y="6.9" width="2.2" height="2.2" rx="0.5" fill="currentColor" />
      <rect x="2" y="10.8" width="2.2" height="2.2" rx="0.5" fill="currentColor" />
      <path d="M6 4H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 12H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function plainTextFromHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function getStickyPreviewText(content) {
  return plainTextFromHtml(content || "");
}

export function StickyNotesTaskbarTabs({
  stickyNotes,
  activeStickyId,
  onRestore,
  onMinimize,
}) {
  return stickyNotes.filter((note) => !note.closed).map((note) => ({
    id: `sticky-${note.id}`,
    type: "sticky",
    title: note.title,
    previewText: getStickyPreviewText(note.content),
    updatedAt: note.updatedAt,
    minimized: note.minimized,
    active: note.id === activeStickyId,
    onClick: () =>
      note.minimized || note.id !== activeStickyId
        ? onRestore(note.id)
        : onMinimize(note.id),
  }));
}

export default function StickyNotesLayer({
  stickyNotes,
  setStickyNotes,
  activeStickyId,
  setActiveStickyId,
}) {
  const [showStickyHistory, setShowStickyHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stickyHistoryPosition, setStickyHistoryPosition] = useState(() =>
    getStickyHistoryPosition(stickyNotes.length),
  );
  const stickyDragging = useRef(false);
  const stickyDragOffset = useRef({ x: 0, y: 0 });
  const stickyHistoryDragging = useRef(false);
  const stickyHistoryDragOffset = useRef({ x: 0, y: 0 });
  const stickyResizing = useRef(null);
  const stickyEditorRefs = useRef({});
  const searchInputRef = useRef(null);
  const historySize = getStickyHistorySize(stickyNotes.length);

  useEffect(() => {
    const activeNote = stickyNotes.find((note) => note.id === activeStickyId);
    const editor = stickyEditorRefs.current[activeStickyId];
    if (!activeNote || activeNote.minimized || activeNote.closed || !editor) return;

    if (editor.innerHTML !== (activeNote.content || "")) {
      editor.innerHTML = activeNote.content || "";
    }
  }, [activeStickyId, stickyNotes]);

  useEffect(() => {
    const onMove = (event) => {
      if (stickyDragging.current) {
        setStickyNotes((notes) =>
          notes.map((note) => {
            if (note.id !== activeStickyId || note.maximized) return note;

            return {
              ...note,
              position: clampStickyPosition(
                {
                  x: event.clientX - stickyDragOffset.current.x,
                  y: event.clientY - stickyDragOffset.current.y,
                },
                note.size || STICKY_DEFAULT_SIZE,
              ),
            };
          }),
        );
      }

      if (stickyHistoryDragging.current) {
        const nextHistorySize = getStickyHistorySize(stickyNotes.length);
        setStickyHistoryPosition(
          clampStickyPosition(
            {
              x: event.clientX - stickyHistoryDragOffset.current.x,
              y: event.clientY - stickyHistoryDragOffset.current.y,
            },
            nextHistorySize,
          ),
        );
      }

      if (stickyResizing.current) {
        const { id, direction, startPointer, startPosition, startSize } =
          stickyResizing.current;
        const deltaX = event.clientX - startPointer.x;
        const deltaY = event.clientY - startPointer.y;

        setStickyNotes((notes) =>
          notes.map((note) => {
            if (note.id !== id || note.maximized) return note;

            let nextPosition = { ...startPosition };
            let nextSize = { ...startSize };

            if (direction.includes("right")) {
              nextSize.w = startSize.w + deltaX;
            }
            if (direction.includes("bottom")) {
              nextSize.h = startSize.h + deltaY;
            }
            if (direction.includes("left")) {
              nextSize.w = startSize.w - deltaX;
              nextPosition.x = startPosition.x + deltaX;
            }
            if (direction.includes("top")) {
              nextSize.h = startSize.h - deltaY;
              nextPosition.y = startPosition.y + deltaY;
            }

            const viewport = getViewportSize();
            const maxRight = viewport.width - 12;
            const maxBottom = viewport.height - 56;

            if (direction.includes("left")) {
              const proposedRight = startPosition.x + startSize.w;
              nextPosition.x = Math.min(
                Math.max(12, nextPosition.x),
                proposedRight - STICKY_MIN_WIDTH,
              );
              nextSize.w = proposedRight - nextPosition.x;
            }

            if (direction.includes("top")) {
              const proposedBottom = startPosition.y + startSize.h;
              nextPosition.y = Math.min(
                Math.max(12, nextPosition.y),
                proposedBottom - STICKY_MIN_HEIGHT,
              );
              nextSize.h = proposedBottom - nextPosition.y;
            }

            if (direction.includes("right")) {
              nextSize.w = Math.min(nextSize.w, maxRight - startPosition.x);
            }

            if (direction.includes("bottom")) {
              nextSize.h = Math.min(nextSize.h, maxBottom - startPosition.y);
            }

            nextSize = clampStickySize(nextSize);
            nextPosition = clampStickyPosition(nextPosition, nextSize);

            return {
              ...note,
              position: nextPosition,
              size: nextSize,
            };
          }),
        );
      }
    };

    const onUp = () => {
      stickyDragging.current = false;
      stickyHistoryDragging.current = false;
      stickyResizing.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [activeStickyId, setStickyNotes, stickyNotes.length]);

  useEffect(() => {
    const onResize = () => {
      const nextHistorySize = getStickyHistorySize(stickyNotes.length);
      setStickyHistoryPosition((current) =>
        clampStickyPosition(current, nextHistorySize),
      );
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [stickyNotes.length]);

  useEffect(() => {
    const nextHistorySize = getStickyHistorySize(stickyNotes.length);
    setStickyHistoryPosition((current) =>
      clampStickyPosition(current, nextHistorySize),
    );
  }, [stickyNotes.length]);

  const updateSticky = (id, updates) => {
    setStickyNotes((notes) =>
      notes.map((note) => (note.id === id ? { ...note, ...updates } : note)),
    );
  };

  const focusSticky = (id) => {
    updateSticky(id, { minimized: false, closed: false });
    setActiveStickyId(id);
  };

  const createNewSticky = () => {
    const nextStickyNumber =
      stickyNotes.reduce((maxId, note) => Math.max(maxId, note.id), -1) + 1;
    setStickyNotes((notes) => [...notes, createStickyNote(nextStickyNumber)]);
    setActiveStickyId(nextStickyNumber);
    setShowStickyHistory(false);
  };

  const minimizeSticky = (id) => {
    updateSticky(id, { minimized: true, maximized: false, closed: false });
    setShowStickyHistory(false);
  };

  const restoreSticky = (id) => {
    updateSticky(id, { minimized: false, maximized: false, closed: false });
    setActiveStickyId(id);
    setShowStickyHistory(false);
  };

  const closeSticky = (id) => {
    updateSticky(id, { closed: true, minimized: false, maximized: false });
  };

  const toggleStickyMaximize = (id) => {
    setStickyNotes((notes) =>
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              closed: false,
              minimized: false,
              maximized: !note.maximized,
            }
          : note,
      ),
    );
    setActiveStickyId(id);
  };

  const openStickyHistory = (id) => {
    setActiveStickyId(id);
    setShowStickyHistory(true);
  };

  const handleStickyInput = (id, html) => {
    updateSticky(id, {
      content: html,
      updatedAt: new Date().toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }),
    });
  };

  const runStickyCommand = (noteId, command) => {
    const editor = stickyEditorRefs.current[noteId];
    editor?.focus();
    if (typeof document === "undefined") return;
    document.execCommand(command, false);
    if (editor) {
      handleStickyInput(noteId, editor.innerHTML);
    }
  };

  const onStickyTitleMouseDown = (event, note) => {
    if (!note || note.maximized) return;
    event.preventDefault();
    stickyDragging.current = true;
    stickyDragOffset.current = {
      x: event.clientX - note.position.x,
      y: event.clientY - note.position.y,
    };
    focusSticky(note.id);
  };

  const startStickyResize = (event, note, direction) => {
    if (!note || note.maximized) return;
    event.preventDefault();
    event.stopPropagation();
    stickyResizing.current = {
      id: note.id,
      direction,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition: { ...note.position },
      startSize: { ...(note.size || STICKY_DEFAULT_SIZE) },
    };
    focusSticky(note.id);
  };

  const filteredStickyNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return [...stickyNotes].sort((a, b) => b.id - a.id);
    }

    return stickyNotes
      .filter((note) => {
        const haystack = `${note.title} ${plainTextFromHtml(note.content)}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => b.id - a.id);
  }, [searchTerm, stickyNotes]);

  const onStickyHistoryMouseDown = (event) => {
    event.preventDefault();
    stickyHistoryDragging.current = true;
    stickyHistoryDragOffset.current = {
      x: event.clientX - stickyHistoryPosition.x,
      y: event.clientY - stickyHistoryPosition.y,
    };
  };

  return (
    <div className="wd-sticky-layer" onClick={(e) => e.stopPropagation()}>
      {stickyNotes
        .filter((note) => !note.minimized && !note.closed)
        .map((note) => (
          <div
            key={note.id}
            className={`wd-sticky-card${note.maximized ? " maximized" : ""}`}
            style={
              note.maximized
                ? {
                    left: 18,
                    right: 18,
                    top: 18,
                    bottom: 54,
                    zIndex: note.id === activeStickyId ? stickyNotes.length + 2 : 1,
                  }
                : {
                    left: note.position.x,
                    top: note.position.y,
                    width: note.size?.w ?? STICKY_DEFAULT_SIZE.w,
                    height: note.size?.h ?? STICKY_DEFAULT_SIZE.h,
                    zIndex: note.id === activeStickyId ? stickyNotes.length + 2 : 1,
                  }
            }
            onMouseDown={() => setActiveStickyId(note.id)}>
            <div
              className="wd-sticky-topbar"
              onMouseDown={(event) => onStickyTitleMouseDown(event, note)}>
              <div className="wd-sticky-topbar-group">
                <button
                  className="wd-sticky-icon-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={createNewSticky}
                  title="New sticky note">
                  <StickyControlIcon type="plus" />
                </button>
              </div>

              <div className="wd-sticky-topbar-group">
                <button
                  className="wd-sticky-icon-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => minimizeSticky(note.id)}
                  title="Minimize">
                  <StickyControlIcon type="minimize" />
                </button>
                <button
                  className="wd-sticky-icon-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => toggleStickyMaximize(note.id)}
                  title={note.maximized ? "Restore" : "Maximize"}>
                  <StickyControlIcon type="maximize" />
                </button>
                <button
                  className="wd-sticky-icon-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => openStickyHistory(note.id)}
                  title="Sticky note history">
                  <StickyControlIcon type="more" />
                </button>
                <button
                  className="wd-sticky-icon-btn"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => closeSticky(note.id)}
                  title="Close">
                  <StickyControlIcon type="close" />
                </button>
              </div>
            </div>

            <div
              ref={(element) => {
                stickyEditorRefs.current[note.id] = element;
              }}
              className="wd-sticky-editor"
              contentEditable
              suppressContentEditableWarning
              onFocus={() => focusSticky(note.id)}
              onInput={(e) => handleStickyInput(note.id, e.currentTarget.innerHTML)}
            />

            <div className="wd-sticky-toolbar">
              {[
                { type: "bold", command: "bold", title: "Bold" },
                { type: "italic", command: "italic", title: "Italic" },
                { type: "underline", command: "underline", title: "Underline" },
                {
                  type: "strike",
                  command: "strikeThrough",
                  title: "Strikethrough",
                },
                {
                  type: "list",
                  command: "insertUnorderedList",
                  title: "Bullet list",
                },
              ].map((tool) => (
                <button
                  key={tool.type}
                  className="wd-sticky-tool-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setActiveStickyId(note.id);
                    runStickyCommand(note.id, tool.command);
                  }}
                  title={tool.title}>
                  <StickyToolbarIcon type={tool.type} />
                </button>
              ))}
            </div>

            {!note.maximized &&
              note.id === activeStickyId &&
              ["top", "right", "bottom", "left"].map((direction) => (
                <button
                  key={direction}
                  type="button"
                  className={`wd-sticky-resize-handle ${direction}`}
                  onMouseDown={(event) => startStickyResize(event, note, direction)}
                  aria-label={`Resize sticky note from ${direction} edge`}
                  tabIndex={-1}
                />
              ))}

            {!note.maximized &&
              note.id === activeStickyId &&
              ["top-left", "top-right", "bottom-right", "bottom-left"].map(
                (direction) => (
                  <button
                    key={direction}
                    type="button"
                    className={`wd-sticky-resize-handle corner ${direction}`}
                    onMouseDown={(event) => startStickyResize(event, note, direction)}
                    aria-label={`Resize sticky note from ${direction} corner`}
                    tabIndex={-1}
                  />
                ),
              )}
          </div>
        ))}

      {showStickyHistory && (
        <div
          className="wd-sticky-history"
          style={{
            left: stickyHistoryPosition.x,
            top: stickyHistoryPosition.y,
            width: historySize.w,
            height: historySize.h,
            zIndex: stickyNotes.length + 12,
          }}>
          <div
            className="wd-sticky-history-head"
            onMouseDown={onStickyHistoryMouseDown}>
            <div className="wd-sticky-history-title">Sticky Notes</div>
            <button
              className="wd-sticky-history-close"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowStickyHistory(false)}
              title="Close history">
              <StickyControlIcon type="close" />
            </button>
          </div>
          <div className="wd-sticky-history-search">
            <div className="wd-sticky-history-searchbox">
              <input
                ref={searchInputRef}
                className="wd-sticky-history-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
              <button
                className="wd-sticky-history-searchbtn"
                onClick={() => searchInputRef.current?.focus()}
                title="Search notes">
                <StickyControlIcon type="search" />
              </button>
            </div>
          </div>
          <div className="wd-sticky-history-list">
            {filteredStickyNotes.map((note) => (
              <button
                key={note.id}
                className="wd-sticky-history-item"
                onClick={() => restoreSticky(note.id)}>
                <span className="wd-sticky-history-date">{note.updatedAt}</span>
                <span className="wd-sticky-history-text">
                  {plainTextFromHtml(note.content) || "Empty note"}
                </span>
              </button>
            ))}
            {!filteredStickyNotes.length && (
              <div className="wd-sticky-history-empty">No matching notes.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

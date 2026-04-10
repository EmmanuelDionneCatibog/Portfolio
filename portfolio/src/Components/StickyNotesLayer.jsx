import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/sticky-notes.css";

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

export function createStickyNote(id) {
  return {
    id,
    title: `Sticky Note ${id + 1}`,
    content: "",
    minimized: false,
    maximized: false,
    updatedAt: new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    position: getStickyPosition(id),
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

export function StickyNotesTaskbarTabs({
  stickyNotes,
  activeStickyId,
  onRestore,
  onMinimize,
}) {
  return stickyNotes.map((note) => (
    <button
      key={`sticky-${note.id}`}
      className={`wd-tab-btn${note.minimized ? " minimized" : ""}`}
      onClick={() =>
        note.minimized || note.id !== activeStickyId
          ? onRestore(note.id)
          : onMinimize(note.id)
      }>
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ flexShrink: 0 }}>
        <path
          d="M1 1H9V9H1V1Z"
          fill="#dff0b8"
          stroke="#8fa15e"
          strokeWidth="0.8"
        />
        <path
          d="M2.2 3H7.8"
          stroke="#7a845b"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </svg>
      {note.title}
    </button>
  ));
}

export default function StickyNotesLayer({
  stickyNotes,
  setStickyNotes,
  activeStickyId,
  setActiveStickyId,
}) {
  const [showStickyHistory, setShowStickyHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const stickyDragging = useRef(false);
  const stickyDragOffset = useRef({ x: 0, y: 0 });
  const stickyEditorRefs = useRef({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    const activeNote = stickyNotes.find((note) => note.id === activeStickyId);
    const editor = stickyEditorRefs.current[activeStickyId];
    if (!activeNote || activeNote.minimized || !editor) return;

    if (editor.innerHTML !== (activeNote.content || "")) {
      editor.innerHTML = activeNote.content || "";
    }
  }, [activeStickyId, stickyNotes]);

  useEffect(() => {
    const onMove = (event) => {
      if (!stickyDragging.current) return;

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
              { w: 334, h: 312 },
            ),
          };
        }),
      );
    };

    const onUp = () => {
      stickyDragging.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [activeStickyId, setStickyNotes]);

  const updateSticky = (id, updates) => {
    setStickyNotes((notes) =>
      notes.map((note) => (note.id === id ? { ...note, ...updates } : note)),
    );
  };

  const focusSticky = (id) => {
    updateSticky(id, { minimized: false });
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
    updateSticky(id, { minimized: true, maximized: false });
    setShowStickyHistory(false);
  };

  const restoreSticky = (id) => {
    updateSticky(id, { minimized: false });
    setActiveStickyId(id);
    setShowStickyHistory(false);
  };

  const closeSticky = (id) => {
    setStickyNotes((notes) => notes.filter((note) => note.id !== id));
    setShowStickyHistory(false);
  };

  const toggleStickyMaximize = (id) => {
    setStickyNotes((notes) =>
      notes.map((note) =>
        note.id === id
          ? { ...note, minimized: false, maximized: !note.maximized }
          : note,
      ),
    );
    setActiveStickyId(id);
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

  return (
    <div className="wd-sticky-layer" onClick={(e) => e.stopPropagation()}>
      {stickyNotes
        .filter((note) => !note.minimized)
        .map((note) => (
          <div
            key={note.id}
            className={`wd-sticky-card${note.maximized ? " maximized" : ""}`}
            style={
              note.maximized
                ? { right: 18, top: 26 }
                : {
                    left: note.position.x,
                    top: note.position.y,
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
                  onClick={() => {
                    setActiveStickyId(note.id);
                    setShowStickyHistory((value) => !value);
                  }}
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
          </div>
        ))}

      {showStickyHistory && (
        <div className="wd-sticky-history">
          <div className="wd-sticky-history-head">
            <div className="wd-sticky-history-title">Sticky Notes</div>
            <button
              className="wd-sticky-history-close"
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

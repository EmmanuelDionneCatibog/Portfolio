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

const ImgPlaceholder = ({ label }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#25263a",
      border: "1px solid rgba(219,152,52,0.2)",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      color: "rgba(215,198,172,0.3)",
      fontSize: "10px",
      letterSpacing: "0.05em",
    }}>
    <svg width="22" height="18" viewBox="0 0 28 24" fill="none">
      <rect
        x="1"
        y="1"
        width="26"
        height="22"
        rx="2"
        stroke="rgba(219,152,52,0.3)"
        strokeWidth="1.5"
      />
      <path
        d="M1 17l7-7 5 5 4-4 10 10"
        stroke="rgba(219,152,52,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="8"
        cy="7"
        r="2.5"
        stroke="rgba(219,152,52,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
    {label}
  </div>
);

const VideoThumbnail = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#25263a",
      border: "1px solid rgba(219,152,52,0.2)",
      borderRadius: "4px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      color: "rgba(215,198,172,0.3)",
      fontSize: "10px",
      letterSpacing: "0.05em",
    }}>
    <svg width="22" height="18" viewBox="0 0 28 24" fill="none">
      <rect
        x="1"
        y="1"
        width="26"
        height="22"
        rx="2"
        stroke="rgba(219,152,52,0.3)"
        strokeWidth="1.5"
      />
      <polygon points="11,8 11,16 19,12" fill="rgba(219,152,52,0.45)" />
    </svg>
    Video Demo
  </div>
);

function PropRow({ label, value, multiline }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: multiline ? "column" : "row",
        gap: multiline ? "2px" : "6px",
      }}>
      <span
        style={{
          color: "rgba(215,198,172,0.4)",
          fontSize: "11px",
          flexShrink: 0,
        }}>
        {label}
      </span>
      <span
        style={{
          color: "rgba(215,198,172,0.75)",
          fontSize: "11px",
          lineHeight: 1.5,
        }}>
        {value}
      </span>
    </div>
  );
}

// ── VIDEO PLAYER WINDOW ──
export function VideoPlayerWindow({
  src,
  title,
  onClose,
  onMinimize,
  zIndex,
  onFocus,
}) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragOff = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const [pos, setPos] = useState({
    x: 120 + Math.random() * 80,
    y: 80 + Math.random() * 60,
  });
  const [size, setSize] = useState({ w: 680, h: 420 });
  const [full, setFull] = useState(false);
  // minimized state managed externally via onMinimize prop

  const onTitleMouseDown = (e) => {
    if (full) return;
    e.preventDefault();
    dragging.current = true;
    dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus();
  };
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
      if (dragging.current)
        setPos({
          x: e.clientX - dragOff.current.x,
          y: e.clientY - dragOff.current.y,
        });
      if (resizing.current)
        setSize({
          w: Math.max(
            400,
            resizeStart.current.w + (e.clientX - resizeStart.current.mx),
          ),
          h: Math.max(
            280,
            resizeStart.current.h + (e.clientY - resizeStart.current.my),
          ),
        });
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
        borderRadius: "6px",
      };

  return (
    <div
      onMouseDown={onFocus}
      style={{
        ...containerStyle,
        backgroundColor: "#000",
        border: "1px solid rgba(219,152,52,0.3)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}>
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#25263a",
          borderBottom: "1px solid rgba(219,152,52,0.2)",
          cursor: full ? "default" : "move",
          flexShrink: 0,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px" }}>🎬</span>
          <span style={{ color: "#d7c6ac", fontSize: "13px", fontWeight: 500 }}>
            {title}
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
      <div
        style={{
          flex: 1,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <video
          src={src}
          controls
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
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

// ── MEDIA ROW — reusable thumbnail + label ──
function MediaRow({ thumb, label, isLast, onClick, hasAction }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(219,152,52,0.07)",
      }}>
      {/* Thumbnail — fixed 72×72 */}
      <div
        onClick={onClick}
        style={{
          width: "72px",
          height: "72px",
          flexShrink: 0,
          cursor: hasAction ? "pointer" : "default",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          if (hasAction) e.currentTarget.style.opacity = "0.75";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}>
        {thumb}
      </div>
      {/* Label — fills all remaining space */}
      <span
        style={{
          color: "rgba(215,198,172,0.6)",
          fontSize: "12px",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
          flex: 1,
          wordBreak: "break-word",
        }}>
        {label}
      </span>
    </div>
  );
}

// ── FOLDER WINDOW ──
export default function FolderWindow({
  project,
  onClose,
  onMinimize,
  zIndex,
  onFocus,
  onOpenVideo,
}) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragOff = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const [pos, setPos] = useState({
    x: 60 + Math.random() * 100,
    y: 50 + Math.random() * 60,
  });
  const [size, setSize] = useState({ w: 760, h: 480 });
  const [full, setFull] = useState(false);
  // video windows opened via onOpenVideo prop (managed by WindowsDesktop)

  const onTitleMouseDown = (e) => {
    if (full) return;
    e.preventDefault();
    dragging.current = true;
    dragOff.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus();
  };
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
      if (dragging.current)
        setPos({
          x: e.clientX - dragOff.current.x,
          y: e.clientY - dragOff.current.y,
        });
      if (resizing.current)
        setSize({
          w: Math.max(
            500,
            resizeStart.current.w + (e.clientX - resizeStart.current.mx),
          ),
          h: Math.max(
            360,
            resizeStart.current.h + (e.clientY - resizeStart.current.my),
          ),
        });
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
        borderRadius: "6px",
      };

  // Video thumbnail with play overlay
  const videoThumb = (src) =>
    src ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
        }}>
        <video
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(219,152,52,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polygon points="3,1 11,6 3,11" fill="#25263a" />
            </svg>
          </div>
        </div>
      </div>
    ) : (
      <VideoThumbnail />
    );

  // Icon thumbnail — circular
  const iconThumb = (
    <div
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(219,152,52,0.35)",
        position: "relative",
      }}>
      {project.icon ? (
        <img
          src={project.icon}
          alt="icon"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#25263a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(215,198,172,0.3)",
            fontSize: "9px",
          }}>
          Icon
        </div>
      )}
      {project.url && (
        <span
          style={{
            position: "absolute",
            bottom: "3px",
            right: "3px",
            fontSize: "9px",
            color: "rgba(219,152,52,0.9)",
          }}>
          ↗
        </span>
      )}
    </div>
  );

  // Image thumbnail
  const imgThumb = (src, alt) =>
    src ? (
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
    ) : (
      <ImgPlaceholder label="Screenshot" />
    );

  // Decide left panel rows — if project has video2, show 2 videos instead of screenshot
  const hasVideo2 = !!project.video2;

  return (
    <>
      <div
        onMouseDown={onFocus}
        style={{
          ...containerStyle,
          backgroundColor: "#1c1c2c",
          border: "1px solid rgba(219,152,52,0.3)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
        }}>
        {/* ── TITLE BAR ── */}
        <div
          onMouseDown={onTitleMouseDown}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
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
            <span
              style={{ color: "#d7c6ac", fontSize: "13px", fontWeight: 500 }}>
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

        {/* ── ADDRESS BAR ── */}
        <div
          style={{
            padding: "6px 14px",
            background: "#1a1a2a",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}>
          <span style={{ color: "rgba(215,198,172,0.4)", fontSize: "11px" }}>
            📁
          </span>
          <span style={{ color: "rgba(215,198,172,0.55)", fontSize: "12px" }}>
            {project.subject || "Projects"} › {project.branch || project.tag}
          </span>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT — media rows */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "14px 16px",
              borderRight: "1px solid rgba(219,152,52,0.12)",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}>
            {/* Icon row */}
            <MediaRow
              thumb={iconThumb}
              label={project.iconLabel || project.name + " Website"}
              hasAction={!!project.url}
              onClick={() => project.url && window.open(project.url, "_blank")}
            />

            {/* If video2 exists: show 2 video rows. Otherwise show screenshot + video */}
            {hasVideo2 ? (
              <>
                <MediaRow
                  thumb={videoThumb(project.video)}
                  label={project.videoLabel || "Demo Video"}
                  hasAction={!!project.video}
                  onClick={() =>
                    project.video &&
                    onOpenVideo(
                      project.video,
                      project.videoLabel || project.name,
                    )
                  }
                />
                <MediaRow
                  thumb={videoThumb(project.video2)}
                  label={project.video2Label || "Demo Video 2"}
                  hasAction={!!project.video2}
                  onClick={() =>
                    project.video2 &&
                    onOpenVideo(
                      project.video2,
                      project.video2Label || project.name + " (2)",
                    )
                  }
                  isLast
                />
              </>
            ) : (
              <>
                <MediaRow
                  thumb={imgThumb(project.image, "screenshot")}
                  label={project.imageLabel || "Screenshot"}
                  hasAction={false}
                />
                <MediaRow
                  thumb={videoThumb(project.video)}
                  label={project.videoLabel || "Demo Video"}
                  hasAction={!!project.video}
                  onClick={() =>
                    project.video &&
                    onOpenVideo(
                      project.video,
                      project.videoLabel || project.name,
                    )
                  }
                  isLast
                />
              </>
            )}
          </div>

          {/* RIGHT — logo + properties */}
          <div
            style={{
              width: "220px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid rgba(219,152,52,0.12)",
            }}>
            {/* Logo */}
            <div
              style={{
                height: "110px",
                padding: "10px",
                borderBottom: "1px solid rgba(219,152,52,0.12)",
                flexShrink: 0,
              }}>
              {project.logo ? (
                <img
                  src={project.logo}
                  alt="logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "4px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#25263a",
                    border: "1px solid rgba(219,152,52,0.2)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(215,198,172,0.25)",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                  LOGO
                </div>
              )}
            </div>

            {/* Properties */}
            <div
              style={{
                padding: "14px",
                flex: 1,
                overflowY: "auto",
                scrollbarWidth: "none",
              }}>
              <p
                style={{
                  margin: "0 0 10px",
                  color: "#d7c6ac",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}>
                {project.name}
              </p>
              <p
                style={{
                  margin: "0 0 12px",
                  color: "rgba(219,152,52,0.7)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}>
                Properties
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                }}>
                <PropRow label="Date" value={project.date || "—"} />
                <PropRow label="Stack" value={project.tag || "—"} />
                <PropRow label="Status" value={project.status || "—"} />
                <PropRow
                  label="About"
                  value={project.shortDesc || "—"}
                  multiline
                />
              </div>
            </div>
          </div>
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
    </>
  );
}

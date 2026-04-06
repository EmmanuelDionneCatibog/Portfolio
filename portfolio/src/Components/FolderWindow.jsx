import { useEffect, useRef, useState } from "react";

const MOBILE_BREAKPOINT = 820;
const MOBILE_HEIGHT_BREAKPOINT = 680;

function getViewport() {
  if (typeof window === "undefined") return { width: 1280, height: 720 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function clampWindowPosition(pos, size, viewport, margin = 12) {
  return {
    x: Math.min(
      Math.max(margin, pos.x),
      Math.max(margin, viewport.width - size.w - margin),
    ),
    y: Math.min(
      Math.max(margin, pos.y),
      Math.max(margin, viewport.height - size.h - margin),
    ),
  };
}

const btnStyle = (bg, overrides = {}) => ({
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
  ...overrides,
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

function useWindowViewport() {
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    const onResize = () => setViewport(getViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewport;
}

function useWindowFrame(initialPositionFactory, initialSize, minSize) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const viewport = useWindowViewport();

  const [pos] = useState(initialPositionFactory);
  const [position, setPosition] = useState(pos);
  const [size, setSize] = useState(() => ({
    w: Math.min(initialSize.w, Math.max(minSize.w, getViewport().width - 40)),
    h: Math.min(initialSize.h, Math.max(minSize.h, getViewport().height - 88)),
  }));

  useEffect(() => {
    const onMove = (event) => {
      if (dragging.current) {
        setPosition(
          clampWindowPosition(
            {
              x: event.clientX - dragOffset.current.x,
              y: event.clientY - dragOffset.current.y,
            },
            size,
            viewport,
          ),
        );
      }

      if (resizing.current) {
        setSize({
          w: Math.min(
            viewport.width - 24,
            Math.max(
              minSize.w,
              resizeStart.current.w + (event.clientX - resizeStart.current.mx),
            ),
          ),
          h: Math.min(
            viewport.height - 72,
            Math.max(
              minSize.h,
              resizeStart.current.h + (event.clientY - resizeStart.current.my),
            ),
          ),
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
  }, [minSize.h, minSize.w, size, viewport]);

  useEffect(() => {
    const nextSize = {
      w: Math.min(size.w, Math.max(minSize.w, viewport.width - 24)),
      h: Math.min(size.h, Math.max(minSize.h, viewport.height - 72)),
    };

    if (nextSize.w !== size.w || nextSize.h !== size.h) {
      setSize(nextSize);
    }

    setPosition((currentPos) =>
      clampWindowPosition(currentPos, nextSize, viewport),
    );
  }, [viewport]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    viewport,
    position,
    size,
    dragging,
    resizing,
    dragOffset,
    resizeStart,
  };
}

export function VideoPlayerWindow({
  src,
  title,
  onClose,
  onMinimize,
  zIndex,
  onFocus,
}) {
  const frame = useWindowFrame(
    () => ({
      x: 80 + Math.random() * 60,
      y: 56 + Math.random() * 40,
    }),
    { w: 680, h: 420 },
    { w: 320, h: 220 },
  );
  const [full, setFull] = useState(false);

  const isCompact =
    frame.viewport.width <= MOBILE_BREAKPOINT ||
    frame.viewport.height <= MOBILE_HEIGHT_BREAKPOINT;
  const useFullscreen = full || isCompact;

  const onTitleMouseDown = (event) => {
    if (useFullscreen) return;
    event.preventDefault();
    frame.dragging.current = true;
    frame.dragOffset.current = {
      x: event.clientX - frame.position.x,
      y: event.clientY - frame.position.y,
    };
    onFocus();
  };

  const onResizeMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    frame.resizing.current = true;
    frame.resizeStart.current = {
      mx: event.clientX,
      my: event.clientY,
      w: frame.size.w,
      h: frame.size.h,
    };
    onFocus();
  };

  const containerStyle = useFullscreen
    ? { position: "fixed", inset: 0, zIndex, borderRadius: 0 }
    : {
        position: "fixed",
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.w,
        height: frame.size.h,
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
          cursor: useFullscreen ? "default" : "move",
          flexShrink: 0,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px" }}>VID</span>
          <span style={{ color: "#d7c6ac", fontSize: "13px", fontWeight: 500 }}>
            {title}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: "6px" }}
          onMouseDown={(event) => event.stopPropagation()}>
          <button
            onClick={onMinimize}
            style={btnStyle("#25263a")}
            title="Minimize">
            -
          </button>
          <button
            disabled={isCompact}
            onClick={() => setFull((value) => !value)}
            style={btnStyle("#25263a", {
              opacity: isCompact ? 0.45 : 1,
              cursor: isCompact ? "default" : "pointer",
            })}
            title={full ? "Restore" : "Maximize"}>
            {useFullscreen ? "[]" : "[ ]"}
          </button>
          <button
            onClick={onClose}
            style={btnStyle("rgba(200,40,40,0.75)")}
            title="Close">
            x
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
      {!useFullscreen && (
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
      <div
        onClick={onClick}
        style={{
          width: "72px",
          height: "72px",
          flexShrink: 0,
          cursor: hasAction ? "pointer" : "default",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(event) => {
          if (hasAction) event.currentTarget.style.opacity = "0.75";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = "1";
        }}>
        {thumb}
      </div>
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

export default function FolderWindow({
  project,
  onClose,
  onMinimize,
  zIndex,
  onFocus,
  onOpenVideo,
}) {
  const frame = useWindowFrame(
    () => ({
      x: 60 + Math.random() * 100,
      y: 50 + Math.random() * 60,
    }),
    { w: 760, h: 480 },
    { w: 360, h: 300 },
  );
  const [full, setFull] = useState(false);

  const isCompact =
    frame.viewport.width <= MOBILE_BREAKPOINT ||
    frame.viewport.height <= MOBILE_HEIGHT_BREAKPOINT;
  const useFullscreen = full || isCompact;

  const onTitleMouseDown = (event) => {
    if (useFullscreen) return;
    event.preventDefault();
    frame.dragging.current = true;
    frame.dragOffset.current = {
      x: event.clientX - frame.position.x,
      y: event.clientY - frame.position.y,
    };
    onFocus();
  };

  const onResizeMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    frame.resizing.current = true;
    frame.resizeStart.current = {
      mx: event.clientX,
      my: event.clientY,
      w: frame.size.w,
      h: frame.size.h,
    };
    onFocus();
  };

  const containerStyle = useFullscreen
    ? { position: "fixed", inset: 0, zIndex, borderRadius: 0 }
    : {
        position: "fixed",
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.w,
        height: frame.size.h,
        zIndex,
        borderRadius: "6px",
      };

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
          {"->"}
        </span>
      )}
    </div>
  );

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

  const hasVideo2 = !!project.video2;

  return (
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
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          background: "#25263a",
          borderBottom: "1px solid rgba(219,152,52,0.2)",
          cursor: useFullscreen ? "default" : "move",
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
          onMouseDown={(event) => event.stopPropagation()}>
          <button
            onClick={onMinimize}
            style={btnStyle("#25263a")}
            title="Minimize">
            -
          </button>
          <button
            disabled={isCompact}
            onClick={() => setFull((value) => !value)}
            style={btnStyle("#25263a", {
              opacity: isCompact ? 0.45 : 1,
              cursor: isCompact ? "default" : "pointer",
            })}
            title={full ? "Restore" : "Maximize"}>
            {useFullscreen ? "[]" : "[ ]"}
          </button>
          <button
            onClick={onClose}
            style={btnStyle("rgba(200,40,40,0.75)")}
            title="Close">
            x
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "6px 14px",
          background: "#1a1a2a",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexShrink: 0,
          overflow: "hidden",
        }}>
        <span style={{ color: "rgba(215,198,172,0.4)", fontSize: "11px" }}>
          []
        </span>
        <span
          style={{
            color: "rgba(215,198,172,0.55)",
            fontSize: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {project.subject || "Projects"} &gt; {project.branch || project.tag}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          flexDirection: isCompact ? "column" : "row",
        }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "14px 16px",
            borderRight: isCompact
              ? "none"
              : "1px solid rgba(219,152,52,0.12)",
            borderBottom: isCompact
              ? "1px solid rgba(219,152,52,0.12)"
              : "none",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}>
          <MediaRow
            thumb={iconThumb}
            label={project.iconLabel || `${project.name} Website`}
            hasAction={!!project.url}
            onClick={() => project.url && window.open(project.url, "_blank")}
          />

          {hasVideo2 ? (
            <>
              <MediaRow
                thumb={videoThumb(project.video)}
                label={project.videoLabel || "Demo Video"}
                hasAction={!!project.video}
                onClick={() =>
                  project.video &&
                  onOpenVideo(project.video, project.videoLabel || project.name)
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
                    project.video2Label || `${project.name} (2)`,
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
                  onOpenVideo(project.video, project.videoLabel || project.name)
                }
                isLast
              />
            </>
          )}
        </div>

        <div
          style={{
            width: isCompact ? "100%" : "220px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderLeft: isCompact
              ? "none"
              : "1px solid rgba(219,152,52,0.12)",
            minHeight: isCompact ? "34%" : "auto",
          }}>
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
                Logo
              </div>
            )}
          </div>

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
              <PropRow label="Date" value={project.date || "-"} />
              <PropRow label="Stack" value={project.tag || "-"} />
              <PropRow label="Status" value={project.status || "-"} />
              <PropRow label="About" value={project.shortDesc || "-"} multiline />
            </div>
          </div>
        </div>
      </div>

      {!useFullscreen && (
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

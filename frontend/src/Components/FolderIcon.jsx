import { useState } from "react";

export default function FolderIcon({
  name,
  onClick,
  style,
  onHoverStart,
  onHoverEnd,
  onFocusStart,
  onFocusEnd,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(e);
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        onHoverStart && onHoverStart(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onHoverEnd && onHoverEnd(e);
      }}
      onFocus={(e) => {
        setHovered(true);
        onFocusStart && onFocusStart(e);
      }}
      onBlur={(e) => {
        setHovered(false);
        onFocusEnd && onFocusEnd(e);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(4px, 0.7vw, 6px)",
        cursor: "pointer",
        padding: "clamp(6px, 1vw, 8px) clamp(8px, 1.1vw, 10px)",
        borderRadius: "6px",
        background: hovered ? "rgba(219,152,52,0.15)" : "transparent",
        border: hovered
          ? "1px solid rgba(219,152,52,0.3)"
          : "1px solid transparent",
        transition: "background 0.15s, border 0.15s",
        userSelect: "none",
        width: "clamp(68px, 14vw, 88px)",
        ...style,
      }}>
      <svg
        width="clamp(40px, 8vw, 52px)"
        height="clamp(34px, 6.8vw, 44px)"
        viewBox="0 0 52 44"
        fill="none">
        <path
          d="M2 8C2 5.79 3.79 4 6 4H20L24 10H46C48.21 10 50 11.79 50 14V38C50 40.21 48.21 42 46 42H6C3.79 42 2 40.21 2 38V8Z"
          fill="#db9834"
          opacity="0.85"
        />
        <path
          d="M2 14H50V38C50 40.21 48.21 42 46 42H6C3.79 42 2 40.21 2 38V14Z"
          fill="#d7c6ac"
          opacity="0.9"
        />
        <path
          d="M2 14H50V38C50 40.21 48.21 42 46 42H6C3.79 42 2 40.21 2 38V14Z"
          fill="#db9834"
          opacity="0.25"
        />
      </svg>
      <span
        style={{
          color: "#fff",
          fontSize: "clamp(10px, 2.2vw, 12px)",
          textAlign: "center",
          textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          lineHeight: 1.3,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          maxWidth: "100%",
          wordBreak: "break-word",
        }}>
        {name}
      </span>
    </div>
  );
}

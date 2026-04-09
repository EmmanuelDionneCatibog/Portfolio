import { useState, useRef } from "react";

const ClipArtCat = ({ pupilOffset }) => {
  const leftPupil = { cx: 81.5 + pupilOffset.x, cy: 80.5 + pupilOffset.y };
  const rightPupil = { cx: 130 + pupilOffset.x, cy: 80.5 + pupilOffset.y };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="40 10 200 220"
      fill="none"
      style={{ display: "block" }}
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="-12"
        y="118"
        width="300"
        height="170"
        fill="#476c45"
        stroke="none"
      />
      <polygon
        points="107,193 101,198 90,218 95,236 115,243 131,230"
        fill="#4c312c"
        stroke="none"
      />
      <polygon points="131,230 115,243 106,214" fill="#241310" stroke="none" />
      <polygon
        points="131,230 115,243 115,247 128,261 148,264 268,264 268,228"
        fill="#4c312c"
        stroke="none"
      />
      <polygon
        points="169,238 148,264 128,261 115,247 115,243 131,230"
        fill="#301915"
        stroke="none"
      />
      <polygon
        points="217,126 238,126 252,128 263,131 266,123 238,116 221,120"
        fill="#241310"
        stroke="none"
      />
      <polygon
        points="112,168 104,190 106,214 131,234 169,238 202,236 268,223 266,136 245,132 238,126 217,126"
        fill="#F9F6EE"
        stroke="none"
      />
      <polygon
        points="112,168 104,190 106,214 131,234 169,238 202,236 258,223 220,187 206,206 214,182 183,126"
        fill="#e2e0d8"
        stroke="none"
      />
      <polygon
        points="132,101 115,190 131,234 169,238 202,236 201,216 196,210 181,225 195,197 195,178"
        fill="#c8c7c2"
        stroke="none"
      />
      <polygon
        points="231,132 234,138 247,144 268,161 264,223 266,136 245,132 238,126 217,126"
        fill="#e2e0d8"
        stroke="none"
      />
      <polygon
        points="166,88 174,82 200,56 208,53 208,60 203,88 201,104 193,125"
        fill="#241310"
        stroke="none"
      />
      <polygon
        points="180,93 179,85 199,60 206,57 206,60 200,88 194,97 183,103"
        fill="#979195"
        stroke="none"
      />
      <polygon
        points="127,92 113,83 91,67 83,63 99,103 102,118"
        fill="#241310"
        stroke="none"
      />
      <polygon
        points="123,101 105,82 91,70 87,67 102,103 105,118"
        fill="#979195"
        stroke="none"
      />
      <polygon
        points="118,173 185,171 167,185 158,187 138,187 128,183"
        fill="#3f3f3f"
        stroke="none"
      />
      <polygon
        points="188,100 201,124 199,154 182,172 145,177 121,174 104,165 98,123 111,98 124,91 163,86"
        fill="#F9F6EE"
        stroke="none"
      />
      <polygon
        points="128,93 160,89 163,102 171,104 177,112 192,120 188,143 174,148 170,157 151,172 142,175 130,170 115,160 112,149 105,143 100,126 109,113 115,103 126,101"
        fill="#4c312c"
        stroke="none"
      />
      <polygon
        points="141,151 150,155 160,148 158,140 167,146 178,140 186,124 170,110 169,108 160,106 146,101 130,107 116,111 113,111 108,122 108,127 108,137 115,141 125,135 124,150 127,155 133,155"
        fill="#241310"
        stroke="none"
      />
      <polygon
        points="129.5,118 127,124 119,127.5 114,125 111,122 111,117 114,111.5 119,111 122,111.5 125.5,114"
        fill="#545454"
        stroke="none"
      />
      <circle cx="119.5" cy="119" r="8" fill="#6F8FAF" stroke="none" />
      <circle
        cx={leftPupil.cx + 38}
        cy={leftPupil.cy + 38}
        r="6.9"
        fill="black"
        stroke="none"
      />
      <polygon
        points="156,123 158,127 165,129 175,127 180,121 180,114.5 174.5,110 168,110 160,113.5"
        fill="#403a3e"
        stroke="none"
      />
      <polygon
        points="159,117.5 159,118.5 160.5,124 166,126 174.5,124 178,120 177.5,114 173,111 168,111 163,113"
        fill="#6a6a6a"
        stroke="none"
      />
      <circle cx="168" cy="118.5" r="8.5" fill="#6F8FAF" stroke="none" />
      <circle
        cx={rightPupil.cx + 38}
        cy={rightPupil.cy + 38}
        r="7.5"
        fill="black"
        stroke="none"
      />
      <polygon points="141,149 152,142 132,142" fill="black" stroke="none" />
      <path
        d="M141,149 L141,157 L135,161 L130,163"
        stroke="black"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M141,157 L148,161 L153,163"
        stroke="black"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default function ProfilePic() {
  const [clicked, setClicked] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const size = "min(340px, 78vw)";

  const handleMouseMove = (e) => {
    if (!clicked) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setPupilOffset({ x: nx * 1.5, y: ny * 1.5 });
  };

  const handleClick = () => {
    setClicked((prev) => !prev);
    if (clicked) setPupilOffset({ x: 0, y: 0 });
  };

  const fade = (visible) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.35s ease, transform 0.35s ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : "scale(0.85)",
    pointerEvents: visible ? "auto" : "none",
  });

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "2px solid #db9834",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease",
          background: clicked ? "#ADD8E6" : "transparent",
          zIndex: 1,
        }}>
        <div style={fade(!clicked)}>
          <img
            src="/pfp.jpg"
            alt="profile picture"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <div style={fade(clicked)}>
          <ClipArtCat pupilOffset={pupilOffset} />
        </div>
      </div>
    </div>
  );
}

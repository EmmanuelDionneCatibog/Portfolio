import { useEffect, useRef, useState } from "react";
import ProfilePic from "../components/ProfilePic";

const icons = {
  "C++": ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
      alt="C++"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  JavaScript: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
      alt="JavaScript"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  PHP: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
      alt="PHP"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  Python: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
      alt="Python"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  SQL: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
      alt="SQL"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  React: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
      alt="React"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  "Three.js": ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg"
      alt="Three.js"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  HTML: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
      alt="HTML"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  CSS: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
      alt="CSS"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  "Node.js": ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
      alt="Node.js"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  Git: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
      alt="Git"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  GitHub: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
      alt="GitHub"
      width={size}
      height={size}
      style={{ objectFit: "contain", filter: "invert(1)" }}
    />
  ),
  Figma: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg"
      alt="Figma"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  Vite: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"
      alt="Vite"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
  Arduino: ({ size = 48 }) => (
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg"
      alt="Arduino"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  ),
};

const row1 = [
  "C++",
  "JavaScript",
  "PHP",
  "Python",
  "SQL",
  "React",
  "Three.js",
  "HTML",
  "CSS",
  "Node.js",
  "Git",
  "GitHub",
  "Figma",
  "Vite",
  "Arduino",
];
const row2 = [
  "React",
  "Node.js",
  "Python",
  "Git",
  "JavaScript",
  "Vite",
  "C++",
  "SQL",
  "PHP",
  "Three.js",
  "Arduino",
  "HTML",
  "CSS",
  "GitHub",
  "Figma",
];
const row3 = [
  "Git",
  "PHP",
  "Three.js",
  "Arduino",
  "React",
  "C++",
  "SQL",
  "HTML",
  "CSS",
  "Python",
  "Vite",
  "JavaScript",
  "Node.js",
  "Figma",
  "GitHub",
];

function CarouselRow({ items, direction = 1, speed = 28 }) {
  const [isPaused, setIsPaused] = useState(false);
  const doubled = [...items, ...items, ...items];
  const animName = `scroll-${direction > 0 ? "ltr" : "rtl"}-${speed}`;

  return (
    <div
      className="carousel-row-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      <style>{`
        @keyframes ${animName} {
          0%   { transform: translateX(${direction > 0 ? "0%" : "-33.333%"}); }
          100% { transform: translateX(${direction > 0 ? "-33.333%" : "0%"}); }
        }
      `}</style>
      <div
        className="carousel-row"
        style={{
          animation: `${animName} ${speed}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}>
        {doubled.map((name, i) => {
          const Icon = icons[name];
          return (
            <div key={`${name}-${i}`} className="tech-card">
              {Icon ? (
                <Icon size={42} />
              ) : (
                <div className="tech-card-placeholder">{name.slice(0, 3)}</div>
              )}
              <span className="tech-card-label">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const sectionRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShow(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fadeUp = (delay = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  const handleDownloadResume = () => {
    const link = document.createElement("a");
    link.href = "/Catibog_Dionne_Resume_2026.pdf";
    link.download = "Catibog_Dionne_Resume_2026.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="about-page">
      <div ref={sectionRef} className="about-container">
        <div className="about-content">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              marginBottom: "48px",
            }}>
            {/* Left Column */}
            <div>
              <div style={fadeUp(0.1)}>
                <p className="about-text">Hi, my name is</p>
                <h1 className="about-title">Emmanuel Dionne B. Catibog</h1>
                <p className="about-text">
                  I'm a Computer Science student passionate about building
                  meaningful technology at the crossroads of engineering and
                  design. Whether it's developing full-stack applications or
                  exploring emerging technologies like machine learning, I enjoy
                  turning ideas into reality.
                </p>
              </div>

              <div style={{ marginTop: "50px", ...fadeUp(0.15) }}>
                <h2 className="section-title">Education</h2>
                <div className="section-underline" />
                <div className="timeline-item">
                  <p className="timeline-date">2022 – 2026</p>
                  <p className="timeline-location">
                    Colegio de San Juan de Letran, Calamba
                  </p>
                  <p className="timeline-title">
                    Bachelor of Science in Computer Science
                  </p>
                </div>
                <div className="timeline-item">
                  <p className="timeline-date">2019 – 2021</p>
                  <p className="timeline-location">
                    Laguna Science Integrated National High School
                  </p>
                  <p className="timeline-title">
                    Senior High School | Science, Technology, Engineering, and
                    Mathematics (STEM)
                  </p>
                </div>
                <div className="timeline-item">
                  <p className="timeline-date">2015 – 2019</p>
                  <p className="timeline-location">
                    Laguna Science Integrated National High School
                  </p>
                  <p className="timeline-title">
                    Junior High School | Science, Technology, Engineering, and
                    Mathematics (STEM)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "32px",
                ...fadeUp(0.2),
              }}>
              <ProfilePic />

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                }}>
                {/* GitHub */}
                <a
                  href="https://github.com/EmmanuelDionneCatibog"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a2a",
                    borderRadius: "50%",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = "#333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "#1a1a2a";
                  }}>
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                    alt="GitHub"
                    width="28"
                    height="28"
                    style={{ filter: "invert(1)" }}
                  />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/emmanueldionne.catibog"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a2a",
                    borderRadius: "50%",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = "#1877f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "#1a1a2a";
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="white">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/emmanuel-dionne-catibog-57344a3b9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a2a",
                    borderRadius: "50%",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = "#0a66c2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "#1a1a2a";
                  }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                  </svg>
                </a>
              </div>

              <button
                onClick={handleDownloadResume}
                style={{
                  padding: "12px 28px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: "#db9834",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(219,152,52,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(219,152,52,0.4)";
                  e.currentTarget.style.backgroundColor = "#e6a845";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(219,152,52,0.3)";
                  e.currentTarget.style.backgroundColor = "#db9834";
                }}>
                Download Resume
              </button>
            </div>
          </div>

          <div style={{ marginTop: "96px", ...fadeUp(0.3) }}>
            <h1 className="about-title">Technologies &amp; Tools</h1>
            <div className="carousel-wrapper" style={{ marginTop: "32px" }}>
              <CarouselRow items={row1} direction={1} speed={32} />
              <CarouselRow items={row2} direction={-1} speed={26} />
              <CarouselRow items={row3} direction={1} speed={38} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

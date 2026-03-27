import { useEffect, useRef, useState } from "react";

// ── Logo imports using image URLs (no SVGs) ──────────────────────────────────

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

  return (
    <div className="about-page">
      <div ref={sectionRef} className="about-container">
        <div className="about-content">
          {/* Heading */}
          <div style={{ marginBottom: "56px", ...fadeUp(0) }}>
            <h1 className="about-title">About Me</h1>
            <div className="about-title-underline" />
          </div>

          {/* Who I Am & Education - Side by Side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              marginBottom: "48px",
            }}>
            {/* Who I Am */}
            <div style={fadeUp(0.1)}>
              <h2 className="section-title">Who I Am</h2>
              <div className="section-underline" />
              <p className="about-text">
                I'm{" "}
                <span className="about-name">Emmanuel Dionne B. Catibog</span>,
                a Computer Science student passionate about building meaningful
                technology at the crossroads of engineering and design. Whether
                it's developing full-stack applications or exploring emerging
                technologies like machine learning, I enjoy turning ideas into
                reality.
              </p>
            </div>

            {/* Education */}
            <div style={fadeUp(0.2)}>
              <h2 className="section-title">Education</h2>
              <div className="section-underline" />

              {/* Tertiary Education */}
              <div className="timeline-item">
                <p className="timeline-date">2022 – 2026</p>
                <p className="timeline-location">
                  Colegio de San Juan de Letran, Calamba
                </p>
                <p className="timeline-title">
                  Bachelor of Science in Computer Science
                </p>
              </div>

              {/* Senior High School */}
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

              {/* Junior High School */}
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

          {/* Tech Carousel */}
          <div style={{ marginTop: "48px", ...fadeUp(0.3) }}>
            <h1 className="about-title">Technologies &amp; Tools</h1>
            <div className="section-underline" />
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

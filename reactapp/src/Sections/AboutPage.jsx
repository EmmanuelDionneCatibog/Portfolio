import { useEffect, useRef, useState } from "react";

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

  const fadeIn = (delay = 0) => ({
    opacity: show ? 1 : 0,
    transition: `opacity 0.65s ease ${delay}s`,
  });

  const skills = [
    {
      category: "Languages",
      items: ["C++", "JavaScript", "PHP", "Python", "SQL"],
    },
    { category: "Frontend", items: ["React", "Three.js", "HTML / CSS"] },
    { category: "Backend", items: ["Node.js", "PHP", "MySQL"] },
    { category: "Tools", items: ["Git", "Vite", "Arduino"] },
    {
      category: "Concepts",
      items: ["Computer Vision", "Machine Learning", "REST APIs"],
    },
  ];

  return (
    <>
      <style>{`
        .skill-tag {
          display: inline-block;
          padding: 5px 13px;
          border: 1px solid rgba(219,152,52,0.35);
          border-radius: 3px;
          color: #d7c6ac;
          font-size: 12px;
          letter-spacing: 0.04em;
          background: rgba(219,152,52,0.06);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          cursor: default;
        }
        .skill-tag:hover {
          background: rgba(219,152,52,0.14);
          border-color: rgba(219,152,52,0.7);
          color: #db9834;
        }
        .timeline-item {
          position: relative;
          padding-left: 24px;
          padding-bottom: 28px;
          border-left: 1px solid rgba(219,152,52,0.2);
        }
        .timeline-item::before {
          content: "";
          position: absolute;
          left: -5px; top: 6px;
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #db9834;
        }
        .timeline-item:last-child {
          border-left: 1px solid transparent;
          padding-bottom: 0;
        }
        .about-resume-btn {
          width: 100%; padding: 11px 0;
          background: transparent;
          border: 1.5px solid rgba(215,198,172,0.4);
          border-radius: 5px;
          color: #d7c6ac; font-size: 13px; font-weight: 600;
          cursor: pointer; letter-spacing: 0.05em;
          font-family: system-ui, sans-serif;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .about-resume-btn:hover {
          background: #d7c6ac;
          color: #25263a;
          border-color: #d7c6ac;
        }
        .about-social-link { opacity: 0.65; transition: opacity 0.2s; display: flex; }
        .about-social-link:hover { opacity: 1; }
        @media (max-width: 768px) {
          .about-grid { flex-direction: column !important; }
          .about-sidebar { width: 100% !important; }
        }
      `}</style>

      <div
        ref={sectionRef}
        style={{
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#25263a",
          color: "#d7c6ac",
          padding: "clamp(60px, 8vh, 100px) clamp(24px, 8vw, 120px)",
          boxSizing: "border-box",
        }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Heading */}
          <div style={{ marginBottom: "56px", ...fadeUp(0) }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "rgba(215,198,172,0.5)",
                fontSize: "13px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
              Get to know me
            </p>
            <h1
              style={{
                margin: "0 0 16px",
                color: "#db9834",
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.1,
              }}>
              About Me
            </h1>
            <div
              style={{ width: "40px", height: "2px", background: "#db9834" }}
            />
          </div>

          {/* Two-column layout */}
          <div
            className="about-grid"
            style={{
              display: "flex",
              gap: "clamp(32px, 6vw, 80px)",
              alignItems: "flex-start",
            }}>
            {/* LEFT */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Bio */}
              <div style={{ marginBottom: "48px", ...fadeUp(0.1) }}>
                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#d7c6ac",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}>
                  Who I Am
                </h2>
                <div
                  style={{
                    width: "28px",
                    height: "2px",
                    background: "#db9834",
                    marginBottom: "20px",
                  }}
                />
                <p
                  style={{
                    margin: "0 0 16px",
                    lineHeight: 1.85,
                    fontSize: "15px",
                    color: "rgba(215,198,172,0.8)",
                  }}>
                  I'm{" "}
                  <span style={{ color: "#d7c6ac", fontWeight: 600 }}>
                    Emmanuel Dionne B. Catibog
                  </span>
                  , a Computer Science student with a passion for building
                  things at the intersection of software engineering and
                  creative design.
                </p>
                <p
                  style={{
                    margin: "0 0 16px",
                    lineHeight: 1.85,
                    fontSize: "15px",
                    color: "rgba(215,198,172,0.8)",
                  }}>
                  I enjoy working across the full stack — from low-level systems
                  in C++ to interactive web experiences with React and Three.js.
                  My most recent project, ColorWaste, applies machine learning
                  and computer vision to real-world waste segregation.
                </p>
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.85,
                    fontSize: "15px",
                    color: "rgba(215,198,172,0.8)",
                  }}>
                  When I'm not coding, I'm usually exploring new technologies,
                  tinkering with hardware, or overthinking UI interactions.
                </p>
              </div>

              {/* Education */}
              <div style={{ marginBottom: "48px", ...fadeUp(0.2) }}>
                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#d7c6ac",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}>
                  Education
                </h2>
                <div
                  style={{
                    width: "28px",
                    height: "2px",
                    background: "#db9834",
                    marginBottom: "20px",
                  }}
                />
                <div className="timeline-item">
                  <p
                    style={{
                      margin: "0 0 4px",
                      color: "#db9834",
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}>
                    Present
                  </p>
                  <p
                    style={{
                      margin: "0 0 4px",
                      color: "#d7c6ac",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}>
                    Bachelor of Science in Computer Science
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(215,198,172,0.5)",
                      fontSize: "13px",
                    }}>
                    Calabarzon, Philippines
                  </p>
                </div>
              </div>

              {/* Currently */}
              <div style={{ ...fadeUp(0.3) }}>
                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#d7c6ac",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}>
                  Currently
                </h2>
                <div
                  style={{
                    width: "28px",
                    height: "2px",
                    background: "#db9834",
                    marginBottom: "20px",
                  }}
                />
                <div
                  style={{
                    padding: "20px 24px",
                    background: "#1c1c2c",
                    border: "1px solid rgba(219,152,52,0.15)",
                    borderLeft: "3px solid #db9834",
                    borderRadius: "0 6px 6px 0",
                  }}>
                  {[
                    ["🎓", "Finishing my CS degree"],
                    ["🔧", "Building out this portfolio"],
                    ["🌐", "Exploring machine learning & computer vision"],
                  ].map(([icon, text]) => (
                    <p
                      key={text}
                      style={{
                        margin: "0 0 10px",
                        color: "rgba(215,198,172,0.8)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        display: "flex",
                        gap: "12px",
                      }}>
                      <span>{icon}</span>
                      <span>{text}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="about-sidebar"
              style={{ width: "300px", flexShrink: 0 }}>
              {/* Profile card */}
              <div
                style={{
                  background: "#1c1c2c",
                  border: "1px solid rgba(219,152,52,0.2)",
                  borderRadius: "8px",
                  padding: "28px 24px",
                  marginBottom: "20px",
                  textAlign: "center",
                  ...fadeIn(0.15),
                }}>
                <div
                  style={{
                    width: "86px",
                    height: "86px",
                    borderRadius: "50%",
                    border: "2px solid #db9834",
                    margin: "0 auto 14px",
                    overflow: "hidden",
                    background: "#25263a",
                  }}>
                  <img
                    src="/pfp.jpg"
                    alt="Dionne"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: "0 0 4px",
                    color: "#d7c6ac",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}>
                  Emmanuel Dionne B. Catibog
                </p>
                <p
                  style={{
                    margin: "0 0 16px",
                    color: "rgba(215,198,172,0.45)",
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                  }}>
                  CS Student · Developer
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                  }}>
                  <a
                    href="https://github.com/EmmanuelDionneCatibog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-link">
                    <svg
                      width="18"
                      height="18"
                      fill="#d7c6ac"
                      viewBox="0 0 24 24"
                      style={{ display: "block" }}>
                      <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.85c-3.06.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.98 1.68 2.57 1.2 3.2.92.1-.72.38-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.42 0-1.2.43-2.18 1.14-2.95-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.56 0c2.12-1.43 3.05-1.13 3.05-1.13.61 1.53.22 2.66.11 2.94.71.77 1.14 1.75 1.14 2.95 0 4.21-2.57 5.13-5.02 5.41.39.34.74 1.01.74 2.04v3.02c0 .29.2.64.76.53A10.52 10.52 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/emmanueldionne.catibog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-link">
                    <svg
                      width="18"
                      height="18"
                      fill="#d7c6ac"
                      viewBox="0 0 24 24"
                      style={{ display: "block" }}>
                      <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.57 1.53-4 3.88-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.88h-2.4v6.99A10 10 0 0 0 22 12z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Skills */}
              <div
                style={{
                  background: "#1c1c2c",
                  border: "1px solid rgba(219,152,52,0.2)",
                  borderRadius: "8px",
                  padding: "22px",
                  marginBottom: "16px",
                  ...fadeIn(0.25),
                }}>
                <h2
                  style={{
                    margin: "0 0 18px",
                    color: "#d7c6ac",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}>
                  Skills & Technologies
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}>
                  {skills.map(({ category, items }) => (
                    <div key={category}>
                      <p
                        style={{
                          margin: "0 0 8px",
                          color: "rgba(219,152,52,0.75)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}>
                        {category}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "5px",
                        }}>
                        {items.map((item) => (
                          <span key={item} className="skill-tag">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume */}
              <a
                href="/Catibog_Dionne_Resume_2026.pdf"
                download
                style={{
                  textDecoration: "none",
                  display: "block",
                  ...fadeIn(0.35),
                }}>
                <button className="about-resume-btn">Download Resume ↓</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

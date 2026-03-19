import { useEffect, useState } from "react";
import ImageToCat from "../Components/ProfilePic";

export default function LandingPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  const slide = (delay = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateX(0)" : "translateX(-40px)",
    transition: `all 0.6s ease ${delay}s`,
  });

  const imageScale = Math.min(Math.max(window.innerWidth / 1600, 0.7), 1.3);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        height: "100vh",
        width: "100%",
        backgroundColor: "#25263a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        // Push content below the fixed navbar (~70px tall)
        paddingTop: "clamp(56px, 8vh, 72px)",
        boxSizing: "border-box",
      }}>
      {/* WAVE BACKGROUND */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid slice">
        <path
          d="M-20,80  C100,30  200,130 350,70  S550,10  700,80  S850,150 920,90"
          fill="none"
          stroke="#db9834"
          strokeWidth="1"
          opacity="0.35"
        />
        <path
          d="M-20,160 C80,110  220,210 380,140 S580,70  730,145 S870,210 920,160"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.8"
          opacity="0.25"
        />
        <path
          d="M-20,260 C120,200 240,310 420,240 S620,160 760,240 S880,300 920,260"
          fill="none"
          stroke="#db9834"
          strokeWidth="1.1"
          opacity="0.3"
        />
        <path
          d="M-20,360 C100,300 260,400 440,330 S640,250 780,330 S880,400 920,360"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.8"
          opacity="0.2"
        />
        <path
          d="M-20,440 C140,380 280,470 460,410 S660,340 800,420 S890,470 920,440"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.9"
          opacity="0.25"
        />
        <path
          d="M-20,110 C150,60  270,160 430,100 S630,40  770,110 S880,170 920,120"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.7"
          opacity="0.18"
        />
        <path
          d="M-20,310 C110,250 260,360 440,290 S640,210 780,290 S880,360 920,310"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.7"
          opacity="0.18"
        />
        <path
          d="M-20,490 C130,430 290,510 470,450 S670,380 820,460 S900,500 920,490"
          fill="none"
          stroke="#db9834"
          strokeWidth="0.6"
          opacity="0.15"
        />
      </svg>

      {/* HERO */}
      <section
        className="hero-section"
        style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-inner">
          <div className="hero-left">
            <div className={`hero-rect ${show ? "visible" : "hidden"}`} />
            <div className={`hero-text ${show ? "visible" : "hidden"}`}>
              <p className="hero-eyebrow">Hi, my name is</p>
              <h1 className="hero-name">Emmanuel Dionne B. Catibog</h1>
              <p className="hero-bio">
                I'm a Computer Science student passionate about building modern,
                clean digital experiences through thoughtful design and
                efficient code.
              </p>

              <div className="social-icons">
                <a
                  href="https://github.com/EmmanuelDionneCatibog"
                  target="_blank"
                  rel="noopener noreferrer">
                  <svg fill="#d7c6ac" viewBox="0 0 24 24">
                    <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53v-1.85c-3.06.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.98 1.68 2.57 1.2 3.2.92.1-.72.38-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.42 0-1.2.43-2.18 1.14-2.95-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.56 0c2.12-1.43 3.05-1.13 3.05-1.13.61 1.53.22 2.66.11 2.94.71.77 1.14 1.75 1.14 2.95 0 4.21-2.57 5.13-5.02 5.41.39.34.74 1.01.74 2.04v3.02c0 .29.2.64.76.53A10.52 10.52 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z" />
                  </svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg fill="#d7c6ac" viewBox="0 0 24 24">
                    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.49 6 1.12 6 0 4.88 0 3.5 0 2.12 1.12 1 2.49 1c1.37 0 2.49 1.12 2.49 2.5zM.22 8.98h4.54V24H.22zM8.34 8.98h4.35v2.05h.06c.61-1.16 2.11-2.38 4.35-2.38 4.65 0 5.5 3.06 5.5 7.03V24h-4.54v-7.54c0-1.8-.03-4.12-2.51-4.12-2.51 0-2.89 1.96-2.89 3.99V24H8.34z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/emmanueldionne.catibog"
                  target="_blank"
                  rel="noopener noreferrer">
                  <svg fill="#d7c6ac" viewBox="0 0 24 24">
                    <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.57 1.53-4 3.88-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.88h-2.4v6.99A10 10 0 0 0 22 12z" />
                  </svg>
                </a>
              </div>

              <a
                href="/Catibog_Dionne_Resume_2026.pdf"
                download
                style={{ textDecoration: "none" }}>
                <button className="resume-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ flexShrink: 0 }}>
                    <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-7 2h14v2H5v-2z" />
                  </svg>
                  <span>Download Resume</span>
                </button>
              </a>
            </div>
          </div>

          <div className={`hero-image-wrap ${show ? "visible" : "hidden"}`}>
            <div
              className="image-scaler"
              style={{ transform: `scale(${imageScale})` }}>
              <ImageToCat />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

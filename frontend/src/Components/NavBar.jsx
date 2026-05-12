import { useEffect, useRef, useState } from "react";
import { smoothScrollToId } from "../utils/smoothScroll";

export default function NavBar() {
  const navRef = useRef(null);
  const suppressAutoHideUntil = useRef(0);
  const [activeId, setActiveId] = useState("");

  const scrollTo = (id) => {
    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    suppressAutoHideUntil.current = performance.now() + 850;
    setVisible(true);
    lastScrollY.current = window.scrollY;
    smoothScrollToId(id, { durationMs: 750, offsetPx: navHeight });
    // Keep URL in sync without triggering App's hashchange scroll again.
    if (id) window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      if (performance.now() < suppressAutoHideUntil.current) {
        lastScrollY.current = window.scrollY;
        return;
      }

      const current = window.scrollY;
      // Always show at top of page
      if (current < 60) {
        setVisible(true);
      } else if (current < lastScrollY.current) {
        // Scrolling up — show
        setVisible(true);
      } else if (current > lastScrollY.current + 5) {
        // Scrolling down — hide (5px threshold to avoid jitter)
        setVisible(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["about", "projects", "contact"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const fromHash = window.location.hash.replace("#", "");
    if (fromHash) setActiveId(fromHash);

    if (!sections.length) return;

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visibleEntries[0];
        if (top?.target?.id) setActiveId(top.target.id);
      },
      {
        // Treat the area below the navbar as "top of viewport" for section detection.
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: `-${Math.ceil(navHeight + 1)}px 0px -55% 0px`,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .site-nav {
          position: fixed;
          top: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: clamp(15px, 2.5vh, 22px) clamp(24px, 5vw, 60px);
          background: #1c1c2c;
          box-sizing: border-box;
          z-index: 1000;
          gap: 12px;
          transition: transform 0.3s ease;
        }
        body.desktop-open .site-nav {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .site-nav-brand {
          color: #db9834;
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          flex-shrink: 0;
        }
        .site-nav-links {
          display: flex;
          gap: clamp(16px, 3vw, 32px);
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
        }
        .nav-link {
          position: relative;
          color: #d7c6ac;
          text-decoration: none;
          font-size: clamp(0.85rem, 1.2vw, 1rem);
          padding: 4px 0;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link::before {
          content: "";
          position: absolute;
          bottom: 0; left: 0;
          width: 0%; height: 2px;
          background-color: #db9834;
          transition: width 0.35s ease;
        }
        .nav-link:hover::before { width: 100%; }
        .nav-link:hover { color: #db9834; transition: color 0.35s ease; }
        .nav-link.active { color: #db9834; }
        .nav-link.active::before { width: 100%; }
        @media (max-width: 640px) {
          .site-nav {
            padding: 12px 16px;
            gap: 10px;
            align-items: flex-start;
          }
          .site-nav-brand {
            font-size: 1.15rem;
            line-height: 1;
            padding-top: 4px;
          }
          .site-nav-links {
            gap: 12px;
            justify-content: flex-end;
            row-gap: 8px;
            max-width: 70%;
          }
          .nav-link {
            font-size: 0.9rem;
          }
        }
        @media (max-width: 420px) {
          .site-nav {
            padding: 10px 12px;
          }
          .site-nav-links {
            gap: 10px;
            max-width: 72%;
          }
          .nav-link {
            font-size: 0.82rem;
          }
        }
      `}</style>

      <nav
        ref={navRef}
        className="site-nav"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)",
        }}>
        <button onClick={() => scrollTo("home")} className="site-nav-brand">
          DC
        </button>

        <div className="site-nav-links">
          {[
            { label: "About", id: "about" },
            { label: "Projects", id: "projects" },
            { label: "Contact", id: "contact" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`nav-link${activeId === id ? " active" : ""}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

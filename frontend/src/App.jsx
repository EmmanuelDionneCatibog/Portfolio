import NavBar from "./Components/NavBar";
import ProjectsPage from "./Sections/ProjectsPage";
import AboutPage from "./Sections/AboutPage";
import { useEffect } from "react";
import { smoothScrollToId } from "./utils/smoothScroll";

export default function App() {
  useEffect(() => {
    const scrollFromHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const navHeight =
        document.querySelector(".site-nav")?.getBoundingClientRect().height ?? 0;
      smoothScrollToId(id, { durationMs: 750, offsetPx: navHeight });
    };

    // Initial load (and after refresh) with a hash like #about
    scrollFromHash();

    // Any subsequent hash navigation
    window.addEventListener("hashchange", scrollFromHash);
    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <NavBar />

      <section id="about">
        <AboutPage />
      </section>

      <section id="projects">
        <ProjectsPage />
      </section>
    </div>
  );
}

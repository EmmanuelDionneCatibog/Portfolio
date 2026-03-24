import NavBar from "./Components/NavBar";
import LandingPage from "./Sections/LandingPage";
import ProjectsPage from "./Sections/ProjectsPage";
import AboutPage from "./Sections/AboutPage";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <NavBar />

      <section id="home">
        <LandingPage />
      </section>

      <section id="about">
        <AboutPage />
      </section>

      <section id="projects">
        <ProjectsPage />
      </section>
    </div>
  );
}

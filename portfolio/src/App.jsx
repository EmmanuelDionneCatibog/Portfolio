import NavBar from "./Components/NavBar";
import ProjectsPage from "./Sections/ProjectsPage";
import AboutPage from "./Sections/AboutPage";

export default function App() {
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

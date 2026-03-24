export default function NavBar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
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
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "clamp(15px, 2.5vh, 22px) clamp(24px, 5vw, 60px)",
          background: "#1c1c2c",
          boxSizing: "border-box",
          zIndex: 1000,
          flexWrap: "wrap",
          gap: "12px",
        }}>
        <button
          onClick={() => scrollTo("home")}
          style={{
            color: "#db9834",
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}>
          DC
        </button>

        <div
          style={{
            display: "flex",
            gap: "clamp(16px, 3vw, 32px)",
            flexWrap: "wrap",
          }}>
          {[
            { label: "Home", id: "home" },
            { label: "About", id: "about" },
            { label: "Projects", id: "projects" },
            { label: "Contact", id: "contact" },
          ].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} className="nav-link">
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

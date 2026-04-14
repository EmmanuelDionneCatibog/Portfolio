import { useEffect, useState } from "react";
import "../styles/certificate-carousel.css";

export default function CertificateCarousel({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  const certificates = [
    {
      src: "/DeviceManagement.jpg",
      title: "Device Management Certification",
      alt: "Device Management Certificate",
    },
    {
      src: "/Python.jpg",
      title: "Python Certification",
      alt: "Python Certificate",
    },
    {
      src: "/Database.jpg",
      title: "Database Certification",
      alt: "Database Certificate",
    },
  ];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && shouldRender) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [shouldRender, onClose]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const enterTimer = requestAnimationFrame(() => setIsVisible(true));
      document.body.style.overflow = "hidden";
      return () => cancelAnimationFrame(enterTimer);
    }

    setIsVisible(false);
    const exitTimer = window.setTimeout(() => {
      setShouldRender(false);
      document.body.style.overflow = "unset";
    }, 380);

    return () => {
      document.body.style.overflow = "unset";
      window.clearTimeout(exitTimer);
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p === 0 ? certificates.length - 1 : p - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((p) => (p === certificates.length - 1 ? 0 : p + 1));
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`cc-overlay${isVisible ? " is-visible" : ""}`}
      onClick={onClose}>
      <div
        className={`cc-card${isVisible ? " is-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}>
        <div className="cc-title">{certificates[currentIndex].title}</div>

        <button className="cc-close" onClick={handleClose}>
          x
        </button>

        <button
          className="cc-arrow cc-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 18L9 12L15 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <img
          className="cc-image"
          src={certificates[currentIndex].src}
          alt={certificates[currentIndex].alt}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/800x600/2a2a3a/db9834?text=Certificate+Not+Found";
          }}
        />

        <button
          className="cc-arrow cc-arrow-right"
          onClick={goToNext}
          aria-label="Next">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 18L15 12L9 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="cc-counter">
          {currentIndex + 1} / {certificates.length}
        </div>

      </div>
    </div>
  );
}

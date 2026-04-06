import { useState, useEffect } from "react";

export default function CertificateCarousel({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    <>
      <style>{`
        .cc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cc-card {
          position: relative;
          /* Card shrinks to fit on any screen with comfortable padding */
          width:  min(92vw, 960px);
          max-height: 92vh;
          background: rgba(20,20,35,0.6);
          border-radius: clamp(10px, 2vw, 20px);
          /* Vertical padding for title + counter bars */
          padding: clamp(52px, 8vh, 72px) clamp(48px, 7vw, 80px) clamp(44px, 6vh, 64px);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .cc-title {
          position: absolute;
          top: clamp(10px, 2vh, 20px);
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          background: rgba(0,0,0,0.6);
          padding: clamp(4px,0.8vh,6px) clamp(12px,2vw,20px);
          border-radius: 30px;
          font-size: clamp(11px, 1.2vw, 14px);
          font-weight: 500;
          font-family: system-ui, sans-serif;
          z-index: 10;
          white-space: nowrap;
          max-width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cc-close {
          position: absolute;
          top: clamp(10px, 2vh, 20px);
          right: clamp(12px, 2vw, 24px);
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          cursor: pointer;
          width:  clamp(28px, 3.5vw, 36px);
          height: clamp(28px, 3.5vw, 36px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 0;
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1;
        }
        .cc-close:hover { background: rgba(255,255,255,0.15); }

        /* Nav arrows — hidden on very narrow screens, shown via a swipe hint instead */
        .cc-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          border: none;
          color: #fff;
          cursor: pointer;
          width:  clamp(32px, 4.5vw, 50px);
          height: clamp(32px, 4.5vw, 50px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          z-index: 10;
          transition: background 0.15s;
        }
        .cc-arrow:hover { background: rgba(0,0,0,0.75); }
        .cc-arrow-left  { left:  clamp(6px, 1.5vw, 20px); }
        .cc-arrow-right { right: clamp(6px, 1.5vw, 20px); }
        .cc-arrow svg {
          width:  clamp(16px, 2.2vw, 28px);
          height: clamp(16px, 2.2vw, 28px);
        }

        .cc-image {
          display: block;
          /* Fill the card space minus the arrow gutters */
          max-width: 100%;
          max-height: calc(92vh - clamp(52px,8vh,72px) - clamp(44px,6vh,64px));
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: clamp(6px, 1vw, 12px);
        }

        .cc-counter {
          position: absolute;
          bottom: clamp(10px, 1.8vh, 20px);
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.7);
          background: rgba(0,0,0,0.5);
          padding: clamp(3px,0.6vh,6px) clamp(10px,1.5vw,14px);
          border-radius: 30px;
          font-size: clamp(11px, 1.1vw, 14px);
          font-family: monospace;
          z-index: 10;
          white-space: nowrap;
        }

        /* Dot indicators for touch / small screens */
        .cc-dots {
          position: absolute;
          bottom: clamp(10px, 1.8vh, 20px);
          right: clamp(12px, 2vw, 24px);
          display: flex;
          gap: clamp(4px, 0.6vw, 6px);
          z-index: 10;
        }
        .cc-dot {
          width:  clamp(5px, 0.8vw, 7px);
          height: clamp(5px, 0.8vw, 7px);
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          transition: background 0.2s;
        }
        .cc-dot.active { background: rgba(219,152,52,0.9); }
      `}</style>

      <div className="cc-overlay" onClick={onClose}>
        <div className="cc-card" onClick={(e) => e.stopPropagation()}>
          {/* Title */}
          <div className="cc-title">{certificates[currentIndex].title}</div>

          {/* Close */}
          <button className="cc-close" onClick={handleClose}>
            ×
          </button>

          {/* Prev arrow */}
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

          {/* Certificate image */}
          <img
            className="cc-image"
            src={certificates[currentIndex].src}
            alt={certificates[currentIndex].alt}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/800x600/2a2a3a/db9834?text=Certificate+Not+Found";
            }}
          />

          {/* Next arrow */}
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

          <div className="cc-dots">
            {certificates.map((_, i) => (
              <div
                key={i}
                className={`cc-dot${i === currentIndex ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

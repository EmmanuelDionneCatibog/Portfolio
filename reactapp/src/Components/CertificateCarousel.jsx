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
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? certificates.length - 1 : prev - 1,
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === certificates.length - 1 ? 0 : prev + 1,
    );
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}>
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          backgroundColor: "rgba(20, 20, 35, 0.6)",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            background: "rgba(0,0,0,0.6)",
            padding: "6px 20px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "500",
            fontFamily: "system-ui, sans-serif",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}>
          {certificates[currentIndex].title}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "30px",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 0,
            margin: 0,
            lineHeight: "36px",
          }}>
          ×
        </button>

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          style={{
            position: "absolute",
            left: "30px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "white",
            cursor: "pointer",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0,
          }}>
          <svg
            width="30"
            height="30"
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

        {/* Next Button */}
        <button
          onClick={goToNext}
          style={{
            position: "absolute",
            right: "30px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "white",
            cursor: "pointer",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0,
          }}>
          <svg
            width="30"
            height="30"
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

        {/* Image Counter */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.7)",
            background: "rgba(0,0,0,0.5)",
            padding: "6px 14px",
            borderRadius: "30px",
            fontSize: "14px",
            fontFamily: "monospace",
            zIndex: 10,
          }}>
          {currentIndex + 1} / {certificates.length}
        </div>

        {/* Image */}
        <img
          src={certificates[currentIndex].src}
          alt={certificates[currentIndex].alt}
          style={{
            maxWidth: "80vw",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: "12px",
            display: "block",
          }}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/800x600/2a2a3a/db9834?text=Certificate+Not+Found";
          }}
        />
      </div>
    </div>
  );
}

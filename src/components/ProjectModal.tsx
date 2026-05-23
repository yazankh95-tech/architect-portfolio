import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '../data/projectsData';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [index, setIndex] = useState(0);
  const images = project.images;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reset index when active project changes
  useEffect(() => {
    setIndex(0);
  }, [project]);

  // Lock body scrolling to prevent background parallax shifting
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const prev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  // Close on Escape & switch images with Arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, images.length]);

  // Precise Swipe Gesture Handling for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) { // Swipe threshold
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {/* Dynamic Image Indicator counter */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            padding: '0.4rem 1.2rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: 'var(--color-accent)',
            zIndex: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
            {index + 1} / {images.length}
          </div>
        )}

        <div 
          className="modal-slider-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="modal-slider-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, idx) => (
              <div className="modal-slide" key={idx}>
                <img
                  src={src}
                  alt={`${project.title} ${idx + 1}`}
                  loading={idx === 0 || Math.abs(idx - index) <= 1 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button className="modal-nav left" onClick={(e) => prev(e)} aria-label="Previous">
              <ArrowLeft size={24} />
            </button>
            <button className="modal-nav right" onClick={(e) => next(e)} aria-label="Next">
              <ArrowRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

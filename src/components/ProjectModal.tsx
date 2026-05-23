import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '../data/projectsData';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [index, setIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const images = project.images;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    setIndex(0);
  }, [project]);

  // Preload all gallery images
  useEffect(() => {
    const preloadImages = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    return () => {
      preloadImages.forEach((img) => {
        img.src = '';
      });
    };
  }, [images]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const prev = () => {
    setImgLoaded(false);
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = () => {
    setImgLoaded(false);
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.7)',
            zIndex: 10,
            fontFamily: 'monospace',
          }}>
            {index + 1} / {images.length}
          </div>
        )}

        <img
          src={images[index]}
          alt={`${project.title} ${index + 1}`}
          className="modal-img"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            opacity: imgLoaded ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
          }}
        />

        {images.length > 1 && (
          <>
            <button className="modal-nav left" onClick={prev} aria-label="Previous">
              <ArrowLeft size={28} />
            </button>
            <button className="modal-nav right" onClick={next} aria-label="Next">
              <ArrowRight size={28} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '../data/projectsData';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [index, setIndex] = useState(0);
  const images = project.images;

  useEffect(() => {
    setIndex(0);
  }, [project]);

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

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  // close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        <img src={images[index]} alt={`${project.title} ${index + 1}`} className="modal-img" />
        {images.length > 1 && (
          <>
            <button className="modal-nav left" onClick={prev} aria-label="Previous">
              <ArrowLeft size={32} />
            </button>
            <button className="modal-nav right" onClick={next} aria-label="Next">
              <ArrowRight size={32} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

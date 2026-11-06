import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: { url: string; alt?: string; caption?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between text-stone-300 text-xs">
        <span className="tabular-nums">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Lightbox"
          className="p-2 text-stone-300 hover:text-white rounded-lg bg-stone-900/60 hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
        <img
          src={current.url}
          alt={current.alt || 'Full size view'}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
        />

        {/* Navigation arrows */}
        {images.length > 1 && onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous Image"
            className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-800 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {images.length > 1 && onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next Image"
            className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-800 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Caption footer */}
      {current.caption && (
        <div className="text-center text-xs text-stone-400 max-w-xl pb-2">
          {current.caption}
        </div>
      )}
    </div>
  );
};

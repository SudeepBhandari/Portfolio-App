import React, { useEffect, useState } from 'react';

export const CursorSpotlight: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        if (!isVisible) setIsVisible(true);

        // Detect hover over interactive elements or cards
        const target = e.target as HTMLElement | null;
        if (target && target.closest('a, button, input, textarea, select, [role="button"], label, article, .group')) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 overflow-hidden"
    >
      {/* Ambient Radial Spotlight following the cursor */}
      <div
        className="absolute -inset-px transition-transform duration-75 ease-out"
        style={{
          background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, rgba(217, 119, 6, 0.035), transparent 60%)`
        }}
      />

      {/* Subtle Magnetic Floating Cursor Ring */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-stone-400/40 dark:border-stone-500/40 transition-[width,height,transform,opacity,border-color] duration-200 ease-out ${
          isHovered
            ? 'w-10 h-10 -ml-5 -mt-5 bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/60 dark:border-amber-400/60 scale-100 opacity-90'
            : 'w-5 h-5 -ml-2.5 -mt-2.5 opacity-40 scale-75'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`
        }}
      />
    </div>
  );
};

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.25;
const HINT_KEY = 'swipe_hint_shown_v2';

export default function SwipeNav({ pages }) {
  const navigate = useNavigate();
  const location = useLocation();

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);
  const [dragX, setDragX] = useState(0);        // live drag offset in px
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // /settings is never in the swipe deck
  const swipeablePages = pages
    .filter(p => p.path !== '/settings')
    .map(p => p.path);

  const currentIndex = swipeablePages.indexOf(location.pathname);
  const canGoNext = currentIndex < swipeablePages.length - 1;
  const canGoPrev = currentIndex > 0;

  // Show first-time hint
  useEffect(() => {
    if (!localStorage.getItem(HINT_KEY) && swipeablePages.length > 1) {
      const t = setTimeout(() => {
        setShowHint(true);
        setTimeout(() => {
          setShowHint(false);
          localStorage.setItem(HINT_KEY, '1');
        }, 2800);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, []);

  const doNavigate = useCallback((dir) => {
    if (transitioning) return;
    const target = dir === 'next'
      ? swipeablePages[currentIndex + 1]
      : swipeablePages[currentIndex - 1];
    if (!target) return;
    setTransitioning(true);
    navigate(target);
    setTimeout(() => setTransitioning(false), 350);
  }, [currentIndex, swipeablePages, navigate, transitioning]);

  // ── Touch handlers ──
  useEffect(() => {
    const onStart = (e) => {
      // Ignore swipes starting on horizontally scrollable elements (e.g., wager chips)
      const target = e.target.closest('[style*="touch-action: pan-y"], [data-no-swipe]');
      if (target) return;
      
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setIsDragging(false);
      setDragX(0);
    };

    const onMove = (e) => {
      if (touchStartX.current === null) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      // Only track horizontal-dominant drags
      if (!isDragging && Math.abs(dy) > Math.abs(dx) * 1.2) return;
      if (Math.abs(dx) > 8) setIsDragging(true);

      // Resist at edges
      const atLeft = currentIndex === 0 && dx > 0;
      const atRight = currentIndex === swipeablePages.length - 1 && dx < 0;
      const resistance = (atLeft || atRight) ? 0.25 : 1;
      setDragX(dx * resistance);
    };

    const onEnd = (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const dt = Date.now() - touchStartTime.current;
      const velocity = Math.abs(dx) / dt;

      const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
      const isStrong = Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY;

      if (isHorizontal && isStrong) {
        if (dx < 0 && canGoNext) doNavigate('next');
        else if (dx > 0 && canGoPrev) doNavigate('prev');
      }

      setDragX(0);
      setIsDragging(false);
      touchStartX.current = null;
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, currentIndex, swipeablePages.length, canGoNext, canGoPrev, doNavigate]);

  return (
    <>
      {/* Live drag overlay — subtle parallax shift on the screen */}
      {isDragging && dragX !== 0 && (
        <div
          className="fixed inset-0 z-[45] pointer-events-none"
          style={{ transform: `translateX(${dragX * 0.12}px)`, willChange: 'transform' }}
        />
      )}

      {/* Edge rubber-band indicators */}
      {isDragging && dragX > 20 && !canGoPrev && (
        <div
          className="fixed inset-y-0 left-0 z-[46] w-12 pointer-events-none"
          style={{ background: `linear-gradient(to right, hsl(var(--primary)/0.3), transparent)`, opacity: Math.min(dragX / 80, 1) }}
        />
      )}
      {isDragging && dragX < -20 && !canGoNext && (
        <div
          className="fixed inset-y-0 right-0 z-[46] w-12 pointer-events-none"
          style={{ background: `linear-gradient(to left, hsl(var(--primary)/0.3), transparent)`, opacity: Math.min(-dragX / 80, 1) }}
        />
      )}

      {/* Directional peek arrows while dragging */}
      {isDragging && Math.abs(dragX) > 20 && (
        <div className="fixed inset-0 z-[46] pointer-events-none flex items-center justify-between px-3">
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: dragX > 20 && canGoPrev ? Math.min(dragX / 60, 1) : 0, x: 0 }}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: dragX < -20 && canGoNext ? Math.min(-dragX / 60, 1) : 0, x: 0 }}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      )}

      {/* First-time swipe hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
              <motion.div
                animate={{ x: [-5, 0, -5] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              >
                <ChevronLeft className="w-4 h-4 text-primary" />
              </motion.div>
              Swipe left or right to flip pages
              <motion.div
                animate={{ x: [5, 0, 5] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
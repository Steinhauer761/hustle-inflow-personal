import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIER2_PATHS } from './NavCustomizer';

export default function PageSwipeDots({ pages, onCustomize }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState(null);

  // Same ordering as SwipeNav: core first, Tier 2 at end, no /settings
  const core = pages.filter(p => p.path !== '/settings' && !TIER2_PATHS.includes(p.path));
  const tier2 = pages.filter(p => TIER2_PATHS.includes(p.path));
  const swipeable = [...core, ...tier2];
  const currentIndex = swipeable.findIndex(p => p.path === location.pathname);

  if (swipeable.length < 2 || currentIndex === -1) return null;

  const MAX_DOTS = 9;
  let start = Math.max(0, currentIndex - Math.floor(MAX_DOTS / 2));
  let end = Math.min(swipeable.length, start + MAX_DOTS);
  if (end - start < MAX_DOTS) start = Math.max(0, end - MAX_DOTS);
  const visible = swipeable.slice(start, end);

  return (
    <div className="fixed bottom-[5.5rem] left-0 right-0 z-40 flex flex-col items-center gap-1 pointer-events-none md:bottom-4">
      {/* Page label tooltip */}
      {tooltip && (
        <div className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
          {tooltip}
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 pointer-events-auto border border-white/8">
        {start > 0 && <div className="w-1 h-1 rounded-full bg-white/20" />}
        {visible.map((page, i) => {
          const absIndex = start + i;
          const isCurrent = absIndex === currentIndex;
          return (
            <button
              key={page.path}
              onClick={() => navigate(page.path)}
              onMouseEnter={() => setTooltip(page.label)}
              onMouseLeave={() => setTooltip(null)}
              onTouchStart={() => setTooltip(page.label)}
              onTouchEnd={() => setTimeout(() => setTooltip(null), 800)}
              className={cn(
                "rounded-full transition-all duration-300 touch-manipulation",
                isCurrent ? "w-5 h-2 bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "w-2 h-2 bg-white/25 hover:bg-white/55 active:bg-white/70"
              )}
            />
          );
        })}
        {end < swipeable.length && <div className="w-1 h-1 rounded-full bg-white/20" />}

        <div className="w-px h-3 bg-white/20 mx-0.5" />

        <button
          onClick={onCustomize}
          className="text-white/50 hover:text-primary active:text-primary transition-colors p-0.5 touch-manipulation"
          title="Customize pages"
        >
          <SlidersHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
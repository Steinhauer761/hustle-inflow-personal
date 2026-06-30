import { EVENT_TYPES } from '@/pages/Calendar';

export default function CalendarFilters({ activeFilters, onToggle }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {Object.entries(EVENT_TYPES).map(([type, cfg]) => {
        const active = activeFilters.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all shrink-0 ${
              active ? 'text-white border-transparent' : 'bg-transparent text-muted-foreground border-border'
            }`}
            style={active ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
          >
            <span>{cfg.emoji}</span> {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
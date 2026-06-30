import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format, startOfWeek, addDays, isSameDay, isToday, parseISO
} from 'date-fns';

const HOUR_START = 7;  // 7am
const HOUR_END = 21;   // 9pm
const HOUR_HEIGHT = 56; // px per hour

function timeToY(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return null;
  return ((h - HOUR_START) + (m || 0) / 60) * HOUR_HEIGHT;
}

function EventPill({ event }) {
  const y = timeToY(event.time);
  const isAllDay = y === null;

  if (isAllDay) {
    return (
      <div
        className="text-[9px] font-bold leading-tight rounded-md px-1 py-0.5 mb-0.5 truncate"
        style={{ background: event.color + '33', color: event.color, border: `1px solid ${event.color}55` }}
        title={event.title}
      >
        {event.emoji} {event.title}
      </div>
    );
  }

  return (
    <div
      className="absolute left-0 right-0 mx-0.5 rounded-md px-1 py-0.5 text-[9px] font-bold leading-tight overflow-hidden"
      style={{
        top: y,
        minHeight: 20,
        background: event.color + '33',
        color: event.color,
        border: `1px solid ${event.color}55`,
        zIndex: 2,
      }}
      title={event.title}
    >
      {event.emoji} {event.title}
    </div>
  );
}

function DayColumn({ day, events }) {
  const todayFlag = isToday(day);
  const allDay = events.filter(e => !e.time);
  const timed = events.filter(e => e.time);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Day header */}
      <div className={`text-center py-2 rounded-xl mb-1 ${todayFlag ? 'bg-primary/20' : ''}`}>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(day, 'EEE')}</p>
        <p className={`text-base font-display leading-none ${todayFlag ? 'text-primary' : 'text-foreground'}`}>
          {format(day, 'd')}
        </p>
      </div>

      {/* All-day events */}
      {allDay.length > 0 && (
        <div className="mb-1 space-y-0.5">
          {allDay.slice(0, 3).map(e => <EventPill key={e.id} event={e} />)}
          {allDay.length > 3 && (
            <div className="text-[8px] text-muted-foreground text-center">+{allDay.length - 3} more</div>
          )}
        </div>
      )}

      {/* Timed grid */}
      <div className="relative flex-1" style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}>
        {timed.map(e => <EventPill key={e.id} event={e} />)}
      </div>
    </div>
  );
}

export default function WeekView({ weekStart, events }) {
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const hours = useMemo(() =>
    Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    []
  );

  const eventsForDay = (day) =>
    events.filter(e => isSameDay(parseISO(e.date), day));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex overflow-x-auto">
        {/* Time gutter */}
        <div className="shrink-0 w-10">
          {/* header spacer */}
          <div className="h-[60px]" />
          {/* hour labels */}
          {hours.map(h => (
            <div
              key={h}
              className="text-[8px] text-muted-foreground text-right pr-1 leading-none border-t border-border/30"
              style={{ height: HOUR_HEIGHT }}
            >
              {h % 12 === 0 ? '12' : h % 12}{h < 12 ? 'a' : 'p'}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 min-w-0 divide-x divide-border/30">
          {days.map(day => (
            <div key={day.toISOString()} className="flex-1 min-w-[44px] px-0.5 pt-1">
              <DayColumn day={day} events={eventsForDay(day)} />
              {/* Hour grid lines */}
              <div className="relative pointer-events-none" style={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }}>
                {hours.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (h - HOUR_START) * HOUR_HEIGHT }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
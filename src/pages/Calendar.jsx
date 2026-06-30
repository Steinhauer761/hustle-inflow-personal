import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO,
  startOfWeek, addWeeks, subWeeks
} from 'date-fns';
import CalendarEventDot from '@/components/calendar/CalendarEventDot';
import CalendarDaySheet from '@/components/calendar/CalendarDaySheet';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import CalendarCalculator from '@/components/calendar/CalendarCalculator';
import WeekView from '@/components/calendar/WeekView';

export const EVENT_TYPES = {
  birthday: { label: 'Birthdays', emoji: '🎂', color: '#E05078' },
  vet: { label: 'Vet Visits', emoji: '🏥', color: '#0891B2' },
  grooming: { label: 'Grooming', emoji: '✂️', color: '#8B5CF6' },
  task: { label: 'Tasks', emoji: '✅', color: '#059669' },
  payment: { label: 'Payments', emoji: '💳', color: '#E05A00' },
  trip: { label: 'Trips', emoji: '✈️', color: '#CA8A04' },
};

function buildEvents(members, pets, tasks, trips) {
  const events = [];
  const today = new Date();

  // Family birthdays — show for current + next year
  members.forEach(m => {
    if (!m.birthday) return;
    [today.getFullYear(), today.getFullYear() + 1].forEach(year => {
      const d = `${year}-${m.birthday.slice(5)}`;
      events.push({ id: `bday-${m.id}-${year}`, date: d, type: 'birthday', title: `${m.name}'s Birthday`, emoji: '🎂', color: EVENT_TYPES.birthday.color });
    });
  });

  // Pet birthdays
  pets.forEach(p => {
    if (!p.birthday) return;
    [today.getFullYear(), today.getFullYear() + 1].forEach(year => {
      const d = `${year}-${p.birthday.slice(5)}`;
      events.push({ id: `pbday-${p.id}-${year}`, date: d, type: 'birthday', title: `${p.name}'s Birthday 🐾`, emoji: '🎂', color: EVENT_TYPES.birthday.color });
    });
  });

  // Vet appointments
  pets.forEach(p => {
    if (p.next_vet_visit) events.push({ id: `vet-${p.id}`, date: p.next_vet_visit, type: 'vet', title: `${p.name} — Vet Visit`, emoji: '🏥', color: EVENT_TYPES.vet.color });
    if (p.next_grooming) events.push({ id: `groom-${p.id}`, date: p.next_grooming, type: 'grooming', title: `${p.name} — Grooming`, emoji: '✂️', color: EVENT_TYPES.grooming.color });
  });

  // Tasks with dates
  tasks.forEach(t => {
    if (t.date) events.push({ id: `task-${t.id}`, date: t.date, type: 'task', title: t.title, emoji: '✅', color: EVENT_TYPES.task.color, status: t.status });
  });

  // Trips
  trips.forEach(t => {
    if (t.start_date) events.push({ id: `trip-start-${t.id}`, date: t.start_date, type: 'trip', title: `✈️ ${t.title} departs`, emoji: '✈️', color: EVENT_TYPES.trip.color });
    if (t.end_date) events.push({ id: `trip-end-${t.id}`, date: t.end_date, type: 'trip', title: `🏠 ${t.title} returns`, emoji: '🏠', color: EVENT_TYPES.trip.color });
  });

  return events;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeFilters, setActiveFilters] = useState(Object.keys(EVENT_TYPES));
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const { data: members = [] } = useQuery({ queryKey: ['family'], queryFn: () => base44.entities.FamilyMember.list() });
  const { data: pets = [] } = useQuery({ queryKey: ['pets'], queryFn: () => base44.entities.Pet.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks-all'], queryFn: () => base44.entities.Task.list() });
  const { data: trips = [] } = useQuery({ queryKey: ['trips'], queryFn: () => base44.entities.Trip.list() });

  const allEvents = useMemo(() => buildEvents(members, pets, tasks, trips), [members, pets, tasks, trips]);
  const filteredEvents = useMemo(() => allEvents.filter(e => activeFilters.includes(e.type)), [allEvents, activeFilters]);

  const eventsForDay = (date) => filteredEvents.filter(e => isSameDay(parseISO(e.date), date));
  const eventsForSelected = selectedDay ? eventsForDay(selectedDay) : [];

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    // Pad start to Monday (0=Sun → shift)
    const startPad = (start.getDay() + 6) % 7;
    return Array(startPad).fill(null).concat(allDays);
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(160deg, #1a0f00 0%, #2d1500 60%, #1a0a00 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display text-foreground">Calendar</h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-muted rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setView('month')}
                className={`p-1.5 rounded-lg transition-all ${view === 'month' ? 'bg-primary/30 text-primary' : 'text-muted-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('week')}
                className={`p-1.5 rounded-lg transition-all ${view === 'week' ? 'bg-primary/30 text-primary' : 'text-muted-foreground'}`}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
            {/* Nav arrows */}
            {view === 'month' ? (
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-foreground min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-foreground min-w-[140px] text-center">
                  {format(weekStart, 'MMM d')} – {format(addWeeks(weekStart, 1), 'MMM d')}
                </span>
                <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <CalendarFilters activeFilters={activeFilters} onToggle={(type) =>
          setActiveFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
        } />
      </div>

      <div className="px-3 pt-4 pb-8 max-w-lg mx-auto">

        {/* ── Week View ── */}
        {view === 'week' && (
          <>
            <WeekView weekStart={weekStart} events={filteredEvents} />
            <UpcomingEvents events={filteredEvents} currentMonth={currentMonth} />
          </>
        )}

        {/* ── Month View ── */}
        {view === 'month' && <>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />;
            const dayEvents = eventsForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const inMonth = isSameMonth(day, currentMonth);
            const todayFlag = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-primary/20 ring-1 ring-primary/50' :
                  todayFlag ? 'bg-primary/10' : 'hover:bg-muted/50'
                } ${inMonth ? '' : 'opacity-30'}`}
              >
                <span className={`text-xs font-bold leading-none mb-1 ${
                  todayFlag ? 'text-primary' : isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="flex gap-0.5 flex-wrap justify-center min-h-[8px]">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <CalendarEventDot key={j} color={e.color} />
                  ))}
                  {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected day events */}
        <AnimatePresence>
          {selectedDay && (
            <CalendarDaySheet
              day={selectedDay}
              events={eventsForSelected}
              onClose={() => setSelectedDay(null)}
            />
          )}
        </AnimatePresence>

        {/* Upcoming events list */}
        {!selectedDay && (
          <UpcomingEvents events={filteredEvents} currentMonth={currentMonth} />
        )}

        {/* Calculator */}
        {!selectedDay && <CalendarCalculator />}
        </>}
      </div>
    </div>
  );
}

function UpcomingEvents({ events, currentMonth }) {
  const upcoming = useMemo(() => {
    const today = new Date();
    return events
      .filter(e => parseISO(e.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [events]);

  if (upcoming.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Upcoming</h2>
      <div className="space-y-2">
        {upcoming.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-white text-center"
              style={{ background: e.color + '33', border: `1px solid ${e.color}55` }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: e.color }}>
                {format(parseISO(e.date), 'MMM')}
              </span>
              <span className="text-sm font-display leading-none" style={{ color: e.color }}>
                {format(parseISO(e.date), 'd')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{e.emoji} {e.title}</p>
              <p className="text-[10px] text-muted-foreground">{format(parseISO(e.date), 'EEEE, MMMM d')}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
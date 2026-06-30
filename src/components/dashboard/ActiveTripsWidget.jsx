import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plane, MapPin, CalendarDays, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

const tripTypeEmoji = {
  road_trip: '🚗',
  flight: '✈️',
  vacation: '🏖️',
  day_trip: '🌅',
  other: '🗺️',
};

const statusColors = {
  planning: 'text-yellow-400 bg-yellow-400/10',
  booked: 'text-emerald-400 bg-emerald-400/10',
  completed: 'text-muted-foreground bg-muted/50',
};

export default function ActiveTripsWidget() {
  const navigate = useNavigate();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['active-trips'],
    queryFn: () => base44.entities.Trip.list('-start_date', 20),
  });

  const active = trips
    .filter(t => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <span>✈️</span> Active Trips
        </h3>
        <button onClick={() => navigate('/trips')}
          className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : active.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2">🗺️</span>
          <p className="text-muted-foreground text-xs font-semibold">No active trips</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-2 text-[10px] text-primary hover:underline"
          >
            Plan one →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto scrollbar-hide">
          {active.map((trip, i) => {
            const daysUntil = trip.start_date
              ? differenceInDays(new Date(trip.start_date + 'T00:00:00'), new Date())
              : null;

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate('/trips')}
                className="p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{tripTypeEmoji[trip.trip_type] || '🗺️'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{trip.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {trip.destination}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[trip.status] || statusColors.planning}`}>
                    {trip.status}
                  </span>
                </div>

                {trip.start_date && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <CalendarDays className="w-2.5 h-2.5" />
                    {format(new Date(trip.start_date + 'T00:00:00'), 'MMM d')}
                    {trip.end_date && ` – ${format(new Date(trip.end_date + 'T00:00:00'), 'MMM d')}`}
                    {daysUntil !== null && daysUntil >= 0 && (
                      <span className="ml-auto text-primary font-bold">
                        {daysUntil === 0 ? 'Today!' : `in ${daysUntil}d`}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
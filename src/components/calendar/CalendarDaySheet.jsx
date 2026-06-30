import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function CalendarDaySheet({ day, events, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="mt-4 bg-card border border-border rounded-3xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">
          {format(day, 'EEEE, MMMM d')}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm text-muted-foreground font-semibold">Nothing scheduled</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {events.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: e.color + '22' }}
              >
                {e.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                {e.status && (
                  <span className={`text-[10px] font-bold capitalize ${
                    e.status === 'done' ? 'text-accent' : e.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground'
                  }`}>{e.status.replace('_', ' ')}</span>
                )}
              </div>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
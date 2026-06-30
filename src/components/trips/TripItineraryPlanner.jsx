import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CalendarDays, Utensils, Backpack, MapPin, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { addDays, format, parseISO } from 'date-fns';

function DayCard({ day, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">{day.label}</p>
            <p className="text-[10px] text-muted-foreground">{day.date}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
              {/* Activities */}
              {day.activities?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Activities
                  </p>
                  <ul className="space-y-1">
                    {day.activities.map((a, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Restaurants */}
              {day.restaurants?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1.5 flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Restaurant Suggestions
                  </p>
                  <ul className="space-y-1">
                    {day.restaurants.map((r, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-accent mt-0.5">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Packing reminders */}
              {day.packing_reminders?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-yellow-400 mb-1.5 flex items-center gap-1">
                    <Backpack className="w-3 h-3" /> Pack for today
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {day.packing_reminders.map((p, i) => (
                      <span key={i} className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TripItineraryPlanner({ trip, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    setLoading(true);
    setItinerary(null);
    setSaved(false);

    const result = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_1_pro',
      add_context_from_internet: true,
      prompt: `Create a detailed day-by-day travel itinerary for a trip to ${trip.destination}.
Trip type: ${trip.trip_type?.replace('_', ' ')}.
Dates: ${trip.start_date || 'flexible'} to ${trip.end_date || 'flexible'}.
Budget level: ${trip.budget ? `$${trip.budget} total` : 'moderate'}.
${trip.notes ? `Notes: ${trip.notes}` : ''}

For EACH day, provide:
- 3-4 specific activities with real place names and brief descriptions
- 2 restaurant recommendations (breakfast/lunch/dinner) with cuisine type
- 2-3 specific packing items relevant to that day's activities

Make it practical, specific, and exciting. Use real landmarks and local restaurants where possible.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'One-line trip summary' },
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_number: { type: 'number' },
                theme: { type: 'string', description: 'Theme for the day e.g. "Explore the Old City"' },
                activities: { type: 'array', items: { type: 'string' } },
                restaurants: { type: 'array', items: { type: 'string' } },
                packing_reminders: { type: 'array', items: { type: 'string' } },
              }
            }
          },
          full_packing_list: { type: 'array', items: { type: 'string' } },
        }
      }
    });

    setItinerary(result);
    setLoading(false);
  };

  const saveAsTasks = async () => {
    if (!itinerary) return;
    setSaving(true);

    const tasks = [];
    const startDate = trip.start_date ? parseISO(trip.start_date) : new Date();

    itinerary.days.forEach((day) => {
      const date = format(addDays(startDate, day.day_number - 1), 'yyyy-MM-dd');

      // Activities → tasks
      day.activities.forEach(activity => {
        tasks.push({
          title: activity,
          category: 'social',
          priority: 'medium',
          status: 'todo',
          date,
          notes: `${trip.title} — Day ${day.day_number}: ${day.theme}`,
        });
      });

      // Restaurant reservations → tasks
      day.restaurants.forEach(restaurant => {
        tasks.push({
          title: `🍽️ ${restaurant}`,
          category: 'meal',
          priority: 'low',
          status: 'todo',
          date,
          notes: `${trip.title} — Day ${day.day_number} dining`,
        });
      });
    });

    // Full packing list → one task per item
    if (itinerary.full_packing_list?.length > 0) {
      const packDate = format(addDays(startDate, -1), 'yyyy-MM-dd'); // Day before trip
      tasks.push({
        title: `🎒 Pack for ${trip.title}: ${itinerary.full_packing_list.join(', ')}`,
        category: 'errand',
        priority: 'high',
        status: 'todo',
        date: packDate,
        notes: `Full packing list: ${itinerary.full_packing_list.join(', ')}`,
      });
    }

    await Promise.all(tasks.map(t => base44.entities.Task.create(t)));
    setSaving(false);
    setSaved(true);
    toast.success(`${tasks.length} tasks saved to your planner! 🎉`);
  };

  // Build enriched day list with labels & dates
  const enrichedDays = itinerary?.days?.map((day) => {
    const startDate = trip.start_date ? parseISO(trip.start_date) : new Date();
    const date = format(addDays(startDate, day.day_number - 1), 'MMM d, yyyy');
    return { ...day, label: `Day ${day.day_number}: ${day.theme}`, date };
  }) || [];

  const handleClose = () => {
    setItinerary(null);
    setSaved(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI Itinerary — {trip?.title}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 inline mr-1" />{trip?.destination}
            {trip?.start_date && ` · ${format(parseISO(trip.start_date), 'MMM d')}${trip?.end_date ? ` – ${format(parseISO(trip.end_date), 'MMM d, yyyy')}` : ''}`}
          </p>
        </SheetHeader>

        {!itinerary && !loading && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-bold text-foreground mb-2">Generate your day-by-day itinerary</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              AI will build a personalized plan with activities, restaurant picks, and a packing list — then save everything as tasks in your planner.
            </p>
            <Button
              onClick={generate}
              className="gap-2 bg-gradient-to-r from-yellow-500 to-primary hover:opacity-90 text-black font-bold rounded-2xl px-8"
            >
              <Sparkles className="w-4 h-4" /> Generate Itinerary
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
              <Sparkles className="w-10 h-10 text-yellow-400 mx-auto" />
            </motion.div>
            <p className="text-sm font-bold text-foreground mt-4">Building your perfect itinerary...</p>
            <p className="text-xs text-muted-foreground mt-1">Researching {trip?.destination} with AI</p>
          </div>
        )}

        {itinerary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-6">
            {/* Summary */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Trip Summary</p>
              <p className="text-sm text-foreground">{itinerary.summary}</p>
            </div>

            {/* Day cards */}
            <div className="space-y-2">
              {enrichedDays.map((day, i) => (
                <DayCard key={i} day={day} index={i} />
              ))}
            </div>

            {/* Packing list */}
            {itinerary.full_packing_list?.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2 flex items-center gap-1">
                  <Backpack className="w-3 h-3" /> Full Packing List
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {itinerary.full_packing_list.map((item, i) => (
                    <span key={i} className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2.5 py-0.5">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={generate} disabled={loading || saving}>
                <Sparkles className="w-4 h-4 mr-1" /> Regenerate
              </Button>
              <Button
                className="flex-1 rounded-2xl gap-2 font-bold"
                onClick={saveAsTasks}
                disabled={saving || saved}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                ) : (
                  <><CalendarDays className="w-4 h-4" /> Save as Tasks</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
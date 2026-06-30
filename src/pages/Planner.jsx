import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import PageHero from '@/components/shared/PageHero';
import TaskForm from '@/components/planner/TaskForm';
import EmptyState from '@/components/shared/EmptyState';
import FloatingParticles from '@/components/shared/FloatingParticles';
import GlassCard from '@/components/shared/GlassCard';

const categoryEmojis = {
  errand: '🏃', appointment: '📅', meal: '🍽️', bill: '💰',
  family: '👨‍👩‍👧‍👦', pet: '🐾', self_care: '🧘', work: '💼',
  social: '🎉', other: '📌',
};

const priorityBorder = { urgent: 'border-l-red-400', high: 'border-l-orange-400', medium: 'border-l-amber-300', low: 'border-l-green-300' };

export default function Planner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(selectedDate, { weekStartsOn: 0 }) });
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-date', 200),
  });

  const dayTasks = tasks.filter(t => t.date === dateStr);

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Task.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setShowForm(false); setEditingTask(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleSubmit = (formData) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, date: formData.date || dateStr });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <FloatingParticles count={20} color="bg-primary/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <PageHero
        imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&amp;q=80"
        title="Let's Get It Done"
        subtitle="Planner"
        emoji="📅"
        overlayColor="from-sky-900/60"
      >
        <Button size="sm" onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="rounded-full gap-1 bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </PageHero>

      <div className="px-4 pb-8 max-w-2xl mx-auto space-y-4 relative z-10">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => setSelectedDate(d => subDays(d, 7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-foreground">
            {format(weekStart, 'MMM d')} – {format(endOfWeek(selectedDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}
          </span>
          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => setSelectedDate(d => addDays(d, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Days - 3D Cards */}
        <GlassCard className="p-3" gradient="from-card via-card/80 to-card border-border">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {weekDays.map(day => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isSelected = format(day, 'yyyy-MM-dd') === dateStr;
              const dayTaskCount = tasks.filter(t => t.date === format(day, 'yyyy-MM-dd')).length;
              return (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-1 min-w-[44px] flex flex-col items-center py-2 rounded-xl transition-all border backdrop-blur-xl",
                    isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-primary" :
                    isToday ? "bg-accent/20 text-accent-foreground border-accent/30" :
                    "bg-card/60 hover:bg-accent/10 text-muted-foreground border-border/50"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase">{format(day, 'EEE')}</span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                  {dayTaskCount > 0 && (
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-0.5", isSelected ? "bg-primary-foreground" : "bg-primary")} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Day Header */}
        <h2 className="text-lg font-bold text-foreground">{format(selectedDate, 'EEEE, MMMM d')}</h2>

        {/* Tasks */}
        {dayTasks.length === 0 ? (
          <EmptyState emoji="✨" title="Nothing here yet!" description="Enjoy the rare peace, or add something to your plate." actionLabel="Add Task" onAction={() => setShowForm(true)} />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {dayTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all",
                    task.status === 'done' && 'opacity-50'
                  )}
                >
                  <button
                    onClick={() => updateMutation.mutate({ id: task.id, data: { status: task.status === 'done' ? 'todo' : 'done' } })}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      task.status === 'done' ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 hover:border-primary/50'
                    )}
                  >
                    {task.status === 'done' && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate text-card-foreground", task.status === 'done' && 'line-through text-muted-foreground')}>
                      {categoryEmojis[task.category]} {task.title}
                    </p>
                    {task.time && <p className="text-xs text-primary">{task.time}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => { setEditingTask(task); setShowForm(true); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(task.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <TaskForm task={editingTask} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditingTask(null); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
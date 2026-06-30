import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';

const categoryEmojis = {
  errand: '🏃', appointment: '📅', meal: '🍽️', bill: '💰',
  family: '👨‍👩‍👧‍👦', pet: '🐾', self_care: '🧘', work: '💼',
  social: '🎉', other: '📌',
};

const priorityBorder = {
  urgent: 'border-l-destructive',
  high: 'border-l-primary',
  medium: 'border-l-yellow-500',
  low: 'border-l-accent',
};

export default function UpcomingTasksWidget() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekAhead = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: () => base44.entities.Task.list('-date', 20),
  });

  const upcoming = tasks
    .filter(t => t.date >= today && t.date <= weekAhead && t.status !== 'done')
    .slice(0, 6);

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.Task.update(id, { status: status === 'done' ? 'todo' : 'done' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['upcoming-tasks'] }),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <span>📋</span> Upcoming Tasks
        </h3>
        <button onClick={() => navigate('/planner')}
          className="text-xs text-primary flex items-center gap-0.5 hover:underline">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : upcoming.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <span className="text-3xl mb-2">🎉</span>
          <p className="text-muted-foreground text-xs font-semibold">Nothing due this week!</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {upcoming.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border-l-4',
                  priorityBorder[task.priority] || 'border-l-border'
                )}
              >
                <button
                  onClick={() => toggleMutation.mutate({ id: task.id, status: task.status })}
                  className="w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-primary flex items-center justify-center shrink-0 transition-colors"
                >
                  {task.status === 'done' && <Check className="w-3 h-3 text-primary" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {categoryEmojis[task.category] || '📌'} {task.title}
                  </p>
                  {task.date && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {task.date === today ? 'Today' : format(new Date(task.date + 'T00:00:00'), 'MMM d')}
                      {task.time && ` · ${task.time}`}
                    </p>
                  )}
                </div>
                {task.priority === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
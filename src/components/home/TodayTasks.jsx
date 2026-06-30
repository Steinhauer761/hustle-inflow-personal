import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const categoryEmojis = {
  errand: '🏃',
  appointment: '📅',
  meal: '🍽️',
  bill: '💰',
  family: '👨‍👩‍👧‍👦',
  pet: '🐾',
  self_care: '🧘',
  work: '💼',
  social: '🎉',
  other: '📌',
};

const priorityStyles = {
  urgent: 'border-l-destructive',
  high: 'border-l-primary',
  medium: 'border-l-chart-4',
  low: 'border-l-accent',
};

export default function TodayTasks({ tasks }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.Task.update(id, { status: status === 'done' ? 'todo' : 'done' }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueriesData({ queryKey: ['tasks'] });
      const newStatus = status === 'done' ? 'todo' : 'done';
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) =>
        Array.isArray(old) ? old.map(t => t.id === id ? { ...t, status: newStatus } : t) : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-sm">
        <span className="text-3xl block mb-2">🎉</span>
        <span className="text-muted-foreground font-semibold">Nothing on your plate today!</span>
        <p className="text-muted-foreground/60 text-xs mt-1">Go enjoy the sunshine ☀️</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-muted/50 border-l-4 transition-all",
              priorityStyles[task.priority] || 'border-l-border',
              task.status === 'done' && 'opacity-50'
            )}
          >
            <button
              onClick={() => toggleMutation.mutate({ id: task.id, status: task.status })}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                task.status === 'done'
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground hover:border-primary'
              )}
            >
              {task.status === 'done' && <Check className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold truncate text-foreground",
                task.status === 'done' && 'line-through text-muted-foreground'
              )}>
                {categoryEmojis[task.category] || '📌'} {task.title}
              </p>
              {task.time && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {task.time}
                </p>
              )}
            </div>
            {task.priority === 'urgent' && (
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EmptyState({ emoji, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <span className="text-6xl mb-4 animate-float">{emoji}</span>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} className="rounded-full gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
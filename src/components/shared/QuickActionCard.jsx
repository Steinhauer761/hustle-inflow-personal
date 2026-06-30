import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function QuickActionCard({ icon: Icon, label, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border border-border",
        "bg-card hover:bg-muted/50 transition-colors min-w-[80px]"
      )}
    >
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </motion.button>
  );
}
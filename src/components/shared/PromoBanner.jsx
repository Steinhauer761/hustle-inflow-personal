import { Sparkles, Tag } from 'lucide-react';

export default function PromoBanner({ variant = 'default' }) {
  const variants = {
    default: 'from-primary/20 via-secondary/15 to-primary/20 border-primary/30',
    urgent: 'from-red-500/20 via-orange-500/15 to-red-500/20 border-red-500/30',
    success: 'from-emerald-500/20 via-green-500/15 to-emerald-500/20 border-emerald-500/30',
    teal: 'from-teal-500/20 via-primary/15 to-teal-500/20 border-teal-500/30',
  };

  return (
    <div className={`w-full bg-gradient-to-r ${variants[variant]} border rounded-xl p-3 mb-4 flex items-center gap-3`}>
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground">
          🎉 New: The Complete Ecosystem Bundle!
        </p>
        <p className="text-[10px] text-muted-foreground">
          Get lifetime access to the Fitness Hub & Visual Coach
        </p>
      </div>
      <Tag className="w-4 h-4 text-primary/70" />
    </div>
  );
}
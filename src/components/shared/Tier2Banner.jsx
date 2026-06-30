import { Lock, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Tier2Banner({ feature = "This feature" }) {
  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
  });

  if (settings?.description === 'PREMIUM_MEMBER') {
    return null;
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary font-bold text-sm">Tier 2 — Coming Soon</span>
        </div>
        <p className="text-muted-foreground text-xs leading-snug">
          <strong className="text-foreground">{feature}</strong> unlocks in Tier 2. You're seeing a preview — full access is on its way!
        </p>
      </div>
    </div>
  );
}
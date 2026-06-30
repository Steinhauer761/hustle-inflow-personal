import { Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Tier2Lock({ label = "Unlock in Tier 2", className = "" }) {
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
    <span className={`inline-flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide ${className}`}>
      <Lock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
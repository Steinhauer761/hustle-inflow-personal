import { useState } from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Tier2Footer({ moduleName }) {
  const [idea, setIdea] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
  });

  const handleSubmit = () => {
    if (!idea.trim()) return;
    base44.integrations.Core.SendEmail({
      to: 'Steinhauer761@gmail.com',
      subject: `💡 Feature Idea — ${moduleName}`,
      body: `Module: ${moduleName}\n\nIdea: "${idea}"\n\nSubmitted: ${new Date().toLocaleString()}`,
    });
    setSubmitted(true);
    setIdea('');
  };

  return (
    <div className="mt-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-primary font-bold text-sm">
            {settings?.description === 'PREMIUM_MEMBER' ? 'Premium Feature' : 'Tier 2 — Coming Soon'}
        </span>
      </div>
      <p className="text-muted-foreground text-xs mb-4">
        {settings?.description === 'PREMIUM_MEMBER' 
            ? `You have full access to ${moduleName} as a premium member. Have ideas for how we can improve it?` 
            : `Full access to ${moduleName} unlocks in Tier 2. Want to shape what gets built?`}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-xs font-semibold text-foreground">Submit a feature idea</span>
      </div>
      <textarea
        value={idea}
        onChange={e => setIdea(e.target.value)}
        placeholder={`What would you love to see in ${moduleName}?`}
        rows={2}
        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none mb-2"
      />
      {submitted ? (
        <p className="text-primary text-xs font-semibold">✅ Idea received! Thanks for helping shape the platform.</p>
      ) : (
        <button
          onClick={handleSubmit}
          className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full transition-all"
        >
          Submit Idea →
        </button>
      )}
    </div>
  );
}
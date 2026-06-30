import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  DollarSign, LayoutGrid, MapPin, Brain, Users, Zap,
  Gift, Lock, Sparkles, Star
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const FEATURES = [
  {
    icon: DollarSign,
    color: 'from-yellow-500/20 to-yellow-700/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    title: 'Money Mastery',
    desc: 'Track budgets, split bills, log receipts, and stay on top of every dollar.',
    tier: 1,
  },
  {
    icon: LayoutGrid,
    color: 'from-purple-500/20 to-purple-800/10',
    border: 'border-purple-400/30',
    iconColor: 'text-purple-300',
    title: 'Smart Organisation',
    desc: 'Tasks, reminders, family chores, and daily planning in one dashboard.',
    tier: 1,
  },
  {
    icon: MapPin,
    color: 'from-emerald-500/20 to-emerald-800/10',
    border: 'border-emerald-400/30',
    iconColor: 'text-emerald-300',
    title: 'Travel Ready',
    desc: 'Plan trips, store flights, hotels, and documents — your pocket travel HQ.',
    tier: 1,
  },
  {
    icon: Brain,
    color: 'from-sky-500/20 to-sky-800/10',
    border: 'border-sky-400/30',
    iconColor: 'text-sky-300',
    title: 'AI Life Buddy',
    desc: 'A witty, context-aware AI assistant that knows your family, schedule, and vibe.',
    tier: 1,
  },
  {
    icon: Users,
    color: 'from-rose-500/20 to-rose-800/10',
    border: 'border-rose-400/30',
    iconColor: 'text-rose-300',
    title: 'Family & Community',
    desc: 'Manage household members, pets, shared tasks and connect with your people.',
    tier: 1,
  },
  {
    icon: Zap,
    color: 'from-orange-500/20 to-orange-800/10',
    border: 'border-orange-400/30',
    iconColor: 'text-orange-300',
    title: 'Instant Actions',
    desc: 'Quick-capture tasks and one-tap shortcuts so nothing falls through the cracks.',
    tier: 1,
  },
];

const TIER2_FEATURES = [
  { icon: '🤖', title: 'Advanced AI Agents', desc: 'Autonomous agents that handle tasks, book appointments, and manage your calendar for you.' },
  { icon: '📊', title: 'Business Dashboard', desc: 'Track side-hustle income, invoices, clients, and business expenses in one place.' },
  { icon: '🏘️', title: 'Community Hub', desc: 'Connect with other hustlers, share tips, and get accountability partners.' },
  { icon: '🔗', title: 'Deep Integrations', desc: 'Sync with Google Calendar, banking apps, email, and 50+ tools seamlessly.' },
];

const REWARDS = [
  { emoji: '🏆', label: 'Early Access', desc: 'Be first in line when Tier 2 launches' },
  { emoji: '🎁', label: 'Founding Badge', desc: 'Exclusive in-app status forever' },
  { emoji: '✨', label: '3 Months Free', desc: 'Full Tier 2 features, zero cost' },
  { emoji: '🔥', label: 'Shape the App', desc: 'Your suggestions get built first' },
];

export default function AppShowcase() {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!suggestion.trim()) return;
    setSubmitted(true);
    base44.integrations.Core.SendEmail({
      to: 'hustleinflow2026@gmail.com',
      subject: '💡 New Feature Idea — HustleInFlow',
      body: `A user submitted a feature idea:\n\n"${suggestion}"\n\nTime: ${new Date().toLocaleString()}`,
    });
    setSuggestion('');
  };

  return (
    <div className="space-y-12 pb-8">

      {/* ── CURRENT FEATURES ── */}
      <section>
        <motion.div {...fadeUp()} className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">What's inside</p>
          <h2 className="text-2xl font-display text-foreground">Your whole life, managed.</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.06)}
              className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-4 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-background/60" />
              <div className="relative z-10 flex gap-3 items-start">
                <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${f.iconColor}`}>
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm mb-0.5">{f.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TIER 2 COMING SOON ── */}
      <section>
        <motion.div {...fadeUp()} className="mb-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3" /> Tier 2 — Coming Soon
          </div>
          <h2 className="text-2xl font-display text-foreground">Level up your hustle.</h2>
          <p className="text-muted-foreground text-sm mt-1">Power features for the serious hustler. Drop an idea below to help shape what gets built.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIER2_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.07)}
              className="relative rounded-2xl border border-border bg-card p-4 overflow-hidden"
            >
              {/* Lock overlay */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 bg-primary/15 border border-primary/30 rounded-full px-2 py-0.5">
                  <Lock className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Soon</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="text-2xl">{f.icon}</div>
                <div className="pr-14">
                  <h3 className="text-foreground font-bold text-sm mb-0.5">{f.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── REWARDS + SUGGESTION ── */}
      <section>
        <motion.div {...fadeUp()} className="mb-5">
          <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-3">
            <Gift className="w-3 h-3 text-primary" /> Suggestion Rewards
          </div>
          <h2 className="text-2xl font-display text-foreground">Shape it. Get rewarded.</h2>
          <p className="text-muted-foreground text-sm mt-1">Submit an idea that gets built and earn exclusive perks.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {REWARDS.map((r, i) => (
            <motion.div
              key={r.label}
              {...fadeUp(i * 0.08)}
              className="bg-card border border-border rounded-2xl p-3 text-center"
            >
              <div className="text-2xl mb-1.5">{r.emoji}</div>
              <div className="text-foreground font-bold text-xs mb-0.5">{r.label}</div>
              <div className="text-muted-foreground text-[10px] leading-relaxed">{r.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.2)} className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-foreground font-bold text-sm mb-0.5 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-primary" /> Drop your idea
          </h3>
          <p className="text-muted-foreground text-xs mb-3">What would make your daily life a little less chaotic?</p>
          <textarea
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            placeholder="e.g. A shared grocery list that auto-sorts by aisle..."
            rows={3}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none mb-3"
          />
          {submitted ? (
            <p className="text-primary text-sm font-semibold">✅ Idea received! Thanks for helping shape the app.</p>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-semibold px-4 py-2 rounded-full transition-all"
            >
              Submit Idea →
            </button>
          )}
        </motion.div>
      </section>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Zap, LayoutGrid, DollarSign, Users, Brain, MapPin, Crown } from 'lucide-react';

const PERSONAS = [
  { id: 'creator', emoji: '🎨', label: 'Creator', desc: 'Content, media & ideas' },
  { id: 'worker', emoji: '⚒️', label: 'Worker', desc: 'Jobs, gigs & hustle' },
  { id: 'business', emoji: '📈', label: 'Business', desc: 'Invoices, clients & ops' },
  { id: 'explorer', emoji: '🌍', label: 'Explorer', desc: 'Travel, discover & experience' },
];

const FREE_FEATURES = [
  { icon: DollarSign, label: 'Expense Tracker' },
  { icon: LayoutGrid, label: 'Smart Planner' },
  { icon: Users, label: 'Family Hub' },
  { icon: Brain, label: 'AI Assistant' },
  { icon: MapPin, label: 'Trip Organiser' },
  { icon: Zap, label: 'Photo & Files' },
];

const slide = {
  initial: { opacity: 0, x: 36 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -36 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Step 0 = welcome (no login required)
  // Step 1 = dashboard preview (go to app)
  // Step 2 = role selection (shown after login/register, post-entry)
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState(null);
  const [saving, setSaving] = useState(false);

  const goToDashboard = () => navigate('/');

  const savePersona = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.UserSettings.list('-created_date', 1);
      const data = { onboarding_complete: true, interests: persona ? [persona] : [] };
      if (existing[0]) await base44.entities.UserSettings.update(existing[0].id, data);
      else await base44.entities.UserSettings.create(data);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    } catch (_) { /* silent */ }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#090d14] flex flex-col items-center justify-center px-5">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
          <Zap className="w-4 h-4 text-teal-400" />
        </div>
        <span className="font-display text-xl font-bold text-white tracking-tight">HustleInFlow</span>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-teal-400' : i < step ? 'w-4 bg-teal-400/40' : 'w-4 bg-white/10'}`} />
        ))}
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <motion.div key="s0" {...slide} className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-teal-400" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-3 leading-tight">
                Welcome to<br />HustleInFlow
              </h1>
              <p className="text-white/40 text-sm leading-relaxed mb-3">
                One platform for work, life, and opportunity.
              </p>
              <p className="text-teal-300 text-sm font-medium mb-8">
                Join free — Tier 2 coming soon at $4.99/mo
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-teal-500 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-400 transition-colors"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={goToDashboard} className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors">
                Skip — take me to the app
              </button>
            </motion.div>
          )}

          {/* Step 1 — What you get free */}
          {step === 1 && (
            <motion.div key="s1" {...slide}>
              <h2 className="font-display text-2xl font-bold text-white mb-1 text-center">Your free dashboard</h2>
              <p className="text-white/40 text-xs text-center mb-6">Everything below is included — no paywall</p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {FREE_FEATURES.map(f => (
                  <div key={f.label} className="flex items-center gap-2.5 bg-white/4 border border-white/8 rounded-xl p-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <span className="text-xs font-semibold text-white">{f.label}</span>
                    <Check className="w-3 h-3 text-teal-400 ml-auto shrink-0" />
                  </div>
                ))}
              </div>

              {/* Tier 2 teaser */}
              <div className="bg-teal-500/6 border border-teal-500/20 rounded-xl p-3.5 mb-5 flex items-center gap-3">
                <Crown className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-teal-300">Tier 2 — $4.99/month</p>
                  <p className="text-[11px] text-white/40">Blackjack, Poker, Avatars, Wallet & more</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-teal-500 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-400 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2 — Role (personalise, post-dashboard entry) */}
          {step === 2 && (
            <motion.div key="s2" {...slide}>
              <h2 className="font-display text-2xl font-bold text-white mb-1 text-center">How do you use it?</h2>
              <p className="text-white/40 text-xs text-center mb-6">We'll personalise your experience</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${persona === p.id
                      ? 'bg-teal-500/15 border-teal-500/50'
                      : 'bg-white/4 border-white/8 hover:border-white/16'}`}
                  >
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <p className={`font-bold text-sm ${persona === p.id ? 'text-teal-300' : 'text-white'}`}>{p.label}</p>
                    <p className="text-xs text-white/35 mt-0.5">{p.desc}</p>
                    {persona === p.id && <Check className="w-3 h-3 text-teal-400 mt-1.5" />}
                  </button>
                ))}
              </div>

              <button
                onClick={persona ? savePersona : goToDashboard}
                disabled={saving}
                className="w-full bg-teal-500 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-400 transition-colors disabled:opacity-50"
              >
                {saving ? 'Setting up...' : 'Enter Dashboard'} <ArrowRight className="w-4 h-4" />
              </button>
              {!persona && (
                <button onClick={goToDashboard} className="mt-2.5 w-full text-xs text-white/25 hover:text-white/50 transition-colors">
                  Skip personalisation
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
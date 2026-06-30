import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Zap, MapPin, Brain, Users, DollarSign, LayoutGrid,
  Star, ArrowRight, Check, ChevronDown, Share2,
  Trophy, Briefcase, Dice5, Wallet, Receipt, Lock,
  Sparkles, Shield, Gamepad2, Crown, Rocket, Megaphone, Download
} from 'lucide-react';
import PromoBanner from '@/components/shared/PromoBanner';
import PromoCodeBox from '@/components/shared/PromoCodeBox';
import { usePWAInstall } from '@/hooks/use-pwa-install';

// ── helpers ───────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

// ── Data ──────────────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  { icon: DollarSign, label: 'Expense Tracker', desc: 'Budgets, receipts, spending insights' },
  { icon: LayoutGrid, label: 'Smart Planner', desc: 'Tasks, calendar, daily dashboard' },
  { icon: MapPin, label: 'Trip Organiser', desc: 'Flights, hotels, travel docs' },
  { icon: Brain, label: 'AI Assistant', desc: 'Context-aware life companion' },
  { icon: Users, label: 'Family Hub', desc: 'Members, pets, shared tasks' },
  { icon: Zap, label: 'Photo & Files', desc: 'Upload, organise, access anywhere' },
];

const TIER2_FEATURES = [
  { icon: Gamepad2, emoji: '🃏', label: 'Multiplayer Blackjack', desc: 'Live tables with real opponents' },
  { icon: Trophy, emoji: '♠️', label: 'Poker Rooms', desc: 'Full multiplayer tournament system' },
  { icon: Crown, emoji: '🎨', label: 'Custom Avatars', desc: 'Personalise your platform identity' },
  { icon: Briefcase, emoji: '📋', label: 'Jobs Posting', desc: 'Post & manage job listings' },
  { icon: Wallet, emoji: '🪙', label: 'Token Wallet', desc: 'Earn, hold, and spend platform tokens' },
  { icon: Receipt, emoji: '📄', label: 'Invoice Downloads', desc: 'Generate and send professional invoices' },
];

const TESTIMONIALS = [
  { quote: "Finally something that keeps everything organized. I don't know how I managed without it.", name: 'Sarah M.', role: 'Entrepreneur' },
  { quote: 'It replaced multiple apps for me. Everything just flows in one place.', name: 'Jake R.', role: 'Freelancer' },
  { quote: 'It actually feels complete. Like it was built for real people.', name: 'Amanda L.', role: 'Working Parent' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { promptInstall } = usePWAInstall();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [ideaSent, setIdeaSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    base44.integrations.Core.SendEmail({
      to: 'Steinhauer761@gmail.com',
      subject: '🚀 New HustleInFlow Signup',
      body: `Email: ${email}\nTime: ${new Date().toLocaleString()}`,
    });
  };

  const handleShare = () => {
    const d = { title: 'HustleInFlow', text: 'The modular SaaS platform for work, life, and opportunity.', url: window.location.href };
    if (navigator.share) navigator.share(d);
    else navigator.clipboard.writeText(window.location.href);
  };

  const BG = 'bg-[#090d14]';
  const CARD = 'bg-[#0e1420]';
  const BORDER = 'border-white/8';

  return (
    <div className={`min-h-screen ${BG} text-white font-nunito overflow-x-hidden`}>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `${BG}/95 backdrop-blur border-b border-white/6 py-3` : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">HustleInFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={promptInstall}
              className="text-sm bg-white/10 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-white/20 transition-colors hidden sm:flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Get App
            </button>
            <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <button onClick={() => navigate('/register')}
              className="text-sm bg-teal-500 text-slate-900 font-bold px-4 py-1.5 rounded-lg hover:bg-teal-400 transition-colors">
              Join Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-20">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-teal-500/6 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
        </div>

        {/* Promo Banner */}
        <PromoBanner variant="teal" />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-4 py-1.5 text-teal-300 text-xs font-semibold uppercase tracking-widest">
          <Star className="w-3 h-3 fill-teal-400 text-teal-400" />
          Early Access — Free Forever on Tier 1
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-5 max-w-3xl">
          <span className="text-white">One platform.</span><br />
          <span className="text-teal-400">Every tool you need.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg text-white/50 mb-3 max-w-xl leading-relaxed">
          Join now and enjoy all free features — <span className="text-white/80 font-medium">Tier 2 coming soon</span> with multiplayer games, wallets, and more.
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-sm text-white/30 mb-8">
          No credit card required &nbsp;·&nbsp; Cancel anytime
        </motion.p>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex items-center gap-3 mb-8">
          <div className="flex -space-x-2">
            {['🧑', '👩', '🧔', '👱‍♀️', '🧕'].map((e, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
          <p className="text-white/40 text-xs"><span className="text-teal-400 font-semibold">1,200+ users</span> already on the platform</p>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-3 items-center">
          <button onClick={() => navigate('/register')}
            className="bg-teal-500 text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-teal-400 transition-colors text-sm flex items-center gap-2 glow-teal">
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={promptInstall}
            className="bg-white/6 border border-white/12 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Get App
          </button>
          <button onClick={() => navigate('/login')}
            className="bg-white/6 border border-white/12 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm hidden sm:block">
            Sign In
          </button>
          <button onClick={handleShare}
            className="text-white/40 text-sm flex items-center gap-1.5 hover:text-white transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </motion.div>

        {/* Promo Video */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-16 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.15)] relative">
            <video 
                src="https://media.base44.com/videos/public/6a143809d6db7ae563faa1a8/54f5d2c8b_generated_video.mp4" 
                controls 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto aspect-video object-cover"
                title="HustleInFlow Promotional Video"
            />
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl"></div>
        </motion.div>

        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-4 text-white/20">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      <Divider />

      {/* FREE FEATURES */}
      <section className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">Included in Free Tier</span>
            <h2 className="font-display text-4xl font-bold text-white mt-3 leading-tight">Everything you need to start.</h2>
            <p className="text-white/40 text-sm mt-3 max-w-md mx-auto">No paywalls on core features. Everything below is yours on day one.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FREE_FEATURES.map((f, i) => (
              <motion.div key={f.label} {...fadeUp(i * 0.07)}
                className={`${CARD} border ${BORDER} rounded-2xl p-5 hover:border-teal-500/30 transition-colors`}>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-teal-400" />
                </div>
                <p className="font-semibold text-white text-sm mb-1">{f.label}</p>
                <p className="text-white/40 text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* TIER 2 FEATURES */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-500/8 border border-teal-500/20 rounded-full px-4 py-1.5 text-teal-300 text-xs font-semibold uppercase tracking-widest mb-5">
              <Crown className="w-3 h-3" /> Tier 2 — Premium
            </div>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Unlock the full experience
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-lg mx-auto">
              Access the ultimate tools designed for power users, directly from your dashboard.
            </p>
          </motion.div>

          {/* Tier 2 feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIER2_FEATURES.map((f, i) => (
              <motion.div key={f.label} {...fadeUp(i * 0.07)}
                className={`${CARD} border ${BORDER} rounded-2xl p-5 hover:border-teal-500/20 transition-colors`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{f.emoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-white text-sm">{f.label}</p>
                      <Lock className="w-3 h-3 text-teal-400/60" />
                    </div>
                    <p className="text-white/40 text-xs">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* TESTIMONIALS */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">Social Proof</span>
            <h2 className="font-display text-3xl font-bold text-white mt-3">People who get it.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className={`${CARD} border ${BORDER} rounded-2xl p-5`}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-teal-400 text-teal-400" />)}
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* IDEA CONTEST */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-widest">Community</span>
            <h2 className="font-display text-3xl font-bold text-white mt-3 mb-2">Got an idea? Submit it.</h2>
            <p className="text-white/40 text-sm mb-8">Best ideas get built into Tier 2 — and the person who submitted them gets featured and rewarded.</p>
            <div className={`${CARD} border ${BORDER} rounded-2xl p-6 text-left`}>
              <textarea
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder="e.g. A leaderboard for the Keno game with weekly prizes..."
                rows={3}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40 resize-none mb-4"
              />
              {ideaSent ? (
                <p className="text-teal-400 text-sm font-semibold">✅ Idea received — thanks for shaping the platform!</p>
              ) : (
                <button onClick={() => {
                  if (!suggestion.trim()) return;
                  setIdeaSent(true);
                  base44.integrations.Core.SendEmail({
                    to: 'Steinhauer761@gmail.com',
                    subject: '💡 Idea Submission — HustleInFlow',
                    body: `"${suggestion}"\n\n${new Date().toLocaleString()}`,
                  });
                  setSuggestion('');
                }} className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">
                  Submit Idea →
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Divider teal />

      {/* FINAL CTA */}
      <section className="py-28 px-5">
        <div className="max-w-xl mx-auto text-center">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-96 h-96 bg-teal-500/6 rounded-full blur-[100px]" />
          </div>
          <motion.div {...fadeUp()} className="relative">
            <div className="text-5xl mb-6">⚡</div>
            <h2 className="font-display text-4xl font-bold text-white mb-3">Start using HustleInFlow today.</h2>
            <p className="text-white/40 text-sm mb-10">
              Free forever on Tier 1. Upgrade to access premium features.
            </p>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-teal-400 font-bold text-xl mb-2">You're in!</h3>
                  <p className="text-white/40 text-sm mb-4">We'll notify you when Tier 2 launches.</p>
                  <button onClick={() => navigate('/register')}
                    className="bg-teal-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-teal-400 transition-colors">
                    Enter the App →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <button onClick={() => navigate('/register')}
                    className="w-full bg-teal-500 text-slate-900 font-bold px-7 py-4 rounded-xl hover:bg-teal-400 transition-colors text-base flex items-center justify-center gap-2 glow-teal">
                    JOIN NOW — FREE ACCESS <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-white/25 text-xs">or join the Tier 2 waitlist:</p>
                  <form onSubmit={handleWaitlist} className="flex gap-2">
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40" />
                    <button type="submit"
                      className="bg-white/8 border border-white/12 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/14 transition-colors text-sm whitespace-nowrap">
                      Notify Me
                    </button>
                  </form>
                  <div className="flex items-center justify-center gap-5 text-white/20 text-xs mt-3">
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-500/50" /> Free forever</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-500/50" /> No spam</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-teal-500/50" /> Secure</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white/40">
            <Zap className="w-4 h-4 text-teal-500/60" />
            <span className="font-display text-sm font-semibold">HustleInFlow</span>
          </div>
          <p className="text-white/20 text-xs">© 2026 HustleInFlow. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-white/30">
            <Link to="/about" className="hover:text-teal-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Divider({ teal = false }) {
  return (
    <div className="max-w-5xl mx-auto px-5">
      <div className={`h-px bg-gradient-to-r from-transparent ${teal ? 'via-teal-500/25' : 'via-white/8'} to-transparent`} />
    </div>
  );
}
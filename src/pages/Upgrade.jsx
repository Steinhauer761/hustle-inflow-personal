import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Crown, Zap, ArrowLeft, Lock, Loader2, PartyPopper, XCircle, Trophy, Gamepad2, Gift, CreditCard } from 'lucide-react';

export default function Upgrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('promos');

  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  const handleCheckout = async (plan) => {
    setLoading(plan);
    setError(null);
    
    let popup = null;
    if (window.self !== window.top) {
      popup = window.open('', '_blank');
    }

    const res = await base44.functions.invoke('stripeCheckout', { plan });
    if (res.data?.url) {
      if (popup) {
        popup.location.href = res.data.url;
        setLoading(null);
      } else {
        window.location.href = res.data.url;
      }
    } else {
      if (popup) popup.close();
      setError(res.data?.error || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const tabs = [
    { id: 'promos', label: 'Promos', icon: Gift },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'onetime', label: 'One-Time', icon: Zap },
    { id: 'coins', label: 'Coins', icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6 pb-20 max-w-2xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Success/Error banners */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-foreground font-semibold text-sm">Purchase Successful! 🎉</p>
              <p className="text-muted-foreground text-xs">Your account has been upgraded.</p>
            </div>
          </motion.div>
        )}

        {cancelled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-muted-foreground text-xs">Payment was cancelled. No charge was made.</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Store & Pricing</h1>
          <p className="text-muted-foreground text-sm">Unlock the full HustleInFlow experience or grab some coins.</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* PROMOS */}
            {activeTab === 'promos' && (
              <motion.div key="promos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-2 border-primary/50 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-xl">Best Value</div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Everything Bundle</h3>
                  <p className="text-sm text-muted-foreground mb-6">Get everything included! Ecosystem Premium + Lifetime Fitness Hub + Lifetime Visual Coach.</p>
                  
                  <div className="flex items-end gap-2 mb-6">
                    <span className="font-display text-4xl font-black text-foreground">$15.99</span>
                    <span className="text-sm text-muted-foreground mb-1">first month, then $4.99/mo</span>
                  </div>

                  <button
                    onClick={() => handleCheckout('bundle')}
                    disabled={!!loading}
                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading === 'bundle' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gift className="w-5 h-5" /> Get The Bundle</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <motion.div key="subscription" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-card border border-border rounded-3xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Tier 2 Premium</h3>
                  <p className="text-sm text-muted-foreground mb-6">Unlock Jobs, Casino, Sports Lounge, Advanced AI, and exclusive features across the app.</p>
                  
                  <div className="flex items-end gap-2 mb-6">
                    <span className="font-display text-4xl font-black text-foreground">$4.99</span>
                    <span className="text-sm text-muted-foreground mb-1">/ month</span>
                  </div>

                  <button
                    onClick={() => handleCheckout('monthly')}
                    disabled={!!loading}
                    className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5" /> Subscribe Now</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ONE-TIME PAYMENTS */}
            {activeTab === 'onetime' && (
              <motion.div key="onetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                
                <div className="bg-card border border-blue-500/30 rounded-3xl p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-500" /> Fitness Hub
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Lifetime access to progressive overload logging, analytics, and fitness rewards.</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="font-display text-2xl font-black text-foreground">$5.99 <span className="text-xs font-normal text-muted-foreground">once</span></span>
                    <button onClick={() => handleCheckout('fitness')} disabled={!!loading} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2">
                      {loading === 'fitness' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock'}
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-purple-500/30 rounded-3xl p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" /> Visual Coach Add-on
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Lifetime access to AI visual coaches, personal audio cues, and exclusive personas.</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="font-display text-2xl font-black text-foreground">$9.99 <span className="text-xs font-normal text-muted-foreground">once</span></span>
                    <button onClick={() => handleCheckout('visual_coach')} disabled={!!loading} className="bg-purple-500 text-white font-bold py-2 px-6 rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2">
                      {loading === 'visual_coach' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock'}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* COINS / CHIPS */}
            {activeTab === 'coins' && (
              <motion.div key="coins" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-card border border-green-500/30 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Starter Stack</p>
                      <p className="font-display text-2xl font-black text-green-500">100k <span className="text-sm">Chips</span></p>
                    </div>
                    <button onClick={() => handleCheckout('chips_starter')} disabled={!!loading} className="bg-green-500/10 text-green-500 hover:bg-green-500/20 font-bold py-2 px-6 rounded-xl transition-colors">
                      {loading === 'chips_starter' ? <Loader2 className="w-4 h-4 animate-spin" /> : '$1.99'}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/50 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <div>
                      <p className="text-xs font-bold text-green-500 uppercase mb-1">Pro Stack</p>
                      <p className="font-display text-2xl font-black text-green-500">500k <span className="text-sm">Chips</span></p>
                    </div>
                    <button onClick={() => handleCheckout('chips_pro')} disabled={!!loading} className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-6 rounded-xl transition-colors">
                      {loading === 'chips_pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : '$4.99'}
                    </button>
                  </div>

                  <div className="bg-card border border-green-500/30 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Vegas Whale</p>
                      <p className="font-display text-2xl font-black text-green-500">1M <span className="text-sm">Chips</span></p>
                    </div>
                    <button onClick={() => handleCheckout('chips_whale')} disabled={!!loading} className="bg-green-500/10 text-green-500 hover:bg-green-500/20 font-bold py-2 px-6 rounded-xl transition-colors">
                      {loading === 'chips_whale' ? <Loader2 className="w-4 h-4 animate-spin" /> : '$8.99'}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
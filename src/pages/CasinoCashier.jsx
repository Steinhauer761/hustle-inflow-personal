import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Coins, Loader2 } from 'lucide-react';

export default function CasinoCashier() {
  const [checkingOut, setCheckoutPlan] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-created_date', 1);
      return list[0] || null;
    },
  });

  const handlePurchase = async (plan) => {
    // Basic detection for iframe/preview mode to warn users but allow the attempt
    const isIframe = window !== window.top;
    if (isIframe) {
      alert("Stripe checkout works best outside the preview mode. If it fails, please publish the app and test in a real browser window.");
    }
    
    setCheckoutPlan(plan);
    try {
      const res = await base44.functions.invoke('stripeCheckout', { plan });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed: " + (e.response?.data?.error || e.message));
    } finally {
      setCheckoutPlan(null);
    }
  };

  if (isLoading) {
      return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const balance = settings?.keno_balance || 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
              </div>
              <span className="text-xl">Casino Cashier</span>
          </div>
          <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Available Balance</p>
              <p className="text-xl font-display text-yellow-400 font-bold">{balance.toLocaleString()} Chips</p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mini Hustle */}
          <div className="bg-muted/30 border border-border hover:border-primary/50 transition-colors rounded-xl p-4 flex flex-col">
              <h3 className="font-bold text-foreground">Mini Hustle</h3>
              <p className="text-sm text-yellow-400 font-bold mb-3 flex items-center gap-1 mt-1">
                  <Coins className="w-3 h-3" /> 10,000 Chips
              </p>
              <button 
                onClick={() => handlePurchase('chips_mini')}
                disabled={checkingOut !== null}
                className="mt-auto w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold text-sm transition-colors"
              >
                  {checkingOut === 'chips_mini' ? 'Loading...' : '$1.99'}
              </button>
          </div>

          {/* Side Hustle */}
          <div className="bg-muted/30 border border-border hover:border-primary/50 transition-colors rounded-xl p-4 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAR</div>
              <h3 className="font-bold text-foreground">Side Hustle</h3>
              <p className="text-sm text-yellow-400 font-bold mb-3 flex items-center gap-1 mt-1">
                  <Coins className="w-3 h-3" /> 20,000 Chips
              </p>
              <button 
                onClick={() => handlePurchase('chips_side')}
                disabled={checkingOut !== null}
                className="mt-auto w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-primary/20"
              >
                  {checkingOut === 'chips_side' ? 'Loading...' : '$3.99'}
              </button>
          </div>

          {/* All Nighter Hustle */}
          <div className="bg-muted/30 border border-border hover:border-primary/50 transition-colors rounded-xl p-4 flex flex-col">
              <h3 className="font-bold text-foreground">All Nighter Hustle</h3>
              <p className="text-sm text-yellow-400 font-bold mb-3 flex items-center gap-1 mt-1">
                  <Coins className="w-3 h-3" /> 100,000 Chips
              </p>
              <button 
                onClick={() => handlePurchase('chips_allnighter')}
                disabled={checkingOut !== null}
                className="mt-auto w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold text-sm transition-colors"
              >
                  {checkingOut === 'chips_allnighter' ? 'Loading...' : '$9.99'}
              </button>
          </div>
      </div>
    </div>
  );
}
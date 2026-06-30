import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, Lock, TrendingUp } from 'lucide-react';
import Tier2Lock from '@/components/shared/Tier2Lock';
import Tier2Footer from '@/components/shared/Tier2Footer';
import Tier2Banner from '@/components/shared/Tier2Banner';

const MOCK_BALANCE = 4_820;
const MOCK_PENDING = 350;

const MOCK_TXN = [
  { id: 1, type: 'credit', desc: 'Feature Idea Reward', amount: 500, date: 'Jun 3', icon: '🏆' },
  { id: 2, type: 'debit', desc: 'Keno Round #1041', amount: -100, date: 'Jun 2', icon: '🎰' },
  { id: 3, type: 'credit', desc: 'Referral Bonus', amount: 250, date: 'Jun 1', icon: '👥' },
  { id: 4, type: 'debit', desc: 'Premium Feature Access', amount: -200, date: 'May 31', icon: '⭐' },
  { id: 5, type: 'credit', desc: 'Daily Login Streak', amount: 50, date: 'May 30', icon: '🔥' },
  { id: 6, type: 'credit', desc: 'Community Contest Win', amount: 1_000, date: 'May 28', icon: '🥇' },
  { id: 7, type: 'debit', desc: 'Sports Lounge Sub', amount: -150, date: 'May 25', icon: '🏟️' },
  { id: 8, type: 'credit', desc: 'Sign-up Bonus', amount: 3_000, date: 'May 20', icon: '🎁' },
];

const TABS = ['Overview', 'Transactions', 'Earn'];

const EARN_OPTIONS = [
  { emoji: '📝', label: 'Submit Feature Idea', reward: '+500 tokens', desc: 'Get rewarded when your idea ships' },
  { emoji: '👥', label: 'Refer a Friend', reward: '+250 tokens', desc: 'Per successful referral' },
  { emoji: '🔥', label: 'Daily Login Streak', reward: '+50 tokens/day', desc: 'Streak bonuses up to 7x' },
  { emoji: '🏆', label: 'Community Contest', reward: 'Up to +2,000', desc: 'Monthly competitions' },
];

export default function Wallet() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Wallet & Token Economy" />
      <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display flex items-center gap-2">💰 Wallet</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Token balance & history — preview mode</p>
          </div>
          <Tier2Lock />
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 border border-primary/30 rounded-3xl p-6 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)),transparent)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <WalletIcon className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Token Balance</p>
            </div>
            <p className="text-4xl font-display text-foreground mb-1">{MOCK_BALANCE.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="text-yellow-400">⏳ {MOCK_PENDING} pending</span> · Demo data only
            </p>
            <div className="flex gap-3 mt-5">
              <button disabled className="flex-1 flex items-center justify-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold py-2.5 rounded-2xl opacity-60 cursor-not-allowed">
                <Plus className="w-3.5 h-3.5" /> Add Tokens
              </button>
              <button disabled className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border text-muted-foreground text-xs font-bold py-2.5 rounded-2xl opacity-60 cursor-not-allowed">
                <ArrowUpRight className="w-3.5 h-3.5" /> Send
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Real transactions unlock in Tier 2
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Earned</span>
                </div>
                <p className="text-xl font-display text-emerald-400">+5,800</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Spent</span>
                </div>
                <p className="text-xl font-display text-red-400">-980</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Monthly Activity</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[60, 80, 45, 90, 70, 100, 55, 85, 65, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-primary/20 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm transition-all" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>Jan</span><span>Jun</span><span>Dec</span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === 'Transactions' && (
          <div className="space-y-2">
            {MOCK_TXN.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{t.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{t.date}</p>
                </div>
                <span className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Earn */}
        {tab === 'Earn' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1 mb-3">Ways to earn tokens — unlocks fully in Tier 2</p>
            {EARN_OPTIONS.map((e, i) => (
              <motion.div
                key={e.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <span className="text-2xl">{e.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <span className="text-xs font-bold text-primary whitespace-nowrap">{e.reward}</span>
              </motion.div>
            ))}
          </div>
        )}

        <Tier2Footer moduleName="Wallet" />
      </div>
    </div>
  );
}
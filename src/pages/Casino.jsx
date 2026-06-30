import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Tier2Banner from '@/components/shared/Tier2Banner';
import CasinoCashier from '@/pages/CasinoCashier';
import { Play, Sparkles, Gamepad2 } from 'lucide-react';

const GAMES = [
  {
    id: 'keno',
    title: 'Fireball Keno',
    emoji: '🔥',
    path: '/keno',
    color: 'bg-orange-500',
    tag: 'Hot',
    desc: 'Pick up to 10 numbers. Hit the Fireball for massive multipliers!'
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    emoji: '♠️',
    path: '/casino/blackjack',
    color: 'bg-slate-800',
    tag: 'New',
    desc: 'Classic single-player 21 against the Dealer AI.'
  },
  {
    id: 'videopoker',
    title: 'Video Poker',
    emoji: '🃏',
    path: '/casino/poker',
    color: 'bg-blue-600',
    tag: 'New',
    desc: 'Five card draw. Hold your best cards and win big payouts.'
  }
];

export default function Casino() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Tier2Banner feature="Hustlers Casino" />
      
      <div className="px-4 pt-6 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
            <span className="text-4xl block mb-2">🎰</span>
            <h1 className="text-3xl font-display font-black text-foreground">HUSTLERS CASINO</h1>
            <p className="text-muted-foreground text-sm mt-1">Play your chips, win big, dominate the floor.</p>
        </div>

        {/* Top Section: Cashier */}
        <CasinoCashier />

        {/* Below Cashier: Square Game Icons */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Casino Floor</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GAMES.map(game => (
                    <motion.button
                        key={game.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(game.path)}
                        className="bg-card border border-border rounded-2xl overflow-hidden text-left shadow-sm flex flex-col h-full group"
                    >
                        <div className={`${game.color} h-24 flex items-center justify-center relative`}>
                            <span className="text-5xl">{game.emoji}</span>
                            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {game.tag}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{game.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{game.desc}</p>
                            <div className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-widest mt-auto">
                                <Play className="w-3 h-3 fill-primary" /> Play Now
                            </div>
                        </div>
                    </motion.button>
                ))}
                
                {/* Future Games Placeholder */}
                <div className="bg-muted/30 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-6 text-center opacity-70 min-h-[200px]">
                    <Sparkles className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="font-bold text-foreground">More games coming soon</p>
                    <p className="text-xs text-muted-foreground mt-1">Roulette, Slots &amp; Craps</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
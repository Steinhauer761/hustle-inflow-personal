import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingParticles from '@/components/shared/FloatingParticles';
import GlassCard from '@/components/shared/GlassCard';
import PromoBanner from '@/components/shared/PromoBanner';
import { Lock, Sparkles, X, Zap, Trophy, Gamepad2, Loader2, ArrowRight, Dumbbell, Star } from 'lucide-react';
import HomeHeader from '@/components/home/HomeHeader';

const ALL_FEATURES = [
  { path: '/', icon: '🏠', label: 'Home', tier: 1 },
  { path: '/pricing', icon: '💳', label: 'Pricing', tier: 1 },
  { path: '/library', icon: '📖', label: 'Library', tier: 1 },
  { path: '/planner', icon: '📅', label: 'Planner', tier: 1 },
  { path: '/family', icon: '👨‍👩‍👧‍👦', label: 'Family', tier: 1 },
  { path: '/pets', icon: '🐾', label: 'Pets', tier: 1 },
  { path: '/discover', icon: '🧭', label: 'Discover', tier: 1 },
  { path: '/assistant', icon: '💬', label: 'AI Chat', tier: 1 },
  { path: '/files', icon: '📁', label: 'Files', tier: 1 },
  { path: '/trips', icon: '✈️', label: 'Trips', tier: 1 },
  { path: '/calendar', icon: '📆', label: 'Calendar', tier: 1 },
  { path: '/expenses', icon: '💰', label: 'Expenses', tier: 1 },
  { path: '/shopping', icon: '🛒', label: 'Shopping', tier: 1 },
  { path: '/meal-planner', icon: '🍽️', label: 'Meals', tier: 1 },
  { path: '/habits', icon: '🔥', label: 'Habits', tier: 1 },
  { path: '/fitness', icon: '⚡', label: 'Fitness', tier: 3 },
  { path: '/sports', icon: '🏆', label: 'Sports', tier: 2 },
  { path: '/keno', icon: '🎲', label: 'Keno', tier: 2 },
  { path: '/casino/blackjack', icon: '🃏', label: 'Blackjack', tier: 2 },
  { path: '/casino/poker', icon: '♠️', label: 'Poker', tier: 2 },
  { path: '/jobs', icon: '💼', label: 'Jobs', tier: 2 },
  { path: '/job-applications', icon: '📋', label: 'Applications', tier: 2 },
  { path: '/photo-book', icon: '📸', label: 'Photo Book', tier: 2 },
  { path: '/music', icon: '🎵', label: 'Music', tier: 2 },
  { path: '/wallet', icon: '👛', label: 'Wallet', tier: 2 },
  { path: '/invoices', icon: '📄', label: 'Invoices', tier: 2 },
  { path: '/settings', icon: '⚙️', label: 'Settings', tier: 1 },
];

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
    enabled: !!user,
  });

  const isGodMode = user?.role === 'admin' && settings?.admin_god_mode;
  const isPremium = settings?.description === 'PREMIUM_MEMBER' || isGodMode;
  const isFitnessUnlocked = settings?.fitness_unlocked || isPremium;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <FloatingParticles count={25} color="bg-primary/15" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <HomeHeader location="St. Paul, Alberta" temperatureUnit={settings?.temperature_unit || 'fahrenheit'} />
        
        <div className="px-4 pb-8">
          {/* Promo Banner */}
          <PromoBanner variant="default" />
          {/* Features Grid */}
          <div className="max-w-3xl mx-auto mt-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
            >
              {ALL_FEATURES.map((feature, i) => (
                <motion.button
                  key={feature.path}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (feature.tier === 3 && !isFitnessUnlocked) {
                      navigate('/fitness-upgrade');
                    } else {
                      navigate(feature.path);
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-card/60 backdrop-blur-xl transition-all relative group border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/15"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-300
                      ${feature.tier === 3 ? 'bg-gradient-to-br from-blue-500/30 to-blue-500/10 group-hover:from-blue-500/40 group-hover:to-blue-500/20' 
                      : feature.tier === 2 
                        ? 'bg-gradient-to-br from-secondary/30 to-secondary/10 group-hover:from-secondary/40 group-hover:to-secondary/20' 
                        : 'bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10'}`}>
                      {feature.icon}
                    </div>
                    {feature.tier === 2 && !isPremium && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center shadow-lg">
                        <Lock className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    {feature.tier === 3 && !isFitnessUnlocked && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background flex items-center justify-center shadow-lg">
                        <Lock className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-foreground text-center leading-tight group-hover:text-primary transition-colors">
                    {feature.label}
                  </span>
                  {feature.tier === 2 && !isPremium && (
                    <span className="text-[8px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/30">
                      Trial
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          
          {/* Tier 2 Info - Glass Card */}
          {!isPremium && (
          <GlassCard className="mt-6 p-5" gradient="from-primary/15 via-secondary/10 to-accent/15">
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground mb-1">
                  🔓 Free Trial Access
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Try all Tier 2 features free! Experience premium tools like Sports Lounge, Keno, Jobs Board, Wallet, and Invoices before they unlock fully. 
                  <strong className="text-primary"> No credit card required.</strong>
                </p>
              </div>
            </div>
          </GlassCard>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
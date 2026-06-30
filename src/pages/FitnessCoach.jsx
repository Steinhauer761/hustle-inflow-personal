import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, Lock, Loader2, PartyPopper, Volume2, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FitnessCoach() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [playingCoachId, setPlayingCoachId] = useState(null);

  const success = searchParams.get('success') === 'true';

  const { data: profiles = [] } = useQuery({
    queryKey: ['coachProfiles'],
    queryFn: () => base44.entities.CoachProfile.list(),
  });

  const { data: userSettingsList = [] } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const settings = userSettingsList[0];
  const hasPremium = settings?.has_visual_coach;
  const activeCoachId = settings?.active_coach_id;

  const updateCoachMutation = useMutation({
    mutationFn: (coachId) => base44.entities.UserSettings.update(settings.id, { active_coach_id: coachId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Active coach updated!');
    }
  });

  const handleSelectCoach = async (coach) => {
    if (coach.is_premium && !hasPremium) {
      // Trigger checkout for Premium Coach Add-on
      setCheckoutLoading(true);
      let popup = null;
      if (window.self !== window.top) {
        popup = window.open('', '_blank');
      }

      try {
        const res = await base44.functions.invoke('stripeCheckout', { plan: 'visual_coach' });
        if (res.data?.url) {
          if (popup) {
            popup.location.href = res.data.url;
          } else {
            window.location.href = res.data.url;
          }
        } else {
          if (popup) popup.close();
          toast.error(res.data?.error || 'Checkout failed to initialize.');
        }
      } catch (e) {
        if (popup) popup.close();
        toast.error('An error occurred while connecting to payment provider.');
      } finally {
        setCheckoutLoading(false);
      }
      return;
    }
    
    // Set active coach
    if (settings?.id) {
      updateCoachMutation.mutate(coach.id);
    }
  };

  const playPreview = (e, coach) => {
    e.stopPropagation();
    if (playingCoachId === coach.id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingCoachId(null);
      return;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Hi, I'm ${coach.name}. ${coach.persona_description || "Let's crush these goals together!"}`;
      const utterance = new SpeechSynthesisUtterance(text);
      if (coach.voice_id === 'uk_female') utterance.lang = 'en-GB';
      else if (coach.voice_id === 'aus_female') utterance.lang = 'en-AU';
      
      utterance.onstart = () => setPlayingCoachId(coach.id);
      utterance.onend = () => setPlayingCoachId(null);
      utterance.onerror = () => setPlayingCoachId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Voice previews not supported in this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <div className="px-4 pt-6 max-w-2xl mx-auto">
        <button onClick={() => navigate('/fitness')} className="flex items-center gap-1.5 text-gray-400 text-sm mb-6 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Training
        </button>

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Visual Coach Unlocked! 🎉</p>
              <p className="text-gray-400 text-xs">You now have lifetime access to premium coaches.</p>
            </div>
          </motion.div>
        )}

        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full px-3 py-1 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" /> Digital Coaches
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight mb-2">Choose Your Coach</h1>
          <p className="text-gray-400 text-sm">Select the personality and training style that pushes you hardest.</p>
        </header>

        <div className="space-y-4">
          {profiles.map(coach => {
            const isActive = activeCoachId === coach.id;
            const isLocked = coach.is_premium && !hasPremium;

            return (
              <div 
                key={coach.id} 
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer group ${
                  isActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-[#111] hover:bg-[#1a1a1a]'
                }`}
                onClick={() => handleSelectCoach(coach)}
              >
                <div className="flex p-4 gap-4">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative">
                    <img src={coach.avatar_url} alt={coach.name} className="w-full h-full object-cover" />
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-xl font-black text-white">{coach.name}</h3>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">{coach.specialty}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => playPreview(e, coach)}
                          className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                            playingCoachId === coach.id ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-300'
                          }`}
                        >
                          {playingCoachId === coach.id ? <Pause className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        {isActive && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{coach.persona_description}</p>
                    
                    {isLocked && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">Premium Coach</span>
                        <span className="text-xs text-gray-500">$9.99 Unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {checkoutLoading && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col items-center">
               <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
               <p className="text-white font-bold">Starting Checkout...</p>
            </div>
         </div>
      )}
    </div>
  );
}
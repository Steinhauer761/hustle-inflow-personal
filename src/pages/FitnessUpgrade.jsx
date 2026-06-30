import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Zap, ArrowLeft, Lock, Loader2, PartyPopper, CheckCircle2, Trophy, Dumbbell, TrendingUp, Timer } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function FitnessUpgrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    let popup = null;
    if (window.self !== window.top) {
      popup = window.open('', '_blank');
    }

    const res = await base44.functions.invoke('stripeCheckout', { plan: 'fitness' });
    if (res.data?.url) {
      if (popup) {
        popup.location.href = res.data.url;
        setLoading(false);
      } else {
        window.location.href = res.data.url;
      }
    } else {
      if (popup) popup.close();
      setError(res.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="px-4 pt-6 pb-20 max-w-lg mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-400 text-sm mb-6 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Success banner */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Welcome to the Hub! 🎉</p>
              <p className="text-gray-400 text-xs">Your early release access is active.</p>
              <button onClick={() => navigate('/fitness')} className="mt-2 text-xs font-bold text-green-400">Go to Fitness Hub →</button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="font-display text-3xl font-black text-white mb-2 uppercase tracking-tight">Fitness Hub</h1>
          <p className="text-gray-400 text-sm mb-6">Early Release Access</p>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] mb-8 bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full aspect-video object-cover opacity-90"
            >
              <source src="https://media.base44.com/videos/public/6a143809d6db7ae563faa1a8/dc6d47357_generated_video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-4">
              <div className="text-left">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">Included</span>
                <p className="font-black text-lg text-white leading-tight">Customizable Digital Coaches</p>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">Audio guidance, unique personas, and live cues straight to your headphones.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="w-full text-left rounded-3xl p-6 border-2 border-blue-500 bg-blue-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/40 rounded-full px-3 py-1 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Trophy className="w-3 h-3" /> Early Adopter Special
            </div>
            
            <p className="font-display text-4xl font-black text-white mb-1">$5.99 <span className="text-sm font-normal text-gray-400">lifetime access</span></p>
            <p className="text-xs text-gray-400 mt-2">Pay once, own the entire Fitness & Performance Hub forever (Trainers sold separately).</p>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting...</>
              ) : (
                <><Lock className="w-5 h-5" /> Unlock Now — $5.99</>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs text-center">
              {error}
            </div>
          )}
        </motion.div>

        {/* Features Slideshow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-1 text-center">What You Get</p>
          
          <div className="px-6">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {[
                  { 
                    title: 'Interactive Workouts', 
                    desc: 'Log sets, reps, and track volume in real time', 
                    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
                    icon: <Dumbbell className="w-6 h-6 text-blue-400" />
                  },
                  { 
                    title: 'Analytics & Trends', 
                    desc: 'Detailed body metrics and progress charts', 
                    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
                    icon: <TrendingUp className="w-6 h-6 text-purple-400" />
                  },
                  { 
                    title: 'Gamified Progress', 
                    desc: 'Earn XP, level up, and unlock exclusive badges', 
                    image: 'https://images.unsplash.com/photo-1526506114642-54bc23977c52?q=80&w=1470&auto=format&fit=crop',
                    icon: <Trophy className="w-6 h-6 text-yellow-400" />
                  },
                  { 
                    title: 'Rest Timers', 
                    desc: 'Built-in utilities for optimal training sessions', 
                    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1471&auto=format&fit=crop',
                    icon: <Timer className="w-6 h-6 text-green-400" />
                  }
                ].map((item, i) => (
                  <CarouselItem key={i}>
                    <div className="relative h-72 rounded-3xl overflow-hidden border border-white/10 group">
                      <div className="absolute inset-0 bg-black/30 z-10" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-10" />
                      <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-xl">
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-black text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-300">{item.desc}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 bg-black/50 border-white/10 hover:bg-black/80 text-white" />
              <CarouselNext className="-right-4 bg-black/50 border-white/10 hover:bg-black/80 text-white" />
            </Carousel>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
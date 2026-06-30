import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dumbbell, Activity, HeartPulse, Sparkles, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    { id: 'strength', name: 'Strength', icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'cardio', name: 'Cardio', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'sports', name: 'Sports', icon: TrophyIcon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'recovery', name: 'Recovery', icon: HeartPulse, color: 'text-green-400', bg: 'bg-green-400/10' },
];

function TrophyIcon(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}

const GYM_FEATURES = [
    {
        title: "Smart Workout Logging",
        desc: "Track sets, reps, and weights. Watch your progressive overload in real-time.",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
        badge: "New Feature"
    },
    {
        title: "Advanced Analytics",
        desc: "Visualize your muscle group distribution and recovery trends across the week.",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
        badge: "Pro"
    },
    {
        title: "Expert Programs",
        desc: "Access pre-built programs designed by professional trainers for any goal.",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
        badge: "Trending"
    }
];

export default function TrainTab() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % GYM_FEATURES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="p-4 space-y-6 pt-8">
            <header>
                <h1 className="text-3xl font-display font-black tracking-tight text-white mb-2">TRAIN</h1>
                
                <div className="relative mt-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search exercises, programs..." 
                        className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
            </header>

            {/* Gym Features Slideshow */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Gym Features</h2>
                <div className="relative overflow-hidden rounded-3xl h-56 bg-[#111] border border-white/5 shadow-2xl mb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            <img src={GYM_FEATURES[currentSlide].image} alt="Gym Feature" className="w-full h-full object-cover opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="mb-2">
                                    <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                                        {GYM_FEATURES[currentSlide].badge}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{GYM_FEATURES[currentSlide].title}</h3>
                                <p className="text-sm text-gray-300 max-w-[90%] leading-relaxed">{GYM_FEATURES[currentSlide].desc}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Dots */}
                    <div className="absolute bottom-4 right-6 flex gap-2">
                        {GYM_FEATURES.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-blue-400 w-4' : 'bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Training Modalities</h2>
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} className="bg-[#111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-left transition-colors flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                                <cat.icon className={`w-5 h-5 ${cat.color}`} />
                            </div>
                            <span className="font-bold text-white text-sm">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Structured Routines */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Guided Routines</h2>
                <div className="space-y-3">
                    {[
                        { title: 'Hypertrophy Push', desc: 'Chest, Shoulders & Triceps • 45m', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop', tag: 'Strength' },
                        { title: 'Core & Cardio HIIT', desc: 'High intensity fat burn • 20m', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop', tag: 'Burn' },
                        { title: 'Leg Day Finisher', desc: 'Quads & Hamstrings focus • 50m', img: 'https://images.unsplash.com/photo-1434652618059-813c9e6bbaf2?q=80&w=1470&auto=format&fit=crop', tag: 'Power' },
                        { title: 'Full Body Basics', desc: 'Perfect for beginners • 35m', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop', tag: 'Foundation' }
                    ].map((prog, i) => (
                        <div key={i} className="relative overflow-hidden rounded-3xl bg-[#111] border border-white/5 group cursor-pointer" onClick={() => navigate('/fitness/workout')}>
                            <div className="absolute inset-0">
                                <img src={prog.img} alt={prog.title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
                            </div>
                            <div className="relative p-5 flex items-center justify-between">
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                                        {prog.tag}
                                    </span>
                                    <h3 className="text-lg font-black text-white mb-1">{prog.title}</h3>
                                    <p className="text-xs text-gray-300">{prog.desc}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <button className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-gray-400 font-bold hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Build Custom Workout
            </button>
        </div>
    );
}
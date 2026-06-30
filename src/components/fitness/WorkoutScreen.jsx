import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Plus, Minus, Check, PlayCircle, Info, Mic, Volume2, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function WorkoutScreen() {
    const navigate = useNavigate();
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Fetch user settings and coach
    const { data: userSettingsList } = useQuery({
        queryKey: ['userSettings'],
        queryFn: () => base44.entities.UserSettings.list(),
    });
    
    const { data: coaches } = useQuery({
        queryKey: ['coachProfiles'],
        queryFn: () => base44.entities.CoachProfile.list(),
    });

    const activeCoachId = userSettingsList?.[0]?.active_coach_id;
    const activeCoach = coaches?.find(c => c.id === activeCoachId) || {
        name: "AI Coach",
        avatar_url: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=200&auto=format&fit=crop",
        specialty: "Standard Trainer"
    };

    const toggleAudio = () => {
        setIsPlayingAudio(!isPlayingAudio);
        if (!isPlayingAudio) {
            // Simulate audio playback using browser TTS if supported
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Let's go! Focus on your form and squeeze at the top of the movement. You got this!`);
                window.speechSynthesis.speak(utterance);
                utterance.onend = () => setIsPlayingAudio(false);
            } else {
                setTimeout(() => setIsPlayingAudio(false), 3000);
            }
        } else {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-24 font-nunito selection:bg-blue-500/30">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-bold tracking-widest uppercase">Upper Body Power</h1>
                        <p className="text-[10px] text-blue-400 font-bold">14:22 elapsed</p>
                    </div>
                    <button className="p-2 -mr-2 rounded-full hover:bg-white/10 text-red-400 text-xs font-bold uppercase">
                        Finish
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-8">
                
                {/* Live Coach Audio Player UI */}
                <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] relative">
                            <img src={activeCoach.avatar_url} alt="Coach" className="w-full h-full object-cover" />
                            {isPlayingAudio && (
                                <span className="absolute inset-0 bg-blue-500/20 animate-pulse"></span>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{activeCoach.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {isPlayingAudio ? (
                                    <div className="flex items-center gap-0.5 h-3">
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full"></motion.div>
                                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full"></motion.div>
                                        <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-white rounded-full"></motion.div>
                                        <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-white rounded-full"></motion.div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-300">Ready for next set</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={toggleAudio}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isPlayingAudio ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>

                {/* Current Exercise Card */}
                <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5">
                    {/* Visual Header */}
                    <div className="relative h-48 bg-[#1a1a1a]">
                        <img 
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                            alt="Bench Press" 
                            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-black text-white">Barbell Bench Press</h2>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Chest • Mid</p>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                                <PlayCircle className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Previous Performance */}
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Last Time</span>
                            <span className="text-gray-500">Oct 12</span>
                        </div>
                        <div className="flex gap-2 text-sm text-gray-300">
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded-md">225 lbs × 8</span>
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded-md">225 lbs × 7</span>
                            <span className="bg-[#1a1a1a] px-2 py-1 rounded-md opacity-50">225 lbs × 6</span>
                        </div>
                    </div>

                    {/* Current Sets Logger */}
                    <div className="p-5 space-y-4">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center px-2">
                            <div className="col-span-2">Set</div>
                            <div className="col-span-4">Lbs</div>
                            <div className="col-span-4">Reps</div>
                            <div className="col-span-2"></div>
                        </div>

                        {/* Set Row 1 (Completed) */}
                        <div className="grid grid-cols-12 gap-2 items-center bg-green-500/10 rounded-xl p-2 border border-green-500/20">
                            <div className="col-span-2 text-center text-green-400 font-bold">1</div>
                            <div className="col-span-4 bg-[#1a1a1a] rounded-lg py-2 text-center font-bold text-white">225</div>
                            <div className="col-span-4 bg-[#1a1a1a] rounded-lg py-2 text-center font-bold text-white">8</div>
                            <div className="col-span-2 flex justify-center">
                                <div className="w-8 h-8 rounded-lg bg-green-500 text-black flex items-center justify-center"><Check className="w-5 h-5" /></div>
                            </div>
                        </div>

                        {/* Set Row 2 (Active) */}
                        <div className="grid grid-cols-12 gap-2 items-center bg-[#1a1a1a] rounded-xl p-2 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative">
                            <div className="col-span-2 text-center text-blue-400 font-bold">2</div>
                            <div className="col-span-4 flex items-center justify-between bg-[#050505] rounded-lg p-1">
                                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                <span className="font-black text-white text-lg">225</span>
                                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                            <div className="col-span-4 flex items-center justify-between bg-[#050505] rounded-lg p-1">
                                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                <span className="font-black text-white text-lg">8</span>
                                <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <button className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-green-500 hover:text-black transition-colors flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <button className="w-full py-3 mt-2 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors uppercase tracking-widest border border-dashed border-white/10">
                            + Add Set
                        </button>
                    </div>
                </div>

                {/* Rest Timer Widget (Floating style) */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                            <Timer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Rest Timer</p>
                            <p className="text-xl font-black text-white font-mono">01:30</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20">+30s</button>
                        <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">Skip</button>
                    </div>
                </div>

                {/* Quick Tools */}
                <div className="grid grid-cols-3 gap-3">
                    <button className="bg-[#111] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Info className="w-4 h-4 text-gray-400" /></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Plates</span>
                    </button>
                    <button className="bg-[#111] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Notes</span>
                    </button>
                    <button className="bg-[#111] p-3 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-colors border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/></svg>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Swap</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
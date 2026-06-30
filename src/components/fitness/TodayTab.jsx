import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Target, Play, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfDay } from 'date-fns';
import { useWeather } from '@/hooks/useWeather';
import { Sun, CloudRain } from 'lucide-react';

export default function TodayTab({ onNavigate }) {
    const navigate = useNavigate();

    const { data: profiles } = useQuery({
        queryKey: ['fitnessProfileToday'],
        queryFn: () => base44.entities.FitnessProfile.list(),
    });
    
    const profile = profiles?.[0] || { xp: 0, coins: 0 };
    const level = Math.floor((profile.xp || 0) / 500) + 1;

    const { data: workouts = [] } = useQuery({
        queryKey: ['streakWorkouts'],
        queryFn: () => base44.entities.WorkoutLog.list('-date', 50),
    });

    const { data: mealPlans = [] } = useQuery({
        queryKey: ['streakMeals'],
        queryFn: () => base44.entities.MealPlan.list('-week_start', 10),
    });

    const streakDays = useMemo(() => {
        const today = startOfDay(new Date());
        return Array.from({ length: 7 }).map((_, i) => {
            const day = subDays(today, 6 - i);
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayName = format(day, 'EEEE');
            
            const hasWorkout = workouts.some(w => w.date === dateStr);
            const hasMeal = mealPlans.some(mp => {
                if (!mp.week_start) return false;
                const diff = (day.getTime() - new Date(mp.week_start).getTime()) / (1000 * 3600 * 24);
                return diff >= 0 && diff < 7 && mp.slots?.some(s => s.day === dayName);
            });

            return {
                dateStr,
                dayLabel: format(day, 'EEE').charAt(0),
                active: hasWorkout || hasMeal,
                isToday: i === 6
            };
        });
    }, [workouts, mealPlans]);

    const activeStreakCount = streakDays.reduce((count, d) => d.active ? count + 1 : count, 0);

    const { weather, loading: weatherLoading } = useWeather();
    
    let workoutSuggestion = {
        tag: 'Push Day',
        duration: '45 Min',
        title: 'Upper Body Power',
        desc: 'Chest, Shoulders, Triceps',
        icon: null,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'
    };
    
    if (weather) {
        if (weather.condition === 'sunny' || weather.condition === 'partly_cloudy') {
            workoutSuggestion = {
                tag: 'Outdoor',
                duration: '45 Min',
                title: 'Sunny Day Trail Run',
                desc: 'Take advantage of the weather and hit the trails.',
                icon: <Sun className="w-3 h-3 ml-1" />,
                image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1470&auto=format&fit=crop'
            };
        } else if (weather.condition === 'rainy' || weather.condition === 'snowy' || weather.condition === 'windy') {
            workoutSuggestion = {
                tag: 'Indoor',
                duration: '30 Min',
                title: 'Rainy Day HIIT',
                desc: 'Keep the momentum going indoors.',
                icon: <CloudRain className="w-3 h-3 ml-1" />,
                image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop'
            };
        }
    }

    return (
        <div className="p-4 space-y-6 pt-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-white">TODAY</h1>
                    <p className="text-gray-400 text-sm">Crush your goals today.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="w-full h-full bg-[#050505] rounded-full border-2 border-transparent flex items-center justify-center font-bold text-sm">
                        LV.{level}
                    </div>
                </div>
            </header>

            {/* Daily Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-3xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                    <Flame className="w-6 h-6 text-orange-500 mb-2" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Calories</p>
                    <p className="text-2xl font-black text-white">450 <span className="text-sm text-gray-500">/ 600</span></p>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-3xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <Droplets className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Water (oz)</p>
                    <p className="text-2xl font-black text-white">64 <span className="text-sm text-gray-500">/ 128</span></p>
                </div>
            </div>

            {/* Active Streak Tracker */}
            <div className="bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shadow-inner">
                            <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Consistency Streak</p>
                            <p className="text-xs text-gray-400 mt-0.5">Workouts & Meals</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-white">{activeStreakCount}<span className="text-sm text-gray-500 font-normal ml-1">/ 7</span></p>
                    </div>
                </div>
                
                <div className="flex justify-between items-center bg-[#050505]/50 p-4 rounded-2xl border border-white/5">
                    {streakDays.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2.5">
                            <span className={`text-[10px] font-bold uppercase ${d.isToday ? 'text-white' : 'text-gray-500'}`}>{d.dayLabel}</span>
                            <motion.div 
                                initial={false}
                                animate={
                                    d.active ? {
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0],
                                        boxShadow: [
                                            "0 0 0px rgba(59,130,246,0)",
                                            "0 0 25px rgba(59,130,246,0.6)",
                                            "0 0 15px rgba(59,130,246,0.4)"
                                        ]
                                    } : {
                                        scale: 1,
                                        rotate: 0,
                                        boxShadow: "none"
                                    }
                                }
                                transition={{ 
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: d.active ? i * 0.1 : 0
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                    d.active 
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                {d.active && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: (i * 0.1) + 0.2, type: "spring" }}
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Start Workout */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Today's Protocol</h2>
                    {weatherLoading && <span className="text-xs text-muted-foreground animate-pulse">Checking weather...</span>}
                </div>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/fitness/workout')}
                    className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 p-1"
                >
                    <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay transition-all duration-500" style={{ backgroundImage: `url('${workoutSuggestion.image}')` }}></div>
                    <div className="relative bg-[#050505]/40 backdrop-blur-md rounded-[22px] p-6 text-left flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest flex items-center">
                                    {workoutSuggestion.tag} {workoutSuggestion.icon}
                                </span>
                                <span className="px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">{workoutSuggestion.duration}</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-1">{workoutSuggestion.title}</h3>
                            <p className="text-sm text-gray-300">{workoutSuggestion.desc}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] shrink-0">
                            <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Daily Completion */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Daily Progress</h3>
                        <p className="text-xs text-gray-400">You're almost there!</p>
                    </div>
                    <span className="text-2xl font-black text-green-400">75%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                    />
                </div>
            </div>
        </div>
    );
}
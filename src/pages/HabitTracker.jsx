import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfDay, isToday, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, TrendingUp, Trophy, ArrowRight, Utensils, Calendar, Settings as SettingsIcon, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { Sun, CloudRain } from 'lucide-react';

export default function HabitTracker() {
    const navigate = useNavigate();

    // Fetch Tasks (Adulting tasks)
    const { data: tasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ['habitTasks'],
        queryFn: () => base44.entities.Task.list('-date', 200),
    });

    // Fetch Meal Plans (Adulting meals)
    const { data: mealPlans = [], isLoading: loadingMeals } = useQuery({
        queryKey: ['habitMeals'],
        queryFn: () => base44.entities.MealPlan.list('-week_start', 20),
    });

    const { weather, loading: weatherLoading } = useWeather();

    // Calculate streaks and heatmap data
    const { days, currentStreak, longestStreak, todayScore } = useMemo(() => {
        const today = startOfDay(new Date());
        // Last 28 days for a perfect 4x7 grid
        const pastDays = Array.from({ length: 28 }).map((_, i) => subDays(today, 27 - i));
        
        let streak = 0;
        let maxStreak = 0;
        let todayStats = { completed: 0, total: 0, hasMeal: false };

        const processedDays = pastDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayName = format(day, 'EEEE');
            
            // Daily Tasks
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const completedTasks = dayTasks.filter(t => t.status === 'done').length;
            const totalTasks = dayTasks.length;
            
            // Daily Meals
            const mealPlanForWeek = mealPlans.find(mp => {
                if (!mp.week_start) return false;
                const diff = (day.getTime() - new Date(mp.week_start).getTime()) / (1000 * 3600 * 24);
                return diff >= 0 && diff < 7;
            });
            const hasMealPlanned = mealPlanForWeek?.slots?.some(s => s.day === dayName) || false;

            const totalGoals = totalTasks + (hasMealPlanned ? 1 : 0);
            const completedGoals = completedTasks + (hasMealPlanned ? 1 : 0); // Assuming planned meals count as successful
            
            const isSuccessful = totalGoals > 0 && completedGoals === totalGoals;
            const hasSomeActivity = completedGoals > 0;

            if (isPast(day) || isToday(day)) {
                if (hasSomeActivity) {
                    streak++;
                    if (streak > maxStreak) maxStreak = streak;
                } else if (totalGoals > 0) {
                    streak = 0; // Broke streak if they had goals but completed 0
                }
            }

            if (isToday(day)) {
                todayStats = { completed: completedGoals, total: totalGoals, hasMeal: hasMealPlanned };
            }

            return {
                date: day,
                dateStr,
                isSuccessful,
                hasSomeActivity,
                score: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
                totalGoals
            };
        });

        return { days: processedDays, currentStreak: streak, longestStreak: maxStreak, todayScore: todayStats };
    }, [tasks, mealPlans]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-4 py-4 max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold">Habit Tracker</h1>
                            <p className="text-xs text-muted-foreground">Your Daily Adulting Streak</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                        <SettingsIcon className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <div className="px-4 pt-6 max-w-4xl mx-auto space-y-6">
                {/* Streak Highlight */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-500/20 via-background to-primary/10 border border-orange-500/30 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20 border-4 border-orange-500/30 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            <Flame className="w-10 h-10 text-orange-500 fill-orange-500/50" />
                        </div>
                        <h2 className="text-5xl font-display font-black text-foreground mb-2">{currentStreak} <span className="text-2xl text-muted-foreground">Days</span></h2>
                        <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-1">Current Streak</p>
                        <p className="text-xs text-muted-foreground">Keep completing tasks &amp; meals to grow your flame!</p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Longest</p>
                            <p className="text-xl font-bold text-foreground">{longestStreak} Days</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Today</p>
                            <p className="text-xl font-bold text-foreground">{todayScore.completed}/{todayScore.total} Done</p>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Heatmap */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Last 28 Days</h3>
                    
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] font-bold text-muted-foreground mb-1">{day}</div>
                        ))}
                        {days.map((day, i) => {
                            let bgClass = "bg-muted";
                            if (day.isSuccessful) bgClass = "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]";
                            else if (day.hasSomeActivity) bgClass = "bg-primary/40";
                            else if (day.totalGoals > 0) bgClass = "bg-destructive/20 border border-destructive/30"; // Missed goals
                            
                            return (
                                <div key={day.dateStr} 
                                     className={`aspect-square rounded-md ${bgClass} flex items-center justify-center text-[8px] sm:text-xs font-semibold ${day.isSuccessful ? 'text-primary-foreground' : 'text-transparent'} transition-colors`}
                                     title={`${day.dateStr}: ${Math.round(day.score)}%`}
                                >
                                    {day.isSuccessful && '✓'}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted"></div> No Activity</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/40"></div> Partial</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary"></div> Perfect</div>
                    </div>
                </motion.div>

                {/* Weather-Based Habit Suggestion */}
                {weather && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            {['sunny', 'partly_cloudy'].includes(weather.condition) ? <Sun className="w-24 h-24" /> : <CloudRain className="w-24 h-24" />}
                        </div>
                        <div className="relative z-10">
                            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                {['sunny', 'partly_cloudy'].includes(weather.condition) ? <><Sun className="w-4 h-4 text-orange-400" /> Perfect Day Outside</> : <><CloudRain className="w-4 h-4 text-blue-400" /> Indoor Focus Weather</>}
                            </h4>
                            <p className="text-xl font-bold text-foreground mb-1">
                                {['sunny', 'partly_cloudy'].includes(weather.condition) ? 'Take your habits outdoors' : 'Perfect time for indoor habits'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {['sunny', 'partly_cloudy'].includes(weather.condition) 
                                    ? 'It\'s sunny! Great time for a walk, gardening, or a coffee outside to keep your streak going.' 
                                    : 'It\'s raining or cold outside. Focus on reading, organizing your space, or indoor stretching!'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/planner')}
                        className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 text-left transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
                            <CheckSquare className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Tasks &amp; Errands</h4>
                        <p className="text-xs text-muted-foreground mb-3">Complete your scheduled tasks to keep the streak going.</p>
                        <div className="flex items-center text-xs font-bold text-indigo-500">Go to Planner <ArrowRight className="w-3 h-3 ml-1" /></div>
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/meal-planner')}
                        className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 text-left transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                            <Utensils className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Meal Plans</h4>
                        <p className="text-xs text-muted-foreground mb-3">Log your daily meals to earn your adulting points.</p>
                        <div className="flex items-center text-xs font-bold text-emerald-500">Go to Meals <ArrowRight className="w-3 h-3 ml-1" /></div>
                    </motion.button>
                </div>

                {/* Notifications settings link */}
                <div className="bg-muted/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border border-border/50">
                    <div>
                        <h4 className="font-bold text-sm text-foreground">Daily Reminders</h4>
                        <p className="text-xs text-muted-foreground">Receive a morning digest of your adulting goals.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="shrink-0 bg-background">
                        Manage Notifications
                    </Button>
                </div>

            </div>
        </div>
    );
}
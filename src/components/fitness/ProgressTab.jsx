import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Target, Activity, TrendingUp, CheckSquare, Utensils } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfDay } from 'date-fns';

const data = [
  { name: 'W1', val: 185 },
  { name: 'W2', val: 184 },
  { name: 'W3', val: 182 },
  { name: 'W4', val: 180 },
  { name: 'W5', val: 178 },
  { name: 'W6', val: 175 },
];

export default function ProgressTab() {
    const { data: tasks = [] } = useQuery({
        queryKey: ['progressTasks'],
        queryFn: () => base44.entities.Task.list('-date', 200),
    });

    const { data: mealPlans = [] } = useQuery({
        queryKey: ['progressMeals'],
        queryFn: () => base44.entities.MealPlan.list('-week_start', 20),
    });

    const weeklyHabits = useMemo(() => {
        const today = startOfDay(new Date());
        const past7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
        
        let completedTasksTotal = 0;
        let completedMealsTotal = 0;

        const chartData = past7Days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayName = format(day, 'EEEE');
            
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const completedTasks = dayTasks.filter(t => t.status === 'done').length;
            completedTasksTotal += completedTasks;

            const mealPlanForWeek = mealPlans.find(mp => {
                if (!mp.week_start) return false;
                const diff = (day.getTime() - new Date(mp.week_start).getTime()) / (1000 * 3600 * 24);
                return diff >= 0 && diff < 7;
            });
            const hasMealPlanned = mealPlanForWeek?.slots?.some(s => s.day === dayName) ? 1 : 0;
            completedMealsTotal += hasMealPlanned;

            return {
                name: format(day, 'EEE'),
                Tasks: completedTasks,
                Meals: hasMealPlanned,
            };
        });

        return { chartData, completedTasksTotal, completedMealsTotal };
    }, [tasks, mealPlans]);
    return (
        <div className="p-4 space-y-6 pt-8">
            <header>
                <h1 className="text-3xl font-display font-black tracking-tight text-white mb-1">PROGRESS</h1>
                <p className="text-sm text-gray-400">Data drives results.</p>
            </header>

            {/* Body Tracking Mini-Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-3xl p-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Weight</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-white">175<span className="text-sm text-gray-500 ml-1">lbs</span></p>
                        <span className="text-xs font-bold text-green-400 mb-1">-2.5 lbs</span>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-3xl p-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Body Fat</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-white">14.2<span className="text-sm text-gray-500 ml-1">%</span></p>
                        <span className="text-xs font-bold text-green-400 mb-1">-0.8%</span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/5 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Weight Trend
                    </h3>
                    <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 outline-none">
                        <option>Last 6 Weeks</option>
                        <option>3 Months</option>
                    </select>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke="#3b82f6" 
                                strokeWidth={4} 
                                dot={{ fill: '#050505', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#3b82f6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Analytics */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Analytics</h2>
                
                <div className="bg-[#111] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 font-bold uppercase">Consistency Score</p>
                        <p className="text-lg font-black text-white">92%</p>
                    </div>
                    <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-purple-500 rounded-full" />
                    </div>
                </div>

                <div className="bg-[#111] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 font-bold uppercase">Goal Completion</p>
                        <p className="text-lg font-black text-white">8/10</p>
                    </div>
                </div>
            </div>

            {/* Habit Trends Reporting */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Habit Trends (Last 7 Days)</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                        <CheckSquare className="w-6 h-6 text-indigo-400 mb-2" />
                        <p className="text-2xl font-black text-white">{weeklyHabits.completedTasksTotal}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tasks Done</p>
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                        <Utensils className="w-6 h-6 text-emerald-400 mb-2" />
                        <p className="text-2xl font-black text-white">{weeklyHabits.completedMealsTotal}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meals Logged</p>
                    </div>
                </div>

                <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/5 rounded-3xl p-5">
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyHabits.chartData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="Tasks" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Meals" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
}
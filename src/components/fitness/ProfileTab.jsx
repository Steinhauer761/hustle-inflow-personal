import React from 'react';
import { Settings, Award, CircleDollarSign, Zap, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ProfileTab() {
    const { user, logout } = useAuth();

    const { data: profiles } = useQuery({
        queryKey: ['fitnessProfile'],
        queryFn: () => base44.entities.FitnessProfile.list(),
    });

    const profile = profiles?.[0] || { xp: 0, coins: 0 };
    const level = Math.floor((profile.xp || 0) / 500) + 1;

    return (
        <div className="p-4 space-y-6 pt-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-display font-black tracking-tight text-white mb-1">PROFILE</h1>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 text-white" />
                </button>
            </header>

            {/* Profile Hero */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[3px]">
                    <div className="w-full h-full bg-[#050505] rounded-full border-4 border-[#111] overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'fitness'}&backgroundColor=050505`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">{user?.full_name || 'Athlete'}</h2>
                    <p className="text-sm text-gray-400 mb-2">Pro Member</p>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">Lvl. {level}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-purple-500/20 text-purple-400">
                            {level > 10 ? 'Elite' : level > 5 ? 'Pro' : 'Beginner'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats / Currency */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <CircleDollarSign className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coins</p>
                        <p className="text-lg font-black text-white">{(profile.coins || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total XP</p>
                        <p className="text-lg font-black text-white">{(profile.xp || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Achievements Snippet */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Achievements</h3>
                    <button className="text-xs font-bold text-blue-400">View All</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { icon: '🔥', name: '7 Day Streak' },
                        { icon: '🏋️', name: '100 Workouts' },
                        { icon: '🏃', name: 'Marathon' },
                        { icon: '🏆', name: 'Champion' },
                    ].map((ach, i) => (
                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
                            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                                {ach.icon}
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 text-center leading-tight">{ach.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings Menu */}
            <div className="space-y-2">
                {[
                    'Workout Preferences',
                    'Integrations & Devices',
                    'Account Settings',
                    'Help & Support'
                ].map((item, i) => (
                    <button key={i} className="w-full bg-[#111] border border-white/5 hover:bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between transition-colors">
                        <span className="font-bold text-sm text-gray-300">{item}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => logout()}
                className="w-full py-4 text-xs font-bold text-red-500 uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
            >
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
    );
}
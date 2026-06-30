import React from 'react';
import { Trophy, Users, ShieldAlert } from 'lucide-react';

export default function ChallengesTab() {
    const activeChallenge = {
        title: "Summer Shred 2026",
        progress: 65,
        daysLeft: 12,
        participants: 1204
    };

    return (
        <div className="p-4 space-y-6 pt-8">
            <header>
                <h1 className="text-3xl font-display font-black tracking-tight text-white mb-1">CHALLENGES</h1>
                <p className="text-sm text-gray-400">Gamify your fitness journey.</p>
            </header>

            {/* Active Challenge Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-blue-800 p-6 shadow-2xl shadow-purple-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Trophy className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-widest mb-3">Active Now</span>
                    <h2 className="text-2xl font-black text-white mb-1">{activeChallenge.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-white/80 font-bold uppercase tracking-wider mb-6">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {activeChallenge.participants}</span>
                        <span>{activeChallenge.daysLeft} Days Left</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-white">
                            <span>Progress</span>
                            <span>{activeChallenge.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${activeChallenge.progress}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming / Available Challenges */}
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Available Challenges</h2>
                <div className="space-y-3">
                    {[
                        { title: '100 Mile Walk', icon: '🚶', reward: '500 XP', difficulty: 'Medium' },
                        { title: '30 Day Push-Up', icon: '💪', reward: 'Exclusive Badge', difficulty: 'Hard' }
                    ].map((c, i) => (
                        <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                                {c.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">{c.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{c.difficulty}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Reward: {c.reward}</span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors">
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Community Leaderboard Snippet */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-5">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    Global Top 3
                </h3>
                <div className="space-y-3">
                    {[
                        { name: 'Alex M.', pts: '12,450', rank: 1, color: 'text-yellow-500' },
                        { name: 'Sarah J.', pts: '11,200', rank: 2, color: 'text-gray-400' },
                        { name: 'Mike R.', pts: '10,950', rank: 3, color: 'text-orange-700' },
                    ].map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`font-black text-lg ${user.color}`}>#{user.rank}</span>
                                <span className="font-bold text-sm text-white">{user.name}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{user.pts} XP</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
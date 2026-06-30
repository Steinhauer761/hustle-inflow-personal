import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Dumbbell, TrendingUp, Trophy, User } from 'lucide-react';
import TodayTab from '@/components/fitness/TodayTab';
import TrainTab from '@/components/fitness/TrainTab';
import ProgressTab from '@/components/fitness/ProgressTab';
import ChallengesTab from '@/components/fitness/ChallengesTab';
import ProfileTab from '@/components/fitness/ProfileTab';

export default function FitnessHub() {
    const [activeTab, setActiveTab] = useState('today');

    const tabs = [
        { id: 'today', icon: Activity, label: 'Today' },
        { id: 'train', icon: Dumbbell, label: 'Train' },
        { id: 'progress', icon: TrendingUp, label: 'Progress' },
        { id: 'challenges', icon: Trophy, label: 'Challenges' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    const renderTab = () => {
        switch (activeTab) {
            case 'today': return <TodayTab onNavigate={setActiveTab} />;
            case 'train': return <TrainTab />;
            case 'progress': return <ProgressTab />;
            case 'challenges': return <ChallengesTab />;
            case 'profile': return <ProfileTab />;
            default: return <TodayTab />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-24 font-nunito selection:bg-blue-500/30">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-full"
                    >
                        {renderTab()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 pb-safe">
                <div className="max-w-md mx-auto flex items-center justify-around px-2 py-3">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${
                                    isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="fitness-nav-bg"
                                        className="absolute inset-0 bg-blue-500/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
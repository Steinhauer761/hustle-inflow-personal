import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, Flame, CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function Family() {
  const [quests, setQuests] = useState([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('quests'); // quests, leaderboard

  useEffect(() => {
    // Load your custom active family board metrics
    base44.entities.Quests?.list({}).then(res => setQuests(res || []));
    base44.entities.FamilyMembers?.list({}).then(res => setFamilyMembers(res || []));
  }, []);

  const handleAddQuest = async (e) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;

    try {
      const created = await base44.entities.Quests.create({
        title: newQuestTitle,
        completed: false,
        points: 15,
        created_at: new Date().toISOString()
      });
      setQuests(prev => [created, ...prev]);
      setNewQuestTitle('');
    } catch (err) {
      console.error("Error adding family quest:", err);
    }
  };

  const toggleQuest = async (id, currentStatus) => {
    try {
      await base44.entities.Quests.update(id, { completed: !currentStatus });
      setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !currentStatus } : q));
    } catch (err) {
      console.error("Error updating quest:", err);
    }
  };

  const deleteQuest = async (id) => {
    try {
      await base44.entities.Quests.delete(id);
      setQuests(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error("Error removing quest:", err);
    }
  };

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Premium Application Branding Banner */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">
          HUSTLE HUB
        </p>
        <h1 className="text-3xl font-black font-display tracking-tight text-white uppercase mt-0.5">
          HQ FAMILY ACCOUNTABILITY
        </h1>
      </div>

      <Tier2Banner />

      {/* Modern High-Contrast View Toggles */}
      <div className="grid grid-cols-2 gap-2 bg-neutral-900/40 p-1 border border-neutral-800/80 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('quests')}
          className={`h-10 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
            activeTab === 'quests' 
              ? 'bg-neutral-800 text-white shadow-md' 
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Active Quests
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`h-10 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
            activeTab === 'leaderboard' 
              ? 'bg-neutral-800 text-white shadow-md' 
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Main Tab Layout Content Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'quests' ? (
          <motion.div 
            key="quests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Smooth Translucent Glass Add Card Form */}
            <form onSubmit={handleAddQuest} className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-4 shadow-2xl">
              <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase mb-3">
                Deploy New Target Quest
              </h3>
              <div className="flex gap-2">
                <Input 
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  placeholder="e.g., Clear kitchen counter / Log morning track run..."
                  className="bg-neutral-950 border-neutral-800 text-sm h-11 focus-visible:ring-purple-500/50"
                />
                <Button 
                  type="submit"
                  className="h-11 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Active Quests View Streams */}
            <div className="space-y-2">
              <h2 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">
                HQ QUESTS STREAM ({quests.length})
              </h2>
              {quests.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/20 border border-neutral-900 rounded-2xl">
                  <p className="text-xs text-neutral-500">All household protocols satisfied. No active tasks.</p>
                </div>
              ) : (
                quests.map((quest) => (
                  <div 
                    key={quest.id}
                    className="flex items-center justify-between p-4 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/60 rounded-xl hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleQuest(quest.id, quest.completed)}
                        className="text-neutral-400 hover:text-purple-500 active:scale-90 transition-transform"
                      >
                        {quest.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-600" />
                        )}
                      </button>
                      <span className={`text-sm font-semibold transition-all ${quest.completed ? 'line-through text-neutral-600' : 'text-neutral-200'}`}>
                        {quest.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-purple-950 text-purple-400 border border-purple-900/60 px-2 py-0.5 rounded-md">
                        +{quest.points || 15} PTS
                      </span>
                      <button 
                        onClick={() => deleteQuest(quest.id)}
                        className="text-neutral-600 hover:text-red-400 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-4 shadow-2xl">
              <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase mb-4 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" /> Standings Tier List
              </h3>
              <div className="space-y-2">
                {familyMembers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500">No scorecards initialized yet.</div>
                ) : (
                  [...familyMembers].sort((a,b) => (b.score || 0) - (a.score || 0)).map((member, index) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-neutral-950/60 border border-neutral-800/40 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black w-5 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          #{index + 1}
                        </span>
                        <span className="text-sm font-bold text-neutral-200">{member.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-sm font-black text-neutral-100">{member.score || 0} <span className="text-[10px] text-neutral-500 font-normal">pts</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

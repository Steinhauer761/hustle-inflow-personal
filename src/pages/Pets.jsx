import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Trash2, Calendar, Activity, ShieldAlert, Sparkles, Bone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [lastFed, setLastFed] = useState('');
  const [careNotes, setCareNotes] = useState('');

  useEffect(() => {
    // Stream active family pet profiles from your data entities
    base44.entities.Pets?.list({}).then(res => setPets(res || []));
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!petName.trim()) return;

    try {
      const created = await base44.entities.Pets.create({
        name: petName.trim(),
        type: petType.trim() || 'Companion',
        last_fed: lastFed || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: careNotes.trim() || 'Routine protocol stable.',
        status: 'Healthy'
      });
      setPets(prev => [created, ...prev]);
      setPetName('');
      setPetType('');
      setLastFed('');
      setCareNotes('');
    } catch (err) {
      console.error("[Pet Registry] Critical save failure:", err);
    }
  };

  const deletePet = async (id) => {
    try {
      await base44.entities.Pets.delete(id);
      setPets(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("[Pet Registry] Record removal failed:", err);
    }
  };

  const updateFeedingTime = async (id) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await base44.entities.Pets.update(id, { last_fed: currentTime });
      setPets(prev => prev.map(p => p.id === id ? { ...p, last_fed: currentTime } : p));
    } catch (err) {
      console.error("[Pet Registry] Status update failed:", err);
    }
  };

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Premium Header System */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">
          Ecosystem Hub
        </p>
        <h1 className="text-3xl font-black font-display tracking-tight text-white uppercase mt-0.5">
          PET CARE MATRIX
        </h1>
      </div>

      <Tier2Banner />

      {/* Modern Translucent Profile Registration Form */}
      <form onSubmit={handleAddPet} className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-5 shadow-2xl space-y-4 mb-6">
        <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-2">
          <Bone className="w-4 h-4 text-purple-500" /> Register Companion Profile
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Name</label>
            <Input 
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g., Rocky"
              className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Breed / Type</label>
            <Input 
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              placeholder="e.g., Canine / Husky"
              className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Special Care Protocols / Notes</label>
          <Input 
            value={careNotes}
            onChange={(e) => setCareNotes(e.target.value)}
            placeholder="e.g., Dietary limitations, medication tracking, schedule constraints..."
            className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
          />
        </div>

        <Button 
          type="submit"
          className="w-full h-11 bg-purple-600 hover:bg-purple-700 active:scale-98 transition-all font-bold tracking-wide rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> COMMIT PROFILE TO SUBSYSTEM
        </Button>
      </form>

      {/* Active Stream Feed */}
      <div className="space-y-3">
        <h2 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">
          COMPANION STATUS TRACKERS ({pets.length})
        </h2>

        {pets.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/20 border border-neutral-900 rounded-2xl">
            <p className="text-xs text-neutral-500">No companion records active. Initialize mapping parameters above.</p>
          </div>
        ) : (
          <AnimatePresence>
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/60 rounded-xl p-4 flex flex-col gap-3 hover:border-purple-500/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                      {pet.name} 
                      <span className="text-[10px] font-black bg-neutral-950 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md uppercase">
                        {pet.type}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium mt-1 leading-relaxed">
                      {pet.notes}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePet(pet.id)}
                    className="p-1.5 text-neutral-600 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/50 pt-3 mt-1 bg-neutral-950/40 -mx-4 -mb-4 p-4 rounded-b-xl">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>Last Fed: <span className="text-white font-black">{pet.last_fed || 'Not Tracked'}</span></span>
                  </div>

                  <Button
                    onClick={() => updateFeedingTime(pet.id)}
                    size="sm"
                    className="h-8 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-black tracking-wider uppercase rounded-lg border border-neutral-700/50"
                  >
                    Log Feeding Time
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

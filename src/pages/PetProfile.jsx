import React, { useState, useEffect } from 'react';

import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, ShieldAlert, Heart, Calendar, FileText, Camera, Save, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function PetProfile() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [weightLog, setWeightLog] = useState('');
  const [vaxDate, setVaxDate] = useState('');
  const [allergies, setAllergies] = useState('None reported.');

  useEffect(() => {
    // Stream extended medical/profile records from your data store
    base44.entities.PetHealthRecords?.list({}).then(res => setMedicalRecords(res || []));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.PetHealthRecords.create({
        weight: weightLog || 'Stable',
        vaccine_date: vaxDate || 'Up to date',
        allergies: allergies.trim(),
        logged_at: new Date().toLocaleDateString()
      });
      // Refresh local array state
      const updated = await base44.entities.PetHealthRecords.list({});
      setMedicalRecords(updated || []);
      setWeightLog('');
      setVaxDate('');
    } catch (err) {
      console.error("[Pet Health Register] Critical stream update abort:", err);
    }
  };

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Header Comms Layout */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-widest text-purple-500 uppercase">DETAILED DOSSIER</p>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">HEALTH PROFILE</h1>
        </div>
        <Link to="/pets">
          <Button variant="outline" className="h-9 border-neutral-800 bg-neutral-900/40 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </div>

      <Tier2Banner />

      {/* Profile Bio Configurator Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <form onSubmit={handleSaveProfile} className="md:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-2xl">
          <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-500" /> Vital Sign & Medical Logs
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Current Weight (kg/lbs)</label>
              <Input 
                value={weightLog} 
                onChange={(e) => setWeightLog(e.target.value)} 
                placeholder="e.g., 45 lbs" 
                className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Last Vaccination Date</label>
              <Input 
                type="date"
                value={vaxDate} 
                onChange={(e) => setVaxDate(e.target.value)} 
                className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 text-neutral-400 focus-visible:ring-purple-500/50" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Known Allergies / Vulnerabilities</label>
            <Input 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)} 
              className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50" 
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700 font-bold tracking-wide rounded-xl flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> COMMIT LOG ENTRY
          </Button>
        </form>

        {/* Quick-Glance Summary Widget */}
        <div className="bg-neutral-900/20 border border-neutral-800/60 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Heart className="w-3.5 h-3.5 text-red-500" /> Status Dashboard
            </h4>
            <div className="space-y-2">
              <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-bold">Medical Status</span>
                <span className="text-emerald-400 font-black uppercase tracking-wider">SECURE</span>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-xl flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-bold">Diet Tracking</span>
                <span className="text-purple-400 font-black uppercase tracking-wider">ACTIVE</span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-neutral-600 font-bold leading-tight bg-neutral-950/40 p-3 border border-neutral-900/60 rounded-xl">
            All medical tracking rows are stored with encryption hooks linked directly to your core ecosystem database profile.
          </div>
        </div>
      </div>

      {/* History Registry Feed */}
      <div className="space-y-2">
        <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">HISTORICAL REGISTER TIMELINE</h3>
        {medicalRecords.length === 0 ? (
          <div className="p-6 text-center bg-neutral-900/10 border border-neutral-900 rounded-xl text-xs text-neutral-600 font-bold">
            No entries logged in health registry timeline.
          </div>
        ) : (
          [...medicalRecords].reverse().map((record, index) => (
            <div key={record.id || index} className="bg-neutral-900/40 border border-neutral-800/40 rounded-xl p-3 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="text-neutral-200 font-bold flex items-center gap-2">
                  <span>Weight: <span className="text-white font-black">{record.weight}</span></span>
                  <span className="text-neutral-700">|</span>
                  <span className="text-neutral-400">Allergies: {record.allergies}</span>
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">Vaccine Check: {record.vaccine_date}</p>
              </div>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {record.logged_at}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

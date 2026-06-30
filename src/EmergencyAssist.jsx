import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Wrench, Droplet, AlertTriangle, HelpCircle, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tier2Banner from '@/components/shared/Tier2Banner';

const MANUALS = [
  {
    id: 'tire',
    title: 'How to Change a Flat Tire Safely',
    icon: Wrench,
    steps: [
      "Find a flat, hard, safe surface completely clear of active traffic lanes. Turn on hazard flashers and pull the parking brake tight.",
      "Use your lug wrench to loosen the lug nuts slightly while the tire is still firmly on the ground. Just break the resistance—do not spin them off yet.",
      "Locate the vehicle jack point on the metal frame rail (check manual). Raise the jack until the flat tire completely clears the pavement.",
      "Spin the lug nuts off entirely, pull the flat tire away, and mount your spare wheel fully onto the hub bolts.",
      "Hand-tighten all the lug nuts back on. Lower the jack slowly until the tire just makes solid contact with the ground, then tighten the nuts firmly with your wrench in a star pattern.",
      "Lower the vehicle the rest of the way down, remove the jack completely, and give the lug nuts one final check for maximum torque."
    ]
  },
  {
    id: 'fluids',
    title: 'How to Check Critical Under-Hood Fluids',
    icon: Droplet,
    steps: [
      "Engine Oil: Make sure the car is parked flat with the engine completely off. Pull the dipstick, wipe it totally clean, push it all the way back down, and pull it out again. Ensure the wet oil level sits between the two hash marks.",
      "Engine Coolant: Look through the translucent plastic overflow reservoir tank to check the depth. If the engine has been running, do not open any caps—just read the cold/hot lines on the side.",
      "Brake Fluid: Locate the clear master cylinder reservoir mounted on the firewall directly in front of the steering wheel. Verify the fluid line is securely sitting between the MIN and MAX limits.",
      "Power Steering: Remove the reservoir cap (which often has a mini dipstick built right underneath it) to confirm it is fully topped up."
    ]
  }
];

export default function EmergencyAssist() {
  const [symptomInput, setSymptomInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedManual, setExpandedManual] = useState(null);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoading(true);
    setAiResult('');
    try {
      const response = await fetch('/api/emergencyRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: symptomInput.trim() }),
      });
      const json = await response.json();
      if (json.success) {
        setAiResult(json.data);
      } else {
        setAiResult('⚠️ Mechanized link offline. Please reference physical documentation or roadside response units.');
      }
    } catch (err) {
      console.error("[Diagnostic Stream Matrix failure]", err);
      setAiResult('⚠️ Telemetry pipeline failure. Ensure system connection limits are stable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Title Subsystem */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">ROADSIDE UTILITY</p>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">EMERGENCY ASSIST</h1>
      </div>

      <Tier2Banner />

      {/* Safety Guardrail Alert */}
      <div className="bg-red-500/10 border border-red-900/40 p-4 rounded-xl flex items-start gap-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">SAFETY PROTOCOL FIRST</h4>
          <p className="text-xs text-neutral-400 mt-0.5">Always secure your immediate surroundings, get to a safe shoulder, and clear active roadways before attempting mechanical inspections.</p>
        </div>
      </div>

      {/* Autonomous Real-Time AI Troubleshooting Engine */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4 mb-6 space-y-3">
        <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" /> Autonomous AI Roadside Coach
        </h3>
        
        <form onSubmit={handleAskAI} className="space-y-2">
          <Input 
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Describe behavior or sound (e.g., loud metal grinding when braking, clicking sound when starting)..."
            className="bg-neutral-950 border-neutral-800 text-xs h-11 focus-visible:ring-purple-500/50"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> ANALYZING FAULT TELEMETRY...
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4" /> RUN MASTER AI DIAGNOSTIC
              </>
            )}
          </Button>
        </form>

        {/* Live Diagnostic Telemetry Display */}
        <AnimatePresence>
          {aiResult && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 mt-3 text-xs leading-relaxed font-sans text-neutral-300 whitespace-pre-wrap font-semibold"
            >
              {aiResult}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Field Manuals */}
      <div className="space-y-2">
        <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">TACTICAL STEP-BY-STEP GUIDES</h3>
        
        {MANUALS.map((manual) => {
          const IconComponent = manual.icon;
          const isExpanded = expandedManual === manual.id;

          return (
            <div key={manual.id} className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedManual(isExpanded ? null : manual.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-purple-400">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-200">{manual.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-neutral-900 bg-neutral-950/60"
                  >
                    <div className="p-4 space-y-3">
                      {manual.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start text-xs font-semibold leading-relaxed text-neutral-300">
                          <span className="w-5 h-5 shrink-0 bg-neutral-900 border border-neutral-800 rounded-md flex items-center justify-center text-[10px] font-black text-purple-400">
                            {idx + 1}
                          </span>
                          <p className="pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

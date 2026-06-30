import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CloudRain, AlertTriangle, CloudSun } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function WeatherCenter() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Weather Center" />
      <div className="px-4 pt-12 pb-10 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
            <CloudRain className="w-12 h-12 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Weather Center
        </h1>
        <div className="flex gap-2 items-center text-orange-400 font-semibold mb-6 bg-orange-400/10 px-4 py-2 rounded-full">
            <AlertTriangle className="w-4 h-4" /> Feature currently under development
        </div>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            The upcoming Weather Center will feature real-time weather warnings, severe alerts, and localized forecast updates to keep you and your family safe.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 opacity-50">
                 <CloudSun className="w-6 h-6 text-muted-foreground" />
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Forecast Updates</span>
             </div>
             <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 opacity-50">
                 <AlertTriangle className="w-6 h-6 text-destructive" />
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Severe Warnings</span>
             </div>
        </div>
      </div>
    </div>
  );
}
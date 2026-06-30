import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function MedicalCenter() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Medical Center" />
      <div className="px-4 pt-12 pb-10 max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6"
        >
            <HeartPulse className="w-12 h-12 text-red-500" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">
          Medical Center
        </h1>
        <div className="flex gap-2 items-center text-orange-400 font-semibold mb-6 bg-orange-400/10 px-4 py-2 rounded-full">
            <AlertTriangle className="w-4 h-4" /> Feature currently under development
        </div>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            The Medical Center will serve as a hub for securely tracking family health records, upcoming appointments, and medication schedules.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 opacity-50">
                 <Stethoscope className="w-6 h-6 text-muted-foreground" />
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Appt Tracking</span>
             </div>
             <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 opacity-50">
                 <FileText className="w-6 h-6 text-muted-foreground" />
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secure Records</span>
             </div>
        </div>
      </div>
    </div>
  );
}
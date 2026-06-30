import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Users, Star, MapPin, DollarSign, Zap } from 'lucide-react';
import Tier2Lock from '@/components/shared/Tier2Lock';

const FEATURES = [
  'LinkedIn integration',
  'Job searching',
  'Job posting',
  'Resume builder',
  'Career coaching',
  'Employer matching',
  'Pro networking',
  'Side hustle board',
  'AI career assistant',
  'Opportunity feed',
];

const PREVIEW_JOBS = [
  { title: 'Brand Strategist', company: 'Hustle Ventures', location: 'Remote', salary: '$85k–$110k', type: 'Full-time', hot: true },
  { title: 'Growth Marketer', company: 'Flow Studio', location: 'New York, NY', salary: '$70k–$95k', type: 'Contract', hot: true },
  { title: 'Content Creator', company: 'Creatives Co.', location: 'Remote', salary: '$50k–$65k', type: 'Part-time', hot: false },
  { title: 'Business Dev Lead', company: 'Elevate Group', location: 'LA, CA', salary: '$100k+', type: 'Full-time', hot: false },
];

export default function HustleCareers() {
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">Hustle Careers</p>
            <h1 className="text-2xl font-display text-foreground leading-none">Find. Build. Level Up.</h1>
          </div>
        </div>
      </div>

      {/* Blurred preview */}
      <div className="relative px-4 pt-4">
        <div className="blur-sm pointer-events-none select-none opacity-40 space-y-3 mb-4">

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-hidden">
            {['All Jobs', 'Remote', 'Side Hustles', 'Networking', 'Coaching'].map(tab => (
              <div key={tab} className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${tab === 'All Jobs' ? 'bg-yellow-500 text-black' : 'bg-card border border-border text-muted-foreground'}`}>{tab}</div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2">
            {[['2.4k', 'Open Roles'], ['340', 'Side Hustles'], ['18', 'New Today']].map(([num, label]) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-xl font-display text-yellow-400">{num}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Job cards */}
          {PREVIEW_JOBS.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-sm">{job.title}</p>
                    {job.hot && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded-full">🔥 Hot</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-yellow-400">{job.salary}</p>
                  <p className="text-[10px] text-muted-foreground">{job.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{job.location}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Watermark icon */}
        <div className="absolute top-6 right-4 pointer-events-none select-none">
          <motion.div
            animate={{ opacity: [0.04, 0.09, 0.04] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-[130px] leading-none text-yellow-400 font-display"
          >
            ↑
          </motion.div>
        </div>
      </div>

      {/* Lock screen */}
      <Tier2Lock
        featureName="Hustle Careers"
        featureIcon="💼"
        features={FEATURES}
      />
    </div>
  );
}
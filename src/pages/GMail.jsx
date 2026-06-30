import { motion } from 'framer-motion';
import { Mail, Inbox, Send, Star, Briefcase, Users, Zap } from 'lucide-react';
import Tier2Lock from '@/components/shared/Tier2Lock';

const FEATURES = [
  'Gmail integration',
  'Multiple accounts',
  'Smart inbox',
  'AI email drafting',
  'Opportunity tracking',
  'Business tools',
  'Network management',
  'Priority sorting',
];

const PREVIEW_EMAILS = [
  { from: 'opportunity@ventures.co', subject: 'Partnership opportunity — let\'s connect', time: '9:41 AM', dot: true },
  { from: 'network@hustlers.io', subject: 'Your profile caught our attention', time: 'Yesterday', dot: true },
  { from: 'deals@growthlab.com', subject: 'Exclusive deal — members only', time: 'Mon', dot: false },
  { from: 'client@creative.co', subject: 'Project follow-up', time: 'Sun', dot: false },
];

export default function GMail() {
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">G-Mail</p>
            <h1 className="text-2xl font-display text-foreground leading-none">Your Hustle Hub</h1>
          </div>
        </div>
      </div>

      {/* Blurred preview of the eventual UI */}
      <div className="relative px-4 pt-4">

        {/* Blurred fake inbox */}
        <div className="blur-sm pointer-events-none select-none opacity-40 space-y-3 mb-4">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-hidden">
            {['All', 'Opportunities', 'Business', 'Network', 'Side Hustle'].map(tab => (
              <div key={tab} className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${tab === 'All' ? 'bg-yellow-500 text-black' : 'bg-card border border-border text-muted-foreground'}`}>{tab}</div>
            ))}
          </div>

          {/* Fake email rows */}
          {PREVIEW_EMAILS.map((email, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {email.from[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground truncate">{email.from}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{email.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{email.subject}</p>
              </div>
              {email.dot && <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 mt-1" />}
            </motion.div>
          ))}

          {/* Fake stat bar */}
          <div className="grid grid-cols-3 gap-2">
            {[['12', 'Unread'], ['4', 'Opportunities'], ['2', 'Replies Due']].map(([num, label]) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-xl font-display text-yellow-400">{num}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* G branding watermark */}
        <div className="absolute top-8 right-6 pointer-events-none select-none">
          <motion.div
            animate={{ opacity: [0.04, 0.09, 0.04] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-[140px] font-display text-yellow-400 leading-none"
          >
            G
          </motion.div>
        </div>
      </div>

      {/* Lock screen */}
      <Tier2Lock
        featureName="G-Mail"
        featureIcon="✉️"
        features={FEATURES}
      />
    </div>
  );
}
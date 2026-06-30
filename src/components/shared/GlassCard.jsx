import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', gradient = 'from-primary/10 via-secondary/10 to-primary/10' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden ${className}`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shine effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
    </motion.div>
  );
}
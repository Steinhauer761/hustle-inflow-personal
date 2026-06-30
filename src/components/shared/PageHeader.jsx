import { motion } from 'framer-motion';

export default function PageHeader({ emoji, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <span className="text-3xl">{emoji}</span>
        <span>{title}</span>
      </h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      )}
    </motion.div>
  );
}
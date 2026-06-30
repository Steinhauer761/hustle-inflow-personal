import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromoCodeBox({ onApply }) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    if (!code.trim()) return;
    setLoading(true);
    // Simulate API call - in production, validate with backend
    setTimeout(() => {
      if (code.toUpperCase() === 'HUSTLE2026') {
        setApplied(true);
        onApply?.('HUSTLE2026');
      }
      setLoading(false);
    }, 800);
  };

  if (applied) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">Promo Code Applied!</p>
            <p className="text-xs text-emerald-300/70">You'll get 3 months for $5.99</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-primary" />
        <p className="text-sm font-bold text-foreground">Have a promo code?</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 uppercase tracking-wide"
        />
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4"
        >
          {loading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Try <strong className="text-primary">HUSTLE2026</strong> for 3 months at $5.99
      </p>
    </motion.div>
  );
}
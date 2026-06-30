import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ScanLine, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ReceiptScanner from './ReceiptScanner';

const categoryColors = {
  receipt: 'text-yellow-400',
  invoice: 'text-orange-400',
  medical: 'text-rose-400',
  other: 'text-muted-foreground',
};

const categoryEmoji = {
  receipt: '🧾',
  invoice: '📄',
  medical: '💊',
  document: '📁',
  image: '🖼️',
  pet: '🐾',
  school: '🏫',
  other: '📎',
};

export default function DailySpendingWidget() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ['uploads-spending'],
    queryFn: () => base44.entities.Upload.list('-created_date', 50),
  });

  const todayUploads = uploads.filter(u => {
    if (!u.created_date) return false;
    return u.created_date.startsWith(today);
  });

  const recentWithAmount = uploads
    .filter(u => u.amount > 0)
    .slice(0, 5);

  const totalToday = todayUploads.reduce((sum, u) => sum + (u.amount || 0), 0);
  const totalAll = recentWithAmount.reduce((sum, u) => sum + (u.amount || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence>
        {showScanner && <ReceiptScanner onClose={() => setShowScanner(false)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <span>💸</span> Daily Spending
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors"
          >
            <ScanLine className="w-3 h-3" /> Scan Receipt
          </button>
          <button onClick={() => navigate('/files')}
            className="text-xs text-muted-foreground flex items-center gap-0.5 hover:text-primary transition-colors">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Today</div>
              <div className="text-lg font-display text-primary">${totalToday.toFixed(2)}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Recent</div>
              <div className="text-lg font-display text-foreground">${totalAll.toFixed(2)}</div>
            </div>
          </div>

          {/* Recent entries */}
          {recentWithAmount.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-muted-foreground text-xs font-semibold">No spending tracked yet</p>
              <button onClick={() => setShowScanner(true)} className="mt-2 text-[10px] text-primary hover:underline flex items-center gap-1 mx-auto">
                <ScanLine className="w-3 h-3" /> Scan your first receipt
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto scrollbar-hide flex-1">
              {recentWithAmount.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30"
                >
                  <span className="text-base">{categoryEmoji[u.category] || '📎'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{u.category}</p>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">${u.amount.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
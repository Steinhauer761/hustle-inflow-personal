import { useState } from 'react';
import { Lock, Plus, Eye, Download, FileText, DollarSign, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Tier2Lock from '@/components/shared/Tier2Lock';

const MOCK_INVOICES = [
  { id: 'INV-0042', client: 'TechFlow Inc.', amount: 3500, status: 'paid', date: 'Jun 1, 2026', due: 'Jun 15, 2026' },
  { id: 'INV-0041', client: 'Designify Studio', amount: 1200, status: 'pending', date: 'May 28, 2026', due: 'Jun 12, 2026' },
  { id: 'INV-0040', client: 'GrowthCo', amount: 800, status: 'overdue', date: 'May 10, 2026', due: 'May 25, 2026' },
  { id: 'INV-0039', client: 'InsightHub', amount: 2200, status: 'paid', date: 'Apr 30, 2026', due: 'May 14, 2026' },
];

const STATUS_STYLES = {
  paid: 'bg-green-900/30 text-green-400 border-green-500/20',
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20',
  overdue: 'bg-red-900/30 text-red-400 border-red-500/20',
};

export default function InvoiceSystem() {
  const [tab, setTab] = useState('Invoices');

  const totalPaid = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = MOCK_INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900/50 via-card to-background px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧾</span>
              <h1 className="text-2xl font-display text-foreground">Invoice System</h1>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full px-3 py-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Tier 2</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm ml-9">Create, send & track invoices — preview mode</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 border border-green-500/20 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground mb-0.5">Total Paid</div>
            <div className="text-2xl font-display text-green-300">${totalPaid.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{MOCK_INVOICES.filter(i => i.status === 'paid').length} invoices</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-2xl p-4">
            <div className="text-xs text-muted-foreground mb-0.5">Outstanding</div>
            <div className="text-2xl font-display text-yellow-300">${totalPending.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{MOCK_INVOICES.filter(i => i.status !== 'paid').length} invoices</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1">
          {['Invoices', 'Create New'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Invoices' && (
          <div className="space-y-3">
            {MOCK_INVOICES.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{inv.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[inv.status]}`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{inv.client}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">${inv.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Due {inv.due}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground cursor-not-allowed">
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground cursor-not-allowed">
                    <Download className="w-3 h-3" /> <Lock className="w-3 h-3" /> Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'Create New' && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="text-sm font-bold text-foreground mb-1">New Invoice (Preview)</div>
            {[['Client Name', User, 'e.g. Acme Corp'], ['Amount ($)', DollarSign, 'e.g. 1500'], ['Due Date', Calendar, 'e.g. Jun 30']].map(([label, Icon, placeholder]) => (
              <div key={label}>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input disabled placeholder={placeholder} className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-muted-foreground placeholder:text-muted-foreground/50 cursor-not-allowed" />
                </div>
              </div>
            ))}
            <button disabled className="w-full py-3 rounded-xl bg-muted border border-border text-muted-foreground text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
              <Lock className="w-4 h-4" /> Generate Invoice (Tier 2)
            </button>
          </div>
        )}

        <Tier2Lock module="Invoice System" />
      </div>
    </div>
  );
}
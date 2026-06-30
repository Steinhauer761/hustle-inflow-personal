import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Eye, Lock, CheckCircle, Clock, XCircle } from 'lucide-react';
import Tier2Lock from '@/components/shared/Tier2Lock';
import Tier2Footer from '@/components/shared/Tier2Footer';
import Tier2Banner from '@/components/shared/Tier2Banner';

const MOCK_INVOICES = [
  { id: 'INV-001', client: 'TechFlow Inc.', amount: 3500, status: 'paid', date: '2026-05-15', due: '2026-05-30', items: 3 },
  { id: 'INV-002', client: 'Nova Studio', amount: 1800, status: 'pending', date: '2026-06-01', due: '2026-06-15', items: 2 },
  { id: 'INV-003', client: 'Analytiq AI', amount: 6200, status: 'overdue', date: '2026-05-01', due: '2026-05-20', items: 5 },
  { id: 'INV-004', client: 'BrandWave', amount: 950, status: 'draft', date: '2026-06-05', due: '2026-06-20', items: 1 },
];

const STATUS_CONFIG = {
  paid: { label: 'Paid', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  overdue: { label: 'Overdue', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  draft: { label: 'Draft', icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

const MOCK_LINE_ITEMS = [
  { desc: 'Web Development — Sprint 1', qty: 1, rate: 2000, total: 2000 },
  { desc: 'UI/UX Design Review', qty: 3, rate: 150, total: 450 },
  { desc: 'Project Management', qty: 10, rate: 105, total: 1050 },
];

function InvoicePreviewModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Invoice Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-display text-foreground">{invoice.id}</h2>
              <p className="text-sm text-muted-foreground">Issued: {invoice.date}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display text-primary">${invoice.amount.toLocaleString()}</p>
              <div className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CONFIG[invoice.status].bg} ${STATUS_CONFIG[invoice.status].color}`}>
                {invoice.status}
              </div>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-2xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">From</p>
              <p className="text-sm font-bold text-foreground">Your Business</p>
              <p className="text-xs text-muted-foreground">your@email.com</p>
            </div>
            <div className="bg-muted rounded-2xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Bill To</p>
              <p className="text-sm font-bold text-foreground">{invoice.client}</p>
              <p className="text-xs text-muted-foreground">Due: {invoice.due}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Line Items</p>
            <div className="space-y-2">
              {MOCK_LINE_ITEMS.slice(0, invoice.items).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground">{item.qty} × ${item.rate}</p>
                  </div>
                  <p className="font-bold text-foreground">${item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-lg font-display text-primary">${invoice.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Locked Actions */}
          <div className="flex gap-2">
            <button disabled className="flex-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold py-2.5 rounded-2xl opacity-60 cursor-not-allowed flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Download PDF — Tier 2
            </button>
            <button disabled className="flex-1 bg-muted border border-border text-muted-foreground text-xs font-bold py-2.5 rounded-2xl opacity-60 cursor-not-allowed">
              Send Invoice
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Invoices() {
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? MOCK_INVOICES : MOCK_INVOICES.filter(i => i.status === tab);
  const total = MOCK_INVOICES.reduce((s, i) => s + i.amount, 0);
  const paid = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Invoice System" />
      <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display flex items-center gap-2">📄 Invoices</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Preview mode — downloads unlock in Tier 2</p>
          </div>
          <Tier2Lock />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Invoiced</p>
            <p className="text-2xl font-display text-foreground">${total.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Collected</p>
            <p className="text-2xl font-display text-emerald-400">${paid.toLocaleString()}</p>
          </div>
        </div>

        {/* New Invoice Button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 bg-card border border-dashed border-border hover:border-primary/30 rounded-2xl py-3 text-sm font-bold text-muted-foreground mb-5 transition-all opacity-60 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
          <Lock className="w-3 h-3" />
        </button>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
          {['all', 'paid', 'pending', 'overdue', 'draft'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all capitalize ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {filtered.map((inv, i) => {
            const sc = STATUS_CONFIG[inv.status];
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setPreviewInvoice(inv)}
                className="bg-card border border-border hover:border-primary/30 rounded-2xl p-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-foreground">{inv.client}</p>
                      <p className="font-display text-base text-foreground">${inv.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground">{inv.id} · {inv.date}</p>
                      <span className={`flex items-center gap-1 border rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />{sc.label}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <Tier2Footer moduleName="Invoices" />
      </div>

      {previewInvoice && (
        <InvoicePreviewModal invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}
    </div>
  );
}
import { useState, useRef } from 'react';
import { X, Camera, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';
import { format } from 'date-fns';

export default function ExpenseForm({ expense, onSubmit, onCancel }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    name: expense?.name || '',
    amount: expense?.amount || '',
    category: expense?.category || 'other',
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: expense?.notes || '',
    file_url: expense?.file_url || '',
    source: expense?.source || 'manual',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleScanReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('file_url', file_url);
    setUploading(false);
    setScanning(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyse this receipt/invoice image and extract: merchant name, total amount (number only, no currency), date (YYYY-MM-DD), and best-fit category from: food, pet_care, home, transport, health, entertainment, shopping, bills, other.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          merchant: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string' },
          category: { type: 'string' },
        },
      },
    });
    setForm(p => ({
      ...p,
      name: result.merchant || p.name,
      amount: result.amount || p.amount,
      date: result.date || p.date,
      category: result.category || p.category,
      source: 'scanned',
    }));
    setScanning(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-foreground">{expense ? 'Edit Expense' : 'Log Expense'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      {/* Scan button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || scanning}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
          : scanning ? <><Loader2 className="w-4 h-4 animate-spin" /> AI scanning...</>
          : <><ScanLine className="w-4 h-4" /> Scan Receipt / Invoice</>}
      </button>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleScanReceipt} />
      {form.file_url && (
        <div className="flex items-center gap-2 text-xs text-accent font-semibold">
          <Camera className="w-3.5 h-3.5" /> Receipt attached
        </div>
      )}

      <div>
        <Label>Merchant / Description *</Label>
        <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Whole Foods" required className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount *</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input type="number" step="0.01" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" required className="pl-6" />
          </div>
        </div>
        <div>
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} required className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => (
            <button
              type="button"
              key={key}
              onClick={() => update('category', key)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                form.category === key
                  ? 'border-transparent text-white'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/30'
              }`}
              style={form.category === key ? { backgroundColor: cfg.color } : {}}
            >
              <span className="text-base">{cfg.emoji}</span>
              {cfg.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Input value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Optional" className="mt-1" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">{expense ? 'Update' : 'Save'}</Button>
      </div>
    </form>
  );
}
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, CheckCircle2, ScanLine, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

export default function ReceiptScanner({ onClose }) {
  const fileRef = useRef();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState('idle'); // idle | uploading | scanning | review | saving | done | error
  const [preview, setPreview] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);

  const saveMutation = useMutation({
    mutationFn: data => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setPhase('done');
      setTimeout(onClose, 1600);
    },
  });

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setPhase('uploading');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    setPhase('scanning');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a receipt scanner. Carefully analyse this receipt image and extract the following details.
Return ONLY valid JSON matching the schema exactly.
- merchant: business name (string)
- date: date of purchase in YYYY-MM-DD format (string, use today if unclear: ${new Date().toISOString().split('T')[0]})
- amount: total amount as a number (no currency symbol)
- category: one of food | pet_care | home | transport | health | entertainment | shopping | bills | other
- notes: 1-sentence summary of what was purchased (string)`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          merchant: { type: 'string' },
          date: { type: 'string' },
          amount: { type: 'number' },
          category: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['merchant', 'amount', 'category'],
      },
    });

    setExtracted({
      merchant: result.merchant || 'Unknown Merchant',
      date: result.date || new Date().toISOString().split('T')[0],
      amount: result.amount || 0,
      category: Object.keys(EXPENSE_CATEGORIES).includes(result.category) ? result.category : 'other',
      notes: result.notes || '',
      file_url,
    });
    setPhase('review');
  };

  const handleSave = () => {
    if (!extracted) return;
    setPhase('saving');
    saveMutation.mutate({
      name: extracted.merchant,
      amount: extracted.amount,
      category: extracted.category,
      date: extracted.date,
      notes: extracted.notes,
      file_url: extracted.file_url,
      source: 'scanned',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Receipt Scanner</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">

            {/* IDLE */}
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-muted-foreground mb-5 text-center">
                  Snap or upload a receipt — AI will extract the details and log it as an expense.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { fileRef.current.accept = 'image/*'; fileRef.current.capture = 'environment'; fileRef.current.click(); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Camera className="w-7 h-7 text-primary" />
                    <span className="text-xs font-bold text-foreground">Take Photo</span>
                  </button>
                  <button
                    onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Upload className="w-7 h-7 text-primary" />
                    <span className="text-xs font-bold text-foreground">Upload File</span>
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])}
                />
              </motion.div>
            )}

            {/* UPLOADING / SCANNING */}
            {(phase === 'uploading' || phase === 'scanning') && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-6">
                {preview && (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-border">
                    <img src={preview} alt="receipt" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    </div>
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-primary/70"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    {phase === 'uploading' ? 'Uploading receipt...' : 'AI is reading your receipt...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">This takes a few seconds</p>
                </div>
              </motion.div>
            )}

            {/* REVIEW */}
            {phase === 'review' && extracted && (
              <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-muted-foreground mb-4">Review and confirm — then it'll be logged as an expense.</p>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Merchant</label>
                    <input
                      value={extracted.merchant}
                      onChange={e => setExtracted(p => ({ ...p, merchant: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={extracted.amount}
                          onChange={e => setExtracted(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-muted/50 border border-border rounded-xl pl-6 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Date</label>
                      <input
                        type="date"
                        value={extracted.date}
                        onChange={e => setExtracted(p => ({ ...p, date: e.target.value }))}
                        className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setExtracted(p => ({ ...p, category: key }))}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            extracted.category === key
                              ? 'border-transparent text-white font-bold'
                              : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/30'
                          }`}
                          style={extracted.category === key ? { backgroundColor: cfg.color } : {}}
                        >
                          {cfg.emoji} {cfg.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {extracted.notes && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Notes</label>
                      <input
                        value={extracted.notes}
                        onChange={e => setExtracted(p => ({ ...p, notes: e.target.value }))}
                        className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    Save Expense
                  </button>
                </div>
              </motion.div>
            )}

            {/* SAVING */}
            {phase === 'saving' && (
              <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-foreground">Saving expense...</p>
              </motion.div>
            )}

            {/* DONE */}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                  <CheckCircle2 className="w-10 h-10 text-accent" />
                </motion.div>
                <p className="text-sm font-bold text-foreground">Expense logged! 🎉</p>
                <p className="text-xs text-muted-foreground">{extracted?.merchant} · ${extracted?.amount?.toFixed(2)}</p>
              </motion.div>
            )}

            {/* ERROR */}
            {phase === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-sm font-bold text-foreground">Couldn't read receipt</p>
                <p className="text-xs text-muted-foreground text-center">{error || 'Try a clearer photo or enter manually.'}</p>
                <button onClick={() => setPhase('idle')} className="mt-1 text-xs text-primary hover:underline">Try again</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
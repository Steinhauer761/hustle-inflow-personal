import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

export default function BudgetEditor({ budgets, onClose }) {
  const queryClient = useQueryClient();
  const [limits, setLimits] = useState(() => {
    const map = {};
    Object.keys(EXPENSE_CATEGORIES).forEach(k => { map[k] = ''; });
    budgets.forEach(b => { map[b.category] = String(b.monthly_limit); });
    return map;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    for (const [category, val] of Object.entries(limits)) {
      const amount = parseFloat(val);
      const existing = budgets.find(b => b.category === category);
      if (amount > 0) {
        if (existing) await base44.entities.Budget.update(existing.id, { category, monthly_limit: amount });
        else await base44.entities.Budget.create({ category, monthly_limit: amount });
      } else if (existing) {
        await base44.entities.Budget.delete(existing.id);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Monthly Budgets</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Set a monthly spending limit per category. Leave blank for no limit.</p>
      <div className="space-y-3">
        {Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: cfg.color + '22' }}>
              {cfg.emoji}
            </div>
            <span className="flex-1 text-sm font-semibold text-foreground">{cfg.label}</span>
            <div className="relative w-28">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={limits[key]}
                onChange={e => setLimits(p => ({ ...p, [key]: e.target.value }))}
                placeholder="No limit"
                className="w-full bg-muted/50 border border-border rounded-xl pl-6 pr-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl gap-1">
          {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Budgets</>}
        </Button>
      </div>
    </div>
  );
}
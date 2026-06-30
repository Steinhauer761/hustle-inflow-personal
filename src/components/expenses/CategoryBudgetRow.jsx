import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

export default function CategoryBudgetRow({ category, spent, budget }) {
  const cfg = EXPENSE_CATEGORIES[category];
  if (!cfg) return null;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : null;
  const over = budget > 0 && spent > budget;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
        style={{ background: cfg.color + '22' }}>
        {cfg.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-foreground truncate">{cfg.label}</span>
          <span className={`text-xs font-bold shrink-0 ml-2 ${over ? 'text-destructive' : 'text-foreground'}`}>
            ${spent.toFixed(0)}{budget > 0 ? ` / $${budget.toFixed(0)}` : ''}
          </span>
        </div>
        {pct !== null && (
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: over ? '#EF4444' : cfg.color }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
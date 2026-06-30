import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

export default function MonthlyChart({ expenses, budgets }) {
  const data = useMemo(() => {
    const budgetMap = {};
    budgets.forEach(b => { budgetMap[b.category] = b.monthly_limit; });

    return Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => {
      const spent = expenses.filter(e => e.category === key).reduce((s, e) => s + (e.amount || 0), 0);
      const budget = budgetMap[key] || 0;
      return { key, label: cfg.label.split(' ')[0], emoji: cfg.emoji, color: cfg.color, spent, budget };
    }).filter(d => d.spent > 0 || d.budget > 0);
  }, [expenses, budgets]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-bold text-foreground mb-1">{d.emoji} {EXPENSE_CATEGORIES[d.key]?.label}</p>
        <p className="text-primary">Spent: <span className="font-bold">${d.spent.toFixed(2)}</span></p>
        {d.budget > 0 && <p className="text-muted-foreground">Budget: <span className="font-bold">${d.budget.toFixed(2)}</span></p>}
      </div>
    );
  };

  if (data.length === 0) return null;

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
          <XAxis dataKey="emoji" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="spent" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {data.map((d) => <Cell key={d.key} fill={d.color} />)}
          </Bar>
          <Bar dataKey="budget" radius={[6, 6, 0, 0]} maxBarSize={36} fill="transparent"
            stroke="rgba(255,255,255,0.15)" strokeDasharray="4 2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
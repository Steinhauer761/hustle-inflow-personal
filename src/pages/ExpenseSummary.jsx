import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO, isWithinInterval } from 'date-fns';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

/* ─── Donut tooltip ─── */
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: d } = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-foreground">{d.emoji} {name}</p>
      <p className="text-primary font-bold mt-0.5">${value.toFixed(2)}</p>
      <p className="text-muted-foreground">{d.pct.toFixed(1)}% of total</p>
    </div>
  );
};

/* ─── Bar tooltip ─── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg space-y-1">
      <p className="font-bold text-foreground">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">${Number(p.value).toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ExpenseSummary() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [authLoading, setAuthLoading] = useState(true);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 200),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => base44.entities.Budget.list(),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthExpenses = useMemo(() => expenses.filter(e => {
    if (!e.date) return false;
    return isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd });
  }), [expenses, currentMonth]);

  const totalMonth = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const budgetMap = useMemo(() => {
    const m = {};
    budgets.forEach(b => { m[b.category] = b.monthly_limit; });
    return m;
  }, [budgets]);

  const totalBudget = Object.values(budgetMap).reduce((s, v) => s + v, 0);

  /* Donut data */
  const donutData = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + (e.amount || 0); });
    return Object.entries(map)
      .map(([key, value]) => {
        const cfg = EXPENSE_CATEGORIES[key] || EXPENSE_CATEGORIES.other;
        return { name: cfg.label, emoji: cfg.emoji, color: cfg.color, value, pct: totalMonth > 0 ? (value / totalMonth) * 100 : 0 };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses, totalMonth]);

  /* Bar data — spend vs budget per category */
  const barData = useMemo(() => {
    return Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => {
      const spent = monthExpenses.filter(e => e.category === key).reduce((s, e) => s + (e.amount || 0), 0);
      const budget = budgetMap[key] || 0;
      if (spent === 0 && budget === 0) return null;
      return { label: `${cfg.emoji} ${cfg.label.split(' ')[0]}`, emoji: cfg.emoji, color: cfg.color, Spent: spent, Budget: budget };
    }).filter(Boolean);
  }, [monthExpenses, budgetMap]);

  /* Over-budget categories */
  const overBudget = useMemo(() => {
    return Object.entries(EXPENSE_CATEGORIES).map(([key, cfg]) => {
      const spent = monthExpenses.filter(e => e.category === key).reduce((s, e) => s + (e.amount || 0), 0);
      const budget = budgetMap[key] || 0;
      if (budget > 0 && spent > budget) return { key, cfg, spent, budget, over: spent - budget };
      return null;
    }).filter(Boolean);
  }, [monthExpenses, budgetMap]);

  const isEmpty = monthExpenses.length === 0;

  /* Monthly trend data - last 6 months */
  const monthlyTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentMonth, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthTotal = expenses
        .filter(e => e.date && isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }))
        .reduce((s, e) => s + (e.amount || 0), 0);
      months.push({
        name: format(monthDate, 'MMM'),
        month: format(monthDate, 'MMMM'),
        spent: monthTotal,
      });
    }
    return months;
  }, [expenses, currentMonth]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/expenses')} className="p-2 rounded-xl bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">Spending Summary</h1>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-10 max-w-lg mx-auto space-y-5 pt-5">

        {/* Monthly Trend Chart */}
        {!isEmpty && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">6-Month Spending Trend</p>
            <div className="w-full" style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
                          <p className="font-bold text-foreground">{label}</p>
                          <p className="text-primary font-bold mt-0.5">${payload[0].value.toFixed(2)}</p>
                        </div>
                      );
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Area type="monotone" dataKey="spent" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-display text-primary">${totalMonth.toFixed(2)}</p>
            {totalBudget > 0 && (
              <p className={`text-xs mt-0.5 font-semibold flex items-center gap-1 ${totalMonth > totalBudget ? 'text-destructive' : 'text-emerald-400'}`}>
                {totalMonth > totalBudget ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {totalMonth > totalBudget ? `$${(totalMonth - totalBudget).toFixed(2)} over` : `$${(totalBudget - totalMonth).toFixed(2)} under`}
              </p>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-display text-foreground">{totalBudget > 0 ? `$${totalBudget.toFixed(2)}` : '—'}</p>
            {totalBudget > 0 && (
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min((totalMonth / totalBudget) * 100, 100)}%` }} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Over-budget alerts */}
        {overBudget.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-xs font-bold text-destructive uppercase tracking-wide">Over Budget</p>
            </div>
            {overBudget.map(({ key, cfg, spent, budget, over }) => (
              <div key={key} className="flex items-center gap-2.5">
                <span className="text-base">{cfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{cfg.label}</p>
                  <p className="text-[10px] text-muted-foreground">${budget.toFixed(2)} limit · ${spent.toFixed(2)} spent</p>
                </div>
                <span className="text-xs font-bold text-destructive shrink-0">+${over.toFixed(2)}</span>
              </div>
            ))}
          </motion.div>
        )}

        {isEmpty ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">💸</p>
            <p className="text-sm font-bold text-muted-foreground">No expenses this month</p>
            <button onClick={() => navigate('/expenses')} className="mt-2 text-xs text-primary hover:underline">Log an expense</button>
          </div>
        ) : (
          <>
            {/* Donut chart */}
            {donutData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Category Distribution</p>
                <div className="flex items-center gap-4">
                  <div className="w-40 h-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2}>
                          {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {donutData.slice(0, 6).map(d => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-muted-foreground truncate flex-1">{d.emoji} {d.name.split(' ')[0]}</span>
                        <span className="text-xs font-bold text-foreground shrink-0">{d.pct.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Spend vs Budget bar chart */}
            {barData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Spent vs Budget</p>
                <div className="w-full overflow-x-auto">
                  <div style={{ minWidth: `${barData.length * 68}px`, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barGap={3} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="emoji" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                        <Bar dataKey="Spent" radius={[4, 4, 0, 0]} maxBarSize={28}>
                          {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Bar>
                        <Bar dataKey="Budget" radius={[4, 4, 0, 0]} maxBarSize={28} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Category rows with progress bars */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Breakdown</p>
              {donutData.map(({ name, emoji, color, value }) => {
                const catKey = Object.entries(EXPENSE_CATEGORIES).find(([, v]) => v.label === name)?.[0];
                const budget = catKey ? (budgetMap[catKey] || 0) : 0;
                const pct = budget > 0 ? Math.min((value / budget) * 100, 100) : null;
                const over = budget > 0 && value > budget;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{emoji} {name}</span>
                      <span className={`text-xs font-bold ${over ? 'text-destructive' : 'text-foreground'}`}>
                        ${value.toFixed(2)}{budget > 0 ? ` / $${budget.toFixed(2)}` : ''}
                      </span>
                    </div>
                    {pct !== null ? (
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: over ? '#EF4444' : color }} />
                      </div>
                    ) : (
                      <div className="h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full opacity-40" style={{ width: '100%', backgroundColor: color }} />
                      </div>
                    )}
                    {budget === 0 && (
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">No budget set</p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </>
        )}

        <button onClick={() => navigate('/expenses')}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
          ← Back to expenses
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, Trash2, Calendar, TrendingUp, Filter, CreditCard, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Housing');
  const [description, setDescription] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    // Stream active transaction ledgers from the cloud store
    base44.entities.Expenses?.list({}).then(res => setExpenses(res || []));
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    try {
      const created = await base44.entities.Expenses.create({
        amount: parseFloat(amount),
        category,
        description: description.trim() || 'Unclassified transaction',
        date: new Date().toLocaleDateString()
      });
      setExpenses(prev => [created, ...prev]);
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error("[Ledger Stream] Direct deposit/expense creation aborted:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await base44.entities.Expenses.delete(id);
      setExpenses(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("[Ledger Stream] Eradication protocol failed:", err);
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(item => item.category === filterCategory);

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Premium Header Architecture */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">CAPITAL TRACKING</p>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">EXPENSE LEDGER</h1>
      </div>

      <Tier2Banner />

      {/* Financial Matrix Summary Ribbon */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-purple-400" /> Aggregate Outflow
          </span>
          <p className="text-2xl font-black text-white tracking-tight mt-2">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-purple-400" /> Active Rows
          </span>
          <p className="text-2xl font-black text-purple-400 tracking-tight mt-2">
            {expenses.length} <span className="text-xs font-bold text-neutral-600">ITEMS</span>
          </p>
        </div>
      </div>

      {/* Add Transaction Workspace */}
      <form onSubmit={handleAddExpense} className="bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl space-y-4 mb-6">
        <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500" /> Log Asset Allocation
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Amount ($)</label>
            <Input 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              step="0.01"
              className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Allocation Pool</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 text-xs h-11 mt-1 font-semibold text-white focus:outline-none focus:border-purple-500/50 appearance-none"
            >
              <option value="Housing">Housing / Rent</option>
              <option value="Utilities">Utilities / Power</option>
              <option value="Groceries">Groceries / Subsistence</option>
              <option value="Fuel">Fuel / Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Projects">Technical Projects</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Transaction Description</label>
          <Input 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., GitHub API Server Clusters, Parts Warehouse..."
            className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
          />
        </div>

        <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700 font-bold tracking-wide rounded-xl flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> COMMIT DISBURSEMENT ROW
        </Button>
      </form>

      {/* Transaction Array Output Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase">TRANSACTION ARRAY</h3>
          <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-800 px-2.5 py-1 rounded-lg">
            <Filter className="w-3 h-3 text-neutral-400" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Pools</option>
              <option value="Housing">Housing</option>
              <option value="Utilities">Utilities</option>
              <option value="Groceries">Groceries</option>
              <option value="Fuel">Fuel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Projects">Projects</option>
            </select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/10 border border-neutral-900 rounded-2xl text-xs text-neutral-600 font-bold">
            No active allocations mapped to this filter block.
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredExpenses.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-neutral-900/30 border border-neutral-800/50 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center text-xs hover:border-purple-500/20 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-white font-black tracking-tight">{item.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      <span className="text-purple-400 bg-purple-950/40 border border-purple-900/30 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {item.date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white text-sm tracking-tight">
                      -${Number(item.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="p-1.5 text-neutral-600 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

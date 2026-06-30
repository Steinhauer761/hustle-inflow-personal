import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2, Utensils, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tier2Banner from '@/components/shared/Tier2Banner';

export default function MealPlanner() {
  const [meals, setMeals] = useState([]);
  const [dishName, setDishName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [mealType, setMealType] = useState('Dinner');

  useEffect(() => {
    // Synchronize family menu mapping logs with core cluster database
    base44.entities.Meals?.list({}).then(res => setMeals(res || []));
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    try {
      const created = await base44.entities.Meals.create({
        dish_name: dishName.trim(),
        day: dayOfWeek,
        type: mealType,
        status: 'Planned'
      });
      setMeals(prev => [...prev, created]);
      setDishName('');
    } catch (err) {
      console.error("[Menu Engine] Macro/meal mapping log failed to write:", err);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await base44.entities.Meals.delete(id);
      setMeals(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("[Menu Engine] Item deletion fault:", err);
    }
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      {/* Title Subsystem */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">DIETARY LOGISTICS</p>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">MEAL PLANNER</h1>
      </div>

      <Tier2Banner />

      {/* Menu Map Registration Panel */}
      <form onSubmit={handleAddMeal} className="bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl space-y-4 mb-6">
        <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500" /> Register Nutrition Mapping
        </h3>

        <div>
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Dish Designation</label>
          <Input 
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="e.g., Grilled Steak with Asparagus, High-Protein Prep..."
            className="bg-neutral-950 border-neutral-800 text-xs h-11 mt-1 focus-visible:ring-purple-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Target Timeline Day</label>
            <select 
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 text-xs h-11 mt-1 font-semibold text-white focus:outline-none focus:border-purple-500/50 appearance-none"
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider px-1">Meal Sequence</label>
            <select 
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 text-xs h-11 mt-1 font-semibold text-white focus:outline-none focus:border-purple-500/50 appearance-none"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack Protocol</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700 font-bold tracking-wide rounded-xl flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> COMMIT SCHEDULE TARGET
        </Button>
      </form>

      {/* Structured Day-by-Day Menu Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">7-DAY TIMELINE ROUTING</h3>
        
        {DAYS.map((day) => {
          const dayMeals = meals.filter(m => m.day === day);

          return (
            <div key={day} className="bg-neutral-900/40 border border-neutral-800/40 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider border-b border-neutral-800/40 pb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {day}
              </h4>

              {dayMeals.length === 0 ? (
                <p className="text-[11px] text-neutral-600 font-bold py-0.5 px-1">No nutritional vectors mapped for this timeframe block.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-2.5 flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-black bg-neutral-900 text-neutral-400 border border-neutral-800 px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                          {meal.type}
                        </span>
                        <span className="text-neutral-200 tracking-tight">{meal.dish_name}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1 text-neutral-600 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

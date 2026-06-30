          import React, { useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Pick up project materials", assignee: "Me", category: "Work", completed: false },
    { id: 2, text: "Pack school backpack & clean room", assignee: "Niece", category: "Chore", completed: false },
    { id: 3, text: "Check grocery stock for dinner", assignee: "Family", category: "Household", completed: true },
  ]);

  const [input, setInput] = useState("");

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    if (!input.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now(), text: input, assignee: "Me", category: "Inflow", completed: false }
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 font-sans selection:bg-purple-500">
      {/* Header section with street-smart rhythm branding */}
      <header className="mb-6 pt-4">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
          HUSTLE & INFLOW
        </h1>
        <p className="text-xs text-neutral-500 tracking-widest uppercase mt-0.5">Household Command Center</p>
      </header>

      {/* Smart Inflow Input Feed Box */}
      <section className="mb-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
          Smart Inflow Feed
        </label>
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say what needs to get done..." 
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600 text-white"
          />
          <button 
            onClick={handleAddTask}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 rounded-xl text-sm transition-colors active:scale-95"
          >
            Drop
          </button>
        </div>
      </section>

      {/* Multiplayer Family Task Stream */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Today's Flow</h2>
          <span className="text-xs bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-800">
            {tasks.filter(t => !t.completed).length} remaining
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                task.completed 
                  ? 'bg-neutral-900/40 border-neutral-900 line-through text-neutral-600' 
                  : 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3 pr-2">
                {/* Custom styled checkbox indicator */}
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-purple-600 border-purple-600' : 'border-neutral-700 bg-neutral-950'
                }`}>
                  {task.completed && (
                    <svg className="w-3.5 h-3.5 text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium tracking-wide">{task.text}</span>
              </div>

              {/* Identity Tag (Multiplayer ownership) */}
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${
                task.completed
                  ? 'bg-neutral-950 text-neutral-700 border-neutral-900'
                  : task.assignee === 'Niece'
                  ? 'bg-pink-950/40 text-pink-400 border-pink-900/50'
                  : task.assignee === 'Me'
                  ? 'bg-purple-950/40 text-purple-400 border-purple-900/50'
                  : 'bg-blue-950/40 text-blue-400 border-blue-900/50'
              }`}>
                {task.assignee}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

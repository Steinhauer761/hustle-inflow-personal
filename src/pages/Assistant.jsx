import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageSquare, Sparkles, User, RefreshCcw, Send, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tier2Banner from '@/components/shared/Tier2Banner';

// High-end human coaching staff options
const COACHES = [
  { id: 'coach_zack', name: 'Zack (Strength & Conditioning)', gender: 'male', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
  { id: 'coach_maya', name: 'Maya (Elite Nutrition & Flow)', gender: 'female', img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=400&auto=format&fit=crop' },
  { id: 'coach_alex', name: 'Alex (Hiit & Athletic Performance)', gender: 'male', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=400&auto=format&fit=crop' },
  { id: 'coach_sarah', name: 'Sarah (Mindset & Shred)', gender: 'female', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400&auto=format&fit=crop' }
];

export default function Assistant() {
  const [selectedCoach, setSelectedCoach] = useState(COACHES[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Initial greeting sanitizer setup
    const defaultGreeting = `Hey there! I am ${selectedCoach.name}. Ready to dial in your nutrition, crush your workout protocol, and track your metrics today? Let's work.`;
    setMessages([{ sender: 'coach', text: defaultGreeting }]);
  }, [selectedCoach]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setErrorMessage(null);

        try {
      const contextOverride = customPrompt.trim() 
        ? `Adopt this persona explicitly: ${customPrompt.trim()}`
        : `You are ${selectedCoach.name}, an elite human fitness coach. Be direct, highly motivating, and authentic.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${contextOverride}\n\nUser: ${userMsg.text}` }] }]
        })
      });

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { sender: 'coach', text: aiText }]);
    } catch (err) {
      console.error('[AI Client] Send Failure:', err);
      setErrorMessage("Coach connection failed. Check your API key settings.");
        }
    
  

  return (
    <div className="min-h-screen text-white bg-neutral-950 p-4 pb-24">
      <div className="mb-6">
        <p className="text-xs font-black tracking-widest text-purple-500 uppercase">HQ PROTOTYPE</p>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase mt-0.5">FITNESS COMPANIONS</h1>
      </div>

      <Tier2Banner />

      {/* GitHub Auth Warning Status Banner */}
      <div className="bg-amber-500/10 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3 mb-6">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">GitHub Authorization Pending</h4>
          <p className="text-xs text-neutral-400 mt-1">App connection needs explicit grant to eliminate API connector routing timeouts.</p>
        </div>
      </div>

      {/* Modern Human Coach Selector */}
      <div className="space-y-2 mb-6">
        <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase px-1">Select Human Fitness Expert</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COACHES.map(coach => (
            <button
              key={coach.id}
              onClick={() => setSelectedCoach(coach)}
              className={`p-2 border rounded-xl flex flex-col items-center text-center gap-2 transition-all ${
                selectedCoach.id === coach.id 
                  ? 'bg-neutral-900 border-purple-500 shadow-lg' 
                  : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <img src={coach.img} alt={coach.name} className="w-14 h-14 rounded-full object-cover border border-neutral-700" />
              <span className="text-[11px] font-black tracking-tight leading-tight text-neutral-200">{coach.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text/Prompt Injection Field */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-4 mb-6 space-y-2">
        <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Custom Persona & Speech Engine
        </h3>
        <Input 
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Write exactly what you want them to focus on or say..."
          className="bg-neutral-950 border-neutral-800 text-xs h-10 focus-visible:ring-purple-500/50"
        />
      </div>

      {/* Chat Display Interface */}
      <div className="bg-neutral-900/20 border border-neutral-800/60 rounded-2xl flex flex-col h-[350px] overflow-hidden mb-4 shadow-inner">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-xl p-3 text-xs font-semibold leading-relaxed border ${
                  m.sender === 'user'
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-neutral-900 border-neutral-800/80 text-neutral-200'
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {errorMessage && (
            <div className="text-center text-[11px] text-red-400 font-bold p-2 bg-red-950/20 border border-red-900/40 rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800/60 bg-neutral-950 flex gap-2">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${selectedCoach.name.split(' ')[0]}...`}
            className="bg-neutral-900 border-neutral-800 text-xs h-10 focus-visible:ring-purple-500/50"
          />
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 h-10 w-10 p-0 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

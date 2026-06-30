import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const greetings = [
  "You're doing amazing, even if it doesn't feel like it. 💛",
  "Reminder: you don't have to have it all together. Nobody does.",
  "One thing at a time. You got this. 🫶",
  "Adulting is hard, but look at you — still showing up!",
  "Today's goal: survive. Bonus points for thriving. ✨",
  "You remembered to open this app. That's already a win.",
  "Be kind to yourself today. The dishes can wait.",
  "Plot twist: you're actually handling life better than you think.",
  "Even on the hard days, you're still doing the thing. 🌻",
  "You are not behind. You are exactly where you need to be.",
];

export default function AiGreeting() {
  const [timeGreeting, setTimeGreeting] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning! ☀️');
    else if (hour < 17) setTimeGreeting('Good afternoon! 🌤️');
    else if (hour < 21) setTimeGreeting('Good evening! 🌇');
    else setTimeGreeting('Still up? 🌙');
    setMessage(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-5 bg-card border border-border"
    >
      {/* Glow */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,100,20,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Daily Vibe</p>
        </div>
        <p className="text-lg font-bold text-foreground">{timeGreeting}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_NUMBERS = 80;
const MAX_PICKS = 10;
const DRAW_COUNT = 20;
const BALL_DROP_INTERVAL = 320;

export default function KenoGame() {
  const [balance, setBalance] = useState(2500);
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState('pick');
  const [revealedBalls, setRevealedBalls] = useState([]);
  const isRunningRef = useRef(false);

  const handlePlay = () => {
    if (phase !== 'pick' || isRunningRef.current) return;
    if (selected.length < 1) return;

    isRunningRef.current = true;
    setPhase('dropping');
    
    const shuffled = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const allBalls = shuffled.slice(0, DRAW_COUNT);

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setRevealedBalls(allBalls.slice(0, i));
      if (i >= allBalls.length) {
        clearInterval(timer);
        setPhase('result');
        isRunningRef.current = false;
      }
    }, BALL_DROP_INTERVAL);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔥 Fireball Keno</h1>
      <div className="grid grid-cols-10 gap-1 mb-4">
        {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => phase === 'pick' && setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])}
            className={`p-2 border ${selected.includes(n) ? 'bg-primary text-white' : 'bg-card'}`}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={handlePlay} className="w-full bg-primary text-white p-4 rounded-xl font-bold">
        {phase === 'dropping' ? 'DROPPING...' : 'PLAY GAME'}
      </button>
    </div>
  );
}

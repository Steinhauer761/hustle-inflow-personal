import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import { base44 } from '@/api/base44Client';

const TOTAL_NUMBERS = 80;
const MAX_PICKS = 10;
const DRAW_COUNT = 20;
const BALL_DROP_INTERVAL = 320;

const PAYOUT_TABLE_10 = { 4: 1, 5: 3, 6: 10, 7: 40, 8: 150, 9: 500, 10: 2000 };

function calcPayout(wager, picked, hits, fireballHits) {
  if (hits < 4) return 0;
  const table = picked === 10 ? PAYOUT_TABLE_10 : {};
  const multiplier = table[hits] || 0;
  if (multiplier === 0) return 0;
  return fireballHits > 0 ? (wager * multiplier) * Math.pow(4, fireballHits) : wager * multiplier;
}

export default function KenoGame() {
  const [balance, setBalance] = useState(2500);
  const [fireballMeter, setFireballMeter] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [selected, setSelected] = useState([]);
  const [wager] = useState(25);
  const [phase, setPhase] = useState('pick');
  const [drawn, setDrawn] = useState([]);
  const [fireballs, setFireballs] = useState([]);
  const [revealedBalls, setRevealedBalls] = useState([]);
  const isRunningRef = useRef(false);

  const saveGameState = async (newBalance, newMeter, newSpins) => {
    try {
      const settings = await base44.entities.UserSettings.list('-updated_date', 1);
      const payload = { keno_balance: newBalance, fireball_meter: newMeter, free_spins: newSpins };
      if (settings[0]) await base44.entities.UserSettings.update(settings[0].id, payload);
      else await base44.entities.UserSettings.create(payload);
    } catch (e) { console.error(e); }
  };

  const handlePlay = async () => {
    if (phase !== 'pick' || isRunningRef.current) return;
    if (selected.length < 1) return;
    
    isRunningRef.current = true;
    const newBalance = freeSpins > 0 ? balance : balance - wager;
    const newFreeSpins = freeSpins > 0 ? freeSpins - 1 : 0;
    
    setBalance(newBalance);
    setFreeSpins(newFreeSpins);
    
    const shuffled = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const regularDraw = shuffled.slice(0, DRAW_COUNT - 1);
    const fbArray = shuffled.slice(DRAW_COUNT - 1, DRAW_COUNT);

    setDrawn([...regularDraw, ...fbArray]);
    setFireballs(fbArray);
    setRevealedBalls([]);
    setPhase('dropping');

    let i = 0;
    const allBalls = [...regularDraw, ...fbArray];
    const timer = setInterval(() => {
      i++;
      setRevealedBalls(allBalls.slice(0, i));
      if (i >= allBalls.length) {
        clearInterval(timer);
        setTimeout(() => {
          setPhase('result');
          isRunningRef.current = false;
        }, 600);
      }
    }, BALL_DROP_INTERVAL);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔥 Fireball Keno</h1>
      <div className="grid grid-cols-10 gap-1 mb-4">
        {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => phase === 'pick' && setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n])}
            className={`p-2 border ${selected.includes(n) ? 'bg-primary' : 'bg-card'}`}>
            {n}
          </button>
        ))}
      </div>
      <button onClick={handlePlay} className="w-full bg-primary text-white p-4 rounded-xl">PLAY</button>
    </div>
  );
}

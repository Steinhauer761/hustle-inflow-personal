import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Coins } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const VALUE_MAP = { '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':11, 'Q':12, 'K':13, 'A':14 };

function createDeck() {
  const deck = [];
  for (let s of SUITS) {
    for (let v of VALUES) {
      deck.push({ suit: s, value: v, rank: VALUE_MAP[v] });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

// Poker hand evaluation
function evaluateHand(hand) {
  if (hand.length !== 5) return { name: 'High Card', mult: 0 };
  
  const ranks = hand.map(c => c.rank).sort((a,b) => a - b);
  const suits = hand.map(c => c.suit);
  
  const isFlush = suits.every(s => s === suits[0]);
  let isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);
  
  // Special case: A, 2, 3, 4, 5 straight
  if (!isStraight && ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 4 && ranks[3] === 5 && ranks[4] === 14) {
    isStraight = true;
  }

  const rankCounts = {};
  for (let r of ranks) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (isFlush && isStraight && ranks.includes(14) && ranks.includes(13)) return { name: 'Royal Flush', mult: 250 };
  if (isFlush && isStraight) return { name: 'Straight Flush', mult: 50 };
  if (counts[0] === 4) return { name: 'Four of a Kind', mult: 25 };
  if (counts[0] === 3 && counts[1] === 2) return { name: 'Full House', mult: 9 };
  if (isFlush) return { name: 'Flush', mult: 6 };
  if (isStraight) return { name: 'Straight', mult: 4 };
  if (counts[0] === 3) return { name: 'Three of a Kind', mult: 3 };
  if (counts[0] === 2 && counts[1] === 2) return { name: 'Two Pair', mult: 2 };
  
  // Jacks or better
  let hasJacksOrBetter = false;
  for (let r in rankCounts) {
    if (rankCounts[r] === 2 && parseInt(r) >= 11) hasJacksOrBetter = true;
  }
  
  if (hasJacksOrBetter) return { name: 'Jacks or Better', mult: 1 };
  
  return { name: 'High Card', mult: 0 };
}

const WAGER_OPTIONS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

export default function VideoPokerGame() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [settingsId, setSettingsId] = useState(null);
  
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [wager, setWager] = useState(25);
  const [phase, setPhase] = useState('betting'); // betting, holding, result
  const [resultMsg, setResultMsg] = useState('');
  const [payout, setPayout] = useState(0);

  useEffect(() => {
    base44.entities.UserSettings.filter({}).then(res => {
      if (res.length > 0) {
        setBalance(res[0].keno_balance || 0);
        setSettingsId(res[0].id);
      }
    });
  }, []);

  const updateBalance = async (newBalance) => {
    setBalance(newBalance);
    if (settingsId) {
      await base44.entities.UserSettings.update(settingsId, { keno_balance: newBalance });
    }
  };

  const handleDeal = () => {
    if (balance < wager) return;
    updateBalance(balance - wager);

    const newDeck = createDeck();
    const newHand = [newDeck.pop(), newDeck.pop(), newDeck.pop(), newDeck.pop(), newDeck.pop()];
    
    setDeck(newDeck);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setPhase('holding');
    setPayout(0);
    setResultMsg('');
  };

  const handleDraw = () => {
    const newDeck = [...deck];
    const newHand = [...hand];
    
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        newHand[i] = newDeck.pop();
      }
    }
    
    setDeck(newDeck);
    setHand(newHand);
    
    const evalResult = evaluateHand(newHand);
    const winAmount = wager * evalResult.mult;
    
    setResultMsg(evalResult.name);
    setPayout(winAmount);
    setPhase('result');
    
    if (winAmount > 0) {
      setBalance(prev => {
        const nb = prev + winAmount;
        if (settingsId) base44.entities.UserSettings.update(settingsId, { keno_balance: nb });
        return nb;
      });
    }
  };

  const toggleHold = (index) => {
    if (phase !== 'holding') return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const renderCard = (card, index) => {
    if (!card) return <div className="w-14 sm:w-16 h-20 sm:h-24 bg-primary/10 rounded-xl border-2 border-primary/20" />;
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    const isHeld = held[index];

    return (
      <div className="flex flex-col items-center">
        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 h-3 transition-opacity ${isHeld ? 'text-yellow-400 opacity-100' : 'opacity-0'}`}>HELD</span>
        <motion.button 
          whileTap={{ scale: phase === 'holding' ? 0.95 : 1 }}
          onClick={() => toggleHold(index)}
          className={`w-14 sm:w-16 h-20 sm:h-24 bg-white rounded-xl shadow-md flex flex-col justify-between p-1.5 border-2 transition-colors relative
            ${isHeld ? 'border-yellow-400 shadow-yellow-400/30' : 'border-slate-200'}`}
        >
          <span className={`text-sm font-bold self-start ${isRed ? 'text-red-500' : 'text-slate-800'}`}>{card.value}{card.suit}</span>
          <span className={`text-3xl self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 ${isRed ? 'text-red-500' : 'text-slate-800'}`}>{card.suit}</span>
          <span className={`text-sm font-bold self-end rotate-180 ${isRed ? 'text-red-500' : 'text-slate-800'}`}>{card.value}{card.suit}</span>
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Tier2Banner feature="Video Poker" />
      <div className="px-4 pt-6 max-w-2xl mx-auto flex flex-col min-h-[80vh]">
        
        <div className="w-full flex justify-between items-center mb-4">
            <Button variant="ghost" className="text-muted-foreground gap-1 px-2" onClick={() => navigate('/casino')}>
                <ChevronLeft className="w-4 h-4" /> Casino
            </Button>
            <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-display font-bold text-sm text-foreground">{balance.toLocaleString()}</span>
            </div>
        </div>

        <div className="flex gap-2 items-center text-orange-400 text-xs font-semibold mb-4 bg-orange-400/10 px-3 py-1.5 rounded-full self-center">
            <AlertTriangle className="w-3 h-3 shrink-0" /> Multiplayer coming soon. Single player active.
        </div>
        
        {/* Payout Table */}
        <div className="bg-card border border-border rounded-xl p-3 mb-4 text-[10px] sm:text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Royal Flush</span><span className="text-yellow-400 font-bold">250x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Str. Flush</span><span className="text-primary font-bold">50x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">4 of a Kind</span><span className="text-primary font-bold">25x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Full House</span><span className="text-primary font-bold">9x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Flush</span><span className="text-primary font-bold">6x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Straight</span><span className="text-primary font-bold">4x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">3 of a Kind</span><span className="text-primary font-bold">3x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Two Pair</span><span className="text-primary font-bold">2x</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Jacks+</span><span className="text-primary font-bold">1x</span></div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-blue-900/20 border border-blue-500/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner mb-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="h-12 flex items-center justify-center mb-4 z-10 w-full">
                <AnimatePresence mode="wait">
                    {phase === 'result' && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-2 rounded-2xl text-center">
                            <p className={`font-display font-bold text-lg ${payout > 0 ? 'text-yellow-400' : 'text-white'}`}>{resultMsg}</p>
                            {payout > 0 && <p className="text-yellow-400 font-bold text-sm">+{payout.toLocaleString()} Chips</p>}
                        </motion.div>
                    )}
                    {phase === 'holding' && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blue-400 font-bold uppercase tracking-widest text-sm">
                            Select cards to hold
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2 sm:gap-4 z-10 w-full">
                {hand.length === 0 ? (
                  [0,1,2,3,4].map(i => renderCard(null, i))
                ) : (
                  hand.map((card, i) => (
                    <motion.div key={`${phase}-${i}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        {renderCard(card, i)}
                    </motion.div>
                  ))
                )}
            </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg mt-auto">
            {phase === 'betting' || phase === 'result' ? (
                <div className="flex gap-3">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1.5">Bet Amount</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {[10, 50, 100, 500, 'MAX'].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setWager(preset === 'MAX' ? balance : preset)}
                                        className={`shrink-0 h-8 px-3 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                                            (preset === 'MAX' ? wager === balance && balance > 0 : wager === preset)
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : 'bg-muted border-primary/20 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full">
                                <Input 
                                    type="number" 
                                    min="1"
                                    max={balance}
                                    value={wager === 0 ? '' : wager} 
                                    onChange={(e) => setWager(parseInt(e.target.value) || 0)}
                                    className="h-10 border-primary/40 bg-muted font-bold text-base pl-3 pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase">Chips</span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        className="h-12 px-8 font-bold text-lg shadow-primary/30 shadow-lg" 
                        onClick={handleDeal}
                        disabled={balance < wager || wager <= 0}
                    >
                        Deal
                    </Button>
                </div>
            ) : (
                <Button className="w-full h-14 font-bold text-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30" onClick={handleDraw}>
                    DRAW
                </Button>
            )}
        </div>

      </div>
    </div>
  );
}
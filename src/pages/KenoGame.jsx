import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, Flame, Trophy, RotateCcw, Shuffle } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import Tier2Footer from '@/components/shared/Tier2Footer';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TOTAL_NUMBERS = 80;
const MAX_PICKS = 10;
const DRAW_COUNT = 20;
const HOUSE_TAKE = 0.0; // House edge is built into the multiplier table, not a direct cut
const BALL_DROP_INTERVAL = 320; // ms per ball

// Payout multipliers (of wager) based on picks vs hits
// [hits_needed_to_win][total_picked] -> multiplier
// Payout multipliers for picking 10 numbers
// Minimum 4 total hits (including fireball) to qualify.
const PAYOUT_TABLE_10 = {
  4: 1,
  5: 3,
  6: 10,
  7: 40,
  8: 150,
  9: 500,
  10: 2000,
};

// Legacy table kept for <10 picks (simplified, minimum 4 hits)
const PAYOUT_TABLE = {
  4: { 4: 10 },
  5: { 4: 3, 5: 30 },
  6: { 4: 2, 5: 10, 6: 100 },
  7: { 4: 1, 5: 4, 6: 30, 7: 300 },
  8: { 4: 1, 5: 3, 6: 15, 7: 100, 8: 1000 },
  9: { 4: 1, 5: 2, 6: 10, 7: 50, 8: 250, 9: 2000 },
};

// hits = total hits (including fireball hits)
// fireballHits = how many fireballs matched
// Win condition: 4+ hits. Fireball hit = ×4 payout multiplier for each fireball hit
function calcPayout(wager, picked, hits, fireballHits) {
  // Must have at least 4 hits to win
  if (hits < 4) return 0;
  
  let multiplier = 0;
  const table = picked === 10 ? PAYOUT_TABLE_10 : PAYOUT_TABLE[picked];
  if (!table) return 0;
  // Sort thresholds ascending and take the highest qualifying one
  const entries = Object.entries(table)
    .map(([h, m]) => [parseInt(h), m])
    .sort((a, b) => a[0] - b[0]);
  for (const [threshold, m] of entries) {
    if (hits >= threshold) multiplier = m;
  }
  if (multiplier === 0) return 0;
  const base = wager * multiplier;
  // Apply x4 multiplier for EACH fireball that hits
  return fireballHits > 0 ? base * Math.pow(4, fireballHits) : base;
}

const WAGER_OPTIONS_ROW1 = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const WAGER_OPTIONS_ROW2 = [5000, 10000, 20000, 50000, 100000, 500000];
const WAGER_OPTIONS = [...WAGER_OPTIONS_ROW1, ...WAGER_OPTIONS_ROW2];

const PROMO_BONUSES = [
  { condition: 'Hit 8+ on a single round', reward: '3 days free Tier 2 access' },
  { condition: 'Win 3 rounds in a row', reward: '500 bonus tokens' },
  { condition: 'Hit a Fireball match', reward: '100 bonus tokens' },
];

export default function KenoGame() {
  const [balance, setBalance] = useState(2500);
  const [fireballMeter, setFireballMeter] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [selected, setSelected] = useState([]);
  const [wager, setWager] = useState(25);
  const [phase, setPhase] = useState('pick'); // pick | dropping | result
  const [drawn, setDrawn] = useState([]);
  const [fireballs, setFireballs] = useState([]);
  const [revealedBalls, setRevealedBalls] = useState([]); // balls revealed so far
  const [tab, setTab] = useState('play');
  const [history, setHistory] = useState([]);
  const [winStreak, setWinStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Load balance from UserSettings on mount
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const settings = await base44.entities.UserSettings.list('-updated_date', 1);
        const userSettings = settings[0];
        if (userSettings?.keno_balance !== undefined) {
          setBalance(userSettings.keno_balance);
        } else {
          await base44.entities.UserSettings.create({ keno_balance: 2500, fireball_meter: 0, free_spins: 0 });
        }
        setFireballMeter(userSettings?.fireball_meter || 0);
        setFreeSpins(userSettings?.free_spins || 0);
      } catch (error) {
        console.error('Failed to load Keno balance:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBalance();
  }, []);

  // Save state to UserSettings
  const saveGameState = async (newBalance, newMeter = fireballMeter, newSpins = freeSpins) => {
    try {
      const settings = await base44.entities.UserSettings.list('-updated_date', 1);
      const userSettings = settings[0];
      const payload = { keno_balance: newBalance, fireball_meter: newMeter, free_spins: newSpins };
      if (userSettings) {
        await base44.entities.UserSettings.update(userSettings.id, payload);
      } else {
        await base44.entities.UserSettings.create(payload);
      }
    } catch (error) {
      console.error('Failed to save Keno state:', error);
    }
  };

  // Auto-save whenever values change (with small delay to batch updates)
  useEffect(() => {
    if (loading) return;
    const timeoutId = setTimeout(() => {
      saveGameState(balance, fireballMeter, freeSpins);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [balance, fireballMeter, freeSpins, loading]);

  // Save on unmount (when navigating away)
  useEffect(() => {
    return () => {
      if (!loading) {
        saveGameState(balance, fireballMeter, freeSpins);
      }
    };
  }, [balance, fireballMeter, freeSpins, loading]);

  const handleQuickPick = () => {
    if (phase !== 'pick') return;
    const pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setSelected(shuffled.slice(0, MAX_PICKS));
  };

  const toggleNumber = (n) => {
    if (phase !== 'pick') return;
    if (selected.includes(n)) {
      setSelected(s => s.filter(x => x !== n));
    } else if (selected.length < MAX_PICKS) {
      setSelected(s => [...s, n]);
    }
  };

  const handlePlay = async () => {
    if (selected.length < 1 || phase !== 'pick') return;
    if (balance < wager && freeSpins <= 0) return;

    // Deduct wager immediately unless it's a free spin
    const newBalance = freeSpins > 0 ? balance : balance - wager;
    const newFreeSpins = freeSpins > 0 ? freeSpins - 1 : 0;
    
    setBalance(newBalance);
    setFreeSpins(newFreeSpins);
    await saveGameState(newBalance, fireballMeter, newFreeSpins);

    // Generate draw
    const pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // Determine how many fireballs (2 for free spins, 1 for normal)
    const numFireballs = freeSpins > 0 ? 2 : 1;
    const regularDraw = shuffled.slice(0, DRAW_COUNT - numFireballs);
    const fbArray = shuffled.slice(DRAW_COUNT - numFireballs, DRAW_COUNT);

    setDrawn([...regularDraw, ...fbArray]);
    setFireballs(fbArray);
    setRevealedBalls([]);
    setPhase('dropping');

    // Drop balls one at a time
    let i = 0;
    const allBalls = [...regularDraw, ...fbArray];
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    intervalRef.current = setInterval(() => {
      i++;
      setRevealedBalls(allBalls.slice(0, i));
      if (i >= allBalls.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        // Short pause then show result
        setTimeout(async () => {
          const regularHits = selected.filter(n => regularDraw.includes(n));
          const fbHitsCount = fbArray.filter(n => selected.includes(n)).length;
          
          const totalHits = regularHits.length + fbHitsCount;
          const payout = calcPayout(wager, selected.length, totalHits, fbHitsCount);
          
          let newMeter = fireballMeter;
          let spinsToGive = 0;
          if (fbHitsCount > 0) {
            newMeter += fbHitsCount;
            if (newMeter >= 10) {
              newMeter = newMeter % 10;
              spinsToGive = 10;
            }
          }

          const finalFreeSpins = newFreeSpins + spinsToGive;
          const winBalance = newBalance + payout;
          
          if (payout > 0 || fbHitsCount > 0 || spinsToGive > 0) {
            setBalance(winBalance);
            setFireballMeter(newMeter);
            setFreeSpins(finalFreeSpins);
            await saveGameState(winBalance, newMeter, finalFreeSpins);
          }
          
          const won = payout > 0;
          setWinStreak(s => won ? s + 1 : 0);
          setHistory(h => [{
            round: Date.now(),
            picks: selected,
            draw: allBalls,
            fireballs: fbArray,
            hits: totalHits,
            fbHitsCount,
            wager: freeSpins > 0 ? 0 : wager,
            payout,
          }, ...h].slice(0, 20));
          setPhase('result');
        }, 600);
      }
    }, BALL_DROP_INTERVAL);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelected([]);
    setDrawn([]);
    setRevealedBalls([]);
    setFireballs([]);
    setPhase('pick');
  };

  const finalRegularHits = selected.filter(n => drawn.filter(d => !fireballs.includes(d)).includes(n));
  const finalFbHitsCount = fireballs.filter(n => selected.includes(n)).length;
  const finalTotalHits = finalRegularHits.length + finalFbHitsCount;
  const finalPayout = phase === 'result' ? calcPayout(wager, selected.length, finalTotalHits, finalFbHitsCount) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ paddingBottom: 'calc(14rem + env(safe-area-inset-bottom))' }}>
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Tier2Banner feature="Fireball Keno" />
        <div className="px-4 pt-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display flex items-center gap-2">
              🔥 Fireball Keno
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick up to {MAX_PICKS} · {freeSpins > 0 ? 'last 2 drawn are 🔥' : 'last drawn = 🔥'} (×4 each)
            </p>
          </div>
          {winStreak >= 2 && (
            <div className="flex items-center gap-1 bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold px-2 py-1 rounded-full">
              <Trophy className="w-3 h-3" /> {winStreak} streak!
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-4">
          {['play', 'promos', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize
                ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
            >
              {t === 'play' ? '🎱 Play' : t === 'promos' ? '🎁 Promos' : '📋 History'}
            </button>
          ))}
        </div>

        {/* ── PLAY TAB ── */}
        {tab === 'play' && (
          <>
            {/* Fireball Meter */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> Fireball Bonus Level</span>
                <span className="text-xs font-bold text-orange-500">{fireballMeter} / 10</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(fireballMeter / 10) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Fill the meter to trigger 10 Free Spins with an extra Fireball!</p>
            </div>

            {freeSpins > 0 && (
              <div className="bg-orange-500 text-white rounded-2xl p-3 mb-4 text-center font-bold animate-pulse shadow-lg shadow-orange-500/20">
                🎉 FREE SPINS ACTIVE: {freeSpins} REMAINING! (2 Fireballs)
              </div>
            )}

            {/* Picks counter */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs text-muted-foreground">Tap to pick your numbers</p>
              <p className="text-xs font-bold text-primary">{selected.length}/{MAX_PICKS} selected</p>
            </div>

            {/* Number Grid */}
            <div className="grid grid-cols-10 gap-1 mb-4">
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(n => {
                const isSelected = selected.includes(n);
                const isRevealed = revealedBalls.includes(n);
                const isFireball = fireballs.includes(n) && isRevealed;
                const isHit = isSelected && isRevealed && !isFireball;
                const isFBHit = isSelected && isFireball;
                const isMiss = isSelected && phase === 'result' && !drawn.includes(n);
                const isDrawnNotPicked = isRevealed && !isSelected && !isFireball;

                return (
                  <motion.button
                    key={n}
                    onClick={() => toggleNumber(n)}
                    whileTap={{ scale: 0.82 }}
                    animate={isFireball ? {
                      scale: [1, 1.25, 1],
                      transition: { duration: 0.5 }
                    } : isHit ? {
                      scale: [1, 1.15, 1],
                      transition: { duration: 0.3 }
                    } : {}}
                    className={`
                      aspect-square rounded-lg text-[10px] font-bold transition-colors relative overflow-hidden
                      ${isFBHit ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 ring-2 ring-orange-400' :
                        isFireball ? 'bg-orange-600/80 text-white shadow-md shadow-orange-500/40' :
                        isHit ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' :
                        isMiss ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                        isSelected ? 'bg-primary/25 text-primary border border-primary/50' :
                        isDrawnNotPicked ? 'bg-muted/70 text-muted-foreground' :
                        'bg-card border border-border text-foreground hover:border-primary/40'}
                    `}
                  >
                    {isFireball ? '🔥' : n}
                  </motion.button>
                );
              })}
            </div>

            {/* Payout Reference Table (10-pick) */}
            {selected.length === 10 && phase === 'pick' && (
              <div className="bg-card border border-border rounded-2xl p-3 mb-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">10-Pick Payout Guide (with 🔥)</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(PAYOUT_TABLE_10).map(([h, mult]) => {
                    const payout = wager * mult * 4; // Fireball ×4 required
                    return (
                      <div key={h} className="flex items-center justify-between bg-muted/50 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-muted-foreground">{h} hits + 🔥</span>
                        <span className="text-xs font-bold text-primary">{payout}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-orange-400 mt-2 text-center font-bold">🔥 Fireball required to win!</p>
              </div>
            )}

            {/* Dropping balls feed */}
            <AnimatePresence>
              {phase === 'dropping' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2 px-1">Balls Dropping…</p>
                  <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                    {revealedBalls.map((b, idx) => {
                      const isFB = fireballs.includes(b) && revealedBalls.indexOf(b) >= DRAW_COUNT - fireballs.length;
                      const isHitBall = selected.includes(b);
                      return (
                        <motion.div
                          key={`${b}-${idx}`}
                          initial={{ y: -30, opacity: 0, scale: 0.5 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow
                            ${isFB ? 'bg-orange-500 text-white ring-2 ring-orange-300 shadow-orange-500/50' :
                              isHitBall ? 'bg-primary text-primary-foreground shadow-primary/30' :
                              'bg-muted text-muted-foreground'}`}
                        >
                          {isFB ? '🔥' : b}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Banner */}
            <AnimatePresence>
              {phase === 'result' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-2xl p-4 mb-4 text-center border
                    ${finalPayout > 0 ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}
                >
                  {finalFbHitsCount > 0 && (
                    <motion.p
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-orange-400 font-bold text-sm mb-1"
                    >
                      {finalFbHitsCount > 1 ? '🔥🔥 DOUBLE FIREBALL HIT — Payout ×16!' : '🔥 FIREBALL HIT — Payout ×4!'}
                    </motion.p>
                  )}
                   <p className="text-xs text-muted-foreground mb-1">Round complete</p>
                   <p className="text-3xl font-display text-primary mb-0.5">
                     {finalTotalHits} / {selected.length} hits
                   </p>
                  {finalPayout > 0 ? (
                    <motion.p
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg font-bold text-accent"
                    >
                      +{finalPayout.toLocaleString()} tokens won!
                    </motion.p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No win this round — try again!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── PROMOS TAB ── */}
        {tab === 'promos' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1 mb-2">Win big &#8594; earn free access &amp; bonus tokens</p>
            {PROMO_BONUSES.map((promo, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                  🎁
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{promo.condition}</p>
                  <p className="text-xs text-primary font-semibold mt-0.5">→ {promo.reward}</p>
                </div>
              </div>
            ))}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mt-4">
              <p className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" /> How to Win
              </p>
              <p className="text-xs text-muted-foreground">
                Match <strong className="text-orange-400">3+ numbers</strong> to win! 
                Hit the 🔥 Fireball = <strong className="text-orange-400">×4 bonus payout</strong> on top!
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm font-bold text-foreground mb-1">How tokens work</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tokens are purchased in-app and used to play. 
                The house retains <strong className="text-foreground">20%</strong> of all wagers to keep the economy circulating. 
                The remaining <strong className="text-foreground">80%</strong> flows back to winners. 
                Promotions and free-access rewards are funded from the house share.
              </p>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No rounds played yet.</p>
            )}
            {history.map((h, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {h.hits} / {h.picks.length} hits {h.fbHitsCount > 0 ? '🔥'.repeat(h.fbHitsCount) : '❌'}
                  </span>
                  <span className={`text-xs font-bold ${h.payout > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                    {h.payout > 0 ? `+${h.payout} tokens` : (h.wager > 0 ? `−${h.wager} tokens` : 'Free Spin')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {h.picks.map(p => (
                    <span key={p}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg
                        ${h.draw.includes(p) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                    >{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Tier2Footer moduleName="Fireball Keno" />
      </div>
      </div> {/* close relative z-10 for page content */}

      {/* ── STICKY CASINO CONTROL BAR ── */}
      <div className="fixed left-0 right-0 z-[60]"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto px-3 pb-2 pt-2 md:pl-24">
          <div className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
             <div className="relative z-10">

            {/* Row 1: Balance + Wager chips */}
            <div className="flex items-center gap-3 mb-2.5">
              {/* Balance */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Coins className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Balance</p>
                  <p className="text-sm font-display text-foreground leading-tight">{balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 shrink-0" />

              {/* Wager chips - selector & input */}
              <div className="flex-1 overflow-hidden" data-no-swipe>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">Bet Amount</p>
                  <div className="flex gap-2 items-center">
                      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                          {[10, 50, 100, 500, 'MAX'].map((preset) => (
                              <button
                                  key={preset}
                                  disabled={phase !== 'pick'}
                                  onClick={() => setWager(preset === 'MAX' ? balance : preset)}
                                  className={`shrink-0 h-8 px-3 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                                      (preset === 'MAX' ? wager === balance && balance > 0 : wager === preset)
                                          ? 'bg-primary border-primary text-primary-foreground'
                                          : 'bg-background/50 border-white/10 text-muted-foreground hover:bg-background hover:text-foreground'
                                  }`}
                              >
                                  {preset}
                              </button>
                          ))}
                      </div>
                      <div className="relative shrink-0 w-24">
                          <Input 
                              type="number"
                              min="1"
                              max={balance}
                              value={wager === 0 ? '' : wager}
                              onChange={(e) => {
                                  if (phase === 'pick') {
                                    setWager(parseInt(e.target.value) || 0);
                                  }
                              }}
                              disabled={phase !== 'pick'}
                              className="h-8 border-white/10 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary font-bold shadow-inner pl-2 pr-8 text-xs"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-bold uppercase">Ch</span>
                      </div>
                  </div>
              </div>
            </div>

            {/* Row 2: Quick Pick + Play/Again button */}
            <div className="flex gap-2">
              {/* Quick Pick — only shown in pick phase */}
              {phase === 'pick' && (
                <button
                  onClick={handleQuickPick}
                  className="flex items-center gap-1.5 bg-card/60 hover:bg-card border border-white/10 text-foreground text-xs font-bold px-4 py-3 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Quick Pick
                </button>
              )}

              {/* Main action button */}
              {phase === 'pick' && (
                <button
                  onClick={handlePlay}
                  disabled={selected.length === 0 || balance < wager || wager <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Flame className="w-4 h-4" /> Play — {wager} tokens
                </button>
              )}
              {phase === 'dropping' && (
                <div className="flex-1 flex items-center justify-center gap-2 bg-background/50 border border-white/5 text-muted-foreground font-bold py-3 rounded-xl text-sm">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Dropping balls…
                </div>
              )}
              {phase === 'result' && (
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
              )}
            </div>
            
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
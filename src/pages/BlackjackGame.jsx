import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Coins, RotateCcw } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  const deck = [];
  for (let s of SUITS) {
    for (let v of VALUES) {
      deck.push({ suit: s, value: v });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function calculateHand(hand) {
  let sum = 0;
  let aces = 0;
  for (let card of hand) {
    const val = getCardValue(card);
    sum += val;
    if (val === 11) aces += 1;
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
}

const WAGER_OPTIONS = [10, 25, 50, 100, 250, 500, 1000];

export default function BlackjackGame() {
  const navigate = useNavigate();
  // Set unlimited starting balance for any active session
  const [balance, setBalance] = useState(99999);
  const [settingsId, setSettingsId] = useState(null);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [wager, setWager] = useState(25);
  const [phase, setPhase] = useState('betting'); // betting, playing, resolved
  const [resultMsg, setResultMsg] = useState('');
  const [payout, setPayout] = useState(0);

  useEffect(() => {
    base44.entities.UserSettings.list({}).then(res => {
      if (res && res.length > 0) {
        setSettingsId(res[0].id);
        // Force the app interface to give everyone infinite game play
        setBalance(99999);
      }
    });
  }, []);

  const updateBalance = async (newBalance) => {
    // Keep internal local balance looking maxed out
    setBalance(99999);
    console.log("[Game Hub] Database balance write bypassed to preserve unlimited status.");
  };

  const startGame = () => {
    // Bypassed database check to let anyone play completely unrestricted
    console.log("[Game Hub] Infinite credits active. Match started without deduction.");

    const newDeck = createDeck();
    const pHand = [newDeck.pop(), newDeck.pop()];
    const dHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    
    const pSum = calculateHand(pHand);
    if (pSum === 21) {
      setPhase('resolved');
      setResultMsg('Blackjack! 🎉');
      setBalance(prev => prev + Math.floor(wager * 2.5));
    } else {
      setPhase('playing');
    }
  };

  const hit = () => {
    const nextDeck = [...deck];
    const nextHand = [...playerHand, nextDeck.pop()];
    setDeck(nextDeck);
    setPlayerHand(nextHand);

    if (calculateHand(nextHand) > 21) {
      setPhase('resolved');
      setResultMsg('Bust! Dealer wins. 🪓');
    }
  };

  const stand = () => {
    let nextDeck = [...deck];
    let nextDealerHand = [...dealerHand];

    while (calculateHand(nextDealerHand) < 17) {
      nextDealerHand.push(nextDeck.pop());
    }

    setDeck(nextDeck);
    setDealerHand(nextDealerHand);

    const pSum = calculateHand(playerHand);
    const dSum = calculateHand(nextDealerHand);

    setPhase('resolved');

    if (dSum > 21) {
      setResultMsg('Dealer busts! You win! 🏆');
      setBalance(prev => prev + wager * 2);
    } else if (pSum > dSum) {
      setResultMsg('You win! 🏆');
      setBalance(prev => prev + wager * 2);
    } else if (pSum < dSum) {
      setResultMsg('Dealer wins. 💔');
    } else {
      setResultMsg('Push! Bet returned. 🤝');
      setBalance(prev => prev + wager);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-neutral-950 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/casino')} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black uppercase tracking-widest">Hustle Blackjack</h1>
      </div>

      <Tier2Banner />

      <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full space-y-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl shadow-xl">
          <Coins className="w-5 h-5 text-yellow-500 animate-bounce" />
          <span className="text-sm font-black tracking-wider text-neutral-200">TOKENS: {balance}</span>
        </div>

        {phase === 'betting' && (
          <div className="w-full bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-6 text-center space-y-4">
            <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase">Place Your Wager</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {WAGER_OPTIONS.map((amt) => (
                <Button 
                  key={amt} 
                  variant={wager === amt ? "default" : "outline"}
                  onClick={() => setWager(amt)}
                  className="rounded-xl font-bold transition-all active:scale-95"
                >
                  {amt}
                </Button>
              ))}
            </div>
            <Button 
              onClick={startGame} 
              className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 font-black tracking-wider rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              DEAL CARDS
            </Button>
          </div>
        )}

        {phase !== 'betting' && (
          <div className="w-full space-y-6">
            {/* Dealer Hand */}
            <div className="space-y-2">
              <h3 className="text-xs font-black tracking-widest text-neutral-500 uppercase">Dealer Hand ({phase === 'playing' ? '?' : calculateHand(dealerHand)})</h3>
              <div className="flex gap-2">
                {dealerHand.map((card, idx) => (
                  <div key={idx} className="w-16 h-24 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between p-2 shadow-md">
                    {phase === 'playing' && idx === 1 ? (
                      <div className="flex-1 flex items-center justify-center text-neutral-600 font-bold text-xl">?</div>
                    ) : (
                      <>
                        <span className={`text-sm font-bold ${['♥','♦'].includes(card.suit) ? 'text-red-500' : 'text-neutral-200'}`}>{card.value}</span>
                        <span className={`text-xl self-center ${['♥','♦'].includes(card.suit) ? 'text-red-500' : 'text-neutral-200'}`}>{card.suit}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Player Hand */}
            <div className="space-y-2">
              <h3 className="text-xs font-black tracking-widest text-neutral-400 uppercase">Your Hand ({calculateHand(playerHand)})</h3>
              <div className="flex gap-2">
                {playerHand.map((card, idx) => (
                  <div key={idx} className="w-16 h-24 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between p-2 shadow-md animate-fade-in">
                    <span className={`text-sm font-bold ${['♥','♦'].includes(card.suit) ? 'text-red-500' : 'text-neutral-200'}`}>{card.value}</span>
                    <span className={`text-xl self-center ${['♥','♦'].includes(card.suit) ? 'text-red-500' : 'text-neutral-200'}`}>{card.suit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Turn Actions */}
            {phase === 'playing' && (
              <div className="flex gap-4 w-full">
                <Button onClick={hit} className="flex-1 h-12 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl active:scale-95 transition-transform">HIT</Button>
                <Button onClick={stand} className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl active:scale-95 transition-transform">STAND</Button>
              </div>
            )}

            {phase === 'resolved' && (
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 text-center space-y-4">
                <h2 className="text-xl font-black tracking-wide">{resultMsg}</h2>
                <Button 
                  onClick={() => setPhase('betting')} 
                  className="w-full h-11 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

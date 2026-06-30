import { useState } from 'react';
import { motion } from 'framer-motion';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function CalendarCalculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(false);

  const press = (val) => {
    if (val === 'C') {
      setDisplay('0'); setPrev(null); setOp(null); setFresh(false);
    } else if (val === '±') {
      setDisplay(d => String(-parseFloat(d)));
    } else if (val === '%') {
      setDisplay(d => String(parseFloat(d) / 100));
    } else if (['÷', '×', '−', '+'].includes(val)) {
      setPrev(parseFloat(display));
      setOp(val);
      setFresh(true);
    } else if (val === '=') {
      if (op && prev !== null) {
        const cur = parseFloat(display);
        let result;
        if (op === '+') result = prev + cur;
        else if (op === '−') result = prev - cur;
        else if (op === '×') result = prev * cur;
        else if (op === '÷') result = cur !== 0 ? prev / cur : 'Error';
        setDisplay(String(parseFloat(result.toFixed(10))));
        setPrev(null); setOp(null); setFresh(false);
      }
    } else if (val === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return; }
      if (!display.includes('.')) setDisplay(d => d + '.');
    } else {
      if (fresh || display === '0') {
        setDisplay(val); setFresh(false);
      } else {
        setDisplay(d => d.length < 12 ? d + val : d);
      }
    }
  };

  const isOp = (v) => ['÷', '×', '−', '+'].includes(v);

  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Calculator</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Display */}
        <div className="px-4 py-4 text-right">
          <p className="text-xs text-muted-foreground h-4">
            {prev !== null ? `${prev} ${op}` : ''}
          </p>
          <p className="text-3xl font-bold text-foreground truncate">{display}</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-px bg-border">
          {BUTTONS.flat().map((btn, i) => {
            const isEquals = btn === '=';
            const isOperator = isOp(btn);
            const isTopRow = ['C', '±', '%'].includes(btn);
            const isZero = btn === '0';

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => press(btn)}
                className={`
                  ${isZero ? 'col-span-2' : ''}
                  py-4 text-lg font-semibold transition-colors
                  ${isEquals ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
                    isOperator ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                    isTopRow ? 'bg-muted text-muted-foreground hover:bg-muted/80' :
                    'bg-card text-foreground hover:bg-muted/50'}
                `}
              >
                {btn}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
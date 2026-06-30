import { useState, useEffect } from 'react';
import { Home, CalendarDays, Users, PawPrint, Compass, MessageCircle, FileUp, Settings, Plane, Check, Calendar, Wallet, ShoppingCart, UtensilsCrossed, Trophy, Dices, Briefcase, ReceiptText, DollarSign, CreditCard, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const TIER1_PATHS = [ '/sports', '/keno', '/jobs', '/wallet', '/invoices' ];
export const TIER2_PATHS = [ '/fitness', '/family' ];



export const ALL_NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/pricing', icon: CreditCard, label: 'Pricing' },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/planner', icon: CalendarDays, label: 'Planner' },
  { path: '/family', icon: Users, label: 'Family' },
  { path: '/pets', icon: PawPrint, label: 'Pets' },
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/assistant', icon: MessageCircle, label: 'AI Chat' },
  { path: '/files', icon: FileUp, label: 'Files' },
  { path: '/trips', icon: Plane, label: 'Trips' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/expenses', icon: DollarSign, label: 'Expenses' },
  { path: '/shopping', icon: ShoppingCart, label: 'Shopping' },
  { path: '/meal-planner', icon: UtensilsCrossed, label: 'Meals' },
  { path: '/sports', icon: Trophy, label: 'Sports' },
  { path: '/keno', icon: Dices, label: 'Keno' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/invoices', icon: ReceiptText, label: 'Invoices' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const CORE_ITEMS = ALL_NAV_ITEMS.filter(i => !TIER2_PATHS.includes(i.path) && !TIER3_PATHS.includes(i.path) && i.path !== '/settings');
const SHOWCASE_ITEMS = ALL_NAV_ITEMS.filter(i => TIER2_PATHS.includes(i.path));
const TIER3_ITEMS = ALL_NAV_ITEMS.filter(i => TIER3_PATHS.includes(i.path));

export const DEFAULT_PATHS = ['/', '/planner', '/family', '/pets', '/discover', '/assistant', '/trips', '/calendar', '/expenses', '/shopping', '/meal-planner', '/files'];
export const DEFAULT_PATHS_ADMIN = [...DEFAULT_PATHS, ...TIER2_PATHS, ...TIER3_PATHS];
const STORAGE_KEY = 'adulting_nav_paths';

export function useNavConfig(isTier2Unlocked = false, isTier3Unlocked = false) {
  const [paths, setPaths] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const missing2 = isTier2Unlocked ? TIER2_PATHS.filter(p => !parsed.includes(p)) : [];
      const missing3 = isTier3Unlocked ? TIER3_PATHS.filter(p => !parsed.includes(p)) : [];
      if (missing2.length > 0 || missing3.length > 0) {
        return [...parsed, ...missing2, ...missing3];
      }
      return parsed;
    }
    let defaultPaths = [...DEFAULT_PATHS];
    if (isTier2Unlocked) defaultPaths = [...defaultPaths, ...TIER2_PATHS];
    if (isTier3Unlocked) defaultPaths = [...defaultPaths, ...TIER3_PATHS];
    return defaultPaths;
  });

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const missing2 = isTier2Unlocked ? TIER2_PATHS.filter(p => !parsed.includes(p)) : [];
        const missing3 = isTier3Unlocked ? TIER3_PATHS.filter(p => !parsed.includes(p)) : [];
        if (missing2.length > 0 || missing3.length > 0) {
          setPaths([...parsed, ...missing2, ...missing3]);
        } else {
          setPaths(parsed);
        }
      }
    };
    window.addEventListener('navconfig-updated', handler);
    return () => window.removeEventListener('navconfig-updated', handler);
  }, [isTier2Unlocked, isTier3Unlocked]);

  // Build ordered deck: core pages first (user order), then Tier 2/3 at end, /settings excluded from swipe
  const corePaths = paths.filter(p => p !== '/settings' && !TIER2_PATHS.includes(p) && !TIER3_PATHS.includes(p));
  const tier2InDeck = paths.filter(p => TIER2_PATHS.includes(p));
  const tier3InDeck = paths.filter(p => TIER3_PATHS.includes(p));
  const ordered = [...corePaths, ...tier2InDeck, ...tier3InDeck, '/settings'];

  return ALL_NAV_ITEMS
    .filter(item => ordered.includes(item.path))
    .sort((a, b) => ordered.indexOf(a.path) - ordered.indexOf(b.path));
}

export function saveNavConfig(paths) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  window.dispatchEvent(new Event('navconfig-updated'));
}

export default function NavCustomizer({ open, onClose, isTier2Unlocked = false, isTier3Unlocked = false }) {
  const getDefault = () => {
    let defaults = [...DEFAULT_PATHS];
    if (isTier2Unlocked) defaults = [...defaults, ...TIER2_PATHS];
    if (isTier3Unlocked) defaults = [...defaults, ...TIER3_PATHS];
    return defaults;
  };

  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return getDefault();
  });

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSelected(JSON.parse(stored));
    }
  }, [open]);

  const toggle = (path) => {
    if (path === '/') return;
    if (selected.includes(path)) {
      if (selected.length <= 2) return;
      setSelected(s => s.filter(p => p !== path));
    } else {
      setSelected(s => [...s, path]);
    }
  };

  const handleSave = () => {
    saveNavConfig(selected);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize Pages</SheetTitle>
          <p className="text-xs text-muted-foreground">Choose which pages appear in swipe navigation. Home is always included.</p>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-1">Core Features</p>
          {CORE_ITEMS.map(item => {
            const isSelected = selected.includes(item.path);
            const isHome = item.path === '/';
            return (
              <button key={item.path} onClick={() => toggle(item.path)} disabled={isHome}
                className={cn("w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  isSelected ? "bg-primary/10 border-primary/30" : "bg-card border-border",
                  isHome && "opacity-60 cursor-not-allowed")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                  isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("font-bold text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>{item.label}</p>
                </div>
                {isHome && <span className="text-xs text-muted-foreground font-semibold">Always on</span>}
                {!isHome && isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}

          <p className="text-[10px] font-bold uppercase tracking-widest text-primary px-1 mt-4 mb-1">
            {isTier2Unlocked ? '⚡ Tier 2 — Unlocked' : '🔒 Tier 2 Preview'}
          </p>
          {SHOWCASE_ITEMS.map(item => {
            const isSelected = selected.includes(item.path);
            return (
              <button key={item.path} onClick={() => toggle(item.path)}
                className={cn("w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  isSelected ? "bg-primary/10 border-primary/30" : "bg-card border-border")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                  isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("font-bold text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                    {item.label} {isTier2Unlocked ? '' : '🔒'}
                  </p>
                  {!isTier2Unlocked && <p className="text-xs text-muted-foreground">Requires Tier 2</p>}
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}

          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 px-1 mt-4 mb-1">
            {isTier3Unlocked ? '⚡ Tier 3 — Unlocked' : '🔒 Tier 3 Preview'}
          </p>
          {TIER3_ITEMS.map(item => {
            const isSelected = selected.includes(item.path);
            return (
              <button key={item.path} onClick={() => toggle(item.path)}
                className={cn("w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  isSelected ? "bg-blue-500/10 border-blue-500/30" : "bg-card border-border")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                  isSelected ? "bg-blue-500/20 text-blue-500" : "bg-muted text-muted-foreground")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("font-bold text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                    {item.label} {isTier3Unlocked ? '' : '🔒'}
                  </p>
                  {!isTier3Unlocked && <p className="text-xs text-muted-foreground">Requires Tier 3</p>}
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={() => setSelected(getDefault())}>Reset</Button>
          <Button className="flex-1" onClick={handleSave}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

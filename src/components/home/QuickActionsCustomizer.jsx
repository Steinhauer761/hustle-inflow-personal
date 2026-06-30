import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVertical, Check, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Users, PawPrint, Compass, MessageCircle, Plus, Plane,
  CalendarDays, Wallet, ShoppingCart, UtensilsCrossed,
  FileUp, Calendar, Trophy, Dice5, Briefcase, Receipt, Dumbbell
} from 'lucide-react';

const TIER2_PATHS = ['/sports', '/keno', '/jobs', '/wallet-t2', '/invoices'];
const TIER3_PATHS = ['/fitness'];

// Use unique keys — two different Wallet paths caused key collisions
export const ALL_QUICK_ACTIONS = [
  { icon: Plus,           label: 'Add Task',  path: '/planner' },
  { icon: Users,          label: 'Family',    path: '/family' },
  { icon: PawPrint,       label: 'Pets',      path: '/pets' },
  { icon: Compass,        label: 'Discover',  path: '/discover' },
  { icon: MessageCircle,  label: 'AI Chat',   path: '/assistant' },
  { icon: Plane,          label: 'Trips',     path: '/trips' },
  { icon: CalendarDays,   label: 'Planner',   path: '/planner-full' },
  { icon: Calendar,       label: 'Calendar',  path: '/calendar' },
  { icon: Wallet,         label: 'Expenses',  path: '/expenses' },
  { icon: ShoppingCart,   label: 'Shopping',  path: '/shopping' },
  { icon: UtensilsCrossed,label: 'Meals',     path: '/meal-planner' },
  { icon: FileUp,         label: 'Files',     path: '/files' },
  // Tier 2 previews
  { icon: Trophy,         label: 'Sports',    path: '/sports' },
  { icon: Dice5,          label: 'Keno',      path: '/keno' },
  { icon: Briefcase,      label: 'Jobs',      path: '/jobs' },
  { icon: Wallet,         label: 'Wallet',    path: '/wallet-t2' },
  { icon: Receipt,        label: 'Invoices',  path: '/invoices' },
  // Tier 3
  { icon: Dumbbell,       label: 'Fitness',   path: '/fitness' },
];

// Map display paths to real routes (wallet-t2 is the preview wallet page)
const ROUTE_MAP = { '/planner-full': '/planner', '/wallet-t2': '/wallet' };
export function toRoute(path) { return ROUTE_MAP[path] || path; }

const STORAGE_KEY = 'home_quick_actions_v2';
const DEFAULT_PATHS = ['/planner', '/family', '/pets', '/discover', '/assistant', '/trips', '/calendar', '/expenses', '/shopping', '/meal-planner'];
const ALL_PATHS = ALL_QUICK_ACTIONS.map(a => a.path);

function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { paths: DEFAULT_PATHS, order: ALL_PATHS };
    const parsed = JSON.parse(stored);
    const order = [
      ...parsed.order.filter(p => ALL_PATHS.includes(p)),
      ...ALL_PATHS.filter(p => !parsed.order.includes(p)),
    ];
    const paths = parsed.paths.filter(p => ALL_PATHS.includes(p));
    return { paths, order };
  } catch {
    return { paths: DEFAULT_PATHS, order: ALL_PATHS };
  }
}

export function useQuickActionsConfig() {
  const [config, setConfig] = useState(() => {
    const { paths, order } = loadConfig();
    return order
      .filter(p => paths.includes(p))
      .map(p => ALL_QUICK_ACTIONS.find(a => a.path === p))
      .filter(Boolean);
  });

  useEffect(() => {
    const handler = () => {
      const { paths, order } = loadConfig();
      setConfig(
        order
          .filter(p => paths.includes(p))
          .map(p => ALL_QUICK_ACTIONS.find(a => a.path === p))
          .filter(Boolean)
      );
    };
    window.addEventListener('quickactions-updated', handler);
    return () => window.removeEventListener('quickactions-updated', handler);
  }, []);

  return config;
}

export function saveQuickActionsConfig(paths, order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ paths, order }));
    return true;
  } catch (error) {
    console.error('Failed to save quick actions config:', error);
    return false;
  }
}

export default function QuickActionsCustomizer({ open, onClose }) {
  const [selected, setSelected] = useState(DEFAULT_PATHS);
  const [order, setOrder] = useState(ALL_PATHS);

  // Reload from storage every time the sheet opens
  useEffect(() => {
    if (open) {
      const { paths, order: savedOrder } = loadConfig();
      setSelected(paths);
      setOrder(savedOrder);
    }
  }, [open]);

  // Build the ordered item list from current order state
  const orderedItems = order
    .map(p => ALL_QUICK_ACTIONS.find(a => a.path === p))
    .filter(Boolean);

  const toggle = (path) => {
    setSelected(s =>
      s.includes(path) ? s.filter(p => p !== path) : [...s, path]
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const next = [...order];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setOrder(next);
  };

  const handleSave = () => {
    const success = saveQuickActionsConfig(selected, order);
    if (success) {
      window.dispatchEvent(new Event('quickactions-updated'));
      toast.success('Quick access saved!');
      onClose();
    } else {
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleReset = () => {
    setSelected(DEFAULT_PATHS);
    setOrder(ALL_PATHS);
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] flex flex-col gap-0 p-0">
        <div className="px-6 pt-6 pb-3 shrink-0">
          <SheetTitle>Customize Quick Access</SheetTitle>
          <p className="text-xs text-muted-foreground mt-1">Drag ☰ to reorder · tap circle to show/hide on home.</p>
        </div>

        {/* Scrollable drag list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="quick-actions-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 py-1"
                >
                  {orderedItems.map((item, index) => {
                    const isOn = selected.includes(item.path);
                    const isTier2 = TIER2_PATHS.includes(item.path);
                    const isTier3 = TIER3_PATHS.includes(item.path);
                    // Show Tier 2 divider before first Tier 2 item
                    const prevIsTier2 = index > 0 && TIER2_PATHS.includes(orderedItems[index - 1]?.path);
                    const showTier2Divider = isTier2 && !prevIsTier2;
                    
                    const prevIsTier3 = index > 0 && TIER3_PATHS.includes(orderedItems[index - 1]?.path);
                    const showTier3Divider = isTier3 && !prevIsTier3;

                    return (
                      <Draggable key={item.path} draggableId={item.path} index={index}>
                        {(drag, snapshot) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                          >
                            {showTier2Divider && (
                              <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                                <Lock className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Tier 2 — Coming Soon</span>
                              </div>
                            )}
                            {showTier3Divider && (
                              <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                                <Lock className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Tier 3 — Coming Soon</span>
                              </div>
                            )}
                            <div
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl border transition-colors",
                                snapshot.isDragging
                                  ? "bg-card border-primary/50 shadow-xl"
                                  : isOn && !isTier2 && !isTier3
                                    ? "bg-primary/10 border-primary/30"
                                    : isOn && isTier2
                                      ? "bg-secondary/20 border-secondary/30"
                                      : isOn && isTier3
                                        ? "bg-blue-500/10 border-blue-500/30"
                                        : "bg-card border-border opacity-50"
                              )}
                            >
                              {/* Drag handle */}
                              <div
                                {...drag.dragHandleProps}
                                className="text-muted-foreground cursor-grab active:cursor-grabbing touch-none select-none p-0.5"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Icon */}
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                isOn && !isTier2 && !isTier3 ? "bg-primary/20" : isOn && isTier2 ? "bg-secondary/30" : isOn && isTier3 ? "bg-blue-500/20" : "bg-muted"
                              )}>
                                <item.icon className={cn(
                                  "w-4 h-4",
                                  isOn && !isTier2 && !isTier3 ? "text-primary" : isOn && isTier2 ? "text-secondary-foreground" : isOn && isTier3 ? "text-blue-500" : "text-muted-foreground"
                                )} />
                              </div>

                              {/* Label */}
                              <div className="flex-1 min-w-0">
                                <p className={cn("font-bold text-sm", isOn ? "text-foreground" : "text-muted-foreground")}>
                                  {item.label}
                                </p>
                                {isTier2 && (
                                  <span className="text-[10px] text-primary font-semibold">Tier 2 · Preview</span>
                                )}
                                {isTier3 && (
                                  <span className="text-[10px] text-blue-500 font-semibold">Tier 3 · Preview</span>
                                )}
                              </div>

                              {/* Toggle checkbox */}
                              <button
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => toggle(item.path)}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                  isOn && !isTier2 && !isTier3 ? "bg-primary border-primary" : "",
                                  isOn && isTier2 ? "bg-secondary border-secondary" : "",
                                  isOn && isTier3 ? "bg-blue-500 border-blue-500" : "",
                                  !isOn ? "border-muted-foreground/40 bg-transparent" : ""
                                )}
                              >
                                {isOn && <Check className="w-3 h-3 text-primary-foreground" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-2 px-4 py-4 shrink-0 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button className="flex-1" onClick={handleSave}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
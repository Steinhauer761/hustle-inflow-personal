import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Menu, X, Home, SlidersHorizontal, ChevronRight, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ALL_NAV_ITEMS, TIER2_PATHS, TIER3_PATHS, useNavConfig } from './NavCustomizer';
import NavCustomizer from './NavCustomizer';
import SwipeNav from './SwipeNav';
import PageSwipeDots from './PageSwipeDots';
import FloatingAIButton from '@/components/shared/FloatingAIButton';

const PULL_THRESHOLD = 72;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
    enabled: !!user,
  });

  const isGodMode = user?.role === 'admin' && settings?.admin_god_mode;
  const isPremium = settings?.description === 'PREMIUM_MEMBER' || isGodMode;
  
  // Actually, wait, let's treat the user as "Admin" for nav if they have the role AND god mode is on.
  // Or rather, the navigation drawer has special badges for "Admin"
  const isAdmin = user?.role === 'admin';
  const isNavUnlocked = isAdmin && settings?.admin_god_mode;
  
  const navItems = useNavConfig(isNavUnlocked || isPremium, isNavUnlocked || settings?.fitness_unlocked);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (scrollRef.current?.scrollTop > 0 || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta * 0.5, PULL_THRESHOLD + 20));
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => { window.location.reload(); }, 800);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  const coreItems = navItems.filter(i => !TIER2_PATHS.includes(i.path) && !TIER3_PATHS.includes(i.path) && i.path !== '/settings');
  const tier2Items = navItems.filter(i => TIER2_PATHS.includes(i.path));
  const tier3Items = navItems.filter(i => TIER3_PATHS.includes(i.path));

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Swipe navigation — horizontal swipe between pages */}
      <SwipeNav pages={navItems} />

      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            style={{ paddingTop: `calc(env(safe-area-inset-top) + 8px)` }}>
            <motion.div
              className="bg-card border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg text-xs font-semibold text-foreground"
              style={{ y: pullDistance - 20 }}>
              <motion.div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: isRefreshing ? 360 : pullProgress * 270 }}
                transition={isRefreshing ? { repeat: Infinity, duration: 0.6, ease: 'linear' } : {}} />
              {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-safe md:pb-4 md:pl-20"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div style={{ y: pullDistance }} transition={{ type: 'spring', stiffness: 300 }}>
          <Outlet />
        </motion.div>
      </main>

      {/* Page swipe dots — above bottom bar */}
      <PageSwipeDots pages={navItems} onCustomize={() => setShowCustomizer(true)} />

      {/* ── Mobile Bottom Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-sidebar backdrop-blur-xl border-t border-sidebar-border"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-between px-4 pt-2 pb-2 h-16">
            <Link to="/" className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all",
              location.pathname === '/' ? "bg-primary/20 text-primary" : "text-muted-foreground"
            )}>
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Home</span>
            </Link>

            <div className="flex-1 text-center">
              {(() => {
                const current = ALL_NAV_ITEMS.find(i => i.path === location.pathname);
                return current ? (
                  <span className="text-sm font-bold text-foreground">{current.label}</span>
                ) : null;
              })()}
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-muted-foreground hover:text-primary transition-all"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-bold">Menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Full-screen Nav Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-sidebar rounded-t-3xl md:hidden overflow-hidden"
              style={{ maxHeight: '88vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span className="font-display text-lg text-foreground">Navigation</span>
                  {isAdmin && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/30">Admin ⚡</span>
                  )}
                </div>
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(88vh - 120px)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">Core Features</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {coreItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button key={item.path} onClick={() => handleNav(item.path)}
                        className={cn("flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left",
                          isActive ? "bg-primary/20 border-primary/40" : "bg-card border-border hover:border-primary/30")}>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-primary/20" : "bg-muted")}>
                          <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <span className={cn("text-sm font-bold", isActive ? "text-primary" : "text-foreground")}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {tier2Items.length > 0 && (
                  <>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest px-1 mb-2", isNavUnlocked || isPremium ? "text-primary" : "text-muted-foreground")}>
                      {isNavUnlocked || isPremium ? '⚡ Tier 2 — Unlocked' : '🔒 Tier 2 Preview'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {tier2Items.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button key={item.path} onClick={() => handleNav(item.path)}
                            className={cn("flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left",
                              isActive ? "bg-primary/20 border-primary/40" : "bg-card border-border hover:border-primary/30")}>
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-primary/20" : "bg-muted")}>
                              <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <span className={cn("text-sm font-bold", isActive ? "text-primary" : "text-foreground")}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {tier3Items.length > 0 && (
                  <>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest px-1 mb-2", isNavUnlocked || settings?.fitness_unlocked ? "text-blue-500" : "text-muted-foreground")}>
                      {isNavUnlocked || settings?.fitness_unlocked ? '⚡ Tier 3 — Unlocked' : '🔒 Tier 3 Preview'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {tier3Items.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                          <button key={item.path} onClick={() => handleNav(item.path)}
                            className={cn("flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left",
                              isActive ? "bg-blue-500/10 border-blue-500/30" : "bg-card border-border hover:border-blue-500/30")}>
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-blue-500/20" : "bg-muted")}>
                              <item.icon className={cn("w-4 h-4", isActive ? "text-blue-500" : "text-muted-foreground")} />
                            </div>
                            <span className={cn("text-sm font-bold", isActive ? "text-blue-500" : "text-foreground")}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {!(isNavUnlocked || isPremium) && (
                  <button onClick={() => { setMenuOpen(false); navigate('/upgrade'); }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary/15 transition-all mb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-primary">Unlock Tier 2</p>
                      <p className="text-xs text-muted-foreground">$4.99/mo — Early access price</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary/60" />
                  </button>
                )}

                <div className="border-t border-border pt-4 mt-2 space-y-2">
                  <button onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Settings className="w-4 h-4 text-muted-foreground" /></div>
                    <span className="text-sm font-bold text-foreground flex-1 text-left">Settings</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { setMenuOpen(false); setShowCustomizer(true); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><SlidersHorizontal className="w-4 h-4 text-muted-foreground" /></div>
                    <span className="text-sm font-bold text-foreground flex-1 text-left">Customize Pages</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => base44.auth.logout()}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><LogOut className="w-4 h-4 text-destructive" /></div>
                    <span className="text-sm font-bold text-destructive flex-1 text-left">Log Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Side Nav ── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-sidebar backdrop-blur-xl border-r border-sidebar-border flex-col items-center py-6 gap-1 z-50 overflow-y-auto"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
        <div className="mb-4 text-2xl">🔥</div>
        {navItems.filter(item => item.path !== '/settings').map((item) => (
          <Link key={item.path} to={item.path} className="relative flex flex-col items-center gap-0.5 select-none shrink-0 min-w-[56px]">
            <div className={cn("relative p-2 rounded-2xl transition-all duration-300", location.pathname === item.path ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary")}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={cn("text-[10px] font-extrabold transition-colors", location.pathname === item.path ? "text-primary" : "text-muted-foreground")}>
              {item.label}
            </span>
          </Link>
        ))}
        <Link to="/settings" className="flex flex-col items-center gap-0.5">
          <div className={cn("p-2 rounded-2xl transition-all", location.pathname === '/settings' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary")}>
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-muted-foreground">Settings</span>
        </Link>
        <button onClick={() => setShowCustomizer(true)} className="flex flex-col items-center gap-0.5 mt-2">
          <div className="p-2 rounded-2xl text-muted-foreground hover:text-primary transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-muted-foreground">Edit</span>
        </button>
        <button onClick={() => base44.auth.logout()} className="flex flex-col items-center gap-0.5 mt-auto mb-2">
          <div className="p-2 rounded-2xl text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold text-muted-foreground">Logout</span>
        </button>
      </nav>

      <NavCustomizer open={showCustomizer} onClose={() => setShowCustomizer(false)} isTier2Unlocked={isNavUnlocked || isPremium} isTier3Unlocked={isNavUnlocked || settings?.fitness_unlocked} />

      {/* Floating AI Button — on every page */}
      <FloatingAIButton />
    </div>
  );
}
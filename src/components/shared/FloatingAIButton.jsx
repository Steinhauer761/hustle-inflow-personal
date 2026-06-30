import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, X, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function FloatingAIButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('aiButtonPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    base44.auth.me()
      .then(userData => setUser(userData))
      .catch(() => {});
  }, []);

  // Save position to localStorage when changed
  useEffect(() => {
    localStorage.setItem('aiButtonPosition', JSON.stringify(position));
  }, [position]);

  const handleAIClick = () => {
    navigate('/assistant');
    setShowMenu(false);
  };

  const handleEmailAdmin = () => {
    window.location.href = 'mailto:Steinhauer761@gmail.com?subject=Admin Question from HustleInFlow';
    setShowMenu(false);
  };

  // Don't show on login/register pages or if already on assistant
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/assistant'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Floating AI Button - Draggable anywhere */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          setPosition(p => ({ x: p.x + info.offset.x, y: p.y + info.offset.y }));
        }}
        animate={{ x: position.x, y: position.y }}
        className="fixed bottom-4 right-4 z-[70]"
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence>
          {showMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMenu(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-14 right-0 bg-card border border-border rounded-2xl shadow-2xl p-3 w-56"
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Need Help?</span>
                  <button onClick={() => setShowMenu(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAIClick}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all mb-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">AI Assistant</p>
                    <p className="text-[10px] text-muted-foreground">Ask anything</p>
                  </div>
                </button>

                <button
                  onClick={handleEmailAdmin}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted hover:bg-muted/70 border border-border transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Email Admin</p>
                    <p className="text-[10px] text-muted-foreground">For account issues</p>
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !isDragging && setShowMenu(!showMenu)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 border-2 border-primary-foreground/20 flex items-center justify-center hover:shadow-xl hover:shadow-primary/50 transition-all cursor-grab active:cursor-grabbing"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </>
  );
}
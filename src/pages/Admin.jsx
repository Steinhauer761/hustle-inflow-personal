import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Calendar, Loader2, UserX, ShieldCheck, ChevronDown, Hash, Clock, User, Megaphone, Share2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

function UserCard({ u, currentUser, onChangeRole, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Main row */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
          {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-foreground truncate">{u.full_name || 'No name set'}</p>
            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
              <Shield className="w-2.5 h-2.5 mr-0.5" />{u.role || 'user'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-xl hover:bg-muted transition-colors shrink-0"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <User className="w-3 h-3" /> Full Name
                  </p>
                  <p className="text-sm font-semibold text-foreground">{u.full_name || '—'}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Role
                  </p>
                  <p className="text-sm font-semibold text-foreground capitalize">{u.role || 'user'}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5 col-span-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm font-semibold text-foreground break-all">{u.email}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Ago
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {u.created_date ? formatDistanceToNow(new Date(u.created_date), { addSuffix: true }) : '—'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 space-y-0.5 col-span-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                    <Hash className="w-3 h-3" /> User ID
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">{u.id}</p>
                </div>
              </div>

              {/* Actions */}
              {u.email !== currentUser?.email && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {u.role !== 'admin' ? (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => onChangeRole(u, 'admin')}>
                      <ShieldCheck className="w-3 h-3 mr-1" /> Make Admin
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-muted-foreground border-border hover:bg-muted"
                      onClick={() => onChangeRole(u, 'user')}>
                      <Shield className="w-3 h-3 mr-1" /> Demote to User
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                        <UserX className="w-3 h-3 mr-1" /> Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {u.full_name || u.email}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes their account. They can sign up again fresh with the same email if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDelete(u)}
                        >
                          Yes, Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              {u.email === currentUser?.email && (
                <p className="text-xs text-muted-foreground italic">This is your account</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    enabled: user?.role === 'admin',
  });

  // Block access while auth is loading OR if user is not admin
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const handleChangeRole = async (u, newRole) => {
    await base44.entities.User.update(u.id, { role: newRole });
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    toast.success(`${u.full_name || u.email} is now a ${newRole}`);
  };

  const handleDelete = async (u) => {
    await base44.entities.User.delete(u.id);
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    toast.success(`${u.full_name || u.email} has been deleted`);
  };

  const admins = users.filter(u => u.role === 'admin');
  const regular = users.filter(u => u.role !== 'admin');

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">🛡️ Admin</p>
        <h1 className="text-2xl font-display text-foreground">User Management</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-2xl border border-border p-3 text-center">
                <p className="text-2xl font-display text-foreground">{users.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3 text-center">
                <p className="text-2xl font-display text-primary">{admins.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admins</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3 text-center">
                <p className="text-2xl font-display text-foreground">{regular.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Users</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Promotional Emails Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-primary/30 rounded-2xl p-5 cursor-pointer hover:border-primary/60 transition-all flex flex-col h-full"
                  onClick={() => navigate('/promo-emails')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Promotional Emails</h3>
                      <p className="text-xs text-muted-foreground">Send campaigns to drive traffic</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
                    Create and send promotional emails to users and external contacts. Drive traffic, announce features, and boost engagement.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary font-semibold">
                    <span>Launch Campaign →</span>
                  </div>
                </motion.div>

                {/* Marketing Hub Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-card border border-primary/30 rounded-2xl p-5 cursor-pointer hover:border-primary/60 transition-all flex flex-col h-full"
                  onClick={() => navigate('/marketing-hub')}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <Share2 className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Marketing Hub</h3>
                      <p className="text-xs text-muted-foreground">Social media strategies</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">
                    Access pre-written scripts for TikTok, Reels, and community posts. Perfect for promoting the app and gaining new users.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-500 font-semibold">
                    <span>Open Hub →</span>
                  </div>
                </motion.div>
            </div>

            {/* Admins */}
            {admins.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-primary px-1">Admins</p>
                {admins.map(u => (
                  <UserCard key={u.id} u={u} currentUser={user} onChangeRole={handleChangeRole} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* Users */}
            {regular.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Users</p>
                {regular.map(u => (
                  <UserCard key={u.id} u={u} currentUser={user} onChangeRole={handleChangeRole} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
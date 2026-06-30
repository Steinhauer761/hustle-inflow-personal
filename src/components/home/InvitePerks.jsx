import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Gift, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PERKS = [
  { threshold: 1, emoji: '🎨', label: 'Custom Themes', desc: 'Unlock colour theme options' },
  { threshold: 3, emoji: '⚡', label: 'Sports Preview+', desc: 'Enhanced sports lounge preview' },
  { threshold: 5, emoji: '🏅', label: 'Early Access Badge', desc: 'Exclusive founder badge in-app' },
];

export default function InvitePerks({ user }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/landing?ref=${user?.id?.slice(0, 8) || 'hustle'}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      subject: `${user?.full_name || 'A friend'} invited you to HustleInFlow!`,
      body: `Hey!\n\n${user?.full_name || 'Someone'} thought you'd love HustleInFlow — the all-in-one life management platform.\n\nClick here to get started for free:\n${referralLink}\n\nSee you inside! 🔥`,
    });
    setSent(true);
    setEmail('');
    setSending(false);
    toast.success('Invite sent! 🎉');
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">Invite Friends, Earn Perks</h3>
        </div>
        <p className="text-xs text-muted-foreground">Invite friends and unlock exclusive rewards as you grow.</p>
      </div>

      {/* Perks ladder */}
      <div className="px-5 py-4 space-y-3 border-b border-border">
        {PERKS.map((p, i) => (
          <div key={p.threshold} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base shrink-0">
              {p.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
              {p.threshold} invite{p.threshold > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Referral Link</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground truncate font-mono">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 bg-primary/10 border border-primary/30 text-primary rounded-xl px-3 py-2 transition-all hover:bg-primary/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Email invite */}
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="friend@email.com"
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={sendInvite}
            disabled={sending || !email.trim()}
            className="shrink-0 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
        {sent && <p className="text-accent text-xs font-semibold">✅ Invite sent successfully!</p>}
      </div>
    </div>
  );
}
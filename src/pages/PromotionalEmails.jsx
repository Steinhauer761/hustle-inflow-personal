import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Users, Plus, X, Check, Loader2, Tag, BarChart3, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import PromoBanner from '@/components/shared/PromoBanner';

export default function PromotionalEmails() {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState(['']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);

  const addRecipient = () => setRecipients([...recipients, '']);
  const removeRecipient = (index) => setRecipients(recipients.filter((_, i) => i !== index));
  const updateRecipient = (index, value) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const copyToClipboard = async (text, name) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${name} copied to clipboard!`);
  };

  const handleSend = async () => {
    const validEmails = recipients.filter(e => e.trim() && e.includes('@'));
    
    if (validEmails.length === 0) {
      toast.error('Please add at least one valid email');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const response = await base44.functions.invoke('sendPromotionalEmail', {
        recipientEmails: validEmails,
        subject,
        messageBody: message,
        campaignName: campaignName || 'Promotional Campaign',
        adminEmail: adminEmail,
      });

      setResults(response.data);
      toast.success(`Sent to ${response.data.sentCount} recipients! Report sent to your email.`);
      
      // Reset form
      setRecipients(['']);
      setSubject('');
      setMessage('');
      setCampaignName('');
    } catch (error) {
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const quickTemplates = [
    {
      name: '🎯 Feature Launch (Professional)',
      subject: '🚀 Your Life Just Got an Upgrade',
      message: 'Hey there!\n\nRemember when you had 10 different apps open just to manage your day? Yeah, we do too. That\'s why we built HustleInFlow.\n\n✨ NEW Tier 2 Features Just Dropped:\n• Sports Lounge with live Canadian scores\n• Jobs Board with LinkedIn integration  \n• Keno games (because why not?)\n• AI-powered Photo Books\n\n🎁 Early Bird Special: 3 months for just $5.99\nUse code: HUSTLE2026\n\nReady to finally have your life together? (Well, almost.)\n\n— HustleInFlow Team',
    },
    {
      name: '💰 Discount Offer (Urgent)',
      subject: '⏰ This Offer Expires Faster Than Your New Year\'s Resolutions',
      message: 'Let\'s be honest - you\'ve been meaning to get organized since... what, January?\n\nGood news: HustleInFlow makes it actually easy this time.\n\n🔥 LIMITED TIME: 67% OFF\n3 months of premium features for $5.99\n(That\'s less than your daily coffee)\n\nCode: HUSTLE2026\n\nWhat you get:\n✓ Family & pet management\n✓ Budget tracking (your wallet will thank you)\n✓ Meal planning (no more "what\'s for dinner?")\n✓ Trip planning, job board, sports tracking & more\n\nThis offer won\'t last forever. Unlike your gym membership.\n\n— HustleInFlow',
    },
    {
      name: '😄 Humorous (Relatable)',
      subject: 'Confession: We Built This Because We\'re Terrible at Adulting',
      message: 'Hey,\n\nLet\'s face it - adulting is hard. Between remembering vet appointments, tracking expenses, planning meals, and somehow not forgetting your mom\'s birthday... it\'s a lot.\n\nSo we built HustleInFlow to do the remembering for you.\n\n🧠 What It Does:\n• Manages your family\'s chaos (kids, pets, everyone)\n• Tracks your spending (ouch, but necessary)\n• Plans your meals (no more takeout guilt)\n• Plans trips, tracks jobs, monitors sports scores\n• Basically runs your life while you focus on... living it\n\n🎉 Special Deal: 3 months for $5.99\nCode: HUSTLE2026\n\nBecause you\'ve got enough to remember already.\n\n— HustleInFlow (Your New Favorite App)',
    },
    {
      name: '📊 Problem/Solution (Direct)',
      subject: 'Tired of This? → [Lists 5 Things Everyone Hates]',
      message: '❌ Forgetting appointments\n❌ Overspending (thanks, impulse buys)\n❌ "What\'s for dinner?" panic at 6pm\n❌ Missing pet vet visits\n❌ Losing track of job applications\n\nSound familiar?\n\n✅ HustleInFlow fixes all of it.\n\nOne app. Your entire life. Finally organized.\n\n🎁 Try Premium for 67% Off\n3 months = $5.99\nCode: HUSTLE2026\n\nStop juggling. Start thriving.\n\n— HustleInFlow Team',
    },
    {
      name: '🎪 FOMO (Fear of Missing Out)',
      subject: 'Everyone\'s Using This Except You...',
      message: 'Hey,\n\nWhile you\'re reading this, someone just:\n✓ Planned their entire week in 5 minutes\n✓ Saved $200 by tracking expenses\n✓ Found a job through our Jobs Board\n✓ Booked a trip without the stress\n✓ Actually remembered their anniversary\n\nThat someone could be you.\n\n🚀 HustleInFlow Premium\n3 months for $5.99 (67% off)\nCode: HUSTLE2026\n\nJoin thousands who finally got their act together.\n\nP.S. This discount expires soon. Don\'t be the person who misses out on saving money. That\'s ironic.\n\n— HustleInFlow',
    },
  ];

  const redditTemplates = [
    {
      name: 'Reddit - r/Entrepreneur (Humorous)',
      platform: 'Reddit',
      content: `**Confession: I built this because I'm terrible at adulting**

Look, I forgot my mom's birthday last month. Again. My dog's vet appointment? Double-booked. My budget? LOL.

So I did what any sane person would do: I built an app to fix my life.

**Enter HustleInFlow:**
✓ Family management (never miss a birthday)
✓ Pet care tracking (vet visits, medications)
✓ Expense tracking (yes, I see how much I spend on coffee)
✓ Meal planning (no more 6pm panic)
✓ Trip planning, job board, sports tracking
✓ Basically everything except doing your taxes

**For the Reddit Community:**
3 months premium for $5.99 (67% off)
Code: **HUSTLE2026**

No VC funding, no corporate BS. Just one person who wanted to stop forgetting stuff.

Try it: [Link]

What's the one thing you always forget?`,
    },
    {
      name: 'Reddit - r/Productivity (Honest)',
      platform: 'Reddit',
      content: `**I tracked my productivity for a year. Here's what I learned.**

Spoiler: I was terrible at it.

The problem wasn't motivation - it was having 7 different apps for 7 different things. Tasks in one place, budget in another, meals somewhere else...

So I built **HustleInFlow** to consolidate everything:

**What Actually Works:**
- Task management (with reminders you'll actually see)
- Family/pet profiles (allergies, preferences, important dates)
- Budget tracking with receipt scanning
- Meal planner → auto-generates shopping list
- Trip planning without the spreadsheet nightmare
- Job application tracker

**The Result:** I actually use it. Every day.

**Reddit Deal:** 3 months for $5.99
Code: HUSTLE2026

[Link to app]

AMA about building a productivity app while being unproductive.`,
    },
    {
      name: 'Facebook/Instagram (Witty)',
      platform: 'Social',
      content: `✨ YOUR LIFE IN ONE APP ✨
(Because you already have 47 tabs open)

**HustleInFlow** = Finally having your act together

📅 REMEMBER STUFF
Tasks, appointments, birthdays (mom will be thrilled)

👨‍👩‍👧‍👦 MANAGE CHAOS
Family schedules, pet care, meal planning

💰 STOP OVERSPENDING
Budget tracking (coffee addicts welcome)

🎯 ACTUALLY THRIVE
Job board, trip planning, sports scores & more

🔥 LIMITED OFFER
3 Months Premium: $5.99 (67% OFF!)
Code: HUSTLE2026

👉 Your Future Organized Self Says Thanks
[Link to app]

#AdultingIsHard #LifeHacks #Productivity #HustleInFlow #FinallyOrganized`,
    },
    {
      name: 'LinkedIn (Professional)',
      platform: 'LinkedIn',
      content: `**The average person uses 4-5 apps to manage daily life.**

We asked: "Why?"

Introducing **HustleInFlow** - the unified life management platform that combines:

✓ Family & household management
✓ Financial tracking & budgeting
✓ Meal planning & nutrition
✓ Travel coordination
✓ Career & job search tools
✓ Wellness & sports tracking

**Built for modern families who value:**
- Efficiency over complexity
- Integration over fragmentation
- Results over features

**Early Access Offer:**
3 months premium at 67% off
Code: HUSTLE2026

Learn more: [Link]

#Productivity #FamilyTech #LifeManagement #Innovation #HustleInFlow`,
    },
  ];

  const applyTemplate = (template) => {
    setSubject(template.subject);
    setMessage(template.message);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="px-6 pt-6 pb-20 max-w-6xl mx-auto">
        {/* Promo Banner */}
        <PromoBanner variant="teal" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Email Campaign Manager</h1>
                <p className="text-sm text-muted-foreground">Send professional newsletters & track engagement</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/campaign-analytics')}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </Button>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Email Campaigns</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">Send professional newsletters to potential users with tracking pixels for open rates</p>
            </div>
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Social Media Ads</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">Ready-to-post templates for Reddit, Facebook, and Instagram to drive traffic</p>
            </div>
            <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Admin Notifications</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">Automatic email reports with full campaign details sent to your inbox</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Templates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Email Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickTemplates.map((template, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(template)}
                className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/40 transition-all"
              >
                <p className="text-xs font-bold text-foreground mb-1">{template.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{template.subject}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Social Media Templates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Social Media & Ad Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {redditTemplates.map((template, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 hover:border-accent/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground">{template.name}</p>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => copyToClipboard(template.content, template.name)}>
                    <Copy className="w-3 h-3 text-accent" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-3 mb-3">{template.content}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    {template.platform}
                  </span>
                  <span className="text-[9px] text-muted-foreground">Click copy to use</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Campaign Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6">
          
          {/* Admin Email Notification */}
          <div className="mb-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <label className="text-xs font-bold text-foreground mb-2 block flex items-center gap-2">
              <Mail className="w-3 h-3 text-primary" /> Send Campaign Report To
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              ✓ You'll receive a detailed email with sent count, open rates, and full campaign details
            </p>
          </div>

          {/* Campaign Name */}
          <div className="mb-4">
            <label className="text-xs font-bold text-foreground mb-2 block">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Summer Promotion 2026"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Recipients */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground">Recipient Emails</label>
              <Button variant="ghost" size="sm" onClick={addRecipient} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {recipients.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  {recipients.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeRecipient(index)}
                      className="w-10 h-10 hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Add emails from your mailing list, leads from Reddit ads, or potential customers
            </p>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="text-xs font-bold text-foreground mb-2 block">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Catchy subject that gets opens..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="text-xs font-bold text-foreground mb-2 block">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your promotional message here..."
              rows={10}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              💡 Tip: Include promo code HUSTLE2026 and a clear call-to-action
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Campaign...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Send Campaign & Email Me Report</>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Campaign Sent Successfully!
            </h3>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-foreground mb-2">
                ✓ A detailed report has been sent to <strong className="text-primary">{adminEmail || 'your email'}</strong>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Check your email for complete campaign details including all recipients, subject, and full message content.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-primary">{results.sentCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sent</p>
              </div>
              <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{results.totalRecipients}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              </div>
              {results.failedCount > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-destructive">{results.failedCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Failed</p>
                </div>
              )}
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {results.results.map((result, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{result.email}</span>
                  <span className={`font-bold ${result.status === 'sent' ? 'text-emerald-400' : 'text-destructive'}`}>
                    {result.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
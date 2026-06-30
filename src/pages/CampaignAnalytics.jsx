import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, TrendingUp, Users, Eye, Calendar, ArrowLeft, BarChart3, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import PromoBanner from '@/components/shared/PromoBanner';
import { useNavigate } from 'react-router-dom';

export default function CampaignAnalytics() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const data = await base44.entities.EmailCampaign.list('-sent_date');
      return data;
    },
    initialData: [],
  });

  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
    totalOpens: campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0),
    avgOpenRate: campaigns.length > 0 
      ? Math.round((campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0) / 
          Math.max(campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0), 1)) * 100)
      : 0,
  };

  const CampaignCard = ({ campaign }) => {
    const openRate = campaign.sent_count > 0 
      ? Math.round((campaign.open_count / campaign.sent_count) * 100) 
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all"
        onClick={() => setSelectedCampaign(campaign)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">{campaign.campaign_name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{campaign.subject}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {new Date(campaign.sent_date).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric' 
            })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background rounded-lg p-2 text-center">
            <p className="text-lg font-display font-bold text-foreground">{campaign.sent_count}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Sent</p>
          </div>
          <div className="bg-background rounded-lg p-2 text-center">
            <p className="text-lg font-display font-bold text-primary">{campaign.open_count}</p>
            <p className="text-[9px] text-muted-foreground uppercase">Opens</p>
          </div>
          <div className="bg-background rounded-lg p-2 text-center">
            <p className="text-lg font-display font-bold text-accent">{openRate}%</p>
            <p className="text-[9px] text-muted-foreground uppercase">Rate</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const CampaignDetail = ({ campaign, onBack }) => {
    const openRate = campaign.sent_count > 0 
      ? Math.round((campaign.open_count / campaign.sent_count) * 100) 
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="w-9 h-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{campaign.campaign_name}</h2>
            <p className="text-xs text-muted-foreground">{campaign.subject}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-primary mb-1">{campaign.sent_count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sent</p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-accent mb-1">{campaign.open_count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Opens</p>
          </div>
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-foreground mb-1">{openRate}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Open Rate</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-display font-bold text-foreground mb-1">
              {new Date(campaign.sent_date).toLocaleDateString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sent Date</p>
          </div>
        </div>

        {/* Recipients List */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Recipients
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {campaign.recipients?.map((recipient, i) => (
              <div key={i} className="flex items-center justify-between bg-background rounded-lg p-3 text-xs">
                <span className="text-foreground">{recipient.email}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    recipient.status === 'sent' ? 'text-emerald-400' : 'text-destructive'
                  }`}>
                    {recipient.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                  </span>
                  {recipient.opened_at && (
                    <span className="text-[10px] text-accent flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Opened
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Message Preview</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard(campaign.message, 'message', 'Message')}
              className="h-7 text-xs"
            >
              {copiedId === 'message' ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
              {copiedId === 'message' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{campaign.message}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="px-6 pt-6 pb-12 max-w-6xl mx-auto">
        {/* Promo Banner */}
        <PromoBanner variant="teal" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Campaign Analytics</h1>
                <p className="text-sm text-muted-foreground">Track email performance and open rates</p>
              </div>
            </div>
            <Button onClick={() => navigate('/promo-emails')} className="bg-primary hover:bg-primary/90">
              <Mail className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </div>

          {/* App Overview */}
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-display font-bold text-foreground mb-1">HustleInFlow - Complete Life Management Platform</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  HustleInFlow is an all-in-one solution for managing family, pets, tasks, expenses, meals, trips, job applications, sports tracking, photo books, and music. 
                  Built for Canadian families who want to simplify their lives with premium features at an affordable price.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-primary">📅</p>
                <p className="text-[9px] text-muted-foreground">Smart Planning</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-accent">👨‍👩‍👧‍👦</p>
                <p className="text-[9px] text-muted-foreground">Family & Pets</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-emerald-400">💰</p>
                <p className="text-[9px] text-muted-foreground">Budgeting</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-secondary">🍽️</p>
                <p className="text-[9px] text-muted-foreground">Meal Planning</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-destructive">🏆</p>
                <p className="text-[9px] text-muted-foreground">Sports Lounge</p>
              </div>
            </div>

            <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-[10px] text-foreground">
                <strong className="text-primary">🔥 Limited Offer:</strong> 3 months of Tier 2 premium features for just <strong>$5.99</strong> (67% off!) 
                Use code: <strong className="text-primary">HUSTLE2026</strong>
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground mb-1">{stats.totalCampaigns}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Campaigns</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-primary mb-1">{stats.totalSent}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Sent</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-accent mb-1">{stats.totalOpens}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Opens</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-emerald-400 mb-1">{stats.avgOpenRate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Open Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {selectedCampaign ? (
          <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> All Campaigns
            </h3>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">Loading campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-bold text-foreground mb-2">No campaigns yet</p>
                <p className="text-xs text-muted-foreground mb-4">Start by creating your first email campaign</p>
                <Button onClick={() => navigate('/promo-emails')} className="bg-primary hover:bg-primary/90">
                  Create Campaign
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign, i) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
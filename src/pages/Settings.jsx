import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save, LogOut, Loader2, Trash2, Shield, User as UserIcon, 
  Bell, Lock, CreditCard, Share2, Phone, Mail, MapPin, Badge as BadgeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Download } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { promptInstall } = usePWAInstall();
  const [form, setForm] = useState({
    city: '', province_state: '', country: '', temperature_unit: 'fahrenheit',
    interests: '', budget_preference: 'moderate', food_preferences: '', ai_tone: 'funny', app_theme: 'hustledark',
    contact_phone: '', notifications_email: true, notifications_push: true, notifications_reminders: true, privacy_public: false,
    referral_code: '', admin_god_mode: false
  });
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
  });

  // Generate referral code if none exists
  const generateReferralCode = () => {
    return 'HIF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    if (settings) {
      setForm({
        city: settings.city || '',
        province_state: settings.province_state || '',
        country: settings.country || '',
        temperature_unit: settings.temperature_unit || 'fahrenheit',
        interests: settings.interests?.join(', ') || '',
        budget_preference: settings.budget_preference || 'moderate',
        food_preferences: settings.food_preferences?.join(', ') || '',
        ai_tone: settings.ai_tone || 'funny',
        app_theme: settings.app_theme || 'hustledark',
        contact_phone: settings.contact_phone || '',
        notifications_email: settings.notifications_email ?? true,
        notifications_push: settings.notifications_push ?? true,
        notifications_reminders: settings.notifications_reminders ?? true,
        privacy_public: settings.privacy_public ?? false,
        referral_code: settings.referral_code || generateReferralCode(),
        admin_god_mode: settings.admin_god_mode ?? false
      });
    } else {
        setForm(prev => ({...prev, referral_code: generateReferralCode()}));
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      interests: form.interests ? form.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      food_preferences: form.food_preferences ? form.food_preferences.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
        if (settings?.id) {
            await base44.entities.UserSettings.update(settings.id, data);
        } else {
            await base44.entities.UserSettings.create(data);
        }
        
        // Apply theme immediately to HTML element
        const html = document.documentElement;
        html.classList.remove('theme-hustledark', 'theme-neonflow', 'theme-executive', 'theme-crypto');
        html.classList.add(`theme-${data.app_theme}`);

        queryClient.invalidateQueries({ queryKey: ['userSettings'] });
        toast.success('Settings successfully updated');
    } catch (error) {
        toast.error('Failed to save settings: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const copyReferralCode = () => {
      navigator.clipboard.writeText(form.referral_code);
      toast.success("Referral code copied to clipboard!");
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-background px-6 pt-8 pb-6 border-b border-border shadow-sm">
        <h1 className="text-3xl font-display font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your Hustle InFlow experience</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-8 h-auto p-1 bg-background/50 backdrop-blur border border-border">
            <TabsTrigger value="profile" className="py-2.5 data-[state=active]:bg-background"><UserIcon className="w-4 h-4 mr-2 hidden sm:block" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2.5 data-[state=active]:bg-background"><Bell className="w-4 h-4 mr-2 hidden sm:block" />Alerts</TabsTrigger>
            <TabsTrigger value="privacy" className="py-2.5 data-[state=active]:bg-background"><Lock className="w-4 h-4 mr-2 hidden sm:block" />Privacy</TabsTrigger>
            <TabsTrigger value="billing" className="py-2.5 data-[state=active]:bg-background"><CreditCard className="w-4 h-4 mr-2 hidden sm:block" />Billing</TabsTrigger>
          </TabsList>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* PROFILE & PREFERENCES TAB */}
            <TabsContent value="profile" className="space-y-6">
                
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/10">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">Contact Information</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</Label>
                    <Input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden border-primary/20">
                <div className="p-5 border-b border-border bg-primary/5">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location Settings
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        We use this to customize your job board and discovery suggestions.
                    </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground mb-1.5">City / Town</Label>
                      <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Toronto" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground mb-1.5">Province / State</Label>
                      <Input value={form.province_state} onChange={e => update('province_state', e.target.value)} placeholder="e.g. Ontario" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground mb-1.5">Country</Label>
                      <Input value={form.country} onChange={e => update('country', e.target.value)} placeholder="e.g. Canada" className="bg-background" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/10">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">App Preferences</h3>
                </div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label className="text-muted-foreground mb-1.5">Temperature Format</Label>
                            <Select value={form.temperature_unit} onValueChange={v => update('temperature_unit', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="celsius">C Celsius</SelectItem>
                                    <SelectItem value="fahrenheit">F Fahrenheit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-muted-foreground mb-1.5">Budget Preference</Label>
                            <Select value={form.budget_preference} onValueChange={v => update('budget_preference', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="budget">Budget-Friendly</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="splurge">Treat Yo Self</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-muted-foreground mb-1.5">AI Assistant Vibe</Label>
                            <Select value={form.ai_tone} onValueChange={v => update('ai_tone', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="funny">Funny &amp; Relatable</SelectItem>
                                    <SelectItem value="supportive">Warm &amp; Supportive</SelectItem>
                                    <SelectItem value="sarcastic">Sarcastic Bestie</SelectItem>
                                    <SelectItem value="calm">Calm &amp; Zen</SelectItem>
                                    <SelectItem value="motivational">Motivational Coach</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-muted-foreground mb-1.5">App Theme</Label>
                            <Select value={form.app_theme} onValueChange={v => update('app_theme', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hustledark">Hustle Dark (Black &amp; Gold)</SelectItem>
                                    <SelectItem value="neonflow">Neon Flow (Cyber Blue)</SelectItem>
                                    <SelectItem value="executive">Executive (White &amp; Blue)</SelectItem>
                                    <SelectItem value="crypto">Crypto Mode (Black &amp; Green)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground mb-1.5">Interests (Comma separated)</Label>
                        <Input value={form.interests} onChange={e => update('interests', e.target.value)} placeholder="cooking, hiking, gaming..." />
                    </div>
                    <div>
                        <Label className="text-muted-foreground mb-1.5">Food Preferences (Comma separated)</Label>
                        <Input value={form.food_preferences} onChange={e => update('food_preferences', e.target.value)} placeholder="vegetarian, gluten-free..." />
                    </div>
                </div>
              </div>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/10">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">Notification Settings</h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive platform updates, bonuses, and casino promotions.</p>
                    </div>
                    <Switch checked={form.notifications_email} onCheckedChange={(v) => update('notifications_email', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get instant alerts for sports, weather warnings, and reminders.</p>
                    </div>
                    <Switch checked={form.notifications_push} onCheckedChange={(v) => update('notifications_push', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Daily Adulting Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive a daily morning email summary of your scheduled tasks and meal plans.</p>
                    </div>
                    <Switch checked={form.notifications_reminders} onCheckedChange={(v) => update('notifications_reminders', v)} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* PRIVACY TAB */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/10">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">Privacy &amp; Security</h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow other users to see your basic profile information.</p>
                    </div>
                    <Switch checked={form.privacy_public} onCheckedChange={(v) => update('privacy_public', v)} />
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <div className="space-y-0.5">
                        <Label className="text-base font-bold text-primary flex items-center gap-2"><Shield className="w-4 h-4" /> Admin God Mode</Label>
                        <p className="text-sm text-muted-foreground">Instantly unlock all Tier 2 and Tier 3 features on your account for testing.</p>
                      </div>
                      <Switch checked={form.admin_god_mode} onCheckedChange={(v) => update('admin_god_mode', v)} />
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border mt-4">
                    <h4 className="font-medium text-destructive mb-3">Danger Zone</h4>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your account, balances, and all your data. There is no going back.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => toast.error('Contact support to complete account deletion.')}>
                            Yes, Delete Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* BILLING & REFERRALS TAB */}
            <TabsContent value="billing" className="space-y-6">
                
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Share2 className="w-24 h-24 text-primary" />
                </div>
                <div className="p-5 border-b border-border bg-primary/5">
                    <h3 className="font-semibold text-primary flex items-center gap-2">Referral Program</h3>
                </div>
                <div className="p-6 relative z-10">
                  <h4 className="text-lg font-bold mb-2">Invite Friends, Earn Rewards!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your unique code. When a friend joins, you BOTH receive <strong>100,000 Chips</strong>. 
                    They also get 30 Days Premium Access and 20% off their first month!
                  </p>
                  <div className="flex items-center gap-3 bg-muted/50 p-1 pl-4 rounded-xl border border-border max-w-sm">
                      <span className="font-mono font-bold tracking-wider text-lg flex-1">{form.referral_code}</span>
                      <Button onClick={copyReferralCode} variant="secondary" className="rounded-lg shrink-0">Copy Code</Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-border bg-muted/10 flex justify-between items-center">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">Subscription Management</h3>
                    <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">
                        {settings?.description === 'PREMIUM_MEMBER' ? 'Premium Member' : 'Free Tier'}
                    </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                      <div>
                          <h4 className="font-medium">Premium Membership</h4>
                          <p className="text-sm text-muted-foreground mt-1">Unlock all exclusive Hustle InFlow features.</p>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-xl">$4.99<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                      </div>
                  </div>
                  {settings?.description !== 'PREMIUM_MEMBER' && (
                      <Button 
                        className="w-full sm:w-auto mt-2" 
                        onClick={async () => {
                            if (window.self !== window.top) {
                                toast.error('Checkout is disabled inside the preview editor. Please view the published app to test payments.');
                                return;
                            }
                            try {
                                const res = await base44.functions.invoke('createCheckout', {
                                    priceId: 'price_1TgYIDBAS06om82pjQLZC6oY', // Premium Subscription Price ID
                                    type: 'subscription'
                                });
                                if (res.data?.url) {
                                    window.location.href = res.data.url;
                                } else {
                                    toast.error(res.data?.error || 'Failed to start checkout');
                                }
                            } catch (e) {
                                toast.error('Error starting checkout');
                            }
                        }}
                      >
                        Upgrade to Premium
                      </Button>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/10">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">In-App Purchases</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                      <div>
                          <h4 className="font-medium">100,000 Keno Chips</h4>
                          <p className="text-sm text-muted-foreground mt-1">Need more chips to play? Get an instant refill.</p>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-xl">$0.99<span className="text-sm text-muted-foreground font-normal"> once</span></p>
                      </div>
                  </div>
                  <Button 
                    className="w-full sm:w-auto mt-2" 
                    variant="outline"
                    onClick={async () => {
                        if (window.self !== window.top) {
                            toast.error('Checkout is disabled inside the preview editor. Please view the published app to test payments.');
                            return;
                        }
                        try {
                            const res = await base44.functions.invoke('createCheckout', {
                                priceId: 'price_1TgYIDBAS06om82pnAQiYHJh', // Keno Chips Price ID
                                type: 'chips'
                            });
                            if (res.data?.url) {
                                window.location.href = res.data.url;
                            } else {
                                toast.error(res.data?.error || 'Failed to start checkout');
                            }
                        } catch (e) {
                            toast.error('Error starting checkout');
                        }
                    }}
                  >
                    Buy 100,000 Chips
                  </Button>
                </div>
              </div>
            </TabsContent>

          </motion.div>
          
          {/* Persistent Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
             <div className="flex gap-4 w-full sm:w-auto">
                 <Button onClick={handleSave} className="flex-1 sm:flex-none rounded-xl gap-2" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
             </div>
             
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10 flex-1 sm:flex-none" onClick={promptInstall}>
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Get App</span>
                </Button>
                <a href="mailto:hustleinflow2026@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden md:block px-2">
                    Support
                </a>
                {user?.role === 'admin' && (
                    <Button variant="outline" size="icon" className="text-primary border-primary/30 hover:bg-primary/10 rounded-xl shrink-0" onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4" />
                    </Button>
                )}
                <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl gap-2 shrink-0" onClick={() => base44.auth.logout()}>
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Log Out</span>
                </Button>
             </div>
          </div>

        </Tabs>
      </div>
    </div>
  );
}
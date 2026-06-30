import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Copy, CheckCircle2, ChevronRight, Globe, Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const TIKTOK_SCRIPTS = [
    {
        title: "The 'Hidden Gem' Hook",
        hook: "POV: You finally found the app that organizes your entire chaotic life 🤯",
        body: "I used to have 5 different apps for meal planning, family calendar, budget, and bedtime stories for the kids. Now I just use HustleInFlow. It even has a local job board and Keno game built-in?!",
        cta: "Link in bio to get your life in flow ✨",
        hashtags: "#LifeHacks #Organization #ProductivityApp #ParentingHacks #HustleInFlow"
    },
    {
        title: "The 'Adulting' Pain Point",
        hook: "If you're terrible at 'adulting', watch this...",
        body: "Trying to keep track of groceries, bills, vet appointments, and job hunting is exhausting. HustleInFlow is basically a personal assistant for your life. The AI actually tells me what to cook based on what's on sale locally.",
        cta: "Stop stressing, start flowing. Link in bio 🚀",
        hashtags: "#Adulting #Budgeting #MealPrep #JobSearch #HustleInFlow"
    },
    {
        title: "The 'Parenting Hack' Hook",
        hook: "The bedtime hack that saved my sanity 😴",
        body: "My kids were getting bored of the same 3 bedtime stories. HustleInFlow's Library has thousands of free public domain books AND custom AI audio narration that reads it to them in a calm voice. Game changer.",
        cta: "Try the Bedtime Story Library via link in bio 📚",
        hashtags: "#MomHack #DadHack #BedtimeStories #ParentingTips #HustleInFlow"
    }
];

const COMMUNITY_POSTS = [
    {
        title: "Local Facebook Group Post",
        content: "Hey neighbors! 👋 I've been using this new app called HustleInFlow to keep my family organized, and I noticed they have a really cool local job board and discovery feature specifically for our area. If anyone is looking for work or trying to organize meal plans/budgets, you should check it out! It's completely free to start.",
    },
    {
        title: "Reddit (r/Productivity or Local Subreddit)",
        content: "I finally found an 'all-in-one' life management app that actually works (and doesn't cost $20/month).\n\nI was tired of juggling Notion, MyFitnessPal, Google Calendar, and Spotify. I recently switched to HustleInFlow. It handles family calendars, meal planning, budgeting, and even has a localized job board. Has anyone else tried this yet? The UI is super clean (glassmorphism style).",
    }
];

export default function MarketingHub() {
    const [activeTab, setActiveTab] = useState('video');
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-4 py-4 max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold">Marketing Hub</h1>
                            <p className="text-xs text-muted-foreground">Growth strategies &amp; content</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 pt-6 max-w-4xl mx-auto space-y-8">
                
                {/* Intro Card */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                        🚀 Your Growth Engine
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Use these pre-written scripts and templates to promote HustleInFlow on your social channels. 
                        Once your CapCut video is ready, pair it with one of the TikTok/Reels scripts below!
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border">
                    <button 
                        onClick={() => setActiveTab('video')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'video' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Video className="w-4 h-4" /> Short-Form Video
                    </button>
                    <button 
                        onClick={() => setActiveTab('community')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'community' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Globe className="w-4 h-4" /> Community Posts
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'video' && (
                        <motion.div 
                            key="video"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="mb-4">
                                <h3 className="font-bold text-lg mb-1">TikTok / Reels / Shorts Scripts</h3>
                                <p className="text-sm text-muted-foreground">Pair these with your upcoming CapCut edit.</p>
                            </div>

                            {TIKTOK_SCRIPTS.map((script, i) => (
                                <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                                        <h4 className="font-bold text-primary">{script.title}</h4>
                                        <button 
                                            onClick={() => handleCopy(`${script.hook}\n\n${script.body}\n\n${script.cta}\n\n${script.hashtags}`, `video-${i}`)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            {copiedIndex === `video-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedIndex === `video-${i}` ? 'Copied' : 'Copy All'}
                                        </button>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">On-Screen Text (Hook)</span>
                                            <p className="font-medium text-foreground bg-muted/50 p-2 rounded-md">{script.hook}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Voiceover / Caption</span>
                                            <p className="text-muted-foreground">{script.body}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Call to Action</span>
                                            <p className="font-medium text-primary">{script.cta}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Hashtags</span>
                                            <p className="text-blue-500/80">{script.hashtags}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'community' && (
                        <motion.div 
                            key="community"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="mb-4">
                                <h3 className="font-bold text-lg mb-1">Community Outreach</h3>
                                <p className="text-sm text-muted-foreground">Post these in local Facebook groups or relevant Reddit communities.</p>
                            </div>

                            {COMMUNITY_POSTS.map((post, i) => (
                                <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                                        <div className="flex items-center gap-2">
                                            {post.title.includes('Facebook') ? <Facebook className="w-4 h-4 text-blue-500" /> : <MessageCircle className="w-4 h-4 text-orange-500" />}
                                            <h4 className="font-bold text-foreground">{post.title}</h4>
                                        </div>
                                        <button 
                                            onClick={() => handleCopy(post.content, `community-${i}`)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            {copiedIndex === `community-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedIndex === `community-${i}` ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {post.content}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
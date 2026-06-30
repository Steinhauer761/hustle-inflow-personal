import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Headphones, Library, Moon, Plus, Upload, User, Search, Play, Pause, AlertCircle, Globe, DownloadCloud, Loader2, SkipBack, SkipForward, Filter, Clock, Sparkles, Tags, ListMusic, Timer, Download, ThumbsUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function LibraryPage() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, kids, adults
    const [filterMood, setFilterMood] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterDuration, setFilterDuration] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    
    // View states
    const [view, setView] = useState('grid'); // grid, read, create, scanner, discover
    const [activeStory, setActiveStory] = useState(null);
    
    // Form states
    const [newStory, setNewStory] = useState({ title: '', author: '', content: '', target_audience: 'kids', mood: 'calm', category: 'fantasy' });
    const [storyFont, setStoryFont] = useState('font-nunito');
    const [generatingAudio, setGeneratingAudio] = useState(false);
    
    // Discover states
    const [discoverSearch, setDiscoverSearch] = useState('');
    const [discoverTopic, setDiscoverTopic] = useState('all');
    const [discoverFormat, setDiscoverFormat] = useState('all');
    const [discoverResults, setDiscoverResults] = useState([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [importingId, setImportingId] = useState(null);

    // Scanner states
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    // Audio playback
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [playingStory, setPlayingStory] = useState(null);

    // Playlist and Sleep Timer
    const [playlist, setPlaylist] = useState([]);
    const [sleepTimer, setSleepTimer] = useState(null);
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
    const sleepTimerRef = useRef(null);

    // Recommended
    const [recommendedStories, setRecommendedStories] = useState([]);

    useEffect(() => {
        fetchStories();
    }, []);

    useEffect(() => {
        return () => {
            if (audioPlayer) {
                audioPlayer.pause();
            }
            if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
        };
    }, [audioPlayer]);

    useEffect(() => {
        if (stories.length > 0) {
            const shuffled = [...stories].sort(() => 0.5 - Math.random());
            setRecommendedStories(shuffled.slice(0, 3));
        }
    }, [stories]);

    useEffect(() => {
        if (audioPlayer) {
            const handleEnded = () => {
                setIsPlaying(false);
                setAudioProgress(0);
                if (playlist.length > 0) {
                    const nextStory = playlist[0];
                    setPlaylist(prev => prev.slice(1));
                    togglePlayback(nextStory, true);
                }
            };
            audioPlayer.addEventListener('ended', handleEnded);
            return () => audioPlayer.removeEventListener('ended', handleEnded);
        }
    }, [audioPlayer, playlist]);

    const startSleepTimer = (minutes) => {
        setSleepTimer(minutes);
        setSleepTimerRemaining(minutes * 60);
        if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
        
        if (minutes > 0) {
            sleepTimerRef.current = setInterval(() => {
                setSleepTimerRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(sleepTimerRef.current);
                        if (audioPlayer) {
                            audioPlayer.pause();
                            setIsPlaying(false);
                        }
                        setSleepTimer(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            toast.success(`Sleep timer set for ${minutes} minutes`);
        } else {
            setSleepTimer(null);
            setSleepTimerRemaining(null);
            toast.success("Sleep timer canceled");
        }
    };

    const addToPlaylist = (story, playNext = false) => {
        if (playNext) {
            setPlaylist(prev => [story, ...prev]);
            toast.success(`"${story.title}" will play next`);
        } else {
            setPlaylist(prev => [...prev, story]);
            toast.success(`"${story.title}" added to playlist`);
        }
    };

    const handleDownloadOffline = (story) => {
        const element = document.createElement("a");
        const file = new Blob([`${story.title}\n\nBy ${story.author || 'Unknown'}\n\n${story.content}`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Story downloaded for offline reading");
    };

    // Removed auto-search effect to let user initiate and cancel

    const fetchStories = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.BedtimeStory.list('-created_date', 50);
            setStories(data);
        } catch (error) {
            toast.error("Failed to load library");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStory = async (keepEditing = false) => {
        if (!newStory.title || !newStory.content) {
            toast.error("Title and content are required.");
            return;
        }
        
        try {
            if (newStory.id) {
                await base44.entities.BedtimeStory.update(newStory.id, newStory);
                toast.success("Work saved successfully!");
            } else {
                const created = await base44.entities.BedtimeStory.create(newStory);
                setNewStory({...newStory, id: created.id});
                toast.success(keepEditing ? "Work saved as draft!" : "Story added to your library!");
            }
            fetchStories();
            if (!keepEditing) {
                setNewStory({ title: '', author: '', content: '', target_audience: 'kids', mood: 'calm', category: 'fantasy' });
                setView('grid');
            }
        } catch (error) {
            toast.error("Could not save story.");
        }
    };

    const handleSearchPublic = async (e) => {
        if (e) e.preventDefault();
        setIsDiscovering(true);
        try {
            const res = await base44.functions.invoke('searchPublicBooks', { 
                query: discoverSearch,
                topic: discoverTopic !== 'all' ? discoverTopic : undefined,
                format: discoverFormat !== 'all' ? discoverFormat : undefined
            });
            if (res.data?.books) {
                setDiscoverResults(res.data.books);
            }
        } catch (error) {
            toast.error("Failed to search public library");
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleImportBook = async (book) => {
        setImportingId(book.id);
        try {
            const res = await base44.functions.invoke('importPublicBook', book);
            if (res.data?.success) {
                toast.success("Book imported to your library!");
                fetchStories();
                setView('grid');
            } else {
                toast.error(res.data?.error || "Could not import book.");
            }
        } catch (error) {
            toast.error("Failed to import book");
        } finally {
            setImportingId(null);
        }
    };

    const handleGenerateAudio = async (story) => {
        setGeneratingAudio(true);
        try {
            const textToRead = story.content.substring(0, 4000); 
            
            const response = await base44.integrations.Core.GenerateSpeech({
                text: textToRead,
                voice: story.target_audience === 'kids' ? 'nova' : 'onyx',
            });
            
            if (response && response.audio_url) {
                await base44.entities.BedtimeStory.update(story.id, { audio_url: response.audio_url });
                toast.success("Audio generated successfully!");
                fetchStories();
                
                if (activeStory && activeStory.id === story.id) {
                    setActiveStory({ ...activeStory, audio_url: response.audio_url });
                }
            }
        } catch (error) {
            toast.error("Failed to generate audio. The story might be too long.");
            console.error(error);
        } finally {
            setGeneratingAudio(false);
        }
    };

    const togglePlayback = (story, forcePlay = false) => {
        const url = story.audio_url;
        if (!url) return;

        if (!forcePlay && isPlaying && audioPlayer && playingStory?.id === story.id) {
            audioPlayer.pause();
            setIsPlaying(false);
        } else {
            if (!forcePlay && audioPlayer && playingStory?.id === story.id) {
                audioPlayer.play();
                setIsPlaying(true);
            } else {
                if (audioPlayer) {
                    audioPlayer.pause();
                }
                const newPlayer = new Audio(url);
                newPlayer.addEventListener('timeupdate', () => setAudioProgress(newPlayer.currentTime));
                newPlayer.addEventListener('loadedmetadata', () => setAudioDuration(newPlayer.duration));
                // ended event is now handled by the useEffect for playlist integration
                newPlayer.play();
                setAudioPlayer(newPlayer);
                setPlayingStory(story);
                setIsPlaying(true);
            }
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setAudioProgress(time);
        if (audioPlayer) {
            audioPlayer.currentTime = time;
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getReadingDuration = (content) => {
        if (!content) return 0;
        // Fast approximation: ~6 chars per word, 200 words per minute => 1200 chars per minute
        return Math.max(1, Math.ceil(content.length / 1200));
    };

    const displayStories = React.useMemo(() => {
        return stories.filter(s => {
            if (filter === 'kids' && s.target_audience !== 'kids') return false;
            if (filter === 'adults' && s.target_audience !== 'adults') return false;
            if (filter === 'audiobooks' && !s.audio_url) return false;
            if (filter === 'books' && s.audio_url) return false;
            
            if (filterMood !== 'all' && (s.mood || 'calm') !== filterMood) return false;
            if (filterCategory !== 'all' && (s.category || 'classic') !== filterCategory) return false;
            
            if (filterDuration !== 'all') {
                const duration = getReadingDuration(s.content);
                if (filterDuration === 'short' && duration > 5) return false;
                if (filterDuration === 'medium' && (duration <= 5 || duration > 15)) return false;
                if (filterDuration === 'long' && duration <= 15) return false;
            }

            if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.content.toLowerCase().includes(search.toLowerCase())) return false;
            
            return true;
        });
    }, [stories, filter, filterMood, filterCategory, filterDuration, search]);

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-4 py-4 max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold">Flow Library</h1>
                            <p className="text-xs text-muted-foreground">Bedtime stories &amp; audiobooks</p>
                        </div>
                    </div>
                    
                    {view === 'grid' ? (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setView('discover')} className="hidden sm:flex">
                                <Globe className="w-4 h-4 mr-2" /> Discover
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setView('scanner')} className="hidden sm:flex">
                                <Upload className="w-4 h-4 mr-2" /> Scanner
                            </Button>
                            <Button size="sm" onClick={() => setView('create')}>
                                <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">New</span>
                            </Button>
                        </div>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => {
                            setView('grid');
                            setActiveStory(null);
                            if (audioPlayer) {
                                audioPlayer.pause();
                                setIsPlaying(false);
                            }
                        }}>
                            Back to Library
                        </Button>
                    )}
                </div>
            </div>

            {/* Global Floating Audio Player */}
            <AnimatePresence>
                {playingStory && view !== 'read' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 bg-black/60 backdrop-blur-2xl text-white overflow-hidden"
                    >
                        {/* Decorative glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent opacity-40 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4 min-w-0">
                                    {playingStory.cover_image_url ? (
                                        <img src={playingStory.cover_image_url} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                                            <Headphones className="w-7 h-7 text-white/70" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setActiveStory(playingStory); setView('read'); }}>
                                        <p className="text-base font-bold truncate text-white drop-shadow-md mb-1">{playingStory.title}</p>
                                        <p className="text-xs text-white/70 truncate flex items-center gap-1.5">
                                            {isPlaying ? (
                                                <span className="flex h-2.5 items-end gap-[2px] opacity-80">
                                                    <span className="w-0.5 h-1.5 bg-primary animate-pulse rounded-full" />
                                                    <span className="w-0.5 h-2.5 bg-primary animate-pulse delay-75 rounded-full" />
                                                    <span className="w-0.5 h-2 bg-primary animate-pulse delay-150 rounded-full" />
                                                </span>
                                            ) : (
                                                <Headphones className="w-3 h-3 opacity-70" />
                                            )}
                                            {playingStory.author || 'AI Narration'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 relative">
                                    {sleepTimerRemaining > 0 && (
                                        <div className="absolute -top-2 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg animate-pulse z-20">
                                            {Math.ceil(sleepTimerRemaining / 60)}m
                                        </div>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors ${sleepTimer ? 'text-primary' : 'text-white/70'}`}>
                                                <Timer className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-40 bg-card border-border" align="end">
                                            <DropdownMenuItem onClick={() => startSleepTimer(0)}>Off</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => startSleepTimer(5)}>5 Minutes</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => startSleepTimer(15)}>15 Minutes</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => startSleepTimer(30)}>30 Minutes</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => startSleepTimer(60)}>1 Hour</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {playlist.length > 0 && (
                                        <div className="relative">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/70">
                                                <ListMusic className="w-4 h-4" />
                                            </button>
                                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                {playlist.length}
                                            </span>
                                        </div>
                                    )}

                                    <button 
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shadow-inner"
                                        onClick={() => togglePlayback(playingStory)}
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <div className="relative flex items-center h-5 group">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={audioDuration || 100} 
                                        value={audioProgress}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden z-10 group-hover:h-2 transition-all">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                            style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <div 
                                        className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                        style={{ left: `calc(${audioDuration ? (audioProgress / audioDuration) * 100 : 0}% - 7px)` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-white/50 font-medium tabular-nums px-1">
                                    <span>{formatTime(audioProgress)}</span>
                                    <span>{formatTime(audioDuration)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-4 pt-6 max-w-4xl mx-auto">
                {view === 'grid' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search stories..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 bg-card"
                                    />
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={showFilters ? 'bg-accent text-accent-foreground border-accent' : ''}
                                >
                                    <Filter className="w-4 h-4 mr-2" /> Filters
                                </Button>
                                <div className="flex gap-2 bg-card p-1 rounded-lg border border-border shrink-0 overflow-x-auto scrollbar-hide">
                                    {['all', 'books', 'audiobooks', 'kids', 'adults'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                                                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: 'auto', opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Mood
                                                </label>
                                                <Select value={filterMood} onValueChange={setFilterMood}>
                                                    <SelectTrigger className="bg-card"><SelectValue placeholder="All Moods" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Moods</SelectItem>
                                                        <SelectItem value="calm">Calm</SelectItem>
                                                        <SelectItem value="magical">Magical</SelectItem>
                                                        <SelectItem value="adventurous">Adventurous</SelectItem>
                                                        <SelectItem value="funny">Funny</SelectItem>
                                                        <SelectItem value="sleepy">Sleepy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                    <Tags className="w-3 h-3" /> Category
                                                </label>
                                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                                    <SelectTrigger className="bg-card"><SelectValue placeholder="All Categories" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        <SelectItem value="fantasy">Fantasy</SelectItem>
                                                        <SelectItem value="fable">Fable</SelectItem>
                                                        <SelectItem value="educational">Educational</SelectItem>
                                                        <SelectItem value="classic">Classic</SelectItem>
                                                        <SelectItem value="documentary">Documentary</SelectItem>
                                                        <SelectItem value="biography">Biography</SelectItem>
                                                        <SelectItem value="just_playing_around">Just Playing Around</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Duration
                                                </label>
                                                <Select value={filterDuration} onValueChange={setFilterDuration}>
                                                    <SelectTrigger className="bg-card"><SelectValue placeholder="Any Duration" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Any Duration</SelectItem>
                                                        <SelectItem value="short">Short (&lt;5 min)</SelectItem>
                                                        <SelectItem value="medium">Medium (5-15 min)</SelectItem>
                                                        <SelectItem value="long">Long (&gt;15 min)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : displayStories.length === 0 ? (
                            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
                                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold mb-1">Your library is empty</h3>
                                <p className="text-sm text-muted-foreground mb-6">Add your first bedtime story, discover public classics, or use the book scanner.</p>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    <Button variant="secondary" onClick={() => setView('discover')}>
                                        <Globe className="w-4 h-4 mr-2" /> Discover Books
                                    </Button>
                                    <Button onClick={() => setView('create')}>
                                        <Plus className="w-4 h-4 mr-2" /> Create Story
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {recommendedStories.length > 0 && filter === 'all' && search === '' && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <ThumbsUp className="w-5 h-5 text-primary" /> Recommended for You
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {recommendedStories.map(story => (
                                                <motion.div 
                                                    key={`rec-${story.id}`}
                                                    whileHover={{ y: -4 }}
                                                    className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer shadow-sm hover:shadow-md transition-all group"
                                                    onClick={() => { setActiveStory(story); setView('read'); }}
                                                >
                                                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{story.title}</h3>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/30">
                                                        <span className="flex items-center gap-1 line-clamp-1"><User className="w-3 h-3" /> {story.author || 'Unknown'}</span>
                                                        {story.audio_url && <Headphones className="w-3 h-3 shrink-0" />}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            
                            <div>
                                <h3 className="text-lg font-bold mb-4">All Stories</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayStories.map(story => (
                                    <motion.div 
                                        key={story.id}
                                        whileHover={{ y: -4 }}
                                        className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all group"
                                        onClick={() => {
                                            setActiveStory(story);
                                            setView('read');
                                        }}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            {story.cover_image_url && (
                                                <img src={story.cover_image_url} alt={story.title} className="w-12 h-16 object-cover rounded shadow-sm shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{story.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {story.author || 'Unknown'}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getReadingDuration(story.content)} min read</span>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium capitalize">{story.mood || 'calm'}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium capitalize">{story.category || 'classic'}</span>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                story.target_audience === 'kids' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                            }`}>
                                                {story.target_audience}
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                                            {story.content}
                                        </p>
                                        
                                        <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> Read
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {story.audio_url && (
                                                    <>
                                                        <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                                                            <Headphones className="w-3 h-3" /> Audio
                                                        </span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="w-6 h-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                                            onClick={(e) => { e.stopPropagation(); addToPlaylist(story); }}
                                                            title="Add to Playlist"
                                                        >
                                                            <ListMusic className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                </div>
                            </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {view === 'read' && activeStory && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                        
                        <div className="p-6 md:p-10 border-b border-border bg-gradient-to-b from-muted/50 to-transparent relative">
                            {activeStory.cover_image_url && (
                                <img src={activeStory.cover_image_url} alt="" className="absolute right-6 md:right-10 top-6 md:top-10 w-24 h-auto rounded shadow-lg opacity-80 mix-blend-overlay" />
                            )}
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    activeStory.target_audience === 'kids' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                }`}>
                                    {activeStory.target_audience}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="bg-background/50 backdrop-blur-sm"
                                    onClick={() => handleDownloadOffline(activeStory)}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Save Offline
                                </Button>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 relative z-10 pr-24">{activeStory.title}</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 relative z-10">
                                <User className="w-4 h-4" /> By {activeStory.author || 'Unknown'}
                            </p>
                            
                            <div className="mt-8 relative z-10">
                                {activeStory.audio_url ? (
                                    <div className="relative max-w-sm rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 bg-black/70 backdrop-blur-2xl text-white overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent opacity-40 pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-4">
                                                <button 
                                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shadow-inner shrink-0"
                                                    onClick={() => togglePlayback(activeStory)}
                                                >
                                                    {isPlaying && playingStory?.id === activeStory.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-base font-bold truncate text-white drop-shadow-md mb-1">AI Narration</p>
                                                        <button 
                                                            className="text-white/50 hover:text-white/90 hover:bg-white/10 rounded-full p-1 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); addToPlaylist(activeStory); }}
                                                            title="Add to Playlist"
                                                        >
                                                            <ListMusic className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-white/70 truncate flex items-center gap-1.5 mt-0.5">
                                                        {isPlaying && playingStory?.id === activeStory.id ? (
                                                            <span className="flex h-2.5 items-end gap-[2px] opacity-80">
                                                                <span className="w-0.5 h-1.5 bg-primary animate-pulse rounded-full" />
                                                                <span className="w-0.5 h-2.5 bg-primary animate-pulse delay-75 rounded-full" />
                                                                <span className="w-0.5 h-2 bg-primary animate-pulse delay-150 rounded-full" />
                                                            </span>
                                                        ) : (
                                                            <Headphones className="w-3 h-3 opacity-70" />
                                                        )}
                                                        {activeStory.title}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <div className="relative flex items-center h-5 group">
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max={audioDuration || 100} 
                                                        value={audioProgress}
                                                        onChange={handleSeek}
                                                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                                                    />
                                                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden z-10 group-hover:h-2 transition-all">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                                            style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <div 
                                                        className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                                        style={{ left: `calc(${audioDuration ? (audioProgress / audioDuration) * 100 : 0}% - 7px)` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-white/50 font-medium tabular-nums px-1">
                                                    <span>{formatTime(audioProgress)}</span>
                                                    <span>{formatTime(audioDuration)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button 
                                        size="lg" 
                                        className="rounded-full px-8 gap-2 font-bold shadow-lg bg-card/80 backdrop-blur border border-white/10 hover:bg-card/90"
                                        onClick={() => handleGenerateAudio(activeStory)}
                                        disabled={generatingAudio}
                                    >
                                        {generatingAudio ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Generating Studio Audio...</>
                                        ) : (
                                            <><Headphones className="w-5 h-5 text-primary" /> Generate AI Audio</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none text-lg md:text-xl leading-relaxed font-nunito whitespace-pre-wrap">
                            {activeStory.content}
                        </div>
                        
                    </motion.div>
                )}

                {view === 'discover' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
                            <h2 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" /> Discover Public Books
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Search thousands of free, public domain books and stories from Project Gutenberg to import into your library.
                            </p>
                            
                            <form onSubmit={handleSearchPublic} className="flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search title, author..." 
                                            value={discoverSearch}
                                            onChange={(e) => setDiscoverSearch(e.target.value)}
                                            className="pl-9 h-12 text-base"
                                        />
                                    </div>
                                    <Select value={discoverTopic} onValueChange={setDiscoverTopic}>
                                        <SelectTrigger className="h-12 w-full sm:w-48">
                                            <SelectValue placeholder="Topic/Genre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Any Topic</SelectItem>
                                            <SelectItem value="romance">Romance</SelectItem>
                                            <SelectItem value="erotica">Adult (Erotica)</SelectItem>
                                            <SelectItem value="thriller">Thriller</SelectItem>
                                            <SelectItem value="scifi">Science Fiction</SelectItem>
                                            <SelectItem value="horror">Horror</SelectItem>
                                            <SelectItem value="history">History</SelectItem>
                                            <SelectItem value="children">Children's Books</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={discoverFormat} onValueChange={setDiscoverFormat}>
                                        <SelectTrigger className="h-12 w-full sm:w-40">
                                            <SelectValue placeholder="Format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Books & Audio</SelectItem>
                                            <SelectItem value="text">E-Books Only</SelectItem>
                                            <SelectItem value="audio">Audiobooks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-3 justify-end mt-1">
                                    {discoverResults.length > 0 && (
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            className="h-12 px-6" 
                                            onClick={() => { setDiscoverResults([]); setDiscoverSearch(''); setIsDiscovering(false); }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-12 px-6" 
                                        onClick={() => {
                                            if (isDiscovering) {
                                                setIsDiscovering(false);
                                            } else {
                                                handleSearchPublic();
                                            }
                                        }}
                                    >
                                        {isDiscovering ? 'Stop Search' : 'Refresh'}
                                    </Button>
                                    <Button type="submit" className="h-12 px-8" disabled={isDiscovering}>
                                        {isDiscovering ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {isDiscovering ? (
                            <div className="flex justify-center py-12 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : discoverResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {discoverResults.map(book => (
                                    <div key={book.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col hover:border-primary/50 transition-colors">
                                        <div className="flex gap-4 mb-4 flex-1">
                                            {book.cover_image_url ? (
                                                <img src={book.cover_image_url} alt={book.title} className="w-20 h-28 object-cover rounded-md shadow-sm bg-muted" />
                                            ) : (
                                                <div className="w-20 h-28 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                                    <BookOpen className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold leading-tight mb-1 line-clamp-3">{book.title}</h3>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{book.author}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            className="w-full" 
                                            disabled={importingId === book.id || !book.text_url}
                                            onClick={() => handleImportBook(book)}
                                        >
                                            {importingId === book.id ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                                            ) : !book.text_url ? (
                                                'Text Unavailable'
                                            ) : (
                                                <><DownloadCloud className="w-4 h-4 mr-2" /> Import Excerpt</>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                                No books found. Try a different search term.
                            </div>
                        )}
                    </motion.div>
                )}

                {view === 'create' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" /> Add Custom Story
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Story Title</label>
                                <Input 
                                    placeholder="e.g., The Sleepy Little Bear" 
                                    value={newStory.title}
                                    onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                                    className="text-lg font-bold"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Author</label>
                                    <Input 
                                        placeholder="Optional" 
                                        value={newStory.author}
                                        onChange={(e) => setNewStory({...newStory, author: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Audience</label>
                                    <Select value={newStory.target_audience} onValueChange={(v) => setNewStory({...newStory, target_audience: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kids">Kids</SelectItem>
                                            <SelectItem value="adults">Adults</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Mood</label>
                                    <Select value={newStory.mood} onValueChange={(v) => setNewStory({...newStory, mood: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="calm">Calm</SelectItem>
                                            <SelectItem value="magical">Magical</SelectItem>
                                            <SelectItem value="adventurous">Adventurous</SelectItem>
                                            <SelectItem value="funny">Funny</SelectItem>
                                            <SelectItem value="sleepy">Sleepy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                                    <Select value={newStory.category} onValueChange={(v) => setNewStory({...newStory, category: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fantasy">Fantasy</SelectItem>
                                            <SelectItem value="fable">Fable</SelectItem>
                                            <SelectItem value="educational">Educational</SelectItem>
                                            <SelectItem value="classic">Classic</SelectItem>
                                            <SelectItem value="documentary">Documentary</SelectItem>
                                            <SelectItem value="biography">Biography</SelectItem>
                                            <SelectItem value="just_playing_around">Just Playing Around</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Story Content</label>
                                    <Select value={storyFont} onValueChange={setStoryFont}>
                                        <SelectTrigger className="h-7 text-xs w-[140px] bg-card border-none">
                                            <SelectValue placeholder="Font Style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="font-nunito">Modern (Sans)</SelectItem>
                                            <SelectItem value="font-serif">Classic (Serif)</SelectItem>
                                            <SelectItem value="font-mono">Typewriter (Mono)</SelectItem>
                                            <SelectItem value="font-display">Bold (Display)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea 
                                    placeholder="Once upon a time..." 
                                    className={`min-h-[400px] text-base leading-relaxed resize-y ${storyFont}`}
                                    value={newStory.content}
                                    onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                                />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <Button variant="outline" className="flex-1 font-bold h-12" onClick={() => handleCreateStory(true)}>
                                    Save My Work
                                </Button>
                                <Button className="flex-1 font-bold h-12" onClick={() => handleCreateStory(false)}>
                                    Finish & Add to Library
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'scanner' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            {isScanning ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <Upload className="w-10 h-10 text-primary" />}
                        </div>
                        <h2 className="text-2xl font-display font-bold mb-2">Book Scanner</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Take a photo of a book page or upload a document. Our AI will instantly extract the text so you can read it here or have it narrated to you.
                        </p>
                        
                        <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            capture="environment"
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsScanning(true);
                                try {
                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
                                        file_url,
                                        json_schema: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string", description: "Inferred title of the story or chapter" },
                                                author: { type: "string", description: "Inferred author if visible" },
                                                content: { type: "string", description: "The full text content extracted from the image/document" }
                                            },
                                            required: ["title", "content"]
                                        }
                                    });
                                    
                                    if (result.status === 'success' && result.output) {
                                        setNewStory({
                                            title: result.output.title || 'Scanned Story',
                                            author: result.output.author || '',
                                            content: result.output.content || '',
                                            target_audience: 'kids',
                                            mood: 'calm',
                                            category: 'classic'
                                        });
                                        toast.success("Text extracted successfully!");
                                        setView('create');
                                    } else {
                                        toast.error("Failed to extract text from image.");
                                    }
                                } catch (err) {
                                    toast.error("Error scanning document.");
                                } finally {
                                    setIsScanning(false);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }
                            }}
                        />
                        
                        <div className="flex flex-col gap-3">
                            <Button 
                                className="w-full h-12 font-bold text-lg" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isScanning}
                            >
                                {isScanning ? 'Processing Image...' : 'Take Photo / Upload'}
                            </Button>
                            <Button variant="outline" className="w-full h-12" onClick={() => setView('grid')} disabled={isScanning}>
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
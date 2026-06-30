import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Sparkles, Loader2, MapPin, Search, Clock, Star, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const categories = [
  { id: 'hidden_gems', label: 'Hidden Gems', emoji: '💎' },
  { id: 'food_restaurants', label: 'Food & Eats', emoji: '🍽️' },
  { id: 'attractions', label: 'Attractions', emoji: '🎡' },
  { id: 'adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'family_activities', label: 'Family Fun', emoji: '👨‍👩‍👧‍👦' },
  { id: 'events', label: 'Events', emoji: '🎉' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'road_trips', label: 'Road Trips', emoji: '🚗' },
  { id: 'weekend_getaways', label: 'Weekend Trips', emoji: '🌤️' },
  { id: 'local_experiences', label: 'Local Vibes', emoji: '📍' },
  { id: 'accommodations', label: 'Stay', emoji: '🏨' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'seasonal_activities', label: 'Seasonal', emoji: '🍂' },
];

const LOADING_MESSAGES = [
  'Searching destinations...',
  'Finding local attractions...',
  'Analyzing travel opportunities...',
  'Uncovering hidden gems...',
  'Ranking the best spots...',
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-created_date', 1);
      return list[0] || {};
    },
  });

  const location = [settings?.city, settings?.province_state, settings?.country]
    .filter(Boolean)
    .join(', ') || 'my local area';
  const budget = settings?.budget_preference || 'moderate';
  const interests = settings?.interests?.join(', ') || 'general activities';
  const foodPrefs = settings?.food_preferences?.join(', ') || '';

  const buildPrompt = (category, customQuery) => {
    const catLabel = category ? categories.find(c => c.id === category)?.label || category : null;
    const isHiddenGems = category === 'hidden_gems';
    const query = customQuery || (catLabel ? `${catLabel} recommendations` : 'interesting things to do');

    const hiddenGemsInstructions = isHiddenGems
      ? `IMPORTANT: Focus EXCLUSIVELY on lesser-known, underrated, local-favorite places. NO mainstream tourist traps. Think: secret hiking spots, local-only restaurants, hidden beaches, scenic backroads, small-town gems, underrated weekend trips, unique experiences NOT found on typical tourist lists.`
      : '';

    return `You are a premium travel concierge AI. Perform a real web search and find 6 specific, current, real recommendations for: "${query}" near ${location}.

User profile:
- Budget preference: ${budget}
- Interests: ${interests}
${foodPrefs ? `- Food preferences: ${foodPrefs}` : ''}

${hiddenGemsInstructions}

Search the internet for current, real places and experiences. For each recommendation provide:
1. Real, specific name (not generic)
2. Detailed description (2-3 sentences) including what makes it special
3. Why YOU specifically selected this for this user (based on their profile)
4. Estimated distance/travel time from ${location}
5. Cost estimate (be specific with price ranges)
6. Best time to visit
7. An insider tip most tourists don't know
8. A confidence/relevance score out of 10

Rank results by relevance to the user's profile. Only include places that actually exist.`;
  };

  const runSearch = async (category, customQuery) => {
    setLoading(true);
    setSuggestions([]);

    // Rotate loading messages
    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2000);

    try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: buildPrompt(category, customQuery),
          add_context_from_internet: true,
          model: 'gemini_3_1_pro',
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    why_selected: { type: "string" },
                    distance: { type: "string" },
                    cost: { type: "string" },
                    best_time: { type: "string" },
                    insider_tip: { type: "string" },
                    score: { type: "number" },
                    emoji: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setSuggestions(result?.suggestions || []);
    } catch (error) {
        console.error("Search failed:", error);
        // Fallback or error message could go here if needed
        setSuggestions([]);
    } finally {
        clearInterval(interval);
        setLoading(false);
    }
  };

  const handleCategoryClick = (catId) => {
    setActiveTab(catId);
    setSearchQuery('');
    runSearch(catId, null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveTab(null);
    setSearchQuery(searchInput.trim());
    runSearch(null, searchInput.trim());
  };

  const locationStr = [settings?.city, settings?.province_state, settings?.country]
    .filter(Boolean)
    .join(', ') || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">🧭 Discover</p>
        <h1 className="text-2xl font-display text-foreground">Find Your Vibe</h1>
        {locationStr ? (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground">{locationStr}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">Add your location in Settings for better hits 📍</p>
        )}
      </div>

      <div className="px-4 pt-4 pb-8 max-w-2xl mx-auto space-y-4">

        {/* Natural language search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="e.g. Find hidden lakes within 2 hours..."
              className="pl-9 rounded-full"
            />
          </div>
          <Button type="submit" className="rounded-full shrink-0" disabled={loading || !searchInput.trim()}>
            Go
          </Button>
        </form>

        {/* Category chips */}
        <div data-no-swipe="true" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              onClick={() => handleCategoryClick(cat.id)}
              variant={activeTab === cat.id ? 'default' : 'outline'}
              className="rounded-full gap-1 shrink-0"
              disabled={loading}
            >
              <span>{cat.emoji}</span> {cat.label}
            </Button>
          ))}
        </div>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <motion.p
                key={loadingMsg}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground font-semibold"
              >
                {loadingMsg}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {!loading && suggestions.length > 0 && (
          <div className="space-y-3">
            {searchQuery && (
              <p className="text-xs text-muted-foreground font-semibold px-1">
                Results for "{searchQuery}"
              </p>
            )}
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card rounded-2xl border border-border p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{s.emoji || '✨'}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground leading-tight">{s.name}</h3>
                      {s.score && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{s.score}/10</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      {s.cost && (
                        <Badge variant="secondary" className="text-[10px] gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />{s.cost}
                        </Badge>
                      )}
                      {s.distance && (
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{s.distance}
                        </Badge>
                      )}
                      {s.best_time && (
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{s.best_time}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {s.why_selected && (
                  <div className="bg-primary/10 rounded-xl px-3 py-2 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/90 font-medium">{s.why_selected}</p>
                  </div>
                )}

                {s.insider_tip && (
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{s.insider_tip}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && suggestions.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4 animate-float">🧭</span>
            <h3 className="text-lg font-bold mb-2 text-foreground">Ready to explore?</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
              Search anything or pick a category — your AI travel concierge will find real spots near you.
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
              {['"Hidden lakes within 2 hours"', '"Family activities this weekend"', '"Underrated restaurants nearby"'].map(ex => (
                <button
                  key={ex}
                  onClick={() => { setSearchInput(ex.replace(/"/g, '')); }}
                  className="bg-muted rounded-full px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
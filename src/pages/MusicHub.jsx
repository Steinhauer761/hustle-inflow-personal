import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Music, Link, Trash2, ExternalLink, Plus, Disc } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import Tier2Footer from '@/components/shared/Tier2Footer';

const PLATFORMS = {
  spotify: { name: 'Spotify', icon: Music, color: 'text-green-500', bg: 'bg-green-500/10' },
  amazon: { name: 'Amazon Music', icon: Disc, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  apple: { name: 'Apple Music', icon: Music, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  youtube: { name: 'YouTube Music', icon: Music, color: 'text-red-500', bg: 'bg-red-500/10' },
  other: { name: 'Other', icon: Link, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export default function MusicHub() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [platform, setPlatform] = useState('spotify');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const { data: links = [], isLoading, refetch } = useQuery({
    queryKey: ['musicLinks'],
    queryFn: () => base44.entities.MusicLink.filter({}, '-created_date'),
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.MusicLink.create({
        platform,
        title,
        url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musicLinks'] });
      setShowAddForm(false);
      setTitle('');
      setUrl('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.MusicLink.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musicLinks'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    addMutation.mutate();
  };

  const handleOpenLink = (url) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Music Hub" />
      <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-foreground mb-2">
            🎵 Music Hub
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect and share your favorite music profiles and playlists
          </p>
        </div>

        {/* Add Link Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm mb-6"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Music Link'}
        </button>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2.5 block">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PLATFORMS).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPlatform(key)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all
                          ${platform === key 
                            ? `${config.bg} ${config.color} border-current shadow-sm` 
                            : 'bg-muted border-border text-muted-foreground hover:border-primary/30'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Workout Playlist"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Link URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                type="submit"
                disabled={addMutation.isPending}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-40 shadow-sm"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Link'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Music Grid */}
        {links.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Music Links Yet</h3>
            <p className="text-sm text-muted-foreground">Add your Spotify, Apple Music, or other music profiles to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {links.map((link, i) => {
              const PlatformIcon = PLATFORMS[link.platform]?.icon || Music;
              const platformColor = PLATFORMS[link.platform]?.color || 'text-muted-foreground';
              const platformBg = PLATFORMS[link.platform]?.bg || 'bg-muted';

              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                  onClick={() => handleOpenLink(link.url)}
                >
                  <div className={`h-32 ${platformBg} flex items-center justify-center relative`}>
                    <PlatformIcon className={`w-16 h-16 ${platformColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(link.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground truncate mb-1">{link.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{PLATFORMS[link.platform]?.name || 'Music Link'}</p>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Integration Info */}
        <div className="mt-8 bg-card/50 border border-border rounded-2xl p-4">
          <p className="text-xs font-bold text-foreground mb-2">🎵 Connect Your Music</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Add links to your favorite music platforms. Share your playlists, artist profile, 
            or favorite albums with your network. Perfect for DJs, musicians, or just music lovers!
          </p>
        </div>

        <Tier2Footer moduleName="Music Hub" />
      </div>
    </div>
  );
}
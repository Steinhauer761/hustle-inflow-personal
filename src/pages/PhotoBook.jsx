import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Music, Trash2, ExternalLink, Plus, Image as ImageIcon } from 'lucide-react';
import Tier2Banner from '@/components/shared/Tier2Banner';
import Tier2Footer from '@/components/shared/Tier2Footer';

export default function PhotoBook() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [caption, setCaption] = useState('');

  const { data: photos = [], isLoading, refetch } = useQuery({
    queryKey: ['photos'],
    queryFn: () => base44.entities.PhotoAlbum.filter({}, '-uploaded_date'),
  });

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const list = await base44.entities.UserSettings.list('-updated_date', 1);
      return list[0] || null;
    },
  });

  const isPremium = settings?.description === 'PREMIUM_MEMBER';
  const freeLimit = isPremium ? Infinity : 10;
  const isOverLimit = photos.length >= freeLimit;
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return await base44.entities.PhotoAlbum.create({
        file_url,
        caption: caption || '',
        uploaded_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      refetch();
      setShowUpload(false);
      setCaption('');
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.PhotoAlbum.delete(id);
    },
    onSuccess: () => {
      refetch();
      setSelectedPhoto(null);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    uploadMutation.mutate(file);
  };

  const handleAIEdit = () => {
    if (!isPremium) {
      alert('AI Photo Editor is a Tier 2 feature - upgrade to premium to unlock it!');
    } else {
      alert('AI Photo Editor coming soon for Premium members!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading your photo book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tier2Banner feature="Photo Book" />
      <div className="px-4 pt-4 pb-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display text-foreground mb-2">
                📸 Photo Book
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your memories, beautifully organized • <span className="font-semibold text-foreground">{photos.length}</span> of <span className="font-semibold text-foreground">{freeLimit}</span> free photos used
              </p>
            </div>
            <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Upload CTA */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">
                {isOverLimit ? 'Upgrade for Unlimited Photos' : 'Add More Memories'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isOverLimit 
                  ? 'You\'ve used all 10 free photos. Upgrade to Tier 2 for unlimited storage and AI editing tools.'
                  : isPremium ? 'Unlimited photos remaining' : `${freeLimit - photos.length} free photos remaining`}
              </p>
            </div>
            {!isOverLimit && (
              <label className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-lg cursor-pointer hover:bg-primary/90 transition-all shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            {isOverLimit && (
              <button className="bg-primary text-primary-foreground font-semibold py-2.5 px-5 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
                Upgrade to Tier 2
              </button>
            )}
          </div>
          {uploading && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
              Uploading your photo...
            </div>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Photos Yet</h3>
            <p className="text-sm text-muted-foreground">Upload your first memory above to start your photo book!</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square rounded-xl overflow-hidden bg-card border border-border relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.file_url}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-xs text-white font-medium truncate">{photo.caption}</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(photo.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <img
                        src={photo.file_url}
                        alt={photo.caption || 'Photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {photo.caption || 'Untitled Photo'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded {photo.uploaded_date}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(photo.id);
                      }}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-red-500/10 border border-border hover:border-red-500/30 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Photo Detail Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto.file_url}
                  alt={selectedPhoto.caption || 'Photo'}
                  className="w-full h-auto rounded-2xl max-h-[70vh] object-contain"
                />
                {selectedPhoto.caption && (
                  <p className="text-center text-sm text-white mt-3 font-medium">{selectedPhoto.caption}</p>
                )}
                <div className="flex gap-2 mt-4 justify-center">
                  <button
                    onClick={handleAIEdit}
                    className="flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary font-bold py-2 px-4 rounded-xl hover:bg-primary/30 transition-all"
                  >
                    <Upload className="w-4 h-4" /> AI Edit {isPremium ? '' : '(Tier 2)'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(selectedPhoto.id)}
                    className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 font-bold py-2 px-4 rounded-xl hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <span className="text-xl">×</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tier2Footer moduleName="Photo Book" />
      </div>
    </div>
  );
}
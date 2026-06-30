import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PhotoAlbum({ photos = [], onChange, accentColor = '#E05A00' }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // index
  const [editingCaption, setEditingCaption] = useState(null); // index

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newPhotos = [...photos];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push({ url: file_url, caption: '', date: new Date().toISOString().split('T')[0] });
    }
    onChange(newPhotos);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onChange(updated);
    if (lightbox === idx) setLightbox(null);
  };

  const handleCaption = (idx, caption) => {
    const updated = photos.map((p, i) => i === idx ? { ...p, caption } : p);
    onChange(updated);
    setEditingCaption(null);
  };

  return (
    <div>
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <img src={photos[lightbox].url} alt="" className="w-full rounded-2xl object-contain max-h-[70vh]" />
              {/* Caption */}
              {editingCaption === lightbox ? (
                <input
                  autoFocus
                  defaultValue={photos[lightbox].caption}
                  onBlur={e => handleCaption(lightbox, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCaption(lightbox, e.target.value)}
                  className="mt-2 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
                  placeholder="Add a caption..."
                />
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm text-white/70 flex-1">{photos[lightbox].caption || <span className="italic opacity-40">No caption</span>}</p>
                  <button onClick={() => setEditingCaption(lightbox)} className="text-white/40 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(lightbox)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {/* Nav arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setLightbox((lightbox - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1.5 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setLightbox((lightbox + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1.5 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <button onClick={() => setLightbox(null)} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {photos.map((photo, i) => (
            <motion.button
              key={photo.url + i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-xl overflow-hidden relative group border border-border"
            >
              <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                  <p className="text-[9px] text-white truncate">{photo.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Add button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-semibold">Add</span>
            </>
          )}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleAdd} className="hidden" />
    </div>
  );
}
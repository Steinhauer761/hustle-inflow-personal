import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Cake, AlertTriangle, Heart, StickyNote, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import FamilyMemberForm from '@/components/family/FamilyMemberForm';
import PhotoAlbum from '@/components/shared/PhotoAlbum';

const relationEmojis = { partner: '💑', child: '👶', parent: '👨‍👦', sibling: '🤝', other: '👤' };
const ACCENT_COLORS = ['#E05A00','#E05078','#7C3AED','#0891B2','#059669','#CA8A04','#DC2626'];

export default function FamilyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ['family-member', id],
    queryFn: async () => {
      const list = await base44.entities.FamilyMember.list();
      return list.find(m => m.id === id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: data => base44.entities.FamilyMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-member', id] });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setShowEdit(false);
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({ ...member, photo_url: file_url });
    setUploadingPhoto(false);
  };

  const handleAlbumChange = (photos) => {
    updateMutation.mutate({ ...member, photos });
  };

  if (isLoading || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accent = member.cover_color || '#E05A00';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative pb-6" style={{ background: `linear-gradient(160deg, ${accent}22 0%, ${accent}11 60%, transparent 100%)` }}>
        <div className="px-4 pt-5 flex items-center justify-between">
          <button onClick={() => navigate('/family')} className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setShowEdit(true)} className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-4 pb-2 px-4">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: accent }}>
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">
                  {relationEmojis[member.relationship] || '👤'}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow" style={{ background: accent }}>
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <h1 className="text-2xl font-display text-foreground">{member.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{member.relationship}</p>

          {/* Color picker */}
          <div className="flex gap-1.5 mt-3">
            {ACCENT_COLORS.map(color => (
              <button
                key={color}
                onClick={() => updateMutation.mutate({ ...member, cover_color: color })}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: color, borderColor: accent === color ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-5">
        {/* Info pills */}
        <div className="flex flex-wrap gap-2">
          {member.birthday && (
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 text-xs font-semibold text-foreground">
              <Cake className="w-3.5 h-3.5" style={{ color: accent }} />
              {format(new Date(member.birthday), 'MMMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Allergies */}
        {member.allergies?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Allergies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {member.allergies.map(a => (
                <Badge key={a} variant="destructive" className="rounded-full">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Food preferences */}
        {member.food_preferences?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Food Preferences
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {member.food_preferences.map(f => (
                <Badge key={f} className="rounded-full bg-muted text-foreground border border-border">{f}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {member.notes && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </h3>
            <p className="text-sm text-foreground bg-muted/40 rounded-2xl p-3">{member.notes}</p>
          </div>
        )}

        {/* Photo Album */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">📸 Photo Album</h3>
          <PhotoAlbum
            photos={member.photos || []}
            onChange={handleAlbumChange}
            accentColor={accent}
          />
        </div>
      </div>

      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <FamilyMemberForm
            member={member}
            onSubmit={data => updateMutation.mutate(data)}
            onCancel={() => setShowEdit(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
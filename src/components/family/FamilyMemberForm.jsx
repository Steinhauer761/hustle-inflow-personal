import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FamilyMemberForm({ member, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    relationship: member?.relationship || 'other',
    photo_url: member?.photo_url || '',
    birthday: member?.birthday || '',
    allergies: member?.allergies?.join(', ') || '',
    food_preferences: member?.food_preferences?.join(', ') || '',
    notes: member?.notes || '',
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      food_preferences: form.food_preferences ? form.food_preferences.split(',').map(s => s.trim()).filter(Boolean) : [],
    });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{member ? 'Edit Member' : 'Add Family Member'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      {/* Photo */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden"
        >
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-muted-foreground" />
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>
      {uploading && <p className="text-xs text-center text-muted-foreground">Uploading...</p>}

      <div>
        <Label>Name *</Label>
        <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Name" required className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Relationship</Label>
          <Select value={form.relationship} onValueChange={v => update('relationship', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="myself">🙋 Myself</SelectItem>
              <SelectItem value="partner">💑 Partner</SelectItem>
              <SelectItem value="child">👶 Child</SelectItem>
              <SelectItem value="parent">👨‍👦 Parent</SelectItem>
              <SelectItem value="sibling">🤝 Sibling</SelectItem>
              <SelectItem value="other">👤 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Birthday</Label>
          <Input type="date" value={form.birthday} onChange={e => update('birthday', e.target.value)} className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Allergies</Label>
        <Input value={form.allergies} onChange={e => update('allergies', e.target.value)} placeholder="peanuts, dairy..." className="mt-1" />
      </div>

      <div>
        <Label>Food Preferences</Label>
        <Input value={form.food_preferences} onChange={e => update('food_preferences', e.target.value)} placeholder="vegetarian, loves pasta..." className="mt-1" />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any extra info..." className="mt-1" rows={2} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">{member ? 'Update' : 'Add'}</Button>
      </div>
    </form>
  );
}
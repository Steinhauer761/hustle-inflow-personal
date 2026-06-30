import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const speciesOptions = [
  { value: 'dog', label: '🐶 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'fish', label: '🐠 Fish' },
  { value: 'hamster', label: '🐹 Hamster' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'reptile', label: '🦎 Reptile' },
  { value: 'other', label: '🐾 Other' },
];

export default function PetForm({ pet, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: pet?.name || '',
    species: pet?.species || 'dog',
    breed: pet?.breed || '',
    photo_url: pet?.photo_url || '',
    birthday: pet?.birthday || '',
    vet_name: pet?.vet_name || '',
    vet_phone: pet?.vet_phone || '',
    next_vet_visit: pet?.next_vet_visit || '',
    next_grooming: pet?.next_grooming || '',
    feeding_schedule: pet?.feeding_schedule || '',
    medications: pet?.medications || '',
    notes: pet?.notes || '',
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
    onSubmit(form);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{pet ? 'Edit Pet' : 'Add Pet'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
          {form.photo_url ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-muted-foreground" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>
      {uploading && <p className="text-xs text-center text-muted-foreground">Uploading...</p>}

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} required className="mt-1" /></div>
        <div>
          <Label>Species</Label>
          <Select value={form.species} onValueChange={v => update('species', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{speciesOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Breed</Label><Input value={form.breed} onChange={e => update('breed', e.target.value)} className="mt-1" /></div>
        <div><Label>Birthday</Label><Input type="date" value={form.birthday} onChange={e => update('birthday', e.target.value)} className="mt-1" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Vet Name</Label><Input value={form.vet_name} onChange={e => update('vet_name', e.target.value)} className="mt-1" /></div>
        <div><Label>Vet Phone</Label><Input value={form.vet_phone} onChange={e => update('vet_phone', e.target.value)} className="mt-1" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Next Vet Visit</Label><Input type="date" value={form.next_vet_visit} onChange={e => update('next_vet_visit', e.target.value)} className="mt-1" /></div>
        <div><Label>Next Grooming</Label><Input type="date" value={form.next_grooming} onChange={e => update('next_grooming', e.target.value)} className="mt-1" /></div>
      </div>

      <div><Label>Feeding Schedule</Label><Textarea value={form.feeding_schedule} onChange={e => update('feeding_schedule', e.target.value)} placeholder="Morning: 1 cup kibble..." className="mt-1" rows={2} /></div>
      <div><Label>Medications</Label><Input value={form.medications} onChange={e => update('medications', e.target.value)} className="mt-1" /></div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} className="mt-1" rows={2} /></div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">{pet ? 'Update' : 'Add Pet'}</Button>
      </div>
    </form>
  );
}
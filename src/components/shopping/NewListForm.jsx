import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LIST_EMOJIS = ['🛒', '🏪', '🥗', '🍳', '🧹', '🐾', '🏠', '💊', '🎉', '📦'];
const LIST_COLORS = ['#F59E0B', '#8B5CF6', '#059669', '#0891B2', '#EF4444', '#EC4899', '#E05A00', '#6366F1'];

export default function NewListForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', store: '', emoji: '🛒', color: '#F59E0B', meal_plan: '' });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="p-1 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">New Shopping List</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>List Name *</Label>
          <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Weekly Groceries" required className="mt-1" />
        </div>
        <div>
          <Label>Store</Label>
          <Input value={form.store} onChange={e => update('store', e.target.value)} placeholder="e.g. Costco" className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Linked Meal Plan / Recipe</Label>
        <Input value={form.meal_plan} onChange={e => update('meal_plan', e.target.value)} placeholder="e.g. Week 3 meal prep" className="mt-1" />
      </div>

      <div>
        <Label>Icon</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {LIST_EMOJIS.map(e => (
            <button type="button" key={e} onClick={() => update('emoji', e)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/40 hover:bg-muted'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2">
          {LIST_COLORS.map(c => (
            <button type="button" key={c} onClick={() => update('color', c)}
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">Create List</Button>
      </div>
    </form>
  );
}
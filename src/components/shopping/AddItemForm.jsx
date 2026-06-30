import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SECTIONS = {
  produce: { label: 'Produce', emoji: '🥦' },
  dairy: { label: 'Dairy', emoji: '🥛' },
  meat: { label: 'Meat', emoji: '🥩' },
  bakery: { label: 'Bakery', emoji: '🍞' },
  frozen: { label: 'Frozen', emoji: '🧊' },
  pantry: { label: 'Pantry', emoji: '🥫' },
  beverages: { label: 'Beverages', emoji: '🧃' },
  household: { label: 'Household', emoji: '🧹' },
  personal_care: { label: 'Personal Care', emoji: '🧴' },
  other: { label: 'Other', emoji: '📦' },
};

export default function AddItemForm({ listId, familyMembers, onSubmit, onCancel, editItem }) {
  const [form, setForm] = useState({
    name: editItem?.name || '',
    quantity: editItem?.quantity || '',
    store_section: editItem?.store_section || 'other',
    added_by: editItem?.added_by || '',
    recipe_link: editItem?.recipe_link || '',
    notes: editItem?.notes || '',
    list_id: listId,
    purchased: editItem?.purchased || false,
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{editItem ? 'Edit Item' : 'Add Item'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      <div>
        <Label>Item Name *</Label>
        <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Almond milk" required className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Quantity</Label>
          <Input value={form.quantity} onChange={e => update('quantity', e.target.value)} placeholder="e.g. 2 packs" className="mt-1" />
        </div>
        <div>
          <Label>Added By</Label>
          {familyMembers.length > 0 ? (
            <select
              value={form.added_by}
              onChange={e => update('added_by', e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="">Select...</option>
              {familyMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          ) : (
            <Input value={form.added_by} onChange={e => update('added_by', e.target.value)} placeholder="Your name" className="mt-1" />
          )}
        </div>
      </div>

      {/* Section */}
      <div>
        <Label>Store Section</Label>
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {Object.entries(SECTIONS).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => update('store_section', key)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                form.store_section === key
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span className="text-base">{cfg.emoji}</span>
              <span className="leading-tight text-center">{cfg.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe link */}
      <div>
        <Label className="flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5 text-accent" /> Recipe / Meal Plan</Label>
        <Input value={form.recipe_link} onChange={e => update('recipe_link', e.target.value)} placeholder="e.g. Taco Tuesday, Lasagna recipe" className="mt-1" />
      </div>

      <div>
        <Label>Notes</Label>
        <Input value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Optional" className="mt-1" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">{editItem ? 'Update' : 'Add Item'}</Button>
      </div>
    </form>
  );
}
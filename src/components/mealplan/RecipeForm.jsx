import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RECIPE_EMOJIS = ['🍽️','🍝','🌮','🍕','🥗','🍜','🥘','🍛','🍔','🥩','🍗','🐟','🥞','🥚','🥣','🥪','🍱','🫕'];
const SECTIONS = ['produce','dairy','meat','bakery','frozen','pantry','beverages','other'];

export default function RecipeForm({ recipe, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: recipe?.name || '',
    emoji: recipe?.emoji || '🍽️',
    description: recipe?.description || '',
    prep_time: recipe?.prep_time || '',
    servings: recipe?.servings || 4,
    instructions: recipe?.instructions || '',
    tags: recipe?.tags?.join(', ') || '',
    ingredients: recipe?.ingredients?.length > 0 ? recipe.ingredients : [{ name: '', quantity: '', section: 'other' }],
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const updateIngredient = (i, k, v) => {
    const ing = [...form.ingredients];
    ing[i] = { ...ing[i], [k]: v };
    update('ingredients', ing);
  };
  const addIngredient = () => update('ingredients', [...form.ingredients, { name: '', quantity: '', section: 'other' }]);
  const removeIngredient = (i) => update('ingredients', form.ingredients.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      prep_time: form.prep_time ? parseInt(form.prep_time) : null,
      servings: parseInt(form.servings) || 4,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      ingredients: form.ingredients.filter(i => i.name.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{recipe ? 'Edit Recipe' : 'New Recipe'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      {/* Emoji picker */}
      <div>
        <Label>Icon</Label>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {RECIPE_EMOJIS.map(e => (
            <button type="button" key={e} onClick={() => update('emoji', e)}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/40 hover:bg-muted'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Recipe Name *</Label>
        <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Chicken Stir Fry" required className="mt-1" />
      </div>

      <div>
        <Label>Description</Label>
        <Input value={form.description} onChange={e => update('description', e.target.value)} placeholder="Short description" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Prep Time (mins)</Label>
          <Input type="number" value={form.prep_time} onChange={e => update('prep_time', e.target.value)} placeholder="30" className="mt-1" />
        </div>
        <div>
          <Label>Servings</Label>
          <Input type="number" value={form.servings} onChange={e => update('servings', e.target.value)} placeholder="4" className="mt-1" />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Ingredients</Label>
          <button type="button" onClick={addIngredient}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/80 transition-colors">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} placeholder="Ingredient" className="flex-1" />
              <Input value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} placeholder="Qty" className="w-20" />
              <select value={ing.section} onChange={e => updateIngredient(i, 'section', e.target.value)}
                className="bg-input border border-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none w-24 shrink-0">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" onClick={() => removeIngredient(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Instructions</Label>
        <textarea value={form.instructions} onChange={e => update('instructions', e.target.value)}
          placeholder="Step by step instructions..."
          className="mt-1 w-full bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 h-24 resize-none" />
      </div>

      <div>
        <Label>Tags (comma separated)</Label>
        <Input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="e.g. quick, vegetarian, family" className="mt-1" />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
        <Button type="submit" className="flex-1 rounded-xl">{recipe ? 'Update' : 'Save Recipe'}</Button>
      </div>
    </form>
  );
}
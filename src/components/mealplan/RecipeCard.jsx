import { Pencil, Trash2, Clock, Users } from 'lucide-react';

export default function RecipeCard({ recipe, onEdit, onDelete, draggable, onDragStart, compact }) {
  if (compact) {
    return (
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
      >
        <span className="text-lg">{recipe.emoji || '🍽️'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{recipe.name}</p>
          {recipe.prep_time && <p className="text-[10px] text-muted-foreground">{recipe.prep_time}min</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{recipe.emoji || '🍽️'}</span>
          <div>
            <h3 className="font-bold text-foreground text-sm">{recipe.name}</h3>
            {recipe.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{recipe.description}</p>}
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button onClick={() => onEdit(recipe)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(recipe.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {recipe.prep_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prep_time} min</span>}
        {recipe.servings && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings} servings</span>}
        {recipe.ingredients?.length > 0 && <span>{recipe.ingredients.length} ingredients</span>}
      </div>
      {recipe.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {recipe.tags.map(t => (
            <span key={t} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
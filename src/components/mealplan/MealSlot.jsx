import { X } from 'lucide-react';

const MEAL_COLORS = {
  breakfast: 'from-yellow-900/40 to-orange-900/20 border-yellow-800/40',
  lunch: 'from-green-900/40 to-emerald-900/20 border-green-800/40',
  dinner: 'from-indigo-900/40 to-purple-900/20 border-indigo-800/40',
  snack: 'from-pink-900/40 to-rose-900/20 border-pink-800/40',
};

export default function MealSlot({ day, meal, assignment, onDrop, onRemove }) {
  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-primary'); };
  const handleDragLeave = (e) => e.currentTarget.classList.remove('ring-2', 'ring-primary');
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
    const data = JSON.parse(e.dataTransfer.getData('recipe'));
    onDrop(day, meal, data);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative min-h-[52px] rounded-xl border bg-gradient-to-br transition-all ${MEAL_COLORS[meal]} ${
        assignment ? 'opacity-100' : 'opacity-60 hover:opacity-90'
      }`}
    >
      {assignment ? (
        <div className="flex items-center gap-1.5 p-2 pr-7">
          <span className="text-base shrink-0">{assignment.recipe_emoji || '🍽️'}</span>
          <span className="text-[11px] font-bold text-foreground leading-tight line-clamp-2">{assignment.recipe_name}</span>
          <button
            onClick={() => onRemove(day, meal)}
            className="absolute top-1.5 right-1.5 p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[52px]">
          <span className="text-[10px] text-muted-foreground/60 font-semibold">drop here</span>
        </div>
      )}
    </div>
  );
}
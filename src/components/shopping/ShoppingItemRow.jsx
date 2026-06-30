import { motion } from 'framer-motion';
import { Pencil, Trash2, ChefHat } from 'lucide-react';

const SECTION_EMOJI = {
  produce: '🥦', dairy: '🥛', meat: '🥩', bakery: '🍞',
  frozen: '🧊', pantry: '🥫', beverages: '🧃',
  household: '🧹', personal_care: '🧴', other: '📦',
};

export default function ShoppingItemRow({ item, onToggle, onEdit, onDelete, index }) {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
        item.purchased ? 'opacity-40' : 'bg-card border border-border'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          item.purchased
            ? 'bg-accent border-accent text-accent-foreground'
            : 'border-border hover:border-primary'
        }`}
      >
        {item.purchased && <span className="text-xs font-bold">✓</span>}
      </button>

      {/* Section emoji */}
      <span className="text-base shrink-0">{SECTION_EMOJI[item.store_section] || '📦'}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm font-semibold text-foreground ${item.purchased ? 'line-through' : ''}`}>
            {item.name}
          </span>
          {item.quantity && (
            <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5">{item.quantity}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {item.added_by && (
            <span className="text-[10px] text-muted-foreground">by {item.added_by}</span>
          )}
          {item.recipe_link && (
            <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
              <ChefHat className="w-2.5 h-2.5" />{item.recipe_link}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
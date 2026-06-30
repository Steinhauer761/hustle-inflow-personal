import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, ChefHat, ShoppingCart, CheckCheck, RotateCcw, Store } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AddItemForm from '@/components/shopping/AddItemForm';
import ShoppingItemRow from '@/components/shopping/ShoppingItemRow';
import NewListForm from '@/components/shopping/NewListForm';

const SECTION_ORDER = ['produce', 'meat', 'dairy', 'bakery', 'frozen', 'pantry', 'beverages', 'household', 'personal_care', 'other'];
const SECTION_LABELS = {
  produce: '🥦 Produce', meat: '🥩 Meat', dairy: '🥛 Dairy', bakery: '🍞 Bakery',
  frozen: '🧊 Frozen', pantry: '🥫 Pantry', beverages: '🧃 Beverages',
  household: '🧹 Household', personal_care: '🧴 Personal Care', other: '📦 Other',
};

export default function Shopping() {
  const [activeListId, setActiveListId] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showPurchased, setShowPurchased] = useState(false);
  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => base44.entities.ShoppingList.list('-created_date'),
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ['shopping-items'],
    queryFn: () => base44.entities.ShoppingItem.list('-created_date', 500),
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const activeList = useMemo(() => lists.find(l => l.id === activeListId) || lists[0], [lists, activeListId]);

  const items = useMemo(() =>
    allItems.filter(i => i.list_id === (activeList?.id || null) || (!i.list_id && !activeList)),
    [allItems, activeList]
  );

  const pending = items.filter(i => !i.purchased);
  const purchased = items.filter(i => i.purchased);

  const grouped = useMemo(() => {
    const map = {};
    pending.forEach(item => {
      const s = item.store_section || 'other';
      if (!map[s]) map[s] = [];
      map[s].push(item);
    });
    return map;
  }, [pending]);

  const createList = useMutation({
    mutationFn: d => base44.entities.ShoppingList.create(d),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setActiveListId(data.id);
      setShowListForm(false);
    },
  });

  const deleteList = useMutation({
    mutationFn: async (id) => {
      const toDelete = allItems.filter(i => i.list_id === id);
      await Promise.all(toDelete.map(i => base44.entities.ShoppingItem.delete(i.id)));
      await base44.entities.ShoppingList.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      setActiveListId(null);
    },
  });

  const addItem = useMutation({
    mutationFn: d => base44.entities.ShoppingItem.create({ ...d, list_id: activeList?.id || null }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shopping-items'] }); setShowItemForm(false); },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shopping-items'] }); setShowItemForm(false); setEditItem(null); },
  });

  const deleteItem = useMutation({
    mutationFn: id => base44.entities.ShoppingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });

  const clearPurchased = useMutation({
    mutationFn: () => Promise.all(purchased.map(i => base44.entities.ShoppingItem.delete(i.id))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-items'] }),
  });

  const handleToggle = (item) => updateItem.mutate({ id: item.id, data: { purchased: !item.purchased } });
  const handleItemSubmit = (data) => {
    if (editItem) updateItem.mutate({ id: editItem.id, data });
    else addItem.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(160deg, #001a0f 0%, #002d1a 60%, #000f0a 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h1 className="text-2xl font-display text-foreground">Shopping</h1>
          </div>
          <button
            onClick={() => setShowListForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/20 text-accent text-xs font-bold hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New List
          </button>
        </div>

        {/* List tabs */}
        {lists.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                  activeList?.id === list.id
                    ? 'text-white border-transparent'
                    : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/30'
                }`}
                style={activeList?.id === list.id ? { backgroundColor: list.color || '#E05A00' } : {}}
              >
                <span>{list.emoji || '🛒'}</span> {list.name}
                {list.store && <span className="opacity-70">· {list.store}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-8 max-w-lg mx-auto pt-4">
        {!activeList && lists.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-5xl mb-4">🛒</p>
            <h2 className="text-lg font-bold text-foreground mb-1">No shopping lists yet</h2>
            <p className="text-sm text-muted-foreground mb-5">Create a list and start adding items for your family.</p>
            <button onClick={() => setShowListForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Create First List
            </button>
          </motion.div>
        ) : (
          <>
            {/* Active list info */}
            {activeList && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeList.emoji || '🛒'}</span>
                    <span className="font-bold text-foreground">{activeList.name}</span>
                    {activeList.store && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Store className="w-3 h-3" />{activeList.store}
                      </span>
                    )}
                  </div>
                  {activeList.meal_plan && (
                    <p className="text-xs text-accent mt-0.5 flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />{activeList.meal_plan}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{pending.length} left</span>
                  <button onClick={() => deleteList.mutate(activeList.id)}
                    className="ml-2 p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Add item button */}
            <button
              onClick={() => { setEditItem(null); setShowItemForm(true); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5 transition-colors mb-5"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>

            {/* Grouped sections */}
            {SECTION_ORDER.filter(s => grouped[s]).map(section => (
              <div key={section} className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                  {SECTION_LABELS[section]}
                </p>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {grouped[section].map((item, i) => (
                      <ShoppingItemRow
                        key={item.id}
                        item={item}
                        index={i}
                        onToggle={handleToggle}
                        onEdit={(item) => { setEditItem(item); setShowItemForm(true); }}
                        onDelete={(id) => deleteItem.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {pending.length === 0 && items.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-sm font-bold text-foreground">All items purchased!</p>
              </motion.div>
            )}

            {/* Purchased section */}
            {purchased.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setShowPurchased(v => !v)}
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5" /> Done ({purchased.length})
                    <span className="text-[10px] text-muted-foreground/60">{showPurchased ? '▲' : '▼'}</span>
                  </button>
                  <button onClick={() => clearPurchased.mutate()}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors font-semibold">
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
                {showPurchased && (
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {purchased.map((item, i) => (
                        <ShoppingItemRow
                          key={item.id}
                          item={item}
                          index={i}
                          onToggle={handleToggle}
                          onEdit={(item) => { setEditItem(item); setShowItemForm(true); }}
                          onDelete={(id) => deleteItem.mutate(id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit item sheet */}
      <Sheet open={showItemForm} onOpenChange={v => { setShowItemForm(v); if (!v) setEditItem(null); }}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
          <AddItemForm
            listId={activeList?.id}
            familyMembers={familyMembers}
            editItem={editItem}
            onSubmit={handleItemSubmit}
            onCancel={() => { setShowItemForm(false); setEditItem(null); }}
          />
        </SheetContent>
      </Sheet>

      {/* New list sheet */}
      <Sheet open={showListForm} onOpenChange={setShowListForm}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <NewListForm
            onSubmit={d => createList.mutate(d)}
            onCancel={() => setShowListForm(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
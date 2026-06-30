import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import UpcomingTasksWidget from './UpcomingTasksWidget';
import DailySpendingWidget from './DailySpendingWidget';
import ActiveTripsWidget from './ActiveTripsWidget';

const WIDGET_REGISTRY = {
  upcoming_tasks: {
    id: 'upcoming_tasks',
    label: 'Upcoming Tasks',
    component: UpcomingTasksWidget,
    minHeight: 280,
  },
  daily_spending: {
    id: 'daily_spending',
    label: 'Daily Spending',
    component: DailySpendingWidget,
    minHeight: 280,
  },
  active_trips: {
    id: 'active_trips',
    label: 'Active Trips',
    component: ActiveTripsWidget,
    minHeight: 280,
  },
};

const DEFAULT_ORDER = ['upcoming_tasks', 'daily_spending', 'active_trips'];
const STORAGE_KEY = 'hif_widget_order';

export default function DraggableDashboard() {
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate all keys are still valid
        if (parsed.every(id => WIDGET_REGISTRY[id])) return parsed;
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = useCallback((result) => {
    setIsDragging(false);
    if (!result.destination) return;
    const newOrder = Array.from(widgetOrder);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setWidgetOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  }, [widgetOrder]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Your Dashboard
        </h2>
        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
          <GripVertical className="w-3 h-3" /> drag to reorder
        </span>
      </div>

      <DragDropContext
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {widgetOrder.map((widgetId, index) => {
                const widget = WIDGET_REGISTRY[widgetId];
                if (!widget) return null;
                const WidgetComponent = widget.component;

                return (
                  <Draggable key={widgetId} draggableId={widgetId} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        style={dragProvided.draggableProps.style}
                      >
                        <motion.div
                          animate={{
                            scale: dragSnapshot.isDragging ? 1.02 : 1,
                            boxShadow: dragSnapshot.isDragging
                              ? '0 20px 40px rgba(0,0,0,0.5)'
                              : '0 0 0 rgba(0,0,0,0)',
                          }}
                          transition={{ duration: 0.15 }}
                          className="bg-card border border-border rounded-3xl overflow-hidden"
                          style={{ minHeight: widget.minHeight }}
                        >
                          {/* Drag handle bar */}
                          <div
                            {...dragProvided.dragHandleProps}
                            className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing border-b border-border/50 bg-muted/30 select-none"
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                          </div>

                          <div className="p-5" style={{ minHeight: widget.minHeight - 36 }}>
                            <WidgetComponent />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
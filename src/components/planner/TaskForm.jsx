import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

const categories = [
  { value: 'errand', label: '🏃 Errand' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'meal', label: '🍽️ Meal' },
  { value: 'bill', label: '💰 Bill' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
  { value: 'pet', label: '🐾 Pet' },
  { value: 'self_care', label: '🧘 Self Care' },
  { value: 'work', label: '💼 Work' },
  { value: 'social', label: '🎉 Social' },
  { value: 'other', label: '📌 Other' },
];

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    date: task?.date || new Date().toISOString().split('T')[0],
    time: task?.time || '',
    category: task?.category || 'other',
    priority: task?.priority || 'medium',
    assigned_to: task?.assigned_to || '',
    notes: task?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{task ? 'Edit Task' : 'New Task'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <Label>Title *</Label>
        <Input
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="What needs doing?"
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Time</Label>
          <Input type="time" value={form.time} onChange={e => update('time', e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => update('category', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => update('priority', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="urgent">🔴 Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={e => update('description', e.target.value)}
          placeholder="Any extra details..."
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label>Assign to</Label>
        <Input
          value={form.assigned_to}
          onChange={e => update('assigned_to', e.target.value)}
          placeholder="Family member name"
          className="mt-1"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 rounded-xl">
          {task ? 'Update' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}
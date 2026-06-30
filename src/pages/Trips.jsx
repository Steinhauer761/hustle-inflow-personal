import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Plane, MapPin, Calendar, DollarSign,
  Upload, Loader2, Sparkles, X, Hotel, ChevronDown, ChevronUp, FileText, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import PageHero from '@/components/shared/PageHero';
import EmptyState from '@/components/shared/EmptyState';
import TripItineraryPlanner from '@/components/trips/TripItineraryPlanner';
import TripMapView from '@/components/trips/TripMapView';
import { toast } from 'sonner';

const tripTypeIcons = { road_trip: '🚗', flight: '✈️', vacation: '🏖️', day_trip: '🌅', other: '🗺️' };
const statusColors = { planning: 'bg-amber-100 text-amber-700', booked: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600' };

// ── Small helpers ──────────────────────────────────────────────
function SectionLabel({ children }) {
  return <p className="text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-2">{children}</p>;
}

function UploadRow({ label, file_url, file_label, onUpload, onRemove, uploading }) {
  const ref = useRef();
  return (
    <div className="flex items-center gap-2 mt-1">
      {file_url ? (
        <div className="flex-1 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-500">
          <FileText className="w-3 h-3 shrink-0" />
          <a href={file_url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline flex-1">{file_label || label}</a>
          <button type="button" onClick={onRemove}><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" className="text-xs border-amber-500/30 text-amber-500 h-7 gap-1" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {label}
        </Button>
      )}
      <input ref={ref} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
    </div>
  );
}

// ── Trip Form ──────────────────────────────────────────────────
function TripForm({ trip, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: trip?.title || '',
    destination: trip?.destination || '',
    trip_type: trip?.trip_type || 'road_trip',
    start_date: trip?.start_date || '',
    end_date: trip?.end_date || '',
    budget: trip?.budget || '',
    notes: trip?.notes || '',
    status: trip?.status || 'planning',
    packing_list: trip?.packing_list || [],
  });
  const [packingInput, setPackingInput] = useState('');
  const [flights, setFlights] = useState(trip?.flights || []);
  const [hotels, setHotels] = useState(trip?.hotels || []);
  const [documents, setDocuments] = useState(trip?.documents || []);
  const [uploadingIdx, setUploadingIdx] = useState(null); // "flight-0", "hotel-0", "doc", "parse"
  const [generating, setGenerating] = useState(false);
  const docRef = useRef();

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Upload helper — returns { file_url, file_label }
  const uploadFile = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return { file_url, file_label: file.name };
  };

  // ── AI parse uploaded doc to auto-fill flight/hotel ──
  const parseAndFill = async (file) => {
    setUploadingIdx('parse');
    const { file_url, file_label } = await uploadFile(file);
    // Add to general docs first
    setDocuments(prev => [...prev, { label: file_label, file_url }]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract travel details from this document (flight ticket, hotel booking, itinerary, etc). If it's a flight, extract airline, flight number, departure/arrival airports, departure/arrival datetimes, confirmation code. If it's a hotel, extract hotel name, address, check-in, check-out date, confirmation code, cost per night. Return what you can find; leave fields empty if not present.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['flight', 'hotel', 'other'] },
          flight: {
            type: 'object',
            properties: {
              airline: { type: 'string' }, flight_number: { type: 'string' },
              departure_airport: { type: 'string' }, arrival_airport: { type: 'string' },
              departure_datetime: { type: 'string' }, arrival_datetime: { type: 'string' },
              confirmation_code: { type: 'string' }
            }
          },
          hotel: {
            type: 'object',
            properties: {
              name: { type: 'string' }, address: { type: 'string' },
              check_in: { type: 'string' }, check_out: { type: 'string' },
              confirmation_code: { type: 'string' }, cost_per_night: { type: 'number' }
            }
          }
        }
      }
    });

    if (result.type === 'flight' && result.flight) {
      setFlights(prev => [...prev, { ...result.flight, file_url, file_label }]);
      toast.success('✈️ Flight details extracted!');
    } else if (result.type === 'hotel' && result.hotel) {
      setHotels(prev => [...prev, { ...result.hotel, file_url, file_label }]);
      toast.success('🏨 Hotel details extracted!');
    } else {
      toast.success('📄 Document added!');
    }
    setUploadingIdx(null);
  };

  // ── Packing list ──
  const addPackingItem = () => {
    if (!packingInput.trim()) return;
    update('packing_list', [...form.packing_list, packingInput.trim()]);
    setPackingInput('');
  };
  const removePackingItem = (i) => update('packing_list', form.packing_list.filter((_, idx) => idx !== i));

  const generatePackingList = async () => {
    if (!form.destination) { toast.error('Add a destination first'); return; }
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a practical packing list for a ${form.trip_type?.replace('_', ' ')} to ${form.destination} from ${form.start_date || 'soon'} to ${form.end_date || ''}. Return 10-15 essential items.`,
      response_json_schema: { type: 'object', properties: { items: { type: 'array', items: { type: 'string' } } } }
    });
    update('packing_list', [...new Set([...form.packing_list, ...(result.items || [])])]);
    setGenerating(false);
  };

  // ── Flight helpers ──
  const addFlight = () => setFlights(prev => [...prev, { airline: '', flight_number: '', departure_airport: '', arrival_airport: '', departure_datetime: '', arrival_datetime: '', confirmation_code: '', file_url: '', file_label: '' }]);
  const updateFlight = (i, k, v) => setFlights(prev => prev.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  const removeFlight = (i) => setFlights(prev => prev.filter((_, idx) => idx !== i));
  const uploadFlightDoc = async (i, file) => {
    setUploadingIdx(`flight-${i}`);
    const { file_url, file_label } = await uploadFile(file);
    updateFlight(i, 'file_url', file_url);
    updateFlight(i, 'file_label', file_label);
    setUploadingIdx(null);
  };

  // ── Hotel helpers ──
  const addHotel = () => setHotels(prev => [...prev, { name: '', address: '', check_in: '', check_out: '', confirmation_code: '', cost_per_night: '', file_url: '', file_label: '' }]);
  const updateHotel = (i, k, v) => setHotels(prev => prev.map((h, idx) => idx === i ? { ...h, [k]: v } : h));
  const removeHotel = (i) => setHotels(prev => prev.filter((_, idx) => idx !== i));
  const uploadHotelDoc = async (i, file) => {
    setUploadingIdx(`hotel-${i}`);
    const { file_url, file_label } = await uploadFile(file);
    updateHotel(i, 'file_url', file_url);
    updateHotel(i, 'file_label', file_label);
    setUploadingIdx(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedPackingList = form.packing_list;
    if (packingInput.trim()) {
      updatedPackingList = [...updatedPackingList, packingInput.trim()];
      setPackingInput('');
    }
    const finalForm = { ...form, packing_list: updatedPackingList };
    onSubmit({ ...finalForm, budget: finalForm.budget ? Number(finalForm.budget) : null, flights, hotels, documents });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-1 pb-6">
      <SheetHeader>
        <SheetTitle className="text-amber-900">{trip ? 'Edit Trip' : '✈️ New Trip'}</SheetTitle>
      </SheetHeader>

      {/* AI Smart Upload */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-500 mb-1">📄 Upload a booking doc</p>
        <p className="text-xs text-amber-500/80 mb-3">Drop a flight ticket, hotel confirmation, or itinerary — AI will read it and fill in the details automatically.</p>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 rounded-full"
            onClick={() => docRef.current?.click()} disabled={uploadingIdx === 'parse'}>
            {uploadingIdx === 'parse' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {uploadingIdx === 'parse' ? 'Reading doc...' : 'Upload & Auto-Fill'}
          </Button>
          <input ref={docRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) parseAndFill(f); e.target.value = ''; }} />
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-amber-500">Trip Name *</Label>
          <Input value={form.title || ''} onChange={e => update('title', e.target.value)} placeholder="Summer Getaway" required className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
        <div className="col-span-2">
          <Label className="text-amber-500">Destination *</Label>
          <Input value={form.destination || ''} onChange={e => update('destination', e.target.value)} placeholder="e.g. Miami, FL" required className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
        <div>
          <Label className="text-amber-500">Type</Label>
          <Select value={form.trip_type || ''} onValueChange={v => update('trip_type', v)}>
            <SelectTrigger className="mt-1 border-amber-500/30 bg-background/50 text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="road_trip">🚗 Road Trip</SelectItem>
              <SelectItem value="flight">✈️ Flight</SelectItem>
              <SelectItem value="vacation">🏖️ Vacation</SelectItem>
              <SelectItem value="day_trip">🌅 Day Trip</SelectItem>
              <SelectItem value="other">🗺️ Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-amber-500">Status</Label>
          <Select value={form.status || ''} onValueChange={v => update('status', v)}>
            <SelectTrigger className="mt-1 border-amber-500/30 bg-background/50 text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">🗒️ Planning</SelectItem>
              <SelectItem value="booked">✅ Booked</SelectItem>
              <SelectItem value="completed">🏁 Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-amber-500">Start Date</Label>
          <Input type="date" value={form.start_date || ''} onChange={e => update('start_date', e.target.value)} className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
        <div>
          <Label className="text-amber-500">End Date</Label>
          <Input type="date" value={form.end_date || ''} onChange={e => update('end_date', e.target.value)} className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
        <div className="col-span-2">
          <Label className="text-amber-500">Budget ($)</Label>
          <Input type="number" value={form.budget || ''} onChange={e => update('budget', e.target.value)} placeholder="e.g. 1500" className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
        <div className="col-span-2">
          <Label className="text-amber-500">Notes</Label>
          <Input value={form.notes || ''} onChange={e => update('notes', e.target.value)} placeholder="Reminders, ideas..." className="mt-1 border-amber-500/30 bg-background/50 text-foreground" />
        </div>
      </div>

      {/* Flights */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>✈️ Flights</SectionLabel>
          <Button type="button" size="sm" variant="ghost" className="text-xs text-amber-500 gap-1 h-7" onClick={addFlight}>
            <Plus className="w-3 h-3" /> Add Flight
          </Button>
        </div>
        {flights.map((flight, i) => (
          <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-blue-500">Flight {i + 1}</p>
              <button type="button" onClick={() => removeFlight(i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={flight.airline || ''} onChange={e => updateFlight(i, 'airline', e.target.value)} placeholder="Airline" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.flight_number || ''} onChange={e => updateFlight(i, 'flight_number', e.target.value)} placeholder="Flight #" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.departure_airport || ''} onChange={e => updateFlight(i, 'departure_airport', e.target.value)} placeholder="From (YYZ)" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.arrival_airport || ''} onChange={e => updateFlight(i, 'arrival_airport', e.target.value)} placeholder="To (MIA)" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.departure_datetime || ''} onChange={e => updateFlight(i, 'departure_datetime', e.target.value)} placeholder="Departs (date/time)" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.arrival_datetime || ''} onChange={e => updateFlight(i, 'arrival_datetime', e.target.value)} placeholder="Arrives (date/time)" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={flight.confirmation_code || ''} onChange={e => updateFlight(i, 'confirmation_code', e.target.value)} placeholder="Confirmation code" className="border-blue-500/30 bg-background/50 text-foreground text-sm h-8 col-span-2" />
            </div>
            <UploadRow
              label="Upload ticket"
              file_url={flight.file_url}
              file_label={flight.file_label}
              uploading={uploadingIdx === `flight-${i}`}
              onUpload={(file) => uploadFlightDoc(i, file)}
              onRemove={() => { updateFlight(i, 'file_url', ''); updateFlight(i, 'file_label', ''); }}
            />
          </div>
        ))}
      </div>

      {/* Hotels */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>🏨 Hotels</SectionLabel>
          <Button type="button" size="sm" variant="ghost" className="text-xs text-amber-500 gap-1 h-7" onClick={addHotel}>
            <Plus className="w-3 h-3" /> Add Hotel
          </Button>
        </div>
        {hotels.map((hotel, i) => (
          <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-emerald-500">Hotel {i + 1}</p>
              <button type="button" onClick={() => removeHotel(i)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={hotel.name || ''} onChange={e => updateHotel(i, 'name', e.target.value)} placeholder="Hotel name" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8 col-span-2" />
              <Input value={hotel.address || ''} onChange={e => updateHotel(i, 'address', e.target.value)} placeholder="Address" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8 col-span-2" />
              <Input type="date" value={hotel.check_in || ''} onChange={e => updateHotel(i, 'check_in', e.target.value)} placeholder="Check-in" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input type="date" value={hotel.check_out || ''} onChange={e => updateHotel(i, 'check_out', e.target.value)} placeholder="Check-out" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input value={hotel.confirmation_code || ''} onChange={e => updateHotel(i, 'confirmation_code', e.target.value)} placeholder="Confirmation code" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8" />
              <Input type="number" value={hotel.cost_per_night || ''} onChange={e => updateHotel(i, 'cost_per_night', e.target.value)} placeholder="$/night" className="border-emerald-500/30 bg-background/50 text-foreground text-sm h-8" />
            </div>
            <UploadRow
              label="Upload confirmation"
              file_url={hotel.file_url}
              file_label={hotel.file_label}
              uploading={uploadingIdx === `hotel-${i}`}
              onUpload={(file) => uploadHotelDoc(i, file)}
              onRemove={() => { updateHotel(i, 'file_url', ''); updateHotel(i, 'file_label', ''); }}
            />
          </div>
        ))}
      </div>

      {/* Packing List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>🎒 Packing List</SectionLabel>
          <Button type="button" size="sm" variant="ghost" className="text-xs text-amber-500 gap-1 h-7" onClick={generatePackingList} disabled={generating}>
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Generate
          </Button>
        </div>
        <div className="flex gap-2">
          <Input value={packingInput} onChange={e => setPackingInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPackingItem())} onBlur={addPackingItem} placeholder="Add item..." className="border-amber-500/30 bg-background/50 text-foreground text-sm" />
          <Button type="button" size="icon" onClick={addPackingItem} className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {form.packing_list.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.packing_list.map((item, i) => (
              <span key={i} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-full px-2.5 py-1">
                {item}
                <button type="button" onClick={() => removePackingItem(i)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-6 mt-4 border-t border-amber-500/20">
        <Button type="button" variant="outline" className="flex-1 border-amber-500/30 text-amber-500" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          {trip ? 'Save Changes' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}

// ── Trip Card ──────────────────────────────────────────────────
function TripCard({ trip, i, onEdit, onDelete, onItinerary, onMap }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: i * 0.05 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
          {tripTypeIcons[trip.trip_type] || '🗺️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-card-foreground">{trip.title}</h3>
            <Badge className={`text-[10px] border-0`}>{trip.status}</Badge>
          </div>
          <p className="text-xs text-primary flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {trip.destination}</p>
          {(trip.start_date || trip.end_date) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {trip.start_date && format(new Date(trip.start_date), 'MMM d')}
              {trip.start_date && trip.end_date && ' – '}
              {trip.end_date && format(new Date(trip.end_date), 'MMM d, yyyy')}
            </p>
          )}
          <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            {trip.flights?.length > 0 && <span>✈️ {trip.flights.length} flight{trip.flights.length > 1 ? 's' : ''}</span>}
            {trip.hotels?.length > 0 && <span>🏨 {trip.hotels.length} hotel{trip.hotels.length > 1 ? 's' : ''}</span>}
            {trip.packing_list?.length > 0 && <span>🎒 {trip.packing_list.length} items</span>}
            {trip.budget && <span><DollarSign className="w-3 h-3 inline" />${trip.budget.toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 flex-col items-end">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={onEdit}>
              <Pencil className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10 gap-0.5 px-1" onClick={onItinerary}>
            <Sparkles className="w-3 h-3" /> AI Plan
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-accent hover:text-accent hover:bg-accent/10 gap-0.5 px-1" onClick={onMap}>
            <Map className="w-3 h-3" /> Map
          </Button>
          {(trip.flights?.length > 0 || trip.hotels?.length > 0 || trip.packing_list?.length > 0) && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-muted-foreground flex items-center gap-0.5 mt-1">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded itinerary */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              {/* Flights */}
              {trip.flights?.map((f, i) => (
                <div key={i} className="bg-blue-500/10 rounded-xl p-3">
                  <p className="text-xs font-extrabold text-blue-500 mb-1">✈️ {f.airline || 'Flight'} {f.flight_number}</p>
                  {(f.departure_airport || f.arrival_airport) && (
                    <p className="text-xs text-blue-400">{f.departure_airport} → {f.arrival_airport}</p>
                  )}
                  {f.departure_datetime && <p className="text-xs text-blue-400">Departs: {f.departure_datetime}</p>}
                  {f.arrival_datetime && <p className="text-xs text-blue-400">Arrives: {f.arrival_datetime}</p>}
                  {f.confirmation_code && <p className="text-xs text-blue-400 font-semibold">Conf: {f.confirmation_code}</p>}
                  {f.file_url && <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline flex items-center gap-1 mt-1"><FileText className="w-3 h-3" />{f.file_label || 'View ticket'}</a>}
                </div>
              ))}

              {/* Hotels */}
              {trip.hotels?.map((h, i) => (
                <div key={i} className="bg-emerald-500/10 rounded-xl p-3">
                  <p className="text-xs font-extrabold text-emerald-500 mb-1">🏨 {h.name || 'Hotel'}</p>
                  {h.address && <p className="text-xs text-emerald-400">{h.address}</p>}
                  {(h.check_in || h.check_out) && (
                    <p className="text-xs text-emerald-400">
                      {h.check_in && `Check-in: ${h.check_in}`}{h.check_in && h.check_out && ' · '}{h.check_out && `Check-out: ${h.check_out}`}
                    </p>
                  )}
                  {h.confirmation_code && <p className="text-xs text-emerald-400 font-semibold">Conf: {h.confirmation_code}</p>}
                  {h.cost_per_night && <p className="text-xs text-emerald-400">${h.cost_per_night}/night</p>}
                  {h.file_url && <a href={h.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 underline flex items-center gap-1 mt-1"><FileText className="w-3 h-3" />{h.file_label || 'View confirmation'}</a>}
                </div>
              ))}

              {/* Packing list */}
              {trip.packing_list?.length > 0 && (
                <div>
                  <p className="text-xs font-extrabold text-amber-500 mb-1">🎒 Packing List</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trip.packing_list.map((item, i) => (
                      <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full px-2.5 py-0.5">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {trip.notes && (
                <div>
                  <p className="text-xs font-extrabold text-amber-500 mb-1">📝 Notes</p>
                  <p className="text-xs text-amber-500/80">{trip.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function Trips() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [itineraryTrip, setItineraryTrip] = useState(null);
  const [mapTrip, setMapTrip] = useState(null);
  const queryClient = useQueryClient();

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-start_date'),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Trip.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setShowForm(false); toast.success('Trip created! 🎉'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trip.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setShowForm(false); setEditing(null); toast.success('Trip updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Trip.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  const handleSubmit = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const upcoming = trips.filter(t => t.status !== 'completed');
  const completed = trips.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        videoUrl="https://videos.pexels.com/video-files/1456041/1456041-hd_1920_1080_24fps.mp4"
        imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&amp;q=80"
        title="Your Adventures"
        subtitle="Trips & Travel"
        emoji="✈️"
        overlayColor="from-slate-900/50"
      >
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}
          className="rounded-full gap-1 bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30">
          <Plus className="w-4 h-4" /> Plan Trip
        </Button>
      </PageHero>

      <div className="px-4 pb-8 max-w-2xl mx-auto space-y-4">
        {trips.length === 0 ? (
          <EmptyState emoji="🗺️" title="No trips yet" description="Plan your next road trip, flight, or adventure — or just upload your booking docs and let AI build your itinerary!" actionLabel="Plan a Trip" onAction={() => setShowForm(true)} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-600 mb-3">Upcoming &amp; Planning</h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {upcoming.map((trip, i) => (
                      <TripCard key={trip.id} trip={trip} i={i}
                        onEdit={() => { setEditing(trip); setShowForm(true); }}
                        onDelete={() => deleteMutation.mutate(trip.id)}
                        onItinerary={() => setItineraryTrip(trip)}
                        onMap={() => setMapTrip(trip)} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-3">Completed</h2>
                <div className="space-y-3 opacity-70">
                  {completed.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} i={i}
                      onEdit={() => { setEditing(trip); setShowForm(true); }}
                      onDelete={() => deleteMutation.mutate(trip.id)}
                      onItinerary={() => setItineraryTrip(trip)}
                      onMap={() => setMapTrip(trip)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TripItineraryPlanner
        trip={itineraryTrip}
        open={!!itineraryTrip}
        onClose={() => setItineraryTrip(null)}
      />

      <TripMapView
        trip={mapTrip}
        open={!!mapTrip}
        onClose={() => setMapTrip(null)}
        itinerary={null}
      />

      <Sheet open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <TripForm trip={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
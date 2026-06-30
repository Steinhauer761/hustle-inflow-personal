import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, parseISO } from 'date-fns';

// Fix default Leaflet icon paths (Vite/bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MARKER_COLORS = {
  hotel: '#10b981',
  activity: '#f59e0b',
  restaurant: '#ef4444',
  destination: '#6366f1',
};

function makeIcon(type) {
  const color = MARKER_COLORS[type] || '#6366f1';
  const emoji = type === 'hotel' ? '🏨' : type === 'activity' ? '📍' : type === 'restaurant' ? '🍽️' : '✈️';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      border:2px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "><span style="transform:rotate(45deg);font-size:13px">${emoji}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
}

async function geocodeAll(trip) {
  // Build a list of things to geocode
  const items = [];

  // Destination pin
  items.push({ id: 'dest', type: 'destination', label: trip.destination, query: trip.destination });

  // Hotels
  (trip.hotels || []).forEach((h, i) => {
    if (h.name || h.address) {
      items.push({ id: `hotel-${i}`, type: 'hotel', label: h.name || 'Hotel', query: `${h.name} ${h.address} ${trip.destination}`.trim() });
    }
  });

  const result = await base44.integrations.Core.InvokeLLM({
    model: 'gemini_3_flash',
    add_context_from_internet: true,
    prompt: `Return GPS coordinates (latitude, longitude) for each of the following places. Be accurate.
Places:
${items.map((it, i) => `${i + 1}. ${it.query}`).join('\n')}

Return ONLY a JSON array with objects: [{index:0, lat: number, lng: number}, ...]`,
    response_json_schema: {
      type: 'object',
      properties: {
        coords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'number' },
              lat: { type: 'number' },
              lng: { type: 'number' },
            }
          }
        }
      }
    }
  });

  const coords = result?.coords || [];
  return items.map((item, i) => {
    const coord = coords.find(c => c.index === i);
    if (!coord) return null;
    return { ...item, lat: coord.lat, lng: coord.lng };
  }).filter(Boolean);
}

async function geocodeDayItems(day, destination) {
  const places = [];
  (day.activities || []).forEach((a, i) => places.push({ id: `act-${i}`, type: 'activity', label: a, query: `${a} near ${destination}` }));
  (day.restaurants || []).forEach((r, i) => places.push({ id: `rest-${i}`, type: 'restaurant', label: r, query: `${r} near ${destination}` }));

  if (places.length === 0) return [];

  const result = await base44.integrations.Core.InvokeLLM({
    model: 'gemini_3_flash',
    add_context_from_internet: true,
    prompt: `Return GPS coordinates for each place. Be accurate to the real location if known, otherwise approximate near ${destination}.
Places:
${places.map((p, i) => `${i + 1}. ${p.query}`).join('\n')}
Return JSON: {coords:[{index,lat,lng}]}`,
    response_json_schema: {
      type: 'object',
      properties: {
        coords: { type: 'array', items: { type: 'object', properties: { index: { type: 'number' }, lat: { type: 'number' }, lng: { type: 'number' } } } }
      }
    }
  });

  const coords = result?.coords || [];
  return places.map((p, i) => {
    const c = coords.find(x => x.index === i);
    if (!c) return null;
    return { ...p, lat: c.lat, lng: c.lng };
  }).filter(Boolean);
}

const TYPE_LABELS = { destination: 'Destination', hotel: 'Hotel', activity: 'Activity', restaurant: 'Restaurant' };
const TYPE_COLORS_TW = { destination: 'bg-indigo-500', hotel: 'bg-emerald-500', activity: 'bg-amber-500', restaurant: 'bg-red-500' };

export default function TripMapView({ trip, open, onClose, itinerary }) {
  const [baseMarkers, setBaseMarkers] = useState([]);
  const [dayMarkers, setDayMarkers] = useState([]);
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState(null);

  // Load base markers (destination + hotels) when sheet opens
  useEffect(() => {
    if (!open || !trip) return;
    setBaseMarkers([]);
    setDayMarkers([]);
    setSelectedDay(null);
    setError(null);
    setLoadingBase(true);
    geocodeAll(trip)
      .then(setBaseMarkers)
      .catch(() => setError('Could not load map locations.'))
      .finally(() => setLoadingBase(false));
  }, [open, trip?.id]);

  // Load day-specific markers when a day tab is selected
  useEffect(() => {
    if (!selectedDay || !trip) return;
    setDayMarkers([]);
    setLoadingDay(true);
    geocodeDayItems(selectedDay, trip.destination)
      .then(setDayMarkers)
      .catch(() => {})
      .finally(() => setLoadingDay(false));
  }, [selectedDay]);

  const days = itinerary?.days?.map((day) => {
    const startDate = trip?.start_date ? parseISO(trip.start_date) : new Date();
    const date = format(addDays(startDate, day.day_number - 1), 'MMM d');
    return { ...day, label: `Day ${day.day_number}`, date };
  }) || [];

  const visibleMarkers = selectedDay
    ? [...baseMarkers.filter(m => m.type !== 'activity' && m.type !== 'restaurant'), ...dayMarkers]
    : baseMarkers;

  const defaultCenter = baseMarkers[0]
    ? [baseMarkers[0].lat, baseMarkers[0].lng]
    : [20, 0];

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 overflow-hidden" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="px-4 pt-4 pb-2 shrink-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-amber-900">
              <MapPin className="w-5 h-5 text-amber-500" />
              Map — {trip?.title}
            </SheetTitle>
            <p className="text-xs text-muted-foreground">{trip?.destination}</p>
          </SheetHeader>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${TYPE_COLORS_TW[type]}`} />
                {label}
              </div>
            ))}
          </div>

          {/* Day tabs */}
          {days.length > 0 && (
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedDay(null)}
                className={`shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${!selectedDay ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}
              >
                Overview
              </button>
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${selectedDay?.day_number === day.day_number ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}
                >
                  {day.label} · {day.date}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0" style={{ minHeight: 320 }}>
          {(loadingBase || loadingDay) && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <p className="text-xs text-muted-foreground">
                  {loadingBase ? 'Locating places...' : 'Loading day spots...'}
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}
          {!loadingBase && (
            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds markers={visibleMarkers} />
              {visibleMarkers.map((m) => (
                <Marker key={m.id} position={[m.lat, m.lng]} icon={makeIcon(m.type)}>
                  <Popup>
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div className="text-[10px] text-gray-500 capitalize">{TYPE_LABELS[m.type]}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Day summary strip */}
        {selectedDay && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="shrink-0 px-4 py-3 border-t border-border bg-card space-y-1.5 overflow-y-auto"
            style={{ maxHeight: 160 }}
          >
            <p className="text-xs font-bold text-amber-700">{selectedDay.label}: {selectedDay.theme}</p>
            {selectedDay.activities?.map((a, i) => (
              <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                <span className="w-2 h-2 mt-0.5 rounded-full bg-amber-400 shrink-0" />{a}
              </p>
            ))}
            {selectedDay.restaurants?.map((r, i) => (
              <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                <span className="w-2 h-2 mt-0.5 rounded-full bg-red-400 shrink-0" />{r}
              </p>
            ))}
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
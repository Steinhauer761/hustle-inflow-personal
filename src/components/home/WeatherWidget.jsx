import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WeatherWidget({ temperatureUnit = 'fahrenheit', location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Get the current weather for ${location}. Return just the data.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          temp_celsius: { type: 'number' },
          condition: { type: 'string', enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'partly_cloudy'] },
          description: { type: 'string' },
          high_celsius: { type: 'number' },
          low_celsius: { type: 'number' },
        },
      },
    }).then((data) => { setWeather(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [location]);

  const toDisplay = (c) =>
    temperatureUnit === 'fahrenheit' ? `${Math.round(c * 9 / 5 + 32)}°F` : `${Math.round(c)}°C`;

  const WeatherIcon = { sunny: Sun, cloudy: Cloud, rainy: CloudRain, snowy: CloudSnow, windy: Wind, partly_cloudy: Cloud }[weather?.condition] || Sun;

  if (!location) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex items-center gap-3 bg-card rounded-2xl border border-border px-4 py-3">
      {loading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : weather ? (
        <>
          <WeatherIcon className="w-9 h-9 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground leading-none">{toDisplay(weather.temp_celsius)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate capitalize">{weather.description}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>↑ {toDisplay(weather.high_celsius)}</p>
            <p>↓ {toDisplay(weather.low_celsius)}</p>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}
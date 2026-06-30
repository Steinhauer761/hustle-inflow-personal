import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HomeHeader({ location, temperatureUnit = 'fahrenheit' }) {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tick every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch weather
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

  const WeatherIcon = {
    sunny: Sun, cloudy: Cloud, rainy: CloudRain,
    snowy: CloudSnow, windy: Wind, partly_cloudy: Cloud
  }[weather?.condition] || Sun;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 px-1 pt-2"
    >
      {/* Date & Time */}
      <div>
        <p className="text-3xl font-display text-foreground leading-none">
          {format(now, 'h:mm')}
          <span className="text-lg text-muted-foreground ml-1">{format(now, 'a')}</span>
        </p>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">
          {format(now, 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Weather */}
      {location && (
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : weather ? (
            <>
              <WeatherIcon className="w-7 h-7 text-primary" />
              <div className="text-right">
                <p className="text-xl font-bold text-foreground leading-none">{toDisplay(weather.temp_celsius)}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{weather.description}</p>
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                <p>↑ {toDisplay(weather.high_celsius)}</p>
                <p>↓ {toDisplay(weather.low_celsius)}</p>
              </div>
            </>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
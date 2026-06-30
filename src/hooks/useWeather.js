import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useWeather() {
  const { data: settingsList } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => base44.entities.UserSettings.list('-updated_date', 1),
  });
  const settings = settingsList?.[0] || {};
  const location = settings.city ? `${settings.city}, ${settings.province_state || ''} ${settings.country || ''}` : null;

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
    })
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location]);

  return { weather, loading, location, temperatureUnit: settings.temperature_unit || 'fahrenheit' };
}
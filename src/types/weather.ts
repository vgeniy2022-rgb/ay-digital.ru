export type WeatherVisualState = 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'storm' | 'unknown';

export type WeatherVisualData = {
  state: WeatherVisualState;
  temperatureCelsius?: number;
  label: string;
  observedAt?: string;
  source?: string;
};

export type WeatherVisualProvider = {
  getCurrentWeather(): Promise<WeatherVisualData>;
};

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { CurrentWeather, WeatherForecast } from '@/types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '49fcdea905e9267ac7fcdb839ad98acc'; // Fallback to a demo key

interface WeatherState {
  current: CurrentWeather | null;
  forecast: WeatherForecast[] | null;
  loading: boolean;
  error: string | null;
  location: string | null;
}

const initialState: WeatherState = {
  current: null,
  forecast: null,
  loading: false,
  error: null,
  location: null,
};

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (
    params: { city?: string; lat?: number; lon?: number },
    { rejectWithValue }
  ) => {
    try {
      let weatherUrl;
      let locationString;

      if (params.city) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${params.city}&appid=${API_KEY}&units=imperial`;
        locationString = params.city;
      } else if (params.lat && params.lon) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${params.lat}&lon=${params.lon}&appid=${API_KEY}&units=imperial`;
        locationString = 'Current Location';
      } else {
        return rejectWithValue('Invalid parameters: provide either city or coordinates');
      }

      // Get current weather
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      const data = await response.json();

      // Use coordinates from current weather to get forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly&appid=${API_KEY}&units=imperial`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      const forecastData = await forecastResponse.json();
      
      // Get city name if using coordinates
      if (!params.city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${params.lat}&lon=${params.lon}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.length > 0) {
            locationString = `${geoData[0].name}, ${geoData[0].country}`;
          }
        }
      }

      // Format the response
      const current: CurrentWeather = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };

      const forecast: WeatherForecast[] = forecastData.daily.slice(0, 7).map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString(),
        temperature: Math.round(day.temp.day),
        condition: day.weather[0].main,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
      }));

      return { current, forecast, location: locationString || 'Unknown Location' };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
        state.location = action.payload.location;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLocation } = weatherSlice.actions;
export const selectWeather = (state: RootState) => state.weather;
export default weatherSlice.reducer;

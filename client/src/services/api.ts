import { apiRequest } from '@/lib/queryClient';

// Weather API service
export const weatherService = {
  getCurrentWeather: async (city: string) => {
    return await apiRequest('GET', `/api/weather/current?city=${encodeURIComponent(city)}`, undefined);
  },
  
  getForecast: async (city: string) => {
    return await apiRequest('GET', `/api/weather/forecast?city=${encodeURIComponent(city)}`, undefined);
  },
  
  getByCoordinates: async (lat: number, lon: number) => {
    return await apiRequest('GET', `/api/weather/coordinates?lat=${lat}&lon=${lon}`, undefined);
  }
};

// News API service
export const newsService = {
  getHeadlines: async (category = 'general', page = 1, pageSize = 10) => {
    return await apiRequest(
      'GET', 
      `/api/news/headlines?category=${category}&page=${page}&pageSize=${pageSize}`, 
      undefined
    );
  },
  
  search: async (query: string, page = 1, pageSize = 10) => {
    return await apiRequest(
      'GET',
      `/api/news/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
      undefined
    );
  }
};

// Finance API service
export const financeService = {
  getStockQuote: async (symbol: string) => {
    return await apiRequest('GET', `/api/finance/quote?symbol=${symbol}`, undefined);
  },
  
  getHistoricalData: async (symbol: string, timeRange: string) => {
    return await apiRequest('GET', `/api/finance/historical?symbol=${symbol}&range=${timeRange}`, undefined);
  },
  
  searchStocks: async (query: string) => {
    return await apiRequest('GET', `/api/finance/search?q=${encodeURIComponent(query)}`, undefined);
  }
};

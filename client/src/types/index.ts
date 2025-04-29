// Weather Types
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
}

// News Types
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  category: string;
}

// Finance Types
export interface StockData {
  symbol: string;
  companyName: string;
  exchange: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  marketCap: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

// Widget Types
export interface Widget {
  id: string;
  title: string;
  type: string;
  gridArea?: string;
  minWidth?: number;
  minHeight?: number;
  settings?: Record<string, any>;
}

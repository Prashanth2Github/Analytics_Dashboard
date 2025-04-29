import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

// API Keys with fallbacks for external services
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'bd5e378503939ddaee76f12ad7a97608'; // Fallback to demo key
const NEWS_API_KEY = process.env.NEWS_API_KEY || '9503d8e8a7a84a27acff4f845fdbdf20'; // Fallback to demo key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'; // Fallback to demo key

export async function registerRoutes(app: Express): Promise<Server> {
  // Weather API routes
  app.get('/api/weather/current', async (req, res, next) => {
    try {
      const city = req.query.city as string;
      
      if (!city) {
        return res.status(400).json({ message: 'City parameter is required' });
      }
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      
      const data = response.data;
      
      // Format the response
      const currentWeather = {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: `${data.name}, ${data.sys.country}`
      };
      
      res.json(currentWeather);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/weather/coordinates', async (req, res, next) => {
    try {
      const lat = req.query.lat as string;
      const lon = req.query.lon as string;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Both lat and lon parameters are required' });
      }
      
      // Get current weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      
      // Get location name from coordinates
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      
      const weatherData = weatherResponse.data;
      let locationName = 'Current Location';
      
      if (geoResponse.data && geoResponse.data.length > 0) {
        locationName = `${geoResponse.data[0].name}, ${geoResponse.data[0].country}`;
      }
      
      // Format the response
      const currentWeather = {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        location: locationName
      };
      
      res.json(currentWeather);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/weather/forecast', async (req, res, next) => {
    try {
      const city = req.query.city as string;
      
      if (!city) {
        return res.status(400).json({ message: 'City parameter is required' });
      }
      
      // First get coordinates for the city
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!geoResponse.data || geoResponse.data.length === 0) {
        return res.status(404).json({ message: 'Location not found' });
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Get forecast using One Call API
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      
      // Format the response
      const forecastData = forecastResponse.data.daily.slice(0, 7).map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString(),
        temperature: Math.round(day.temp.day),
        condition: day.weather[0].main,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
      }));
      
      res.json(forecastData);
    } catch (error) {
      next(error);
    }
  });
  
  // News API routes
  app.get('/api/news/headlines', async (req, res, next) => {
    try {
      const category = (req.query.category as string) || 'general';
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      // Use category if it's not 'all', otherwise use general category
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us${categoryParam}&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      );
      
      // Add category to each article for filtering
      const articlesWithCategory = response.data.articles.map((article: any) => ({
        ...article,
        category: category === 'all' ? 'general' : category,
      }));
      
      res.json({
        articles: articlesWithCategory,
        totalResults: response.data.totalResults,
        page,
        hasMore: page * pageSize < response.data.totalResults,
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/news/search', async (req, res, next) => {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      );
      
      res.json({
        articles: response.data.articles,
        totalResults: response.data.totalResults,
        page,
        hasMore: page * pageSize < response.data.totalResults,
        searchQuery: query,
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Finance API routes
  app.get('/api/finance/quote', async (req, res, next) => {
    try {
      const symbol = req.query.symbol as string;
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
      }
      
      // Fetch global quote for real-time data
      const quoteResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      // Check if we got valid data
      if (!quoteResponse.data['Global Quote'] || Object.keys(quoteResponse.data['Global Quote']).length === 0) {
        return res.status(404).json({ message: `No data available for ${symbol}` });
      }
      
      const quote = quoteResponse.data['Global Quote'];
      
      // Fetch company overview for additional info
      const overviewResponse = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      // Format stock data
      const stockData = {
        symbol,
        companyName: overviewResponse.data.Name || symbol,
        exchange: overviewResponse.data.Exchange || 'Unknown',
        sector: overviewResponse.data.Sector || 'Unknown',
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        marketCap: overviewResponse.data.MarketCapitalization ? parseInt(overviewResponse.data.MarketCapitalization) : 0,
      };
      
      res.json(stockData);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/finance/historical', async (req, res, next) => {
    try {
      const symbol = req.query.symbol as string;
      const timeRange = req.query.range as string || '1M';
      
      if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
      }
      
      let interval = 'daily';
      let outputSize = 'compact';
      
      switch (timeRange) {
        case '1D':
          interval = 'intraday';
          break;
        case '1W':
          interval = 'daily';
          break;
        case '1M':
          interval = 'daily';
          break;
        case '1Y':
          interval = 'weekly';
          break;
        default:
          interval = 'daily';
      }
      
      // Set function based on interval
      let timeSeriesFunction = 'TIME_SERIES_DAILY';
      if (interval === 'intraday') {
        timeSeriesFunction = 'TIME_SERIES_INTRADAY&interval=5min';
      } else if (interval === 'weekly') {
        timeSeriesFunction = 'TIME_SERIES_WEEKLY';
      }
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&outputsize=${outputSize}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      // Handle different data formats based on interval
      let timeSeriesKey = 'Time Series (Daily)';
      if (interval === 'intraday') {
        timeSeriesKey = 'Time Series (5min)';
      } else if (interval === 'weekly') {
        timeSeriesKey = 'Weekly Time Series';
      }
      
      // Check if we got valid data
      if (!response.data[timeSeriesKey] || Object.keys(response.data[timeSeriesKey]).length === 0) {
        return res.status(404).json({ message: `No time series data available for ${symbol}` });
      }
      
      // Parse historical data
      const historicalData = Object.entries(response.data[timeSeriesKey])
        .map(([date, values]: [string, any]) => ({
          date,
          price: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'] || values['6. volume'] || '0'),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Limit data points based on time range
      let limitedData = [];
      const now = new Date();
      
      switch (timeRange) {
        case '1D':
          limitedData = historicalData.filter(
            d => new Date(d.date).getTime() > now.getTime() - 24 * 60 * 60 * 1000
          );
          break;
        case '1W':
          limitedData = historicalData.filter(
            d => new Date(d.date).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          break;
        case '1M':
          limitedData = historicalData.filter(
            d => new Date(d.date).getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          break;
        case '1Y':
          limitedData = historicalData.filter(
            d => new Date(d.date).getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1000
          );
          break;
        default:
          limitedData = historicalData.slice(-30); // Default to 30 data points
      }
      
      res.json(limitedData);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/finance/search', async (req, res, next) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      // Check if we got valid data
      if (!response.data.bestMatches || response.data.bestMatches.length === 0) {
        return res.json([]);
      }
      
      // Format search results
      const searchResults = response.data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
      }));
      
      res.json(searchResults);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { StockData, HistoricalDataPoint } from '@/types';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo'; // Fallback to a demo key
console.log('Using Alpha Vantage API Key:', API_KEY ? 'Key provided' : 'No key provided'); // Log if key is available

interface FinanceState {
  stockData: Record<string, StockData>;
  stockList: string[];
  searchResults: Array<{ symbol: string; name: string }>;
  historicalData: Record<string, HistoricalDataPoint[]>;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  stockData: {},
  stockList: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA'],
  searchResults: [],
  historicalData: {},
  loading: false,
  error: null,
};

export const fetchStockData = createAsyncThunk(
  'finance/fetchStockData',
  async (params: { symbol: string }, { rejectWithValue, dispatch }) => {
    try {
      const { symbol } = params;
      console.log(`Fetching stock data for ${symbol} with API key: ${API_KEY ? 'Using provided key' : 'Using demo key'}`);
      
      // Fetch global quote for real-time data
      const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
      console.log('Fetching from URL:', globalQuoteUrl);
      const quoteResponse = await fetch(globalQuoteUrl);
      
      if (!quoteResponse.ok) {
        throw new Error(`Alpha Vantage API error: ${quoteResponse.status}`);
      }
      
      const quoteData = await quoteResponse.json();
      console.log('Quote data received:', quoteData);
      
      // Check for API limit message
      if (quoteData.Note) {
        console.error('API limit reached:', quoteData.Note);
        return rejectWithValue('Alpha Vantage API call frequency limit reached. Please try again in a minute.');
      }
      
      // Check if we got valid data
      if (!quoteData['Global Quote'] || Object.keys(quoteData['Global Quote']).length === 0) {
        console.error('No quote data available for symbol:', symbol);
        return rejectWithValue(`No data available for ${symbol}. Please verify the stock symbol.`);
      }
      
      const quote = quoteData['Global Quote'];
      
      // Fetch company overview for additional info
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
      console.log('Fetching company overview from URL:', overviewUrl);
      const overviewResponse = await fetch(overviewUrl);
      
      if (!overviewResponse.ok) {
        throw new Error(`Alpha Vantage API error: ${overviewResponse.status}`);
      }
      
      const overviewData = await overviewResponse.json();
      console.log('Overview data received:', overviewData);
      
      // Check for API limit message in overview response
      if (overviewData.Note) {
        console.error('API limit reached for overview:', overviewData.Note);
        // Continue with limited data rather than fail
      }
      
      // Default to 1 month time series data
      dispatch(toggleTimeRange({ symbol, timeRange: '1M' }));
      
      const stockData: StockData = {
        symbol,
        companyName: overviewData.Name || symbol,
        exchange: overviewData.Exchange || 'Unknown',
        sector: overviewData.Sector || 'Unknown',
        price: parseFloat(quote['05. price'] || '0'),
        change: parseFloat(quote['09. change'] || '0'),
        changePercent: parseFloat((quote['10. change percent'] || '0').replace('%', '')),
        volume: parseInt(quote['06. volume'] || '0'),
        previousClose: parseFloat(quote['08. previous close'] || '0'),
        marketCap: overviewData.MarketCapitalization ? parseInt(overviewData.MarketCapitalization) : 0,
      };
      
      console.log('Processed stock data:', stockData);
      return stockData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const toggleTimeRange = createAsyncThunk(
  'finance/toggleTimeRange',
  async (
    params: { symbol: string; timeRange: string },
    { rejectWithValue }
  ) => {
    try {
      const { symbol, timeRange } = params;
      console.log(`Fetching time range data for ${symbol} with timeRange: ${timeRange}`);
      
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
      
      const url = `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&outputsize=${outputSize}&apikey=${API_KEY}`;
      console.log('Fetching time series from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Time series data received:', data);
      
      // Check for API limit message
      if (data.Note) {
        console.error('API limit reached for time series:', data.Note);
        return rejectWithValue('Alpha Vantage API call frequency limit reached. Please try again in a minute.');
      }
      
      // Handle different data formats based on interval
      let timeSeriesKey = 'Time Series (Daily)';
      if (interval === 'intraday') {
        timeSeriesKey = 'Time Series (5min)';
      } else if (interval === 'weekly') {
        timeSeriesKey = 'Weekly Time Series';
      }
      
      // Check if we got valid data
      if (!data[timeSeriesKey] || Object.keys(data[timeSeriesKey]).length === 0) {
        console.error('No time series data available for symbol:', symbol);
        // Generate some minimal data for display rather than failing entirely
        const fallbackData = {
          symbol,
          timeRange,
          historicalData: []
        };
        return fallbackData;
      }
      
      // Parse historical data
      const historicalData: HistoricalDataPoint[] = Object.entries(data[timeSeriesKey])
        .map(([date, values]: [string, any]) => ({
          date,
          price: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'] || values['6. volume'] || '0'),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Limit data points based on time range
      let limitedData: HistoricalDataPoint[] = [];
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
      
      console.log(`Processed ${limitedData.length} historical data points for ${symbol}`);
      return { symbol, timeRange, historicalData: limitedData };
    } catch (error) {
      console.error('Error fetching time series data:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const searchStocks = createAsyncThunk(
  'finance/searchStocks',
  async (params: { query: string }, { rejectWithValue }) => {
    try {
      const { query } = params;
      
      if (!query.trim()) {
        return rejectWithValue('Search query is required');
      }
      
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got valid data
      if (!data.bestMatches || data.bestMatches.length === 0) {
        return [];
      }
      
      // Format search results
      const searchResults = data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
      }));
      
      return searchResults;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.loading = false;
        state.stockData[action.payload.symbol] = action.payload;
        
        // Add to stock list if not already included
        if (!state.stockList.includes(action.payload.symbol)) {
          state.stockList.push(action.payload.symbol);
        }
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleTimeRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTimeRange.fulfilled, (state, action) => {
        state.loading = false;
        const { symbol, historicalData } = action.payload;
        state.historicalData[symbol] = historicalData;
      })
      .addCase(toggleTimeRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.searchResults = [];
      });
  },
});

export const { clearSearchResults } = financeSlice.actions;
export const selectFinance = (state: RootState) => state.finance;
export default financeSlice.reducer;

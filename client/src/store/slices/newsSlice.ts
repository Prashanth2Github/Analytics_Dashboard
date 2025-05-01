import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'ba28774a6b85483f85764f1768ca1ed2'; // Fallback to a demo key

interface NewsArticle {
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

interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  searchQuery: string;
}

const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  searchQuery: '',
};

export const fetchNewsArticles = createAsyncThunk(
  'news/fetchNewsArticles',
  async (
    params: { 
      category?: string; 
      query?: string; 
      page?: number; 
      pageSize?: number 
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { 
        category = 'general', 
        query = '', 
        page = 1, 
        pageSize = 10 
      } = params;
      
      // Use category if it's not 'all', otherwise use general category
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      
      // Use query if provided
      const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
      
      const url = `https://newsapi.org/v2/top-headlines?country=us${categoryParam}${queryParam}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add category to each article for filtering
      const articlesWithCategory = data.articles.map((article: any) => ({
        ...article,
        category: category === 'all' ? 'general' : category,
      }));
      
      return {
        articles: articlesWithCategory,
        totalResults: data.totalResults,
        page,
        hasMore: page * pageSize < data.totalResults,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const searchNewsArticles = createAsyncThunk(
  'news/searchNewsArticles',
  async (
    params: { 
      query: string; 
      page?: number; 
      pageSize?: number 
    },
    { rejectWithValue }
  ) => {
    try {
      const { 
        query, 
        page = 1, 
        pageSize = 10 
      } = params;
      
      if (!query.trim()) {
        return rejectWithValue('Search query is required');
      }
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        articles: data.articles,
        totalResults: data.totalResults,
        page,
        hasMore: page * pageSize < data.totalResults,
        searchQuery: query,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetNewsState: (state) => {
      state.articles = [];
      state.page = 1;
      state.hasMore = true;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsArticles.fulfilled, (state, action) => {
        state.loading = false;
        
        // If it's the first page, replace articles, otherwise append
        if (action.payload.page === 1) {
          state.articles = action.payload.articles;
        } else {
          state.articles = [...state.articles, ...action.payload.articles];
        }
        
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchNewsArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchNewsArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchNewsArticles.fulfilled, (state, action) => {
        state.loading = false;
        
        // If it's the first page, replace articles, otherwise append
        if (action.payload.page === 1) {
          state.articles = action.payload.articles;
        } else {
          state.articles = [...state.articles, ...action.payload.articles];
        }
        
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.searchQuery = action.payload.searchQuery;
      })
      .addCase(searchNewsArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, resetNewsState } = newsSlice.actions;
export const selectNews = (state: RootState) => state.news;
export default newsSlice.reducer;

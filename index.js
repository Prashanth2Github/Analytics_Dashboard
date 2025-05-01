// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import axios from "axios";
var OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "bd5e378503939ddaee76f12ad7a97608";
var NEWS_API_KEY = process.env.NEWS_API_KEY || "9503d8e8a7a84a27acff4f845fdbdf20";
var ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
async function registerRoutes(app2) {
  app2.get("/api/weather/current", async (req, res, next) => {
    try {
      const city = req.query.city;
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      const data = response.data;
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
  app2.get("/api/weather/coordinates", async (req, res, next) => {
    try {
      const lat = req.query.lat;
      const lon = req.query.lon;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Both lat and lon parameters are required" });
      }
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      const weatherData = weatherResponse.data;
      let locationName = "Current Location";
      if (geoResponse.data && geoResponse.data.length > 0) {
        locationName = `${geoResponse.data[0].name}, ${geoResponse.data[0].country}`;
      }
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
  app2.get("/api/weather/forecast", async (req, res, next) => {
    try {
      const city = req.query.city;
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      if (!geoResponse.data || geoResponse.data.length === 0) {
        return res.status(404).json({ message: "Location not found" });
      }
      const { lat, lon } = geoResponse.data[0];
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      const forecastData = forecastResponse.data.daily.slice(0, 7).map((day) => ({
        date: new Date(day.dt * 1e3).toISOString(),
        temperature: Math.round(day.temp.day),
        condition: day.weather[0].main,
        description: day.weather[0].description,
        icon: day.weather[0].icon
      }));
      res.json(forecastData);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/news/headlines", async (req, res, next) => {
    try {
      const category = req.query.category || "general";
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const categoryParam = category !== "all" ? `&category=${category}` : "";
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us${categoryParam}&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      );
      const articlesWithCategory = response.data.articles.map((article) => ({
        ...article,
        category: category === "all" ? "general" : category
      }));
      res.json({
        articles: articlesWithCategory,
        totalResults: response.data.totalResults,
        page,
        hasMore: page * pageSize < response.data.totalResults
      });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/news/search", async (req, res, next) => {
    try {
      const query = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      );
      res.json({
        articles: response.data.articles,
        totalResults: response.data.totalResults,
        page,
        hasMore: page * pageSize < response.data.totalResults,
        searchQuery: query
      });
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/finance/quote", async (req, res, next) => {
    try {
      const symbol = req.query.symbol;
      if (!symbol) {
        return res.status(400).json({ message: "Stock symbol is required" });
      }
      const quoteResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      if (!quoteResponse.data["Global Quote"] || Object.keys(quoteResponse.data["Global Quote"]).length === 0) {
        return res.status(404).json({ message: `No data available for ${symbol}` });
      }
      const quote = quoteResponse.data["Global Quote"];
      const overviewResponse = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const stockData = {
        symbol,
        companyName: overviewResponse.data.Name || symbol,
        exchange: overviewResponse.data.Exchange || "Unknown",
        sector: overviewResponse.data.Sector || "Unknown",
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
        volume: parseInt(quote["06. volume"]),
        previousClose: parseFloat(quote["08. previous close"]),
        marketCap: overviewResponse.data.MarketCapitalization ? parseInt(overviewResponse.data.MarketCapitalization) : 0
      };
      res.json(stockData);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/finance/historical", async (req, res, next) => {
    try {
      const symbol = req.query.symbol;
      const timeRange = req.query.range || "1M";
      if (!symbol) {
        return res.status(400).json({ message: "Stock symbol is required" });
      }
      let interval = "daily";
      let outputSize = "compact";
      switch (timeRange) {
        case "1D":
          interval = "intraday";
          break;
        case "1W":
          interval = "daily";
          break;
        case "1M":
          interval = "daily";
          break;
        case "1Y":
          interval = "weekly";
          break;
        default:
          interval = "daily";
      }
      let timeSeriesFunction = "TIME_SERIES_DAILY";
      if (interval === "intraday") {
        timeSeriesFunction = "TIME_SERIES_INTRADAY&interval=5min";
      } else if (interval === "weekly") {
        timeSeriesFunction = "TIME_SERIES_WEEKLY";
      }
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&outputsize=${outputSize}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      let timeSeriesKey = "Time Series (Daily)";
      if (interval === "intraday") {
        timeSeriesKey = "Time Series (5min)";
      } else if (interval === "weekly") {
        timeSeriesKey = "Weekly Time Series";
      }
      if (!response.data[timeSeriesKey] || Object.keys(response.data[timeSeriesKey]).length === 0) {
        return res.status(404).json({ message: `No time series data available for ${symbol}` });
      }
      const historicalData = Object.entries(response.data[timeSeriesKey]).map(([date, values]) => ({
        date,
        price: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"] || values["6. volume"] || "0")
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let limitedData = [];
      const now = /* @__PURE__ */ new Date();
      switch (timeRange) {
        case "1D":
          limitedData = historicalData.filter(
            (d) => new Date(d.date).getTime() > now.getTime() - 24 * 60 * 60 * 1e3
          );
          break;
        case "1W":
          limitedData = historicalData.filter(
            (d) => new Date(d.date).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1e3
          );
          break;
        case "1M":
          limitedData = historicalData.filter(
            (d) => new Date(d.date).getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1e3
          );
          break;
        case "1Y":
          limitedData = historicalData.filter(
            (d) => new Date(d.date).getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1e3
          );
          break;
        default:
          limitedData = historicalData.slice(-30);
      }
      res.json(limitedData);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/finance/search", async (req, res, next) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      if (!response.data.bestMatches || response.data.bestMatches.length === 0) {
        return res.json([]);
      }
      const searchResults = response.data.bestMatches.map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"]
      }));
      res.json(searchResults);
    } catch (error) {
      next(error);
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on http://127.0.0.1:${port}`);
  });
})();

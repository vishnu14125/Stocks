// Stock service for fetching real-time stock data
// This service abstracts the stock API calls and provides a consistent interface

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  previousClose: number;
  open: number;
  high: number;
  low: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Yahoo Finance alternative (use for backup or primary)
const YAHOO_FINANCE_BASE_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart";

// Mock data for development/demo
const mockStockData: { [key: string]: StockQuote } = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 182.52,
    change: 2.34,
    changePercent: 1.3,
    volume: 45200000,
    marketCap: "2.8T",
    previousClose: 180.18,
    open: 180.5,
    high: 183.12,
    low: 179.85,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.91,
    change: 4.56,
    changePercent: 1.22,
    volume: 23100000,
    marketCap: "2.8T",
    previousClose: 374.35,
    open: 375.0,
    high: 380.25,
    low: 373.5,
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 138.21,
    change: -1.23,
    changePercent: -0.88,
    volume: 18700000,
    marketCap: "1.7T",
    previousClose: 139.44,
    open: 139.0,
    high: 140.12,
    low: 137.85,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.87,
    change: -5.12,
    changePercent: -2.02,
    volume: 67800000,
    marketCap: "792B",
    previousClose: 253.99,
    open: 252.0,
    high: 255.8,
    low: 247.25,
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 485.63,
    change: 12.45,
    changePercent: 2.63,
    volume: 41200000,
    marketCap: "1.2T",
    previousClose: 473.18,
    open: 475.0,
    high: 487.9,
    low: 472.3,
  },
};

const mockSearchResults: StockSearchResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    type: "Equity",
    region: "United States",
    marketOpen: "09:30",
    marketClose: "16:00",
    timezone: "UTC-4",
    currency: "USD",
  },
];

// Search stocks using Alpha Vantage API
export const searchStocks = async (
  query: string,
): Promise<StockSearchResult[]> => {
  // For demo purposes, use mock data
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.ALPHA_VANTAGE_API_KEY ||
    process.env.ALPHA_VANTAGE_API_KEY === "demo"
  ) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query || query.length < 1) {
      return [];
    }

    return mockSearchResults
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 8);
  }

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data["bestMatches"]) {
      return data["bestMatches"].map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        marketOpen: match["5. marketOpen"],
        marketClose: match["6. marketClose"],
        timezone: match["7. timezone"],
        currency: match["8. currency"],
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching stocks:", error);
    // Fallback to mock data on error
    return mockSearchResults
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 8);
  }
};

// Get stock quote using Alpha Vantage API
export const getStockQuote = async (
  symbol: string,
): Promise<StockQuote | null> => {
  // For demo purposes, use mock data with random variations
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.ALPHA_VANTAGE_API_KEY ||
    process.env.ALPHA_VANTAGE_API_KEY === "demo"
  ) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stock = mockStockData[symbol.toUpperCase()];
    if (!stock) {
      return null;
    }

    // Add random variation to simulate live data
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const newPrice = stock.price * (1 + variation);
    const change = newPrice - stock.previousClose;
    const changePercent = (change / stock.previousClose) * 100;

    return {
      ...stock,
      price: Number(newPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    };
  }

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    const quote = data["Global Quote"];

    if (quote && quote["01. symbol"]) {
      return {
        symbol: quote["01. symbol"],
        name: "", // Alpha Vantage doesn't return company name in quote
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
        volume: parseInt(quote["06. volume"]),
        previousClose: parseFloat(quote["08. previous close"]),
        open: parseFloat(quote["02. open"]),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);

    // Fallback to mock data
    const stock = mockStockData[symbol.toUpperCase()];
    if (stock) {
      const variation = (Math.random() - 0.5) * 0.02;
      const newPrice = stock.price * (1 + variation);
      const change = newPrice - stock.previousClose;
      const changePercent = (change / stock.previousClose) * 100;

      return {
        ...stock,
        price: Number(newPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
      };
    }

    return null;
  }
};

// Get historical data for charts
export const getHistoricalData = async (
  symbol: string,
  period: "1D" | "5D" | "1M" | "1Y" = "1D",
): Promise<ChartData[]> => {
  // For demo purposes, generate mock historical data
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.ALPHA_VANTAGE_API_KEY ||
    process.env.ALPHA_VANTAGE_API_KEY === "demo"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const basePrice = mockStockData[symbol.toUpperCase()]?.price || 100;
    const dataPoints: ChartData[] = [];

    let periods: number;
    let interval: number;

    switch (period) {
      case "1D":
        periods = 78; // 6.5 hours * 12 (5min intervals)
        interval = 5 * 60 * 1000;
        break;
      case "5D":
        periods = 390; // 5 days * 78 intervals
        interval = 5 * 60 * 1000;
        break;
      case "1M":
        periods = 30;
        interval = 24 * 60 * 60 * 1000;
        break;
      case "1Y":
        periods = 52;
        interval = 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        periods = 78;
        interval = 5 * 60 * 1000;
    }

    const now = Date.now();
    let currentPrice = basePrice * 0.95;

    for (let i = 0; i < periods; i++) {
      const timestamp = now - (periods - i - 1) * interval;
      const change = (Math.random() - 0.5) * 0.03;
      const open = currentPrice;
      const volatility = Math.random() * 0.02;
      const high = open * (1 + Math.abs(volatility));
      const low = open * (1 - Math.abs(volatility));
      const close = open * (1 + change);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      dataPoints.push({
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });

      currentPrice = close;
    }

    return dataPoints;
  }

  try {
    // For production, implement real Alpha Vantage historical data API call
    // This is a simplified version - you'd need to use TIME_SERIES_DAILY, etc.
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    // Process the time series data and return ChartData[]
    // Implementation would depend on the specific Alpha Vantage response format

    return [];
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
};

// Get multiple quotes at once (batch processing)
export const getBatchQuotes = async (
  symbols: string[],
): Promise<{ [symbol: string]: StockQuote | null }> => {
  const quotes: { [symbol: string]: StockQuote | null } = {};

  // Process in batches to respect API rate limits
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchPromises = batch.map((symbol) => getStockQuote(symbol));
    const batchResults = await Promise.all(batchPromises);

    batch.forEach((symbol, index) => {
      quotes[symbol] = batchResults[index];
    });

    // Add small delay between batches to respect rate limits
    if (i + batchSize < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return quotes;
};

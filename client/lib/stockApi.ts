// Stock API service using Alpha Vantage (free tier) and Yahoo Finance
// Note: In production, you'd want to proxy these calls through your backend

const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with actual API key
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Yahoo Finance alternative (unofficial API)
const YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

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

// Mock data for demo purposes (replace with real API calls)
const mockStockData: { [key: string]: StockQuote } = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 2.34,
    changePercent: 1.30,
    volume: 45200000,
    marketCap: '2.8T',
    previousClose: 180.18,
    open: 180.50,
    high: 183.12,
    low: 179.85
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    change: 4.56,
    changePercent: 1.22,
    volume: 23100000,
    marketCap: '2.8T',
    previousClose: 374.35,
    open: 375.00,
    high: 380.25,
    low: 373.50
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 138.21,
    change: -1.23,
    changePercent: -0.88,
    volume: 18700000,
    marketCap: '1.7T',
    previousClose: 139.44,
    open: 139.00,
    high: 140.12,
    low: 137.85
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.87,
    change: -5.12,
    changePercent: -2.02,
    volume: 67800000,
    marketCap: '792B',
    previousClose: 253.99,
    open: 252.00,
    high: 255.80,
    low: 247.25
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 485.63,
    change: 12.45,
    changePercent: 2.63,
    volume: 41200000,
    marketCap: '1.2T',
    previousClose: 473.18,
    open: 475.00,
    high: 487.90,
    low: 472.30
  }
};

const mockSearchResults: StockSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Equity', region: 'United States', marketOpen: '09:30', marketClose: '16:00', timezone: 'UTC-4', currency: 'USD' },
];

export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query || query.length < 1) {
    return [];
  }
  
  // Filter mock results based on query
  return mockSearchResults.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Limit results
};

export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stock = mockStockData[symbol.toUpperCase()];
  if (!stock) {
    return null;
  }
  
  // Add some random variation to simulate live data
  const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
  const newPrice = stock.price * (1 + variation);
  const change = newPrice - stock.previousClose;
  const changePercent = (change / stock.previousClose) * 100;
  
  return {
    ...stock,
    price: Number(newPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2))
  };
};

export const getHistoricalData = async (symbol: string, period: '1D' | '5D' | '1M' | '1Y' = '1D'): Promise<ChartData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const basePrice = mockStockData[symbol.toUpperCase()]?.price || 100;
  const dataPoints: ChartData[] = [];
  
  let periods: number;
  let interval: number;
  
  switch (period) {
    case '1D':
      periods = 78; // 6.5 hours * 12 (5min intervals)
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case '5D':
      periods = 390; // 5 days * 78 intervals
      interval = 5 * 60 * 1000;
      break;
    case '1M':
      periods = 30; // 30 days
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1Y':
      periods = 52; // 52 weeks
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    default:
      periods = 78;
      interval = 5 * 60 * 1000;
  }
  
  const now = Date.now();
  let currentPrice = basePrice * 0.95; // Start slightly lower
  
  for (let i = 0; i < periods; i++) {
    const timestamp = now - (periods - i - 1) * interval;
    
    // Generate realistic OHLC data
    const change = (Math.random() - 0.5) * 0.03; // ±1.5% change
    const open = currentPrice;
    const volatility = Math.random() * 0.02; // ±1% intraday volatility
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
      volume
    });
    
    currentPrice = close;
  }
  
  return dataPoints;
};

// Real API integration functions (commented out for demo)
/*
export const searchStocksReal = async (query: string): Promise<StockSearchResult[]> => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['bestMatches']) {
      return data['bestMatches'].map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency']
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const getStockQuoteReal = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    const quote = data['Global Quote'];
    if (quote) {
      return {
        symbol: quote['01. symbol'],
        name: '', // Alpha Vantage doesn't return name in quote
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};
*/

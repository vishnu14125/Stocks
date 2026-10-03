// Portfolio management types and local storage API
import { getStockQuote, type StockQuote } from './stockApi';

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  notes?: string;
  // Calculated fields (updated with live data)
  currentPrice?: number;
  currentValue?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
}

export interface Portfolio {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  lastUpdated: number;
}

const PORTFOLIO_STORAGE_KEY = 'stocktracker-portfolio';

// Generate unique ID for holdings
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Load portfolio from localStorage
export const loadPortfolio = (): PortfolioHolding[] => {
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading portfolio:', error);
  }
  return [];
};

// Save portfolio to localStorage
export const savePortfolio = (holdings: PortfolioHolding[]): void => {
  try {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
};

// Add new holding to portfolio
export const addHolding = (holding: Omit<PortfolioHolding, 'id'>): PortfolioHolding => {
  const newHolding: PortfolioHolding = {
    ...holding,
    id: generateId(),
  };
  
  const currentHoldings = loadPortfolio();
  const updatedHoldings = [...currentHoldings, newHolding];
  savePortfolio(updatedHoldings);
  
  return newHolding;
};

// Update existing holding
export const updateHolding = (id: string, updates: Partial<PortfolioHolding>): PortfolioHolding | null => {
  const currentHoldings = loadPortfolio();
  const holdingIndex = currentHoldings.findIndex(h => h.id === id);
  
  if (holdingIndex === -1) {
    return null;
  }
  
  const updatedHolding = { ...currentHoldings[holdingIndex], ...updates };
  currentHoldings[holdingIndex] = updatedHolding;
  savePortfolio(currentHoldings);
  
  return updatedHolding;
};

// Delete holding from portfolio
export const deleteHolding = (id: string): boolean => {
  const currentHoldings = loadPortfolio();
  const filteredHoldings = currentHoldings.filter(h => h.id !== id);
  
  if (filteredHoldings.length === currentHoldings.length) {
    return false; // Holding not found
  }
  
  savePortfolio(filteredHoldings);
  return true;
};

// Get holding by ID
export const getHolding = (id: string): PortfolioHolding | null => {
  const currentHoldings = loadPortfolio();
  return currentHoldings.find(h => h.id === id) || null;
};

// Calculate portfolio summary with live data
export const calculatePortfolioSummary = async (): Promise<Portfolio> => {
  const holdings = loadPortfolio();
  
  if (holdings.length === 0) {
    return {
      holdings: [],
      totalValue: 0,
      totalInvested: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      lastUpdated: Date.now(),
    };
  }
  
  // Fetch live quotes for all holdings
  const updatedHoldings = await Promise.all(
    holdings.map(async (holding) => {
      try {
        const quote = await getStockQuote(holding.symbol);
        if (quote) {
          const currentValue = quote.price * holding.quantity;
          const investedValue = holding.buyPrice * holding.quantity;
          const totalReturn = currentValue - investedValue;
          const totalReturnPercent = (totalReturn / investedValue) * 100;
          const dayChange = quote.change * holding.quantity;
          const dayChangePercent = quote.changePercent;
          
          return {
            ...holding,
            currentPrice: quote.price,
            currentValue,
            totalReturn,
            totalReturnPercent,
            dayChange,
            dayChangePercent,
          };
        }
      } catch (error) {
        console.error(`Error fetching quote for ${holding.symbol}:`, error);
      }
      
      // Fallback to previous data if API call fails
      return {
        ...holding,
        currentPrice: holding.currentPrice || holding.buyPrice,
        currentValue: (holding.currentPrice || holding.buyPrice) * holding.quantity,
        totalReturn: holding.totalReturn || 0,
        totalReturnPercent: holding.totalReturnPercent || 0,
        dayChange: holding.dayChange || 0,
        dayChangePercent: holding.dayChangePercent || 0,
      };
    })
  );
  
  // Calculate totals
  const totalValue = updatedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalInvested = updatedHoldings.reduce((sum, h) => sum + (h.buyPrice * h.quantity), 0);
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const dayChange = updatedHoldings.reduce((sum, h) => sum + (h.dayChange || 0), 0);
  const dayChangePercent = totalInvested > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;
  
  // Save updated holdings back to storage
  savePortfolio(updatedHoldings);
  
  return {
    holdings: updatedHoldings,
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    lastUpdated: Date.now(),
  };
};

// Get portfolio holdings grouped by symbol (for users with multiple purchases of same stock)
export const getGroupedHoldings = (): { [symbol: string]: PortfolioHolding[] } => {
  const holdings = loadPortfolio();
  return holdings.reduce((groups, holding) => {
    if (!groups[holding.symbol]) {
      groups[holding.symbol] = [];
    }
    groups[holding.symbol].push(holding);
    return groups;
  }, {} as { [symbol: string]: PortfolioHolding[] });
};

// Calculate average price for a symbol across multiple holdings
export const getAveragePrice = (symbol: string): number => {
  const holdings = loadPortfolio().filter(h => h.symbol === symbol);
  if (holdings.length === 0) return 0;
  
  const totalQuantity = holdings.reduce((sum, h) => sum + h.quantity, 0);
  const totalValue = holdings.reduce((sum, h) => sum + (h.buyPrice * h.quantity), 0);
  
  return totalValue / totalQuantity;
};

// Get total quantity for a symbol
export const getTotalQuantity = (symbol: string): number => {
  const holdings = loadPortfolio().filter(h => h.symbol === symbol);
  return holdings.reduce((sum, h) => sum + h.quantity, 0);
};

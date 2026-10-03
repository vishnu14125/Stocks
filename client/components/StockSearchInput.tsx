import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { searchStocks, getStockQuote, type StockSearchResult, type StockQuote } from '@/lib/stockApi';
import { cn } from '@/lib/utils';

interface StockSearchInputProps {
  onStockSelect?: (stock: StockQuote) => void;
  placeholder?: string;
  className?: string;
}

const StockSearchInput: React.FC<StockSearchInputProps> = ({
  onStockSelect,
  placeholder = "Search stocks...",
  className
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [stockQuotes, setStockQuotes] = useState<{ [key: string]: StockQuote }>({});
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for stocks as user types
  useEffect(() => {
    const searchStocksAsync = async () => {
      if (query.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchStocks(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);

        // Fetch quotes for visible results
        const quotes: { [key: string]: StockQuote } = {};
        for (const result of searchResults.slice(0, 5)) {
          try {
            const quote = await getStockQuote(result.symbol);
            if (quote) {
              quotes[result.symbol] = quote;
            }
          } catch (error) {
            console.error(`Error fetching quote for ${result.symbol}:`, error);
          }
        }
        setStockQuotes(quotes);
      } catch (error) {
        console.error('Error searching stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchStocksAsync, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectStock(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectStock = async (stock: StockSearchResult) => {
    try {
      const quote = stockQuotes[stock.symbol] || await getStockQuote(stock.symbol);
      if (quote && onStockSelect) {
        onStockSelect(quote);
      }
    } catch (error) {
      console.error('Error selecting stock:', error);
    }
    
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 border shadow-lg bg-card z-50 max-h-96 overflow-auto">
          <div className="p-2">
            {results.map((stock, index) => {
              const quote = stockQuotes[stock.symbol];
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={stock.symbol}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                    isSelected ? "bg-accent" : "hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {stock.region}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {stock.name}
                    </div>
                  </div>
                  
                  {quote && (
                    <div className="text-right ml-4">
                      <div className="font-medium">
                        ${quote.price.toFixed(2)}
                      </div>
                      <div className={cn(
                        "text-xs flex items-center justify-end gap-1",
                        quote.change >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {quote.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No results message */}
      {isOpen && !isLoading && query.length > 0 && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 border shadow-lg bg-card z-50">
          <div className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No stocks found for "{query}"</p>
            <p className="text-xs mt-1">Try searching with a stock symbol or company name</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StockSearchInput;

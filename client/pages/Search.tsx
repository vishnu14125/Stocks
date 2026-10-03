import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StockSearchInput from '@/components/StockSearchInput';
import { Plus, Trash2, TrendingUp, TrendingDown, Star, StarOff, Eye } from 'lucide-react';
import { type StockQuote } from '@/lib/stockApi';
import { cn } from '@/lib/utils';

interface WatchlistItem extends StockQuote {
  addedAt: number;
}

export default function Search() {
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stocktracker-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stocktracker-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (stock: StockQuote) => {
    const exists = watchlist.find(item => item.symbol === stock.symbol);
    if (!exists) {
      const newItem: WatchlistItem = {
        ...stock,
        addedAt: Date.now()
      };
      setWatchlist(prev => [...prev, newItem]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  const handleStockSelect = (stock: StockQuote) => {
    setSelectedStock(stock);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Stock Search & Watchlist
          </h1>
          <p className="text-muted-foreground">
            Search for stocks and manage your watchlist
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Search Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockSearchInput
              onStockSelect={handleStockSelect}
              placeholder="Search by symbol or company name..."
              className="max-w-lg"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selected Stock Details */}
          {selectedStock && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{selectedStock.symbol}</span>
                    <Badge variant="outline">{selectedStock.name}</Badge>
                  </div>
                  <Button
                    variant={isInWatchlist(selectedStock.symbol) ? "destructive" : "default"}
                    size="sm"
                    onClick={() => {
                      if (isInWatchlist(selectedStock.symbol)) {
                        removeFromWatchlist(selectedStock.symbol);
                      } else {
                        addToWatchlist(selectedStock);
                      }
                    }}
                  >
                    {isInWatchlist(selectedStock.symbol) ? (
                      <><StarOff className="h-4 w-4 mr-2" />Remove</>
                    ) : (
                      <><Star className="h-4 w-4 mr-2" />Add to Watchlist</>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price Section */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        ${selectedStock.price.toFixed(2)}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        selectedStock.change >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {selectedStock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {selectedStock.change >= 0 ? '+' : ''}${selectedStock.change.toFixed(2)}
                        ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  {/* Stock Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Previous Close</div>
                      <div className="font-medium">${selectedStock.previousClose.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Open</div>
                      <div className="font-medium">${selectedStock.open.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Day High</div>
                      <div className="font-medium">${selectedStock.high.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Day Low</div>
                      <div className="font-medium">${selectedStock.low.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="font-medium">{selectedStock.volume.toLocaleString()}</div>
                    </div>
                    {selectedStock.marketCap && (
                      <div>
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                        <div className="font-medium">{selectedStock.marketCap}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Watchlist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                My Watchlist ({watchlist.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your watchlist is empty</p>
                  <p className="text-sm">Search for stocks and add them to your watchlist</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {watchlist.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-sm font-medium">
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right mr-2">
                        <div className={cn(
                          "text-sm flex items-center gap-1",
                          stock.change >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(stock.symbol);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

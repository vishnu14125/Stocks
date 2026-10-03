import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, Eye } from 'lucide-react';
import { getStockQuote, type StockQuote } from '@/lib/stockApi';
import { cn } from '@/lib/utils';

interface WatchlistItem extends StockQuote {
  addedAt: number;
}

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load watchlist from localStorage and refresh quotes
  useEffect(() => {
    const loadWatchlist = async () => {
      const saved = localStorage.getItem('stocktracker-watchlist');
      if (saved) {
        try {
          const parsedWatchlist: WatchlistItem[] = JSON.parse(saved);
          setWatchlist(parsedWatchlist);
          
          // Refresh quotes for watchlist items
          setIsLoading(true);
          const updatedWatchlist = await Promise.all(
            parsedWatchlist.map(async (item) => {
              try {
                const quote = await getStockQuote(item.symbol);
                return quote ? { ...quote, addedAt: item.addedAt } : item;
              } catch (error) {
                console.error(`Error fetching quote for ${item.symbol}:`, error);
                return item;
              }
            })
          );
          
          setWatchlist(updatedWatchlist);
          // Update localStorage with fresh data
          localStorage.setItem('stocktracker-watchlist', JSON.stringify(updatedWatchlist));
        } catch (error) {
          console.error('Error loading watchlist:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWatchlist();
  }, []);

  const displayData = watchlist.slice(0, 5); // Show only first 5 on dashboard

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Watchlist ({watchlist.length})
        </CardTitle>
        <Link to="/search">
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-muted-foreground">Loading watchlist...</span>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your watchlist is empty</p>
            <p className="text-sm">Add stocks to track their performance</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div className="col-span-2">Symbol</div>
              <div>Price</div>
              <div>Change</div>
              <div>Change %</div>
              <div>Volume</div>
            </div>
            
            {displayData.map((stock) => (
              <div key={stock.symbol} className="grid grid-cols-6 gap-4 items-center py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="col-span-2">
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {stock.name}
                  </div>
                </div>
                
                <div className="font-medium">
                  ${stock.price.toFixed(2)}
                </div>
                
                <div className={cn(
                  "flex items-center gap-1",
                  stock.change >= 0 ? "text-success" : "text-destructive"
                )}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  ${Math.abs(stock.change).toFixed(2)}
                </div>
                
                <div className={cn(
                  "font-medium",
                  stock.changePercent >= 0 ? "text-success" : "text-destructive"
                )}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {stock.volume.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {watchlist.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Link to="/search">
              <Button variant="ghost" className="w-full">
                {watchlist.length > 5 ? `View All ${watchlist.length} Stocks` : 'Manage Watchlist'}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Watchlist;

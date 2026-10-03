import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddHoldingDialog from '@/components/AddHoldingDialog';
import {
  Wallet,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator
} from 'lucide-react';
import {
  calculatePortfolioSummary,
  deleteHolding,
  type Portfolio,
  type PortfolioHolding
} from '@/lib/portfolioApi';
import { cn } from '@/lib/utils';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const loadPortfolio = async () => {
    try {
      const portfolioData = await calculatePortfolioSummary();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    setIsRefreshing(true);
    await loadPortfolio();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleDeleteHolding = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
      const success = deleteHolding(id);
      if (success) {
        await loadPortfolio();
      }
    }
  };

  const handleHoldingAdded = async () => {
    await loadPortfolio();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading portfolio...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portfolio Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage your stock holdings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshPortfolio}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${portfolio?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">
                    ${portfolio?.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    (portfolio?.totalReturn || 0) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {(portfolio?.totalReturn || 0) >= 0 ? '+' : ''}${portfolio?.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className={cn(
                    "text-sm",
                    (portfolio?.totalReturnPercent || 0) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {(portfolio?.totalReturnPercent || 0) >= 0 ? '+' : ''}{portfolio?.totalReturnPercent.toFixed(2) || '0.00'}%
                  </p>
                </div>
                {(portfolio?.totalReturn || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-success" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Change</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    (portfolio?.dayChange || 0) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {(portfolio?.dayChange || 0) >= 0 ? '+' : ''}${portfolio?.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                  <p className={cn(
                    "text-sm",
                    (portfolio?.dayChangePercent || 0) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {(portfolio?.dayChangePercent || 0) >= 0 ? '+' : ''}{portfolio?.dayChangePercent.toFixed(2) || '0.00'}%
                  </p>
                </div>
                {(portfolio?.dayChange || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-success" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings ({portfolio?.holdings.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!portfolio || portfolio.holdings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No holdings yet</h3>
                <p className="mb-4">Start building your portfolio by adding your first stock</p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Holding
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-2">Symbol</div>
                  <div className="col-span-1 text-right">Qty</div>
                  <div className="col-span-1 text-right">Avg Price</div>
                  <div className="col-span-1 text-right">Current</div>
                  <div className="col-span-2 text-right">Market Value</div>
                  <div className="col-span-2 text-right">Return</div>
                  <div className="col-span-2 text-right">Day Change</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Holdings Rows */}
                {portfolio.holdings.map((holding) => (
                  <div key={holding.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border/50 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
                    <div className="col-span-2">
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {holding.name}
                      </div>
                    </div>

                    <div className="col-span-1 text-right font-medium">
                      {holding.quantity}
                    </div>

                    <div className="col-span-1 text-right">
                      ${holding.buyPrice.toFixed(2)}
                    </div>

                    <div className="col-span-1 text-right font-medium">
                      ${holding.currentPrice?.toFixed(2) || holding.buyPrice.toFixed(2)}
                    </div>

                    <div className="col-span-2 text-right font-medium">
                      ${holding.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || (holding.buyPrice * holding.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div className="col-span-2 text-right">
                      <div className={cn(
                        "font-medium",
                        (holding.totalReturn || 0) >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {(holding.totalReturn || 0) >= 0 ? '+' : ''}${holding.totalReturn?.toFixed(2) || '0.00'}
                      </div>
                      <div className={cn(
                        "text-sm",
                        (holding.totalReturnPercent || 0) >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {(holding.totalReturnPercent || 0) >= 0 ? '+' : ''}{holding.totalReturnPercent?.toFixed(2) || '0.00'}%
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className={cn(
                        "flex items-center justify-end gap-1 font-medium",
                        (holding.dayChange || 0) >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {(holding.dayChange || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {(holding.dayChange || 0) >= 0 ? '+' : ''}${holding.dayChange?.toFixed(2) || '0.00'}
                      </div>
                      <div className={cn(
                        "text-sm",
                        (holding.dayChangePercent || 0) >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {(holding.dayChangePercent || 0) >= 0 ? '+' : ''}{holding.dayChangePercent?.toFixed(2) || '0.00'}%
                      </div>
                    </div>

                    <div className="col-span-1 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHolding(holding.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Holding Dialog */}
        <AddHoldingDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onHoldingAdded={handleHoldingAdded}
        />
      </div>
    </div>
  );
}

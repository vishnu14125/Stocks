import React, { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import { PortfolioLineChart, SectorPieChart, TopStocksChart } from '@/components/PortfolioChart';
import Watchlist from '@/components/Watchlist';
import { calculatePortfolioSummary, type Portfolio } from '@/lib/portfolioApi';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Format portfolio stats for display
  const portfolioStats = {
    totalValue: `$${portfolio?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    dailyChange: `${portfolio?.dayChange >= 0 ? '+' : ''}$${portfolio?.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    dailyChangePercent: `${portfolio?.dayChangePercent >= 0 ? '+' : ''}${portfolio?.dayChangePercent.toFixed(2) || '0.00'}%`,
    totalGains: `${portfolio?.totalReturn >= 0 ? '+' : ''}$${portfolio?.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
    totalGainsPercent: `${portfolio?.totalReturnPercent >= 0 ? '+' : ''}${portfolio?.totalReturnPercent.toFixed(2) || '0.00'}%`,
    investedAmount: `$${portfolio?.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portfolio Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your investments and market performance in real-time
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshPortfolio}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Portfolio Value"
            value={portfolioStats.totalValue}
            change={`${portfolioStats.dailyChange} (${portfolioStats.dailyChangePercent})`}
            changeType={portfolio?.dayChange >= 0 ? "positive" : "negative"}
            trend={portfolio?.dayChange >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-4 w-4" />}
          />
          
          <StatsCard
            title="Total Invested"
            value={portfolioStats.investedAmount}
            icon={<Activity className="h-4 w-4" />}
          />
          
          <StatsCard
            title="Total Gains/Loss"
            value={portfolioStats.totalGains}
            change={portfolioStats.totalGainsPercent}
            changeType={portfolio?.totalReturn >= 0 ? "positive" : "negative"}
            trend={portfolio?.totalReturn >= 0 ? "up" : "down"}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          
          <StatsCard
            title="Today's Change"
            value={portfolioStats.dailyChange}
            change={portfolioStats.dailyChangePercent}
            changeType={portfolio?.dayChange >= 0 ? "positive" : "negative"}
            trend={portfolio?.dayChange >= 0 ? "up" : "down"}
            icon={portfolio?.dayChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PortfolioLineChart />
          <SectorPieChart />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TopStocksChart />
          <Watchlist />
        </div>
        
        {/* Market Summary */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Market Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">S&P 500</span>
              <div className="text-right">
                <div className="font-medium">4,567.23</div>
                <div className="text-sm text-success flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +0.85%
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">NASDAQ</span>
              <div className="text-right">
                <div className="font-medium">14,234.56</div>
                <div className="text-sm text-success flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +1.23%
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Dow Jones</span>
              <div className="text-right">
                <div className="font-medium">34,789.12</div>
                <div className="text-sm text-destructive flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -0.34%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

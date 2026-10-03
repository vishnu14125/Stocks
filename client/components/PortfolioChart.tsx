import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';

// Sample data - in real app this would come from API
const portfolioData = [
  { date: '2024-01-01', value: 45000 },
  { date: '2024-01-02', value: 46200 },
  { date: '2024-01-03', value: 45800 },
  { date: '2024-01-04', value: 47100 },
  { date: '2024-01-05', value: 48200 },
  { date: '2024-01-06', value: 47800 },
  { date: '2024-01-07', value: 49100 },
];

const sectorData = [
  { name: 'Technology', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Healthcare', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Finance', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Energy', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Others', value: 5, color: 'hsl(var(--chart-5))' },
];

const topStocks = [
  { name: 'AAPL', change: 2.5, value: 8500 },
  { name: 'MSFT', change: 1.8, value: 7200 },
  { name: 'GOOGL', change: -0.8, value: 6800 },
  { name: 'TSLA', change: 3.2, value: 5900 },
  { name: 'NVDA', change: -1.5, value: 5100 },
];

export const PortfolioLineChart = () => (
  <Card className="col-span-1 md:col-span-2">
    <CardHeader>
      <CardTitle>Portfolio Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const SectorPieChart = () => (
  <Card>
    <CardHeader>
      <CardTitle>Sector Allocation</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const TopStocksChart = () => (
  <Card>
    <CardHeader>
      <CardTitle>Top Holdings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topStocks} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                name === 'value' ? `$${value.toLocaleString()}` : `${value}%`,
                name === 'value' ? 'Value' : 'Change'
              ]}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

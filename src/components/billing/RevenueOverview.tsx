'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueOverviewProps {
  currentRevenue: number;
  previousRevenue: number;
  growth: number;
  period: string;
}

export default function RevenueOverview({ currentRevenue, previousRevenue, growth, period }: RevenueOverviewProps) {
  // Generate a simple trend line from previous to current
  const trendData = [
    { label: 'Previous', revenue: previousRevenue },
    { label: 'Current', revenue: currentRevenue },
  ];

  return (
    <div className="card">
      <h3 className="card-header">Monthly Recurring Revenue</h3>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="metric-value text-3xl">${currentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={`text-sm font-mono ${growth >= 0 ? 'text-bfl-green' : 'text-bfl-red'}`}>
          {growth >= 0 ? '+' : ''}{(growth * 100).toFixed(1)}%
        </span>
        <span className="text-xs text-bfl-muted">vs previous {period}</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '2px', fontSize: '12px' }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revenueGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

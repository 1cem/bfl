'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BurnRateData {
  date: string;
  credits: number;
  calls: number;
}

interface CreditBurnRateProps {
  data: BurnRateData[];
}

export default function CreditBurnRate({ data }: CreditBurnRateProps) {
  return (
    <div className="card">
      <h3 className="card-header">Credit Burn Rate (Daily)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={{ stroke: '#1e1e2e' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #1e1e2e',
              borderRadius: '2px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              name === 'credits' ? value.toFixed(1) : value.toLocaleString(),
              name === 'credits' ? 'Credits' : 'Calls',
            ]}
          />
          <Area
            type="monotone"
            dataKey="credits"
            stroke="#3b82f6"
            fill="url(#burnGradient)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

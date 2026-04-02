'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ModelRevenueData {
  model: string;
  revenue: number;
  calls: number;
}

interface ModelRevenueProps {
  data: ModelRevenueData[];
}

export default function ModelRevenue({ data }: ModelRevenueProps) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="card">
      <h3 className="card-header">Revenue by Model Tier</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <YAxis type="category" dataKey="model" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={110} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '2px', fontSize: '12px' }}
            formatter={(v: number, name: string) => {
              if (name === 'revenue') return [`$${v.toFixed(2)}`, 'Revenue'];
              return [v.toLocaleString(), 'Calls'];
            }}
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MpData {
  megapixels: number | null;
  count: number;
}

interface ResolutionHeatmapProps {
  data: MpData[];
}

export default function ResolutionHeatmap({ data }: ResolutionHeatmapProps) {
  const chartData = data.map(d => ({
    mp: `${d.megapixels?.toFixed(2) ?? '?'} MP`,
    count: d.count,
  }));

  return (
    <div className="card">
      <h3 className="card-header">Resolution Distribution (FLUX.2)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="mp"
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
            formatter={(value: number) => [value.toLocaleString(), 'Calls']}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SegmentData {
  segment: string;
  revenue: number;
}

interface SegmentRevenueProps {
  data: SegmentData[];
}

const SEGMENT_COLORS: Record<string, string> = {
  ENTERPRISE: '#3b82f6',
  STARTUP: '#22c55e',
  AGENCY: '#a855f7',
  INDIE: '#f59e0b',
};

const SEGMENT_LABELS: Record<string, string> = {
  ENTERPRISE: 'Enterprise',
  STARTUP: 'Startup',
  AGENCY: 'Agency',
  INDIE: 'Indie',
};

export default function SegmentRevenue({ data }: SegmentRevenueProps) {
  const chartData = data.map(d => ({
    name: SEGMENT_LABELS[d.segment] || d.segment,
    value: d.revenue,
    color: SEGMENT_COLORS[d.segment] || '#6b7280',
  }));

  return (
    <div className="card">
      <h3 className="card-header">Revenue by Customer Segment</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            stroke="#0a0a0f"
            strokeWidth={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '2px', fontSize: '12px' }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(v: string) => <span className="text-gray-400">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

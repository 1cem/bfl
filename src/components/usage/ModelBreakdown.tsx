'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ModelData {
  model: string;
  count: number;
  credits: number;
  costUsd: number;
}

interface ModelBreakdownProps {
  data: ModelData[];
  viewMode: 'credits' | 'calls';
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#a855f7',
];

export default function ModelBreakdown({ data, viewMode }: ModelBreakdownProps) {
  const chartData = data.map((d, i) => ({
    name: d.model,
    value: viewMode === 'credits' ? d.credits : d.count,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="card">
      <h3 className="card-header">Model Breakdown ({viewMode === 'credits' ? 'Credits' : 'Calls'})</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            stroke="#0a0a0f"
            strokeWidth={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #1e1e2e',
              borderRadius: '2px',
              fontSize: '12px',
            }}
            formatter={(value: number) =>
              viewMode === 'credits'
                ? [value.toFixed(1), 'Credits']
                : [value.toLocaleString(), 'Calls']
            }
          />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            formatter={(value: string) => <span className="text-gray-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EntityData {
  entity: string;
  revenue: number;
  credits: number;
  calls: number;
}

interface EntitySplitProps {
  data: EntityData[];
}

export default function EntitySplit({ data }: EntitySplitProps) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="card">
      <h3 className="card-header">Revenue by Entity (US / EU)</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {data.map(d => (
          <div key={d.entity} className="bg-bfl-bg rounded-sm p-3 border border-bfl-border">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${d.entity === 'US' ? 'bg-bfl-blue' : 'bg-purple-500'}`} />
              <span className="text-xs text-bfl-muted">{d.entity === 'US' ? 'api.us.bfl.ai' : 'api.eu.bfl.ai'}</span>
            </div>
            <div className="font-mono text-lg font-semibold">${d.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-bfl-muted">
              {total > 0 ? ((d.revenue / total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <YAxis type="category" dataKey="entity" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '2px', fontSize: '12px' }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
          />
          <Bar dataKey="revenue" radius={[0, 2, 2, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.entity === 'US' ? '#3b82f6' : '#a855f7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { Clock, AlertTriangle } from 'lucide-react';

interface ForecastOrg {
  orgId: string;
  name: string;
  creditBalance: number;
  dailyBurnRate: number;
  daysRemaining: number | null;
  type: string;
  plan: string;
}

interface CreditForecastProps {
  data: ForecastOrg[];
}

export default function CreditForecast({ data }: CreditForecastProps) {
  const sorted = [...data].sort((a, b) => {
    if (a.daysRemaining === null) return 1;
    if (b.daysRemaining === null) return -1;
    return a.daysRemaining - b.daysRemaining;
  });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-bfl-amber" />
        <h3 className="card-header mb-0">Credit Depletion Forecast</h3>
      </div>
      <div className="overflow-auto max-h-[320px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bfl-surface">
            <tr className="border-b border-bfl-border">
              <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Org</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Balance</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Burn/Day</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Days Left</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(org => {
              const urgent = org.daysRemaining !== null && org.daysRemaining <= 7;
              const warning = org.daysRemaining !== null && org.daysRemaining <= 30;
              return (
                <tr key={org.orgId} className="border-b border-bfl-border/30 hover:bg-white/[0.02]">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      {urgent && <AlertTriangle className="w-3 h-3 text-bfl-red" />}
                      <span className="text-gray-300">{org.name}</span>
                    </div>
                    <span className="text-[10px] text-bfl-muted">{org.plan}</span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-gray-200">
                    {org.creditBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-gray-400">
                    {org.dailyBurnRate.toFixed(1)}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-mono ${urgent ? 'text-bfl-red font-semibold' : warning ? 'text-bfl-amber' : 'text-gray-300'}`}>
                    {org.daysRemaining !== null ? `${org.daysRemaining}d` : '---'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

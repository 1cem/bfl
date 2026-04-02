'use client';

import { Radar, AlertCircle, TrendingDown, Clock, Ghost } from 'lucide-react';

interface ChurnRisk {
  orgId: string;
  name: string;
  type: string;
  creditBalance: number;
  dailyBurnRate: number;
  daysRemaining: number | null;
  weekOverWeekChange: number;
  weeklyCallCount: number;
  risks: string[];
  suggestedActions: string[];
}

interface ChurnRadarProps {
  data: ChurnRisk[];
}

export default function ChurnRadar({ data }: ChurnRadarProps) {
  if (data.length === 0) {
    return (
      <div className="card border border-bfl-green/20">
        <div className="flex items-center gap-2 mb-3">
          <Radar className="w-4 h-4 text-bfl-green" />
          <h3 className="card-header mb-0">Churn Risk Radar</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-bfl-muted text-sm">
          No at-risk customers detected
        </div>
      </div>
    );
  }

  return (
    <div className="card border border-bfl-red/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-bfl-red" />
          <h3 className="card-header mb-0">Churn Risk Radar</h3>
        </div>
        <span className="text-[10px] bg-bfl-red/10 text-bfl-red px-2 py-0.5 rounded-sm font-mono">
          {data.length} at risk
        </span>
      </div>

      <div className="space-y-3">
        {data.map(org => (
          <div key={org.orgId} className="bg-bfl-bg border border-bfl-border rounded-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-200">{org.name}</span>
                <span className="text-[10px] text-bfl-muted ml-2">{org.type}</span>
              </div>
              <span className="font-mono text-xs text-bfl-muted">
                {org.creditBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} credits
              </span>
            </div>

            {/* Risk indicators */}
            <div className="space-y-1.5 mb-2">
              {org.risks.map((risk, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {risk.includes('depleting') ? (
                    <Clock className="w-3 h-3 text-bfl-red" />
                  ) : risk.includes('declining') ? (
                    <TrendingDown className="w-3 h-3 text-bfl-amber" />
                  ) : (
                    <Ghost className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-[11px] text-gray-400">{risk}</span>
                </div>
              ))}
            </div>

            {/* Suggested actions */}
            <div className="border-t border-bfl-border pt-2">
              {org.suggestedActions.map((action, i) => (
                <div key={i} className="flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3 h-3 text-bfl-blue" />
                  <span className="text-[11px] text-bfl-blue">{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

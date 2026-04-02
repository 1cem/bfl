'use client';

import { formatDateTime } from '@/lib/utils';

interface ApiCallRow {
  id: string;
  timestamp: string;
  model: string;
  operation: string;
  status: string;
  megapixels: number | null;
  batchSize: number;
  creditsCharged: number;
  costUsd: number;
  latencyMs: number;
  org?: { name: string };
}

interface LiveFeedProps {
  calls: ApiCallRow[];
}

export default function LiveFeed({ calls }: LiveFeedProps) {
  const statusColor = (s: string) => {
    switch (s) {
      case 'SUCCESS': return 'text-bfl-green';
      case 'ERROR': return 'text-bfl-red';
      case 'RATE_LIMITED': return 'text-bfl-amber';
      default: return 'text-gray-400';
    }
  };

  const statusDot = (s: string) => {
    switch (s) {
      case 'SUCCESS': return 'bg-bfl-green';
      case 'ERROR': return 'bg-bfl-red';
      case 'RATE_LIMITED': return 'bg-bfl-amber';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="card-header mb-0">Live API Feed</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-bfl-green animate-pulse" />
          <span className="text-[10px] text-bfl-muted">Streaming</span>
        </div>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bfl-surface">
            <tr className="border-b border-bfl-border">
              <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Time</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Org</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Model</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Op</th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Status</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">MP</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Batch</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Credits</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Cost</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-bfl-muted">Latency</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b border-bfl-border/30 hover:bg-white/[0.02]">
                <td className="px-2 py-1.5 font-mono text-bfl-muted whitespace-nowrap">{formatDateTime(call.timestamp)}</td>
                <td className="px-2 py-1.5 text-gray-300 truncate max-w-[120px]">{call.org?.name ?? '—'}</td>
                <td className="px-2 py-1.5 font-mono text-bfl-blue">{call.model}</td>
                <td className="px-2 py-1.5 text-gray-400">{call.operation.toLowerCase()}</td>
                <td className="px-2 py-1.5 text-center">
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(call.status)}`} />
                    <span className={`${statusColor(call.status)} text-[10px]`}>{call.status}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-gray-400">{call.megapixels?.toFixed(2) ?? '—'}</td>
                <td className="px-2 py-1.5 text-right font-mono text-gray-400">{call.batchSize}</td>
                <td className="px-2 py-1.5 text-right font-mono text-gray-200">{call.creditsCharged.toFixed(1)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-bfl-green">${call.costUsd.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-gray-500">{call.latencyMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

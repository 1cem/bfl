interface ErrorTrackerProps {
  errorRate: number;
  byStatus: { status: string; count: number }[];
}

export default function ErrorTracker({ errorRate, byStatus }: ErrorTrackerProps) {
  const total = byStatus.reduce((sum, s) => sum + s.count, 0);
  const errorCount = byStatus.find(s => s.status === 'ERROR')?.count ?? 0;
  const rateLimitCount = byStatus.find(s => s.status === 'RATE_LIMITED')?.count ?? 0;
  const successCount = byStatus.find(s => s.status === 'SUCCESS')?.count ?? 0;

  const isHealthy = errorRate < 0.05;

  return (
    <div className={`card border ${isHealthy ? 'border-bfl-border' : 'border-bfl-red/30'}`}>
      <h3 className="card-header">Error & Rate Limit Tracking</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`metric-value ${isHealthy ? 'text-bfl-green' : 'text-bfl-red'}`}>
          {(errorRate * 100).toFixed(2)}%
        </span>
        <span className="text-xs text-bfl-muted">error rate</span>
        {!isHealthy && <span className="text-[10px] text-bfl-red bg-bfl-red/10 px-1.5 py-0.5 rounded-sm">ALERT: &gt;5%</span>}
      </div>

      {/* Status bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-3 bg-bfl-border">
        {total > 0 && (
          <>
            <div className="bg-bfl-green h-full" style={{ width: `${(successCount / total) * 100}%` }} />
            <div className="bg-bfl-red h-full" style={{ width: `${(errorCount / total) * 100}%` }} />
            <div className="bg-bfl-amber h-full" style={{ width: `${(rateLimitCount / total) * 100}%` }} />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs font-mono text-bfl-green">{successCount.toLocaleString()}</div>
          <div className="text-[10px] text-bfl-muted">Success</div>
        </div>
        <div>
          <div className="text-xs font-mono text-bfl-red">{errorCount.toLocaleString()}</div>
          <div className="text-[10px] text-bfl-muted">Errors</div>
        </div>
        <div>
          <div className="text-xs font-mono text-bfl-amber">{rateLimitCount.toLocaleString()}</div>
          <div className="text-[10px] text-bfl-muted">Rate Limited</div>
        </div>
      </div>
    </div>
  );
}

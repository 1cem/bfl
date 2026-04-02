import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  icon?: LucideIcon;
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'default';
}

export default function MetricCard({ label, value, delta, deltaLabel, icon: Icon, accent = 'default' }: MetricCardProps) {
  const accentColors = {
    blue: 'border-bfl-blue/30',
    green: 'border-bfl-green/30',
    amber: 'border-bfl-amber/30',
    red: 'border-bfl-red/30',
    default: 'border-bfl-border',
  };

  return (
    <div className={`card border ${accentColors[accent]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="card-header mb-0">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-bfl-muted" />}
      </div>
      <div className="metric-value">{value}</div>
      {delta !== undefined && delta !== null && (
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-mono ${delta >= 0 ? 'text-bfl-green' : 'text-bfl-red'}`}>
            {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-xs text-bfl-muted">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

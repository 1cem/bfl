'use client';

import { FileText } from 'lucide-react';

interface InvoiceStatus {
  status: string;
  count: number;
  totalUsd: number;
}

interface InvoiceTrackerProps {
  data: InvoiceStatus[];
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  SENT: { bg: 'bg-bfl-blue/10', text: 'text-bfl-blue', dot: 'bg-bfl-blue' },
  PAID: { bg: 'bg-bfl-green/10', text: 'text-bfl-green', dot: 'bg-bfl-green' },
  OVERDUE: { bg: 'bg-bfl-red/10', text: 'text-bfl-red', dot: 'bg-bfl-red' },
};

export default function InvoiceTracker({ data }: InvoiceTrackerProps) {
  const totalInvoices = data.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.totalUsd, 0);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-bfl-muted" />
        <h3 className="card-header mb-0">Invoice Status</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-lg font-semibold">{totalInvoices}</span>
        <span className="text-xs text-bfl-muted">invoices totaling</span>
        <span className="font-mono text-sm text-bfl-green">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.map(inv => {
          const colors = statusColors[inv.status] || statusColors.DRAFT;
          return (
            <div key={inv.status} className={`${colors.bg} rounded-sm p-3 border border-bfl-border/50`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                <span className={`text-[10px] uppercase tracking-wider ${colors.text}`}>{inv.status}</span>
              </div>
              <div className="font-mono text-lg font-semibold">{inv.count}</div>
              <div className="font-mono text-xs text-bfl-muted">${inv.totalUsd.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

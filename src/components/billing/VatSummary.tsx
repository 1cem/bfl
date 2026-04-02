import { Receipt } from 'lucide-react';

interface VatSummaryProps {
  totalVat: number;
}

export default function VatSummary({ totalVat }: VatSummaryProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-bfl-muted" />
        <h3 className="card-header mb-0">VAT Summary (EU)</h3>
      </div>
      <div className="bg-bfl-bg rounded-sm p-3 border border-bfl-border">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-bfl-muted">Total VAT Collected</span>
          <span className="font-mono text-lg font-semibold text-bfl-amber">
            ${totalVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-bfl-muted">VAT Rate (Germany)</span>
          <span className="font-mono text-sm text-gray-300">19%</span>
        </div>
        <div className="border-t border-bfl-border mt-2 pt-2">
          <span className="text-[10px] text-bfl-muted">Applied to all EU entity invoices (api.eu.bfl.ai)</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  compact?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  compact = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / pageSize);
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bfl-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`${compact ? 'px-2 py-1.5' : 'px-3 py-2'} text-[10px] font-medium uppercase tracking-wider text-bfl-muted text-${col.align || 'left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-b border-bfl-border/50 hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`${compact ? 'px-2 py-1.5' : 'px-3 py-2'} ${col.mono ? 'font-mono' : ''} text-${col.align || 'left'}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-2">
          <span className="text-xs text-bfl-muted">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-1 text-xs rounded-sm bg-bfl-border/50 hover:bg-bfl-border disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 text-xs rounded-sm bg-bfl-border/50 hover:bg-bfl-border disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

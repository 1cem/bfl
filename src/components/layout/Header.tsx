'use client';

import { Database } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="border-b border-bfl-border bg-bfl-surface/50 backdrop-blur-sm px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-bfl-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-bfl-muted">
            <Database className="w-3.5 h-3.5" />
            <span className="font-mono">PostgreSQL</span>
          </div>
          <div className="h-4 w-px bg-bfl-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-bfl-green animate-pulse" />
            <span className="text-xs text-bfl-muted">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

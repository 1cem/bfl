'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, DollarSign, Zap, Heart } from 'lucide-react';

const navItems = [
  { href: '/usage', label: 'Usage Metering', icon: Activity },
  { href: '/billing', label: 'Revenue & Billing', icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen bg-bfl-surface border-r border-bfl-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-bfl-border">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-bfl-blue" />
          <span className="font-semibold text-sm tracking-wide">BFL GTM Engine</span>
        </div>
        <p className="text-[10px] text-bfl-muted mt-1 uppercase tracking-widest">Metering & Billing</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors ${
                active
                  ? 'bg-bfl-blue/10 text-bfl-blue border border-bfl-blue/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-bfl-border">
        <div className="flex items-center gap-1.5 text-[10px] text-bfl-muted">
          <Heart className="w-3 h-3" />
          <span>Black Forest Labs</span>
        </div>
      </div>
    </aside>
  );
}

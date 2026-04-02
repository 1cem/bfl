'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/shared/MetricCard';
import FilterBar from '@/components/shared/FilterBar';
import RevenueOverview from '@/components/billing/RevenueOverview';
import EntitySplit from '@/components/billing/EntitySplit';
import ModelRevenue from '@/components/billing/ModelRevenue';
import SegmentRevenue from '@/components/billing/SegmentRevenue';
import CreditForecast from '@/components/billing/CreditForecast';
import InvoiceTracker from '@/components/billing/InvoiceTracker';
import VatSummary from '@/components/billing/VatSummary';
import ChurnRadar from '@/components/billing/ChurnRadar';
import { DollarSign, TrendingUp, CreditCard, Users } from 'lucide-react';
import { formatUsd, formatNumber } from '@/lib/utils';

interface BillingData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    totalCredits: number;
    totalCalls: number;
  };
  byEntity: { entity: string; revenue: number; credits: number; calls: number }[];
  byModel: { model: string; revenue: number; calls: number }[];
  bySegment: { segment: string; revenue: number }[];
  invoices: { status: string; count: number; totalUsd: number }[];
  vatTotal: number;
  forecasts: any[];
  churnRisks: any[];
  period: string;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  const eurRate = 0.92;
  const convert = useCallback((usd: number) => currency === 'EUR' ? usd * eurRate : usd, [currency]);
  const symbol = currency === 'EUR' ? '\u20AC' : '$';

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/billing?period=${period}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56">
        <Header
          title="Revenue & Billing Dashboard"
          subtitle="MRR analytics, entity split, invoice tracking, and churn risk detection"
        />

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <FilterBar
              filters={[
                {
                  key: 'period',
                  label: 'Period',
                  value: period,
                  onChange: setPeriod,
                  options: [
                    { value: '7d', label: '7 days' },
                    { value: '30d', label: '30 days' },
                    { value: '90d', label: '90 days' },
                  ],
                },
              ]}
            />
            <div className="flex items-center gap-1 bg-bfl-surface border border-bfl-border rounded-sm">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-mono ${currency === 'USD' ? 'bg-bfl-blue/10 text-bfl-blue' : 'text-gray-400'}`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 text-xs font-mono ${currency === 'EUR' ? 'bg-bfl-blue/10 text-bfl-blue' : 'text-gray-400'}`}
              >
                EUR
              </button>
            </div>
          </div>

          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-bfl-muted text-sm animate-pulse">Loading billing data...</div>
            </div>
          ) : data ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="Revenue (Period)"
                  value={`${symbol}${convert(data.revenue.current).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  delta={data.revenue.growth}
                  deltaLabel="vs prev period"
                  icon={DollarSign}
                  accent="green"
                />
                <MetricCard
                  label="Growth"
                  value={`${data.revenue.growth >= 0 ? '+' : ''}${(data.revenue.growth * 100).toFixed(1)}%`}
                  icon={TrendingUp}
                  accent={data.revenue.growth >= 0 ? 'green' : 'red'}
                />
                <MetricCard
                  label="Credits Consumed"
                  value={formatNumber(data.revenue.totalCredits)}
                  icon={CreditCard}
                  accent="blue"
                />
                <MetricCard
                  label="Active Orgs"
                  value={String(data.forecasts.filter(f => f.weeklyCallCount > 0).length)}
                  icon={Users}
                  accent="amber"
                />
              </div>

              {/* Revenue Overview + Entity Split */}
              <div className="grid grid-cols-2 gap-4">
                <RevenueOverview
                  currentRevenue={convert(data.revenue.current)}
                  previousRevenue={convert(data.revenue.previous)}
                  growth={data.revenue.growth}
                  period={period}
                />
                <EntitySplit data={data.byEntity.map(e => ({ ...e, revenue: convert(e.revenue) }))} />
              </div>

              {/* Model Revenue + Segment Revenue */}
              <div className="grid grid-cols-2 gap-4">
                <ModelRevenue data={data.byModel.map(m => ({ ...m, revenue: convert(m.revenue) }))} />
                <SegmentRevenue data={data.bySegment.map(s => ({ ...s, revenue: convert(s.revenue) }))} />
              </div>

              {/* Forecasts + Invoices */}
              <div className="grid grid-cols-2 gap-4">
                <CreditForecast data={data.forecasts} />
                <InvoiceTracker data={data.invoices.map(i => ({ ...i, totalUsd: convert(i.totalUsd) }))} />
              </div>

              {/* VAT + Churn Radar */}
              <div className="grid grid-cols-2 gap-4">
                <VatSummary totalVat={convert(data.vatTotal)} />
                <ChurnRadar data={data.churnRisks} />
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

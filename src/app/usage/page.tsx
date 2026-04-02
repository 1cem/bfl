'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/shared/MetricCard';
import FilterBar from '@/components/shared/FilterBar';
import LiveFeed from '@/components/usage/LiveFeed';
import ModelBreakdown from '@/components/usage/ModelBreakdown';
import ResolutionHeatmap from '@/components/usage/ResolutionHeatmap';
import CreditBurnRate from '@/components/usage/CreditBurnRate';
import ErrorTracker from '@/components/usage/ErrorTracker';
import PricingCalculator from '@/components/usage/PricingCalculator';
import { Activity, Cpu, Zap, Clock } from 'lucide-react';
import { formatNumber, formatUsd } from '@/lib/utils';

interface UsageData {
  calls: any[];
  pagination: { total: number };
  aggregations: {
    totalCalls: number;
    totalCredits: number;
    totalCostUsd: number;
    avgLatencyMs: number;
    errorRate: number;
  };
  byModel: { model: string; count: number; credits: number; costUsd: number }[];
  byStatus: { status: string; count: number }[];
  mpDistribution: { megapixels: number | null; count: number }[];
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'credits' | 'calls'>('credits');
  const [filters, setFilters] = useState({
    model: '',
    region: '',
    orgId: '',
    status: '',
    period: '30d',
  });
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.model) params.set('model', filters.model);
    if (filters.region) params.set('region', filters.region);
    if (filters.orgId) params.set('orgId', filters.orgId);
    if (filters.status) params.set('status', filters.status);

    const days = filters.period === '7d' ? 7 : filters.period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    params.set('startDate', startDate);
    params.set('limit', '50');

    const res = await fetch(`/api/usage?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetch('/api/orgs').then(r => r.json()).then(o =>
      setOrgs(o.map((org: any) => ({ id: org.id, name: org.name })))
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Simulate live feed refresh
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Compute daily burn rate from calls
  const dailyBurnData = data ? computeDailyBurn(data.calls) : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56">
        <Header
          title="Usage Metering Engine"
          subtitle="Real-time API usage tracking, model analytics, and pricing calculations"
        />

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <FilterBar
              filters={[
                {
                  key: 'period',
                  label: 'Period',
                  value: filters.period,
                  onChange: (v) => setFilters(f => ({ ...f, period: v })),
                  options: [
                    { value: '7d', label: '7 days' },
                    { value: '30d', label: '30 days' },
                    { value: '90d', label: '90 days' },
                  ],
                },
                {
                  key: 'model',
                  label: 'Model',
                  value: filters.model,
                  onChange: (v) => setFilters(f => ({ ...f, model: v })),
                  options: [
                    { value: '', label: 'All Models' },
                    { value: 'flux2-klein-4b', label: 'FLUX.2 Klein 4B' },
                    { value: 'flux2-klein-9b', label: 'FLUX.2 Klein 9B' },
                    { value: 'flux2-pro', label: 'FLUX.2 Pro' },
                    { value: 'flux2-max', label: 'FLUX.2 Max' },
                    { value: 'flux2-flex', label: 'FLUX.2 Flex' },
                    { value: 'flux2-dev', label: 'FLUX.2 Dev' },
                    { value: 'flux1-kontext-pro', label: 'Kontext Pro' },
                    { value: 'flux1-kontext-max', label: 'Kontext Max' },
                    { value: 'flux11-pro', label: 'FLUX1.1 Pro' },
                    { value: 'flux11-pro-ultra', label: 'FLUX1.1 Pro Ultra' },
                    { value: 'flux11-pro-raw', label: 'FLUX1.1 Pro Raw' },
                    { value: 'flux1-fill-pro', label: 'Fill Pro' },
                  ],
                },
                {
                  key: 'region',
                  label: 'Region',
                  value: filters.region,
                  onChange: (v) => setFilters(f => ({ ...f, region: v })),
                  options: [
                    { value: '', label: 'All Regions' },
                    { value: 'US', label: 'US' },
                    { value: 'EU', label: 'EU' },
                  ],
                },
                {
                  key: 'status',
                  label: 'Status',
                  value: filters.status,
                  onChange: (v) => setFilters(f => ({ ...f, status: v })),
                  options: [
                    { value: '', label: 'All' },
                    { value: 'SUCCESS', label: 'Success' },
                    { value: 'ERROR', label: 'Error' },
                    { value: 'RATE_LIMITED', label: 'Rate Limited' },
                  ],
                },
                {
                  key: 'orgId',
                  label: 'Org',
                  value: filters.orgId,
                  onChange: (v) => setFilters(f => ({ ...f, orgId: v })),
                  options: [
                    { value: '', label: 'All Orgs' },
                    ...orgs.map(o => ({ value: o.id, label: o.name })),
                  ],
                },
              ]}
            />
            <div className="flex items-center gap-1 bg-bfl-surface border border-bfl-border rounded-sm">
              <button
                onClick={() => setViewMode('credits')}
                className={`px-3 py-1 text-xs ${viewMode === 'credits' ? 'bg-bfl-blue/10 text-bfl-blue' : 'text-gray-400'}`}
              >
                $ Credits
              </button>
              <button
                onClick={() => setViewMode('calls')}
                className={`px-3 py-1 text-xs ${viewMode === 'calls' ? 'bg-bfl-blue/10 text-bfl-blue' : 'text-gray-400'}`}
              >
                # Calls
              </button>
            </div>
          </div>

          {loading && !data ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-bfl-muted text-sm animate-pulse">Loading usage data...</div>
            </div>
          ) : data ? (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="Total API Calls"
                  value={formatNumber(data.aggregations.totalCalls)}
                  icon={Activity}
                  accent="blue"
                />
                <MetricCard
                  label="Credits Consumed"
                  value={formatNumber(data.aggregations.totalCredits)}
                  icon={Zap}
                  accent="green"
                />
                <MetricCard
                  label="Total Revenue"
                  value={formatUsd(data.aggregations.totalCostUsd)}
                  icon={Cpu}
                  accent="amber"
                />
                <MetricCard
                  label="Avg Latency"
                  value={`${data.aggregations.avgLatencyMs}ms`}
                  icon={Clock}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-4">
                <ModelBreakdown data={data.byModel} viewMode={viewMode} />
                <ResolutionHeatmap data={data.mpDistribution} />
                <div className="space-y-4">
                  <ErrorTracker errorRate={data.aggregations.errorRate} byStatus={data.byStatus} />
                  <PricingCalculator />
                </div>
              </div>

              {/* Burn Rate Chart */}
              {dailyBurnData.length > 0 && (
                <CreditBurnRate data={dailyBurnData} />
              )}

              {/* Live Feed */}
              <LiveFeed calls={data.calls} />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function computeDailyBurn(calls: any[]): { date: string; credits: number; calls: number }[] {
  const byDate: Record<string, { credits: number; calls: number }> = {};
  for (const call of calls) {
    const date = new Date(call.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!byDate[date]) byDate[date] = { credits: 0, calls: 0 };
    byDate[date].credits += call.creditsCharged;
    byDate[date].calls += 1;
  }
  return Object.entries(byDate)
    .map(([date, data]) => ({ date, ...data }))
    .reverse();
}

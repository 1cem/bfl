import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const period = sp.get('period') || '30d';
  const entity = sp.get('entity');
  const orgId = sp.get('orgId');

  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

  const baseWhere: any = { timestamp: { gte: since }, status: 'SUCCESS' };
  const prevWhere: any = { timestamp: { gte: prevSince, lt: since }, status: 'SUCCESS' };
  if (orgId) { baseWhere.orgId = orgId; prevWhere.orgId = orgId; }

  // Current period revenue
  const currentRevenue = await prisma.apiCall.aggregate({
    where: baseWhere,
    _sum: { costUsd: true, creditsCharged: true },
    _count: true,
  });

  // Previous period revenue (for MoM comparison)
  const prevRevenue = await prisma.apiCall.aggregate({
    where: prevWhere,
    _sum: { costUsd: true },
  });

  const currentUsd = currentRevenue._sum.costUsd ?? 0;
  const prevUsd = prevRevenue._sum.costUsd ?? 0;
  const growth = prevUsd > 0 ? (currentUsd - prevUsd) / prevUsd : 0;

  // Revenue by entity
  const byEntity = await prisma.apiCall.groupBy({
    by: ['region'],
    where: baseWhere,
    _sum: { costUsd: true, creditsCharged: true },
    _count: true,
  });

  // Revenue by model
  const byModel = await prisma.apiCall.groupBy({
    by: ['model'],
    where: baseWhere,
    _sum: { costUsd: true },
    _count: true,
  });

  // Revenue by org type (segment)
  const orgs = await prisma.organization.findMany({ select: { id: true, type: true } });
  const orgTypeMap = new Map(orgs.map(o => [o.id, o.type]));

  const byOrg = await prisma.apiCall.groupBy({
    by: ['orgId'],
    where: baseWhere,
    _sum: { costUsd: true, creditsCharged: true },
    _count: true,
  });

  const segmentRevenue: Record<string, number> = {};
  for (const o of byOrg) {
    const type = orgTypeMap.get(o.orgId) || 'UNKNOWN';
    segmentRevenue[type] = (segmentRevenue[type] || 0) + (o._sum.costUsd ?? 0);
  }

  // Invoice summary
  const invoices = await prisma.invoice.groupBy({
    by: ['status'],
    _count: true,
    _sum: { totalUsd: true },
  });

  // VAT summary
  const vatTotal = await prisma.invoice.aggregate({
    where: { entity: 'EU' },
    _sum: { vatAmount: true },
  });

  // Credit depletion forecast for each org
  const allOrgs = await prisma.organization.findMany({
    select: { id: true, name: true, creditBalance: true, type: true, entity: true, plan: true },
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const weeklyUsage = await prisma.apiCall.groupBy({
    by: ['orgId'],
    where: { timestamp: { gte: sevenDaysAgo }, status: 'SUCCESS' },
    _sum: { creditsCharged: true },
    _count: true,
  });
  const weeklyMap = new Map(weeklyUsage.map(u => [u.orgId, u]));

  // Previous week usage (for trend detection)
  const prevWeekUsage = await prisma.apiCall.groupBy({
    by: ['orgId'],
    where: { timestamp: { gte: fourteenDaysAgo, lt: sevenDaysAgo }, status: 'SUCCESS' },
    _sum: { creditsCharged: true },
    _count: true,
  });
  const prevWeekMap = new Map(prevWeekUsage.map(u => [u.orgId, u]));

  const forecasts = allOrgs.map(org => {
    const weekly = weeklyMap.get(org.id);
    const prevWeek = prevWeekMap.get(org.id);
    const dailyBurn = (weekly?._sum.creditsCharged ?? 0) / 7;
    const prevDailyBurn = (prevWeek?._sum.creditsCharged ?? 0) / 7;
    const daysRemaining = dailyBurn > 0 ? Math.round(org.creditBalance / dailyBurn) : null;
    const weeklyCallCount = weekly?._count ?? 0;
    const prevWeeklyCallCount = prevWeek?._count ?? 0;
    const weekOverWeekChange = prevWeeklyCallCount > 0
      ? (weeklyCallCount - prevWeeklyCallCount) / prevWeeklyCallCount
      : 0;

    return {
      orgId: org.id,
      name: org.name,
      type: org.type,
      entity: org.entity,
      plan: org.plan,
      creditBalance: org.creditBalance,
      dailyBurnRate: Math.round(dailyBurn * 100) / 100,
      daysRemaining,
      weekOverWeekChange: Math.round(weekOverWeekChange * 1000) / 1000,
      weeklyCallCount,
    };
  });

  // Churn risk detection
  const churnRisks = forecasts
    .filter(f => {
      const lowCredits = f.daysRemaining !== null && f.daysRemaining <= 2;
      const declining = f.weekOverWeekChange < -0.2;
      const inactive = f.weeklyCallCount === 0 && f.creditBalance > 0;
      return lowCredits || declining || inactive;
    })
    .map(f => {
      const risks: string[] = [];
      const actions: string[] = [];

      if (f.daysRemaining !== null && f.daysRemaining <= 2) {
        risks.push('Credits depleting within 48 hours');
        actions.push('Send credit reminder email');
      }
      if (f.weekOverWeekChange < -0.2) {
        risks.push(`Usage declining ${Math.abs(Math.round(f.weekOverWeekChange * 100))}% week-over-week`);
        actions.push('Schedule customer check-in');
      }
      if (f.weeklyCallCount === 0 && f.creditBalance > 0) {
        risks.push('Zero activity in last 7 days despite having credits');
        actions.push('Trigger re-engagement campaign');
      }

      return { ...f, risks, suggestedActions: actions };
    });

  // Daily revenue trend (for chart)
  const dailyRevenue: { date: string; revenue: number; calls: number }[] = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    // We'll compute this client-side from the raw data to avoid N queries
  }

  return NextResponse.json({
    revenue: {
      current: Math.round(currentUsd * 100) / 100,
      previous: Math.round(prevUsd * 100) / 100,
      growth: Math.round(growth * 10000) / 10000,
      totalCredits: currentRevenue._sum.creditsCharged ?? 0,
      totalCalls: currentRevenue._count,
    },
    byEntity: byEntity.map(e => ({
      entity: e.region,
      revenue: Math.round((e._sum.costUsd ?? 0) * 100) / 100,
      credits: e._sum.creditsCharged ?? 0,
      calls: e._count,
    })),
    byModel: byModel
      .map(m => ({
        model: m.model,
        revenue: Math.round((m._sum.costUsd ?? 0) * 100) / 100,
        calls: m._count,
      }))
      .sort((a, b) => b.revenue - a.revenue),
    bySegment: Object.entries(segmentRevenue).map(([type, revenue]) => ({
      segment: type,
      revenue: Math.round(revenue * 100) / 100,
    })),
    invoices: invoices.map(i => ({
      status: i.status,
      count: i._count,
      totalUsd: Math.round((i._sum.totalUsd ?? 0) * 100) / 100,
    })),
    vatTotal: Math.round((vatTotal._sum.vatAmount ?? 0) * 100) / 100,
    forecasts,
    churnRisks,
    period,
  });
}

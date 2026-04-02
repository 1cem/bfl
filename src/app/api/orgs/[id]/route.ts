import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      projects: true,
      invoices: { orderBy: { periodStart: 'desc' } },
      purchases: { orderBy: { timestamp: 'desc' } },
    },
  });

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Recent daily usage (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentCalls = await prisma.apiCall.findMany({
    where: { orgId: org.id, timestamp: { gte: thirtyDaysAgo } },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  // Aggregated stats
  const stats = await prisma.apiCall.aggregate({
    where: { orgId: org.id, timestamp: { gte: thirtyDaysAgo } },
    _sum: { creditsCharged: true, costUsd: true },
    _count: true,
    _avg: { latencyMs: true },
  });

  // Daily burn rate (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekStats = await prisma.apiCall.aggregate({
    where: { orgId: org.id, timestamp: { gte: sevenDaysAgo }, status: 'SUCCESS' },
    _sum: { creditsCharged: true },
  });
  const dailyBurnRate = (weekStats._sum.creditsCharged ?? 0) / 7;

  return NextResponse.json({
    ...org,
    stats: {
      totalCalls30d: stats._count,
      totalCredits30d: stats._sum.creditsCharged ?? 0,
      totalCost30d: stats._sum.costUsd ?? 0,
      avgLatencyMs: Math.round(stats._avg.latencyMs ?? 0),
      dailyBurnRate,
      daysUntilDepletion: dailyBurnRate > 0 ? Math.round(org.creditBalance / dailyBurnRate) : null,
    },
    recentCalls,
  });
}

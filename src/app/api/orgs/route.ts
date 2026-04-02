import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { apiCalls: true, projects: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Get recent usage summary (last 30 days) for each org
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const recentUsage = await prisma.apiCall.groupBy({
    by: ['orgId'],
    where: { timestamp: { gte: thirtyDaysAgo } },
    _sum: { creditsCharged: true, costUsd: true },
    _count: true,
  });

  const usageMap = new Map(recentUsage.map(u => [u.orgId, u]));

  const result = orgs.map(org => {
    const usage = usageMap.get(org.id);
    return {
      ...org,
      recentUsage: {
        calls: usage?._count ?? 0,
        creditsUsed: usage?._sum.creditsCharged ?? 0,
        costUsd: usage?._sum.costUsd ?? 0,
      },
    };
  });

  return NextResponse.json(result);
}

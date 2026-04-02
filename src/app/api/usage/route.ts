import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const model = sp.get('model');
  const region = sp.get('region');
  const orgId = sp.get('orgId');
  const status = sp.get('status');
  const startDate = sp.get('startDate');
  const endDate = sp.get('endDate');
  const limit = Math.min(parseInt(sp.get('limit') || '50'), 500);
  const offset = parseInt(sp.get('offset') || '0');

  const where: Prisma.ApiCallWhereInput = {};
  if (model) where.model = model;
  if (region) where.region = region as any;
  if (orgId) where.orgId = orgId;
  if (status) where.status = status as any;
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [calls, total, aggregations] = await Promise.all([
    prisma.apiCall.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: { org: { select: { name: true } } },
    }),
    prisma.apiCall.count({ where }),
    prisma.apiCall.aggregate({
      where,
      _sum: { creditsCharged: true, costUsd: true },
      _count: true,
      _avg: { latencyMs: true, megapixels: true },
    }),
  ]);

  // Model breakdown
  const byModel = await prisma.apiCall.groupBy({
    by: ['model'],
    where,
    _count: true,
    _sum: { creditsCharged: true, costUsd: true },
  });

  // Status breakdown
  const byStatus = await prisma.apiCall.groupBy({
    by: ['status'],
    where,
    _count: true,
  });

  const totalCount = byStatus.reduce((sum, s) => sum + s._count, 0);
  const errorCount = byStatus.find(s => s.status === 'ERROR')?._count ?? 0;
  const errorRate = totalCount > 0 ? errorCount / totalCount : 0;

  // Megapixel distribution (for FLUX.2 calls)
  const mpDistribution = await prisma.apiCall.groupBy({
    by: ['megapixels'],
    where: { ...where, megapixels: { not: null } },
    _count: true,
  });

  return NextResponse.json({
    calls,
    pagination: { total, limit, offset },
    aggregations: {
      totalCalls: aggregations._count,
      totalCredits: aggregations._sum.creditsCharged ?? 0,
      totalCostUsd: aggregations._sum.costUsd ?? 0,
      avgLatencyMs: Math.round(aggregations._avg.latencyMs ?? 0),
      errorRate,
    },
    byModel: byModel.map(m => ({
      model: m.model,
      count: m._count,
      credits: m._sum.creditsCharged ?? 0,
      costUsd: m._sum.costUsd ?? 0,
    })),
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    mpDistribution: mpDistribution
      .filter(m => m.megapixels !== null)
      .map(m => ({ megapixels: m.megapixels, count: m._count }))
      .sort((a, b) => (a.megapixels ?? 0) - (b.megapixels ?? 0)),
  });
}

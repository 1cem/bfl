import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [orgs, projects, apiCalls, purchases, invoices] = await Promise.all([
      prisma.organization.count(),
      prisma.project.count(),
      prisma.apiCall.count(),
      prisma.creditPurchase.count(),
      prisma.invoice.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      counts: { orgs, projects, apiCalls, purchases, invoices },
    });
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: String(error) }, { status: 500 });
  }
}

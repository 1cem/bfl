import { PrismaClient, OrgType, Entity, Plan, Operation, Region, CallStatus, Currency, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Deterministic PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// Megapixel options with weights
const MP_OPTIONS = [0.25, 0.5, 1.0, 2.0, 4.0];
const MP_WEIGHTS = [10, 25, 40, 20, 5];

type ModelId = string;

interface OrgArchetype {
  name: string;
  type: OrgType;
  entity: Entity;
  plan: Plan;
  initialCredits: number;
  monthlyCallVolume: number; // avg per month
  models: ModelId[];
  modelWeights: number[];
  operationWeights: [number, number]; // [generation, editing]
  errorRate: number;
  rateLimitRate: number;
  batchSizeRange: [number, number];
  trend: 'growing' | 'steady' | 'declining' | 'dormant' | 'migrating';
  projects: { name: string; prefix: string }[];
}

const archetypes: OrgArchetype[] = [
  {
    name: 'PixelForge AI',
    type: 'STARTUP', entity: 'US', plan: 'SELF_SERVE',
    initialCredits: 500000,
    monthlyCallVolume: 7000,
    models: ['flux2-klein-4b', 'flux2-klein-9b', 'flux2-pro'],
    modelWeights: [70, 20, 10],
    operationWeights: [85, 15],
    errorRate: 0.03, rateLimitRate: 0.02,
    batchSizeRange: [1, 4],
    trend: 'growing',
    projects: [
      { name: 'Production API', prefix: 'pf_prod_' },
      { name: 'Staging', prefix: 'pf_stg_' },
      { name: 'Research', prefix: 'pf_res_' },
    ],
  },
  {
    name: 'CreativeStudio Berlin',
    type: 'AGENCY', entity: 'EU', plan: 'ENTERPRISE',
    initialCredits: 200000,
    monthlyCallVolume: 3000,
    models: ['flux1-kontext-pro', 'flux1-kontext-max', 'flux2-pro'],
    modelWeights: [45, 25, 30],
    operationWeights: [40, 60],
    errorRate: 0.02, rateLimitRate: 0.01,
    batchSizeRange: [1, 2],
    trend: 'growing',
    projects: [
      { name: 'Client Work', prefix: 'cs_cli_' },
      { name: 'Internal Tools', prefix: 'cs_int_' },
    ],
  },
  {
    name: 'MegaCorp Retail',
    type: 'ENTERPRISE', entity: 'US', plan: 'ENTERPRISE',
    initialCredits: 1000000,
    monthlyCallVolume: 800,
    models: ['flux2-max', 'flux2-pro'],
    modelWeights: [80, 20],
    operationWeights: [70, 30],
    errorRate: 0.01, rateLimitRate: 0.005,
    batchSizeRange: [1, 2],
    trend: 'steady',
    projects: [
      { name: 'Product Catalog', prefix: 'mc_cat_' },
      { name: 'Marketing', prefix: 'mc_mkt_' },
    ],
  },
  {
    name: 'IndieDevMax',
    type: 'INDIE', entity: 'US', plan: 'SELF_SERVE',
    initialCredits: 5000,
    monthlyCallVolume: 400,
    models: ['flux2-klein-4b', 'flux2-dev', 'flux1-kontext-pro'],
    modelWeights: [40, 35, 25],
    operationWeights: [90, 10],
    errorRate: 0.05, rateLimitRate: 0.03,
    batchSizeRange: [1, 1],
    trend: 'declining',
    projects: [
      { name: 'Side Project', prefix: 'id_sp_' },
    ],
  },
  {
    name: 'VideoGenX',
    type: 'STARTUP', entity: 'US', plan: 'SELF_SERVE',
    initialCredits: 150000,
    monthlyCallVolume: 4000,
    models: ['flux2-klein-4b', 'flux2-klein-9b', 'flux2-pro'],
    modelWeights: [20, 30, 50], // migrating toward pro
    operationWeights: [95, 5],
    errorRate: 0.04, rateLimitRate: 0.02,
    batchSizeRange: [1, 8],
    trend: 'migrating',
    projects: [
      { name: 'Video Pipeline', prefix: 'vg_vid_' },
      { name: 'Thumbnail Gen', prefix: 'vg_tmb_' },
    ],
  },
  {
    name: 'AdTech Solutions',
    type: 'AGENCY', entity: 'EU', plan: 'ENTERPRISE',
    initialCredits: 300000,
    monthlyCallVolume: 5000,
    models: ['flux11-pro', 'flux11-pro-ultra', 'flux1-fill-pro'],
    modelWeights: [50, 30, 20],
    operationWeights: [80, 20],
    errorRate: 0.02, rateLimitRate: 0.01,
    batchSizeRange: [4, 16],
    trend: 'steady',
    projects: [
      { name: 'Ad Creatives', prefix: 'at_ads_' },
      { name: 'Landing Pages', prefix: 'at_lp_' },
      { name: 'Social Media', prefix: 'at_soc_' },
    ],
  },
  {
    name: 'DesignHaus Munich',
    type: 'INDIE', entity: 'EU', plan: 'SELF_SERVE',
    initialCredits: 50000,
    monthlyCallVolume: 1500,
    models: ['flux1-fill-pro', 'flux1-kontext-pro', 'flux1-kontext-max'],
    modelWeights: [40, 40, 20],
    operationWeights: [50, 50],
    errorRate: 0.01, rateLimitRate: 0.005,
    batchSizeRange: [1, 2],
    trend: 'steady',
    projects: [
      { name: 'Design Studio', prefix: 'dh_ds_' },
    ],
  },
  {
    name: 'GhostAccount Inc.',
    type: 'ENTERPRISE', entity: 'US', plan: 'ENTERPRISE',
    initialCredits: 2000000,
    monthlyCallVolume: 50, // almost nothing
    models: ['flux2-pro', 'flux2-max'],
    modelWeights: [50, 50],
    operationWeights: [80, 20],
    errorRate: 0.02, rateLimitRate: 0.01,
    batchSizeRange: [1, 1],
    trend: 'dormant',
    projects: [
      { name: 'POC', prefix: 'ga_poc_' },
    ],
  },
];

// Pricing logic (duplicated from src/lib/pricing.ts to avoid import issues with ts-node)
function calcCredits(model: string, operation: string, mp: number | null, batchSize: number, status: string): { credits: number; costUsd: number } {
  if (status === 'error' || status === 'rate_limited') return { credits: 0, costUsd: 0 };

  const flux1Credits: Record<string, number> = {
    'flux1-kontext-pro': 4, 'flux1-kontext-max': 8,
    'flux11-pro': 4, 'flux11-pro-ultra': 6, 'flux11-pro-raw': 6, 'flux1-fill-pro': 5,
  };

  if (flux1Credits[model] !== undefined) {
    const credits = flux1Credits[model] * batchSize;
    return { credits, costUsd: Math.round(credits * 0.01 * 10000) / 10000 };
  }

  const flux2Rates: Record<string, { gen: number; edit: number; klein?: boolean }> = {
    'flux2-klein-4b': { gen: 0.014, edit: 0.014, klein: true },
    'flux2-klein-9b': { gen: 0.015, edit: 0.015, klein: true },
    'flux2-pro': { gen: 0.03, edit: 0.045 },
    'flux2-max': { gen: 0.07, edit: 0.07 },
    'flux2-flex': { gen: 0.06, edit: 0.06 },
    'flux2-dev': { gen: 0, edit: 0 },
  };

  const r = flux2Rates[model];
  if (!r) return { credits: 0, costUsd: 0 };

  const megapixels = mp ?? 1;
  const rate = operation === 'editing' ? r.edit : r.gen;
  if (rate === 0) return { credits: 0, costUsd: 0 };

  let costPerImage: number;
  if (r.klein) {
    costPerImage = rate + Math.max(0, megapixels - 1) * 0.001;
  } else {
    costPerImage = rate * megapixels;
  }

  const totalCost = costPerImage * batchSize;
  const credits = Math.round(totalCost / 0.01 * 10000) / 10000;
  return { credits, costUsd: Math.round(totalCost * 10000) / 10000 };
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.apiCall.deleteMany();
  await prisma.creditPurchase.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let totalCalls = 0;

  for (const arch of archetypes) {
    console.log(`Creating ${arch.name}...`);

    // Create org
    const org = await prisma.organization.create({
      data: {
        name: arch.name,
        type: arch.type,
        entity: arch.entity,
        creditBalance: arch.initialCredits,
        plan: arch.plan,
        createdAt: new Date(ninetyDaysAgo.getTime() - randomInt(30, 180) * 24 * 60 * 60 * 1000),
      },
    });

    // Create projects
    const projects = [];
    for (const p of arch.projects) {
      const proj = await prisma.project.create({
        data: {
          orgId: org.id,
          name: p.name,
          apiKeyPrefix: p.prefix + randomInt(1000, 9999),
          createdAt: org.createdAt,
        },
      });
      projects.push(proj);
    }

    // Create credit purchases
    const purchaseCount = arch.plan === 'ENTERPRISE' ? randomInt(2, 4) : randomInt(3, 8);
    for (let i = 0; i < purchaseCount; i++) {
      const purchaseDate = new Date(
        ninetyDaysAgo.getTime() - randomInt(0, 60) * 24 * 60 * 60 * 1000
        + i * randomInt(10, 30) * 24 * 60 * 60 * 1000
      );
      const credits = arch.plan === 'ENTERPRISE'
        ? randomInt(50000, 500000)
        : randomInt(1000, 50000);

      await prisma.creditPurchase.create({
        data: {
          orgId: org.id,
          timestamp: purchaseDate,
          credits,
          amountUsd: credits * 0.01,
          currency: arch.entity === 'EU' ? 'EUR' : 'USD',
          stripeInvoiceId: `in_${randomInt(100000, 999999)}`,
          entity: arch.entity,
        },
      });
    }

    // Generate API calls over 90 days
    const totalDays = 90;
    const callsData: any[] = [];

    for (let day = 0; day < totalDays; day++) {
      const date = new Date(ninetyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Daily volume with weekday/weekend variation
      let dailyBase = arch.monthlyCallVolume / 30;

      // Apply trend
      const dayFraction = day / totalDays;
      switch (arch.trend) {
        case 'growing':
          dailyBase *= 0.6 + dayFraction * 0.8;
          break;
        case 'declining':
          dailyBase *= 1.4 - dayFraction * 0.8;
          break;
        case 'dormant':
          // Only a few calls in first 2 weeks, then nothing
          if (day > 14) dailyBase = rand() < 0.05 ? 1 : 0;
          else dailyBase *= 0.3;
          break;
        case 'migrating':
          // Shift model weights over time (handled in model selection)
          dailyBase *= 0.7 + dayFraction * 0.6;
          break;
        case 'steady':
          dailyBase *= 0.9 + rand() * 0.2;
          break;
      }

      if (isWeekend) dailyBase *= 0.3;

      // Add some randomness
      const dailyCalls = Math.max(0, Math.round(dailyBase * (0.7 + rand() * 0.6)));

      for (let c = 0; c < dailyCalls; c++) {
        const hour = weightedPick(
          Array.from({ length: 24 }, (_, i) => i),
          // Peak during business hours
          [1, 1, 1, 1, 2, 3, 5, 8, 10, 12, 12, 11, 10, 11, 12, 10, 8, 6, 4, 3, 2, 2, 1, 1]
        );
        const timestamp = new Date(date);
        timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59), randomInt(0, 999));

        // Model selection (with migration support)
        let modelWeights = [...arch.modelWeights];
        if (arch.trend === 'migrating' && arch.models.length >= 3) {
          // Shift from first model to last over time
          const shift = dayFraction * 30;
          modelWeights[0] = Math.max(5, modelWeights[0] - shift);
          modelWeights[modelWeights.length - 1] = modelWeights[modelWeights.length - 1] + shift;
        }
        const model = weightedPick(arch.models, modelWeights);

        const operation: Operation = rand() < arch.operationWeights[0] / 100 ? 'GENERATION' : 'EDITING';

        let status: CallStatus = 'SUCCESS';
        const statusRoll = rand();
        if (statusRoll < arch.errorRate) status = 'ERROR';
        else if (statusRoll < arch.errorRate + arch.rateLimitRate) status = 'RATE_LIMITED';

        const isFlux2 = model.startsWith('flux2-');
        const megapixels = isFlux2 ? weightedPick(MP_OPTIONS, MP_WEIGHTS) : null;
        const batchSize = randomInt(arch.batchSizeRange[0], arch.batchSizeRange[1]);

        const { credits, costUsd } = calcCredits(
          model,
          operation === 'GENERATION' ? 'generation' : 'editing',
          megapixels,
          batchSize,
          status === 'SUCCESS' ? 'success' : status === 'ERROR' ? 'error' : 'rate_limited'
        );

        const region: Region = arch.entity === 'EU' ? 'EU' : 'US';

        const latencyMs = status === 'ERROR'
          ? randomInt(50, 500)
          : status === 'RATE_LIMITED'
            ? randomInt(10, 50)
            : randomInt(200, isFlux2 ? 8000 : 3000);

        callsData.push({
          orgId: org.id,
          projectId: pick(projects).id,
          timestamp,
          model,
          operation,
          region,
          status,
          megapixels,
          batchSize,
          creditsCharged: credits,
          costUsd,
          latencyMs,
        });
      }
    }

    // Batch insert API calls
    if (callsData.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < callsData.length; i += batchSize) {
        const batch = callsData.slice(i, i + batchSize);
        await prisma.apiCall.createMany({ data: batch });
      }
      totalCalls += callsData.length;
      console.log(`  → ${callsData.length} API calls`);
    }

    // Generate invoices for enterprise accounts (monthly)
    if (arch.plan === 'ENTERPRISE') {
      for (let month = 0; month < 3; month++) {
        const periodStart = new Date(ninetyDaysAgo.getTime() + month * 30 * 24 * 60 * 60 * 1000);
        const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        const monthCalls = callsData.filter(
          c => c.timestamp >= periodStart && c.timestamp < periodEnd
        );
        const totalCreditsUsed = monthCalls.reduce((sum: number, c: any) => sum + c.creditsCharged, 0);
        const totalUsd = totalCreditsUsed * 0.01;

        const { vatAmount, vatRate } = arch.entity === 'EU'
          ? { vatAmount: Math.round(totalUsd * 0.19 * 100) / 100, vatRate: 0.19 }
          : { vatAmount: 0, vatRate: 0 };

        const statuses: InvoiceStatus[] = ['PAID', 'PAID', 'SENT'];
        const invoiceStatus = month < 2 ? 'PAID' : pick(statuses);

        await prisma.invoice.create({
          data: {
            orgId: org.id,
            periodStart,
            periodEnd,
            totalCreditsUsed,
            totalUsd: totalUsd + vatAmount,
            vatAmount,
            vatRate,
            entity: arch.entity,
            status: invoiceStatus,
          },
        });
      }
    }

    // Update credit balance based on usage
    const totalSpent = callsData.reduce((sum: number, c: any) => sum + c.creditsCharged, 0);
    await prisma.organization.update({
      where: { id: org.id },
      data: { creditBalance: Math.max(0, arch.initialCredits - totalSpent) },
    });
  }

  console.log(`\nSeed complete: ${totalCalls} total API calls across ${archetypes.length} orgs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

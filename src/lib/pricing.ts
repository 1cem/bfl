export type ModelId =
  | 'flux2-klein-4b'
  | 'flux2-klein-9b'
  | 'flux2-pro'
  | 'flux2-max'
  | 'flux2-flex'
  | 'flux2-dev'
  | 'flux1-kontext-pro'
  | 'flux1-kontext-max'
  | 'flux11-pro'
  | 'flux11-pro-ultra'
  | 'flux11-pro-raw'
  | 'flux1-fill-pro';

export type OperationType = 'generation' | 'editing';
export type StatusType = 'success' | 'error' | 'rate_limited';

interface Flux2Pricing {
  type: 'megapixel';
  genPerMp: number;
  editPerMp: number;
  klein?: boolean;
}

interface Flux1Pricing {
  type: 'fixed';
  creditsPerImage: number;
}

type ModelPricing = Flux2Pricing | Flux1Pricing;

const MODEL_PRICING: Record<ModelId, ModelPricing> = {
  'flux2-klein-4b': { type: 'megapixel', genPerMp: 0.014, editPerMp: 0.014, klein: true },
  'flux2-klein-9b': { type: 'megapixel', genPerMp: 0.015, editPerMp: 0.015, klein: true },
  'flux2-pro':      { type: 'megapixel', genPerMp: 0.03,  editPerMp: 0.045 },
  'flux2-max':      { type: 'megapixel', genPerMp: 0.07,  editPerMp: 0.07 },
  'flux2-flex':     { type: 'megapixel', genPerMp: 0.06,  editPerMp: 0.06 },
  'flux2-dev':      { type: 'megapixel', genPerMp: 0,     editPerMp: 0 },
  'flux1-kontext-pro':  { type: 'fixed', creditsPerImage: 4 },
  'flux1-kontext-max':  { type: 'fixed', creditsPerImage: 8 },
  'flux11-pro':         { type: 'fixed', creditsPerImage: 4 },
  'flux11-pro-ultra':   { type: 'fixed', creditsPerImage: 6 },
  'flux11-pro-raw':     { type: 'fixed', creditsPerImage: 6 },
  'flux1-fill-pro':     { type: 'fixed', creditsPerImage: 5 },
};

export const ALL_MODELS = Object.keys(MODEL_PRICING) as ModelId[];
export const FLUX2_MODELS = ALL_MODELS.filter(m => m.startsWith('flux2-'));
export const FLUX1_MODELS = ALL_MODELS.filter(m => m.startsWith('flux1') || m.startsWith('flux11'));

export function isFlux2(model: ModelId): boolean {
  return model.startsWith('flux2-');
}

export interface PricingResult {
  credits: number;
  costUsd: number;
  formula: string;
}

export function calculateCredits(
  model: ModelId,
  operation: OperationType,
  megapixels: number | null,
  batchSize: number,
  status: StatusType
): PricingResult {
  if (status === 'error' || status === 'rate_limited') {
    return { credits: 0, costUsd: 0, formula: `${status} → $0.00` };
  }

  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    return { credits: 0, costUsd: 0, formula: 'unknown model' };
  }

  if (pricing.type === 'fixed') {
    const credits = pricing.creditsPerImage * batchSize;
    const costUsd = credits * 0.01;
    const formula = batchSize > 1
      ? `${pricing.creditsPerImage} credits × ${batchSize} batch = ${credits} credits ($${costUsd.toFixed(4)})`
      : `${pricing.creditsPerImage} credits ($${costUsd.toFixed(4)})`;
    return { credits, costUsd: round(costUsd), formula };
  }

  // Megapixel-based (FLUX.2)
  const mp = megapixels ?? 1;
  const rate = operation === 'editing' ? pricing.editPerMp : pricing.genPerMp;

  if (rate === 0) {
    return { credits: 0, costUsd: 0, formula: 'free tier (flux2-dev)' };
  }

  let costPerImage: number;
  if (pricing.klein) {
    // Klein: base rate for first MP + $0.001 per additional MP
    const additionalMp = Math.max(0, mp - 1);
    costPerImage = rate + additionalMp * 0.001;
  } else {
    costPerImage = rate * mp;
  }

  const totalCost = costPerImage * batchSize;
  const credits = totalCost / 0.01; // 1 credit = $0.01

  let formula: string;
  if (pricing.klein) {
    const additionalMp = Math.max(0, mp - 1);
    formula = `$${rate} base + ${additionalMp.toFixed(2)}MP × $0.001`;
  } else {
    formula = `$${rate}/MP × ${mp.toFixed(2)}MP`;
  }
  if (batchSize > 1) formula += ` × ${batchSize} batch`;
  formula += ` = $${totalCost.toFixed(4)}`;

  return { credits: round(credits), costUsd: round(totalCost), formula };
}

export function calculateVat(amountUsd: number, entity: 'US' | 'EU'): { vatAmount: number; vatRate: number } {
  if (entity === 'EU') {
    const vatRate = 0.19;
    return { vatAmount: round(amountUsd * vatRate), vatRate };
  }
  return { vatAmount: 0, vatRate: 0 };
}

export function getModelDisplayName(model: ModelId): string {
  const names: Record<ModelId, string> = {
    'flux2-klein-4b': 'FLUX.2 Klein 4B',
    'flux2-klein-9b': 'FLUX.2 Klein 9B',
    'flux2-pro': 'FLUX.2 Pro',
    'flux2-max': 'FLUX.2 Max',
    'flux2-flex': 'FLUX.2 Flex',
    'flux2-dev': 'FLUX.2 Dev',
    'flux1-kontext-pro': 'FLUX.1 Kontext Pro',
    'flux1-kontext-max': 'FLUX.1 Kontext Max',
    'flux11-pro': 'FLUX1.1 Pro',
    'flux11-pro-ultra': 'FLUX1.1 Pro Ultra',
    'flux11-pro-raw': 'FLUX1.1 Pro Raw',
    'flux1-fill-pro': 'FLUX.1 Fill Pro',
  };
  return names[model] || model;
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

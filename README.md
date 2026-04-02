# BFL GTM Engine

Production-grade usage metering and billing dashboard for [Black Forest Labs](https://blackforestlabs.ai) — demonstrating mastery of their dual-entity, megapixel-scaled pricing model with working code.

---

## What BFL Asked

From the GTM Systems Engineer job description:

> 1. "How do we accurately track and bill for API usage across millions of requests while handling edge cases we haven't imagined yet?"
> 2. "Can you build systems that handle the complexity of usage-based pricing with megapixel scaling, batch processing, and multiple model tiers?"
> 3. "How would you architect billing across dual US/EU legal entities with different tax requirements?"

## What This Answers

1. **A metering engine** that processes every API call through a deterministic pricing engine, tracking model, resolution, batch size, and status — with full audit trail.
2. **A pricing engine** implementing exact BFL pricing: FLUX.2 megapixel-based rates (including Klein's base+addon formula), FLUX.1 fixed credits, batch multipliers, and error/rate-limit zero-charge rules.
3. **Dual-entity billing** with automatic VAT calculation (19% Germany) for EU invoices, USD/EUR currency support, and per-entity revenue tracking.

---

## Architecture

```
                    ┌──────────────────────────────────┐
                    │         Next.js Frontend          │
                    │   /usage    │    /billing          │
                    │  Metering   │  Revenue & Billing   │
                    └──────┬──────┴──────┬──────────────┘
                           │             │
                    ┌──────▼─────────────▼──────────────┐
                    │          API Routes                │
                    │  /api/usage  /api/billing          │
                    │  /api/orgs   /api/health           │
                    └──────┬────────────────────────────┘
                           │
                    ┌──────▼────────────────────────────┐
                    │       Pricing Engine               │
                    │  FLUX.2 MP-based │ FLUX.1 Fixed    │
                    │  Klein formula   │ Batch multiply  │
                    │  VAT calc        │ Error → $0      │
                    └──────┬────────────────────────────┘
                           │
                    ┌──────▼────────────────────────────┐
                    │    PostgreSQL (Prisma ORM)         │
                    │  Organizations │ Projects          │
                    │  ApiCalls      │ CreditPurchases   │
                    │  Invoices      │                   │
                    └───────────────────────────────────┘
```

## Run It

```bash
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

### Local Development

```bash
# Prerequisites: Node.js 20+, PostgreSQL running locally
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

---

## Pricing Engine

Implements exact BFL pricing as of April 2026:

### FLUX.2 Models (Megapixel-based)

| Model | Gen $/MP | Edit $/MP | Notes |
|-------|----------|-----------|-------|
| FLUX.2 Klein 4B | $0.014 | $0.014 | Base rate + $0.001/additional MP |
| FLUX.2 Klein 9B | $0.015 | $0.015 | Base rate + $0.001/additional MP |
| FLUX.2 Pro | $0.03 | $0.045 | Rate x megapixels |
| FLUX.2 Max | $0.07 | $0.07 | Rate x megapixels |
| FLUX.2 Flex | $0.06 | $0.06 | Rate x megapixels |
| FLUX.2 Dev | Free | Free | Development tier |

### FLUX.1 Models (Fixed credits)

| Model | Credits/Image | $/Image |
|-------|---------------|---------|
| Kontext Pro | 4 | $0.04 |
| Kontext Max | 8 | $0.08 |
| FLUX1.1 Pro | 4 | $0.04 |
| FLUX1.1 Pro Ultra | 6 | $0.06 |
| FLUX1.1 Pro Raw | 6 | $0.06 |
| Fill Pro | 5 | $0.05 |

**Rules:** 1 credit = $0.01 USD. Failed/rate-limited requests = $0. Batch multiplier applies. EU invoices include 19% VAT.

---

## Seed Data

8 customer archetypes generating ~50K API calls over 90 days:

| Org | Type | Entity | Character |
|-----|------|--------|-----------|
| PixelForge AI | Startup | US | High-volume Klein user, healthy growth |
| CreativeStudio Berlin | Agency | EU | Heavy Kontext + editing |
| MegaCorp Retail | Enterprise | US | Low volume, high spend (Max only) |
| IndieDevMax | Indie | US | Sporadic, credits running low |
| VideoGenX | Startup | US | Migrating Klein -> Pro |
| AdTech Solutions | Agency | EU | Batch generation at scale |
| DesignHaus Munich | Indie | EU | Consistent Fill + Kontext |
| GhostAccount Inc. | Enterprise | US | Huge balance, zero activity |

Realistic weekday/weekend patterns, per-archetype error rates, and distinct usage story arcs.

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **Tailwind CSS** (dark theme)
- **Recharts** (charts and visualizations)
- **Lucide** (icons)
- **Docker Compose** (one-command startup)

---

## What I'd Build Next

- **Customer health scoring** — ML-based churn prediction using usage patterns, credit velocity, and engagement signals
- **Quote-to-cash pipeline** — CPQ for enterprise deals, automated provisioning, contract management
- **Stripe webhook integration** — Real-time payment event processing, automatic credit top-up, dunning workflows
- **Metronome evaluation** — Compare build vs buy for the metering layer; Metronome handles the scale, we own the business logic
- **Real-time streaming** — Replace polling with WebSocket/SSE for true live feed
- **Multi-currency invoicing** — Dynamic FX rates, localized tax engines beyond EU VAT

---

## License

MIT

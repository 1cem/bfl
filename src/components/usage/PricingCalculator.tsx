'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculateCredits, ALL_MODELS, isFlux2, getModelDisplayName } from '@/lib/pricing';
import type { ModelId, OperationType } from '@/lib/pricing';

export default function PricingCalculator() {
  const [model, setModel] = useState<ModelId>('flux2-pro');
  const [operation, setOperation] = useState<OperationType>('generation');
  const [megapixels, setMegapixels] = useState(1);
  const [batchSize, setBatchSize] = useState(1);

  const result = calculateCredits(model, operation, isFlux2(model) ? megapixels : null, batchSize, 'success');

  return (
    <div className="card border border-bfl-blue/20">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-bfl-blue" />
        <h3 className="card-header mb-0">Pricing Calculator</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-bfl-muted block mb-1">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value as ModelId)}
            className="w-full bg-bfl-bg border border-bfl-border rounded-sm px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-bfl-blue/50"
          >
            {ALL_MODELS.map(m => (
              <option key={m} value={m}>{getModelDisplayName(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-bfl-muted block mb-1">Operation</label>
          <select
            value={operation}
            onChange={e => setOperation(e.target.value as OperationType)}
            className="w-full bg-bfl-bg border border-bfl-border rounded-sm px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-bfl-blue/50"
          >
            <option value="generation">Generation</option>
            <option value="editing">Editing</option>
          </select>
        </div>
        {isFlux2(model) && (
          <div>
            <label className="text-[10px] uppercase tracking-wider text-bfl-muted block mb-1">Megapixels</label>
            <input
              type="number"
              value={megapixels}
              onChange={e => setMegapixels(Math.max(0.01, parseFloat(e.target.value) || 0))}
              step={0.25}
              min={0.01}
              className="w-full bg-bfl-bg border border-bfl-border rounded-sm px-2 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-bfl-blue/50"
            />
          </div>
        )}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-bfl-muted block mb-1">Batch Size</label>
          <input
            type="number"
            value={batchSize}
            onChange={e => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="w-full bg-bfl-bg border border-bfl-border rounded-sm px-2 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-bfl-blue/50"
          />
        </div>
      </div>

      <div className="bg-bfl-bg border border-bfl-border rounded-sm p-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-bfl-muted">Total Cost</span>
          <span className="metric-value text-bfl-green">${result.costUsd.toFixed(4)}</span>
        </div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-bfl-muted">Credits</span>
          <span className="font-mono text-sm text-gray-200">{result.credits.toFixed(2)}</span>
        </div>
        <div className="border-t border-bfl-border pt-2 mt-2">
          <span className="text-[10px] text-bfl-muted">Formula: </span>
          <span className="text-[10px] font-mono text-bfl-blue">{result.formula}</span>
        </div>
      </div>
    </div>
  );
}

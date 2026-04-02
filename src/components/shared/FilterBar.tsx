'use client';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export default function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {filters.map(filter => (
        <div key={filter.key} className="flex items-center gap-1.5">
          <label className="text-[10px] uppercase tracking-wider text-bfl-muted">{filter.label}</label>
          <select
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className="bg-bfl-surface border border-bfl-border rounded-sm px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-bfl-blue/50"
          >
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

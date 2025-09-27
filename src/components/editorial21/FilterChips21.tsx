import React from 'react';

type Item = { label: string; value: string; count?: number };

const FilterChips21: React.FC<{
  items: Item[];
  value: string;
  onChange: (val: string) => void;
}> = ({ items, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          onClick={() => onChange(it.value)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${
            value === it.value ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          <span>{it.label}</span>
          {typeof it.count === 'number' && <span className={`text-xs ${value === it.value ? 'text-background/80' : 'text-muted-foreground'}`}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
};

export default FilterChips21;


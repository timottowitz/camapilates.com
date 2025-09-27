import React from 'react';

export type Chip = { label: string; onRemove: () => void };

const ActiveChips21: React.FC<{ chips: Chip[]; onClearAll?: () => void }> = ({ chips, onClearAll }) => {
  if (!chips?.length && !onClearAll) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex flex-wrap gap-2">
        {chips.map((c, i) => (
          <button key={i} onClick={c.onRemove} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 bg-card hover:bg-muted">
            <span>{c.label}</span>
            <span aria-hidden>×</span>
          </button>
        ))}
      </div>
      {onClearAll && (
        <button onClick={onClearAll} className="text-xs underline text-muted-foreground hover:text-foreground">Limpiar todo</button>
      )}
    </div>
  );
};

export default ActiveChips21;


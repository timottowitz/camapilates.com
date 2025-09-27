import React from 'react';

type Props = {
  sort: string;
  onSort: (v: string) => void;
  region: 'MX' | 'US' | 'DE';
  onRegion: (v: 'MX' | 'US' | 'DE') => void;
};

const FilterBar21: React.FC<Props> = ({ sort, onSort, region, onRegion }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-muted-foreground">Ordenar:</label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
        >
          <option value="relevance">Relevancia</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="region" className="text-muted-foreground">Región:</label>
        <select
          id="region"
          value={region}
          onChange={(e) => onRegion(e.target.value as any)}
          className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
        >
          <option value="MX">México</option>
          <option value="US">Estados Unidos</option>
          <option value="DE">Europa</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar21;


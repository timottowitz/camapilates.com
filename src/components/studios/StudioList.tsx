import React from 'react';
import StudioCard from './StudioCard';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, List } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface Studio {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  googlePlaceId?: string;
  address: {
    street: string;
    neighborhood?: string;
    city: string;
  };
  contact: {
    phone?: string;
    website?: string;
  };
  metrics: {
    googleRating?: number;
    googleReviewCount?: number;
  };
  pricing?: {
    singleClassMin?: number;
    singleClassMax?: number;
    currency: string;
  };
  photos?: string[];
  classTypes?: string[];
  dataQualityScore: number;
  distance?: number;
}

interface StudioListProps {
  studios: Studio[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const StudioListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No se encontraron estudios
    </h3>
    <p className="text-gray-500 max-w-sm mx-auto">
      No hay estudios de Pilates que coincidan con tus criterios de búsqueda.
      Intenta ajustar los filtros o buscar en otra área.
    </p>
  </div>
);

const StudioList: React.FC<StudioListProps> = ({
  studios,
  loading = false,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  if (loading) {
    return <StudioListSkeleton />;
  }

  if (studios.length === 0) {
    return <EmptyState />;
  }

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end mb-4 gap-2">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => onViewModeChange('grid')}
            aria-label="Vista de cuadrícula"
            size="sm"
          >
            <LayoutGrid className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => onViewModeChange('list')}
            aria-label="Vista de lista"
            size="sm"
          >
            <List className="w-4 h-4" />
          </Toggle>
        </div>
      )}

      {/* Studios Grid/List */}
      <div className={gridClass}>
        {studios.map(studio => (
          <StudioCard key={studio._id || studio.id || studio.slug} studio={studio} />
        ))}
      </div>
    </div>
  );
};

export default StudioList;
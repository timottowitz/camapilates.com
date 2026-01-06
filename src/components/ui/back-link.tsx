import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  fallbackTo?: string;
  label?: string;
  className?: string;
};

export default function BackLink({
  fallbackTo = '/',
  label = 'Volver',
  className = '',
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  return (
    <div className={className}>
      {canGoBack ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#5D5550] hover:text-[#3E2723]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {label}
        </button>
      ) : (
        <Link
          to={fallbackTo}
          state={{ from: location.pathname }}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#5D5550] hover:text-[#3E2723]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {label}
        </Link>
      )}
    </div>
  );
}

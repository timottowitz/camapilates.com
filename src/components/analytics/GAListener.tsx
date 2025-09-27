import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '@/lib/analytics/ga';

const GAListener = () => {
  const location = useLocation();
  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};

export default GAListener;


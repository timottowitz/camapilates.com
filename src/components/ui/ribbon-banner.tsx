import React from 'react';

interface RibbonBannerProps {
  text?: string;
  id?: string; // used for localStorage dismissal key
}

export const RibbonBanner: React.FC<RibbonBannerProps> = ({
  text = 'El último Reformer que necesitarás. Desarrolla tu gracia con materiales nobles — solo lo mejor toca tu piel.',
  id = 'global',
}) => {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    try {
      const k = `ribbon_dismissed_${id}`;
      const v = typeof window !== 'undefined' ? window.localStorage.getItem(k) : null;
      if (v === '1') setVisible(false);
    } catch {}
  }, [id]);

  const dismiss = () => {
    setVisible(false);
    try {
      const k = `ribbon_dismissed_${id}`;
      if (typeof window !== 'undefined') window.localStorage.setItem(k, '1');
    } catch {}
  };

  if (!visible) return null;
  return (
    <div className="bg-[#111827] text-white">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-xs md:text-sm tracking-wide">
        <span>{text}</span>
        <button type="button" onClick={dismiss} aria-label="Cerrar aviso" className="ml-2 text-white/70 hover:text-white">×</button>
      </div>
    </div>
  );
};

export default RibbonBanner;

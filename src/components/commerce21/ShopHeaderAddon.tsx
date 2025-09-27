import React from 'react';

const ShopHeaderAddon: React.FC<{ src?: string; alt?: string; href?: string }>
  = ({ src = '/images/store-addon.png', alt = 'Promoción', href }) => {
  const img = (
    <img
      src={src}
      alt={alt}
      className="h-16 w-auto md:h-20 shadow-sm rounded"
      loading="lazy"
      decoding="async"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
  );
  return (
    <div className="absolute right-3 top-3 md:right-6 md:top-6">
      {href ? <a href={href} target="_blank" rel="noopener noreferrer">{img}</a> : img}
    </div>
  );
};

export default ShopHeaderAddon;


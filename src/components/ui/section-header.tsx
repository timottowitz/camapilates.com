
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  accent?: 'gold' | 'navy' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  className,
  accent = 'gold',
  size = 'md'
}) => {
  const accentColors = {
    gold: 'bg-bennett-gold',
    navy: 'bg-bennett-navy',
    blue: 'bg-blue-500'
  };

  const sizes = {
    sm: {
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-lg',
      description: 'text-base'
    },
    md: {
      title: 'text-3xl md:text-4xl lg:text-5xl',
      subtitle: 'text-xl md:text-2xl',
      description: 'text-lg md:text-xl'
    },
    lg: {
      title: 'text-4xl md:text-5xl lg:text-6xl',
      subtitle: 'text-2xl md:text-3xl',
      description: 'text-xl md:text-2xl'
    }
  };

  return (
    <div className={cn("text-center space-y-6", className)}>
      {subtitle && (
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full">
          <div className={cn("w-2 h-2 rounded-full", accentColors[accent])}></div>
          <span className={cn("font-semibold text-bennett-slate", sizes[size].subtitle)}>
            {subtitle}
          </span>
        </div>
      )}
      
      <h2 className={cn(
        "font-bold leading-tight tracking-tight bg-gradient-to-r from-bennett-navy via-slate-800 to-bennett-navy bg-clip-text text-transparent",
        sizes[size].title
      )}>
        {title}
      </h2>
      
      <div className={cn("w-24 h-1 mx-auto rounded-full", accentColors[accent])}></div>
      
      {description && (
        <p className={cn(
          "text-bennett-slate leading-relaxed max-w-3xl mx-auto font-light",
          sizes[size].description
        )}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;

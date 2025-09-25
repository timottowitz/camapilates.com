
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandardHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA: {
    text: string;
    href?: string;
    onClick?: () => void;
    component?: React.ReactNode;
  };
  secondaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
    component?: React.ReactNode;
  };
  trustBadge?: {
    text: string;
    icon?: React.ReactNode;
  };
  variant?: 'default' | 'minimal' | 'gradient';
  backgroundImage?: string;
  stats?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

const StandardHero: React.FC<StandardHeroProps> = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  trustBadge,
  variant = 'default',
  backgroundImage,
  stats
}) => {
  const bgClass = {
    default: 'bg-gradient-to-br from-bennett-navy via-slate-900 to-bennett-navy/90',
    minimal: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
    gradient: 'bg-gradient-to-br from-bennett-navy via-blue-900 to-bennett-navy'
  };

  const textColor = variant === 'minimal' ? 'text-bennett-navy' : 'text-white';
  const descColor = variant === 'minimal' ? 'text-bennett-slate' : 'text-gray-200';

  return (
    <section className={cn(
      "relative min-h-[80vh] overflow-hidden flex items-center",
      bgClass[variant]
    )}>
      {/* Background Elements */}
      {variant !== 'minimal' && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,154,46,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>
      )}

      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "grid gap-16 items-center",
            stats ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 text-center"
          )}>
            {/* Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              {trustBadge && (
                <div className={cn(
                  "inline-flex items-center gap-3 rounded-2xl px-6 py-3 mb-8 transition-all duration-300",
                  variant === 'minimal' 
                    ? "bg-bennett-lightGold border border-bennett-gold/20" 
                    : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15"
                )}>
                  {trustBadge.icon || <Shield className="h-5 w-5 text-bennett-gold" />}
                  <span className={cn(
                    "text-sm font-semibold",
                    variant === 'minimal' ? "text-bennett-navy" : "text-white"
                  )}>
                    {trustBadge.text}
                  </span>
                  <div className="flex gap-1 ml-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-bennett-gold text-bennett-gold" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Title Section */}
              <div className="space-y-6">
                {subtitle && (
                  <div className="flex items-center gap-3 text-bennett-gold mb-4">
                    <span className="uppercase text-sm font-bold tracking-widest">{subtitle}</span>
                  </div>
                )}
                
                <h1 className={cn(
                  "text-5xl md:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight",
                  textColor
                )}>
                  {title}
                </h1>
              </div>
              
              <p className={cn(
                "text-xl md:text-2xl leading-relaxed max-w-3xl font-light",
                stats ? "" : "mx-auto",
                descColor
              )}>
                {description}
              </p>
              
              {/* CTA Buttons */}
              <div className={cn(
                "flex gap-6 pt-4",
                stats ? "flex-col sm:flex-row" : "flex-col sm:flex-row justify-center"
              )}>
                {primaryCTA.component || (
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-bennett-gold to-yellow-500 hover:from-bennett-gold/90 hover:to-yellow-500/90 text-bennett-navy font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-bennett-gold/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                    onClick={primaryCTA.onClick}
                  >
                    <span className="flex items-center">
                      {primaryCTA.text}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                )}
                
                {secondaryCTA && (
                  secondaryCTA.component || (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className={cn(
                        "font-semibold px-12 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1",
                        variant === 'minimal'
                          ? "border-2 border-bennett-navy text-bennett-navy hover:bg-bennett-navy hover:text-white"
                          : "border-2 border-white/40 text-bennett-navy bg-white hover:text-white hover:bg-white/15 hover:text-white hover:border-white/60 backdrop-blur-sm"
                      )}
                      onClick={secondaryCTA.onClick}
                    >
                      {secondaryCTA.text}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )
                )}
              </div>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className={cn(
                    "rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group",
                    variant === 'minimal'
                      ? "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
                      : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15"
                  )}>
                    {stat.icon && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                          variant === 'minimal' ? "bg-bennett-gold/20" : "bg-bennett-gold/20"
                        )}>
                          {stat.icon}
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      "text-4xl font-bold mb-2",
                      variant === 'minimal' ? "text-bennett-navy" : "text-white"
                    )}>
                      {stat.value}
                    </div>
                    <div className={cn(
                      "text-sm leading-relaxed",
                      variant === 'minimal' ? "text-bennett-slate" : "text-gray-300"
                    )}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandardHero;

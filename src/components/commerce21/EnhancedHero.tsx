import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, TrendingUp, Package, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TrustMetrics } from './SocialProofWidget';

interface EnhancedHeroProps {
  title: string;
  subtitle: string;
  ctaPrimary?: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
  backgroundImage?: string;
  videoUrl?: string;
  showTrustMetrics?: boolean;
  className?: string;
}

export function EnhancedHero({
  title,
  subtitle,
  ctaPrimary = { text: 'Ver promoción', href: '/product/reformer-aluminio-riel-deslizante-a068' },
  ctaSecondary = { text: 'Ver Catálogo', href: '/shop' },
  backgroundImage,
  videoUrl,
  showTrustMetrics = true,
  className = ''
}: EnhancedHeroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-sm ${className}`}>
      {/* Background */}
      <div className="relative aspect-[21/9] md:aspect-[21/7] w-full">
        {/* Video Background (if provided) */}
        {videoUrl && isVideoPlaying ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Image Background */
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage || '/og/cama-de-pilates-venta-mexico.webp'})`
            }}
          />
        )}

        {/* Gradient Overlay - Darker and more dramatic */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2624] via-transparent to-transparent opacity-90" />

        {/* Content - Editorial Split Layout */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12 lg:px-16">
            {/* Asymmetric grid: left column for title/CTAs, right column for subtitle */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 md:gap-4">

              {/* LEFT COLUMN - Title, Trust, CTAs */}
              <div className="max-w-[320px] lg:max-w-[380px] space-y-6">
                {/* Badge */}
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-sans font-medium hover:bg-white/20 transition-colors">
                    Limited Edition
                  </Badge>
                </div>

                {/* Title - Constrained width */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-white leading-[0.95] animate-in slide-in-from-left duration-700">
                  {title}
                </h1>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-white/60 animate-in slide-in-from-left duration-700 delay-100 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-white text-white" />
                      ))}
                    </div>
                    <span className="text-white">4.9/5</span>
                  </div>
                  <div className="h-3 w-px bg-white/20" />
                  <div className="flex items-center gap-2">
                    <span>1,247+ Sold</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-start gap-3 animate-in slide-in-from-left duration-700 delay-200 pt-2">
                  <Link
                    to={ctaPrimary.href}
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EAE8E4] text-[#2A2624] text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all duration-300"
                  >
                    {ctaPrimary.text}
                  </Link>

                  <Link
                    to={ctaSecondary.href}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                  >
                    {ctaSecondary.text}
                  </Link>

                  {/* Play Video Button (if video provided) */}
                  {videoUrl && !isVideoPlaying && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                    >
                      <Play className="h-3 w-3" />
                      Demo
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Subtitle & Secondary Info */}
              <div className="max-w-[280px] lg:max-w-[320px] md:text-right space-y-6 animate-in slide-in-from-right duration-700 delay-150">
                {/* Subtitle */}
                <p className="text-sm md:text-base text-white/80 font-light leading-relaxed">
                  {subtitle}
                </p>

                {/* Secondary trust elements */}
                <div className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.15em] text-white/50 font-sans md:items-end">
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/40"></span>
                    Free Shipping MX
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/40"></span>
                    1 Year Warranty
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/40"></span>
                    Secure Payment
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Animated Trust Metrics Below Hero */}
      {showTrustMetrics && (
        <div className="bg-[#EAE8E4] border-b border-[#2A2624]/5 p-6 md:p-8">
          <TrustMetrics />
        </div>
      )}
    </div>
  );
}

// Animated feature highlight section
export function FeatureHighlights({ className = '' }: { className?: string }) {
  const features = [
    {
      icon: '🔇',
      title: 'Silence',
      description: 'Precision engineering for zero noise',
    },
    {
      icon: '🪵',
      title: 'Materials',
      description: 'Sustainable Walnut & Steel',
    },
    {
      icon: '🏆',
      title: 'Quality',
      description: 'Built for professional studios',
    },
    {
      icon: '🚚',
      title: 'Delivery',
      description: '3 weeks nationwide',
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A2624]/10 border border-[#2A2624]/10 ${className}`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`
            group relative overflow-hidden bg-[#EAE8E4]
            p-8 hover:bg-[#E3E0DB] transition-colors duration-500
          `}
        >
          <div className="text-2xl mb-4 grayscale opacity-80">{feature.icon}</div>
          <h3 className="font-serif italic text-xl text-[#2A2624] mb-2">
            {feature.title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-[#5D5550]">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default EnhancedHero;

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
  ctaPrimary = { text: 'Ver promoción', href: '/product/reformer-profesional' },
  ctaSecondary = { text: 'Comparar modelos', href: '/store' },
  backgroundImage,
  videoUrl,
  showTrustMetrics = true,
  className = ''
}: EnhancedHeroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background */}
      <div className="relative aspect-[21/6] w-full">
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
              backgroundImage: `url(${backgroundImage || '/og/cama-de-pilates-venta-mexico.png'})`
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl space-y-6">
              {/* Badge */}
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse shadow-lg">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Oferta especial
                </Badge>
                <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                  <Clock className="h-3 w-3 mr-1" />
                  Termina pronto
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight animate-in slide-in-from-left duration-500">
                {title}
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-white/90 animate-in slide-in-from-left duration-500 delay-100">
                {subtitle}
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 animate-in slide-in-from-left duration-500 delay-200">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5</span>
                  <span className="opacity-75">(127 reseñas)</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  <span>1,247+ reformers vendidos</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in slide-in-from-left duration-500 delay-300">
                <Link
                  to={ctaPrimary.href}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-foreground font-semibold hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  {ctaPrimary.text}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={ctaSecondary.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/70 text-white font-medium hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  {ctaSecondary.text}
                </Link>

                {/* Play Video Button (if video provided) */}
                {videoUrl && !isVideoPlaying && (
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white font-medium hover:bg-white/10 backdrop-blur-sm transition-all"
                  >
                    <Play className="h-5 w-5" />
                    Ver demo
                  </button>
                )}
              </div>

              {/* Additional trust elements */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/20 text-xs text-white/70 animate-in fade-in duration-500 delay-400">
                <span>✓ Envío gratis en México</span>
                <span>✓ Garantía 1 año</span>
                <span>✓ Pago seguro</span>
                <span>✓ 0% interés hasta 12 meses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Trust Metrics Below Hero */}
      {showTrustMetrics && (
        <div className="bg-gradient-to-br from-primary/5 to-transparent border-t border-border p-6 md:p-8">
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
      title: 'Silencio Total',
      description: 'Tolerancias precisas para un recorrido sin ruido',
      color: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      icon: '🪵',
      title: 'Materiales Premium',
      description: 'Cuero genuino, nogal y acero estructural',
      color: 'from-amber-500/10 to-orange-500/10'
    },
    {
      icon: '🏆',
      title: 'Calidad Profesional',
      description: 'Construido para uso continuo en estudios',
      color: 'from-purple-500/10 to-pink-500/10'
    },
    {
      icon: '🚚',
      title: 'Entrega Rápida',
      description: '3 semanas en todo México',
      color: 'from-green-500/10 to-emerald-500/10'
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`
            group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${feature.color}
            p-6 hover:shadow-lg transition-all duration-300 hover:scale-105
            animate-in slide-in-from-bottom duration-500
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="text-4xl mb-3">{feature.icon}</div>
          <h3 className="font-semibold text-foreground mb-1">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default EnhancedHero;

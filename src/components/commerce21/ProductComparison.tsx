import React, { useState } from 'react';
import { X, Check, Minus, Plus, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';

interface ProductComparisonProps {
  products: Product[];
  onClose?: () => void;
  className?: string;
}

export function ProductComparison({ products, onClose, className = '' }: ProductComparisonProps) {
  if (products.length === 0) return null;

  const comparisonData = {
    'Uso recomendado': {
      'reformer-casa': 'Hogar, 1-2 personas/día',
      'reformer-profesional': 'Estudio, uso continuo',
      'reformer-mycelium': 'Estudio premium, eco-conscious',
    },
    'Estructura': {
      'reformer-casa': 'Acero + Madera de nogal',
      'reformer-profesional': 'Acero reforzado + Nogal premium',
      'reformer-mycelium': 'Acero reforzado + Nogal premium',
    },
    'Peso máximo usuario': {
      'reformer-casa': '120 kg',
      'reformer-profesional': '150 kg',
      'reformer-mycelium': '150 kg',
    },
    'Nivel de silencio': {
      'reformer-casa': '★★★★☆ Silencioso',
      'reformer-profesional': '★★★★★ Silencio total',
      'reformer-mycelium': '★★★★★ Silencio total',
    },
    'Accesorios incluidos': {
      'reformer-casa': 'Básicos (4 muelles, correas)',
      'reformer-profesional': 'Completos (5 muelles, correas premium, barra)',
      'reformer-mycelium': 'Premium (5 muelles, correas Mylo, barra)',
    },
    'Garantía': {
      'reformer-casa': '1 año',
      'reformer-profesional': '1 año',
      'reformer-mycelium': '1 año',
    },
    'Instalación': {
      'reformer-casa': 'Auto-instalación (instructivo)',
      'reformer-profesional': 'Instalación profesional CDMX gratis',
      'reformer-mycelium': 'Instalación profesional CDMX gratis',
    },
    'Material tapizado': {
      'reformer-casa': 'Cuero genuino',
      'reformer-profesional': 'Cuero genuino premium',
      'reformer-mycelium': 'Mylo™ (micelio sostenible)',
    },
    'Mejor para': {
      'reformer-casa': 'Principiantes, uso personal',
      'reformer-profesional': 'Instructores, estudios',
      'reformer-mycelium': 'Estudios premium, sostenibilidad',
    },
  };

  return (
    <div className={`bg-card border border-border rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Comparar Reformers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Encuentra el modelo perfecto para tus necesidades
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
            aria-label="Cerrar comparación"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-semibold text-foreground sticky left-0 bg-muted/30">
                Característica
              </th>
              {products.map((product) => (
                <th key={product.slug} className="p-4 text-center min-w-[200px]">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">
                      {product.name.replace('Cama de Pilates Reformer – ', '')}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${Number(product.price).toLocaleString('es-MX')}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {product.currency}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      o ${Math.ceil(Number(product.price) / 12).toLocaleString('es-MX')}/mes
                    </div>
                    {product.bestSeller && (
                      <Badge variant="default" className="text-[10px]">Más vendido</Badge>
                    )}
                    {product.isNew && (
                      <Badge variant="secondary" className="text-[10px]">Nuevo</Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(comparisonData).map(([feature, values], idx) => (
              <tr
                key={feature}
                className={`border-b border-border ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
              >
                <td className="p-4 font-medium text-foreground sticky left-0 bg-inherit">
                  {feature}
                </td>
                {products.map((product) => (
                  <td key={product.slug} className="p-4 text-center text-sm text-muted-foreground">
                    {values[product.slug as keyof typeof values] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20">
              <td className="p-4 font-semibold text-foreground sticky left-0 bg-muted/20">
                Acción
              </td>
              {products.map((product) => (
                <td key={product.slug} className="p-4 text-center">
                  <div className="space-y-2">
                    <Link
                      to={`/product/${product.slug}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      Ver detalles
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href="https://wa.me/523222787690"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
                    >
                      Consultar
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Help section */}
      <div className="bg-accent/5 border-t border-border px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">¿No estás seguro cuál elegir?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nuestro equipo puede ayudarte a encontrar el reformer perfecto para tu espacio y necesidades.
            </p>
            <div className="flex gap-2">
              <a
                href="https://wa.me/523222787690"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Hablar con experto
              </a>
              <Link
                to="/blog/reformer-casa-vs-profesional"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
              >
                Leer guía completa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sticky comparison bar that appears when multiple products are selected
export function StickyCompareBar({
  selectedProducts,
  onClear,
  onCompare,
  className = ''
}: {
  selectedProducts: Product[];
  onClear: () => void;
  onCompare: () => void;
  className?: string;
}) {
  if (selectedProducts.length === 0) return null;

  return (
    <div
      className={`
        fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-2xl
        animate-in slide-in-from-bottom duration-300
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground">
              Comparar ({selectedProducts.length})
            </span>
            <div className="flex items-center gap-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.slug}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm"
                >
                  <span className="truncate max-w-[150px]">
                    {product.name.replace('Cama de Pilates Reformer – ', '')}
                  </span>
                  <button
                    onClick={() => {/* remove product */}}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={onCompare}
              disabled={selectedProducts.length < 2}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comparar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductComparison;

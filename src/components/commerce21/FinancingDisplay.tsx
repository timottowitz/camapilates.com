import React, { useState } from 'react';
import { CreditCard, Info, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FinancingDisplayProps {
  price: number;
  currency?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'prominent';
}

export function FinancingDisplay({
  price,
  currency = 'MXN',
  className = '',
  variant = 'default'
}: FinancingDisplayProps) {
  const [selectedMonths, setSelectedMonths] = useState(12);

  const calculateMonthly = (months: number) => {
    // Simple calculation, no interest for first 12 months
    const monthlyPayment = price / months;
    return Math.ceil(monthlyPayment);
  };

  const financingOptions = [
    { months: 3, rate: 0, label: '3 meses' },
    { months: 6, rate: 0, label: '6 meses' },
    { months: 12, rate: 0, label: '12 meses', popular: true },
    { months: 18, rate: 8.9, label: '18 meses' },
    { months: 24, rate: 10.5, label: '24 meses' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">o desde</span>
        <span className="text-lg font-semibold text-foreground">
          ${calculateMonthly(12).toLocaleString('es-MX')} {currency}/mes
        </span>
        <Badge variant="secondary" className="text-xs">0% interés</Badge>
      </div>
    );
  }

  if (variant === 'prominent') {
    return (
      <div className={`rounded-lg border border-primary/20 bg-primary/5 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Paga en mensualidades</h3>
          <Badge variant="default" className="text-xs">0% interés</Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ${calculateMonthly(selectedMonths).toLocaleString('es-MX')}
            </span>
            <span className="text-sm text-muted-foreground">/ mes × {selectedMonths} meses</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {financingOptions.map((option) => (
              <button
                key={option.months}
                onClick={() => setSelectedMonths(option.months)}
                className={`
                  relative px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${selectedMonths === option.months
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background border border-border hover:border-primary/50'
                  }
                `}
              >
                {option.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">Popular</Badge>
                  </div>
                )}
                <div className="text-xs opacity-90">{option.label}</div>
                <div className="font-semibold">
                  ${calculateMonthly(option.months).toLocaleString('es-MX')}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Check className="h-3 w-3 text-green-600" />
            <span>Sin enganche • Aprobación en 5 minutos</span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Financiamiento disponible</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Paga en hasta 24 meses sin intereses. Aprobación instantánea con tarjeta de crédito.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {financingOptions.find(o => o.months === selectedMonths)?.rate === 0 && (
          <Badge variant="secondary" className="text-xs">0% interés</Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">
          ${calculateMonthly(selectedMonths).toLocaleString('es-MX')}
        </span>
        <span className="text-sm text-muted-foreground">/ mes</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {financingOptions.map((option) => (
          <button
            key={option.months}
            onClick={() => setSelectedMonths(option.months)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${selectedMonths === option.months
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-foreground'
              }
            `}
          >
            {option.label}
            {option.rate > 0 && <span className="ml-1 opacity-70">({option.rate}%)</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-green-600" />
        <span>Aprobación instantánea con tarjeta Visa, MasterCard o American Express</span>
      </div>
    </div>
  );
}

export default FinancingDisplay;


import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  hover?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ children, className, variant = 'default', hover = true, ...props }, ref) => {
    const variants = {
      default: "bg-white border border-gray-200 shadow-lg",
      elevated: "bg-white border-0 shadow-2xl shadow-gray-900/10",
      glass: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl",
      gradient: "bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl"
    };

    const hoverEffects = hover 
      ? "hover:shadow-2xl hover:shadow-gray-900/20 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-out" 
      : "";

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-3xl overflow-hidden",
          variants[variant],
          hoverEffects,
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard, CardContent, CardHeader };

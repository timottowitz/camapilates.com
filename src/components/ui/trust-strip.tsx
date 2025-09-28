import React from 'react';
import { CreditCard, Truck, ShieldCheck, Package } from 'lucide-react';

const TrustStrip: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs ${className}`}>
      <div className="flex items-center gap-1 text-foreground"><CreditCard className="h-3.5 w-3.5 text-primary" /> Pago seguro</div>
      <div className="flex items-center gap-1 text-foreground"><Truck className="h-3.5 w-3.5 text-primary" /> Entrega 7–14 días (MX)</div>
      <div className="flex items-center gap-1 text-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Garantía 3 años</div>
      <div className="flex items-center gap-1 text-foreground"><Package className="h-3.5 w-3.5 text-primary" /> Repuestos exprés</div>
    </div>
  );
};

export default TrustStrip;


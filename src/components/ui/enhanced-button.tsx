
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ children, loading, loadingText, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-bennett-gold focus:ring-opacity-50",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export default EnhancedButton;

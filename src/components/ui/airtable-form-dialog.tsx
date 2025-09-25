import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AirtableFormDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AirtableFormDialog = ({ 
  children, 
  title = "Report Solar Fraud", 
  description = "Fill out this form to report solar fraud and get legal assistance"
}: AirtableFormDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe 
            className="airtable-embed w-full h-[600px]" 
            src="https://airtable.com/embed/appWMh4mQGOzsWPIi/pag9ioXQFmlcOMTHr/form" 
            frameBorder="0" 
            style={{ background: 'transparent', border: '1px solid #ccc' }}
            title="Solar Fraud Report Form"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for directly embedding the form
export const AirtableFormEmbed = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`w-full ${className}`}>
      <iframe 
        className="airtable-embed w-full" 
        src="https://airtable.com/embed/appWMh4mQGOzsWPIi/pag9ioXQFmlcOMTHr/form" 
        frameBorder="0" 
        width="100%" 
        height="533" 
        style={{ background: 'transparent', border: '1px solid #ccc' }}
        title="Solar Fraud Report Form"
      />
    </div>
  );
};

export default AirtableFormDialog;
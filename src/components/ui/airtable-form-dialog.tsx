import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AirtableFormDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  embedUrl?: string;
}

const DEFAULT_EMBED = "https://airtable.com/embed/appWMh4mQGOzsWPIi/pag9ioXQFmlcOMTHr/form";

const AirtableFormDialog = ({ 
  children, 
  title = "Report Solar Fraud", 
  description = "Fill out this form to report solar fraud and get legal assistance",
  embedUrl,
}: AirtableFormDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const url = embedUrl || DEFAULT_EMBED;

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
            src={url}
            frameBorder="0" 
            style={{ background: 'transparent', border: '1px solid #ccc' }}
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for directly embedding the form
export const AirtableFormEmbed = ({ className = "", embedUrl }: { className?: string, embedUrl?: string }) => {
  const url = embedUrl || DEFAULT_EMBED;
  return (
    <div className={`w-full ${className}`}>
      <iframe 
        className="airtable-embed w-full" 
        src={url}
        frameBorder="0" 
        width="100%" 
        height="533" 
        style={{ background: 'transparent', border: '1px solid #ccc' }}
        title="Airtable Form"
      />
    </div>
  );
};

export default AirtableFormDialog;

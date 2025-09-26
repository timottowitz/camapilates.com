import React from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  vertical?: boolean;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, description, vertical = false }) => {

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Article link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div
      className={cn(
        // Wrap on small screens to avoid overflow; align nicely
        "flex flex-wrap items-center gap-2 sm:gap-3 min-w-0",
        vertical && "flex-col items-start"
      )}
    >
      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && (navigator as any).share && (
        <Button
          variant="outline"
          size="icon"
          onClick={shareNative}
          className="hover:bg-gray-100 shrink-0"
          >
          <Share2 className="w-4 h-4" />
        </Button>
      )}

      {/* Twitter */}
      <Button variant="outline" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-600 shrink-0">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </a>
      </Button>

      {/* Facebook */}
      <Button variant="outline" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-700 shrink-0">
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </a>
      </Button>

      {/* LinkedIn */}
      <Button variant="outline" size="icon" asChild className="hover:bg-blue-50 hover:text-blue-800 shrink-0">
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>
      </Button>

      {/* Copy Link */}
      <Button variant="outline" size="icon" onClick={copyToClipboard} className="hover:bg-gray-100 shrink-0">
        <LinkIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;

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
    <div className={cn(
      "flex gap-2",
      vertical ? "flex-col" : "flex-row items-center"
    )}>
      {/* Native Share (mobile) */}
      {navigator.share && (
        <Button
          variant="ghost"
          size="sm"
          onClick={shareNative}
          className="hover:bg-gray-100"
        >
          <Share2 className="w-4 h-4" />
          {vertical && <span className="ml-2">Share</span>}
        </Button>
      )}

      {/* Twitter */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hover:bg-blue-50 hover:text-blue-600"
      >
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
          {vertical && <span className="ml-2">Twitter</span>}
        </a>
      </Button>

      {/* Facebook */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hover:bg-blue-50 hover:text-blue-700"
      >
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          {vertical && <span className="ml-2">Facebook</span>}
        </a>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hover:bg-blue-50 hover:text-blue-800"
      >
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          {vertical && <span className="ml-2">LinkedIn</span>}
        </a>
      </Button>

      {/* Copy Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="hover:bg-gray-100"
      >
        <LinkIcon className="w-4 h-4" />
        {vertical && <span className="ml-2">Copy Link</span>}
      </Button>
    </div>
  );
};

export default ShareButtons;
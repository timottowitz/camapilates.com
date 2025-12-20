import { useEffect, useRef } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeInstagramUsername } from '@/lib/social';

interface InstagramEmbedProps {
  postUrl: string;
  caption?: boolean;
  className?: string;
}

export function InstagramEmbed({ postUrl, caption = true, className = '' }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const src = 'https://www.instagram.com/embed.js';
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => window.instgrm?.Embeds.process(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(script);
    }
  }, [postUrl]);

  const cleanUrl = postUrl.split('?')[0];

  return (
    <div ref={containerRef} className={className}>
      <blockquote
        className="instagram-media"
        data-instgrm-captioned={caption ? '' : undefined}
        data-instgrm-permalink={cleanUrl}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px',
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: '99.375%',
        }}
      />
    </div>
  );
}

interface InstagramFeedProps {
  posts: string[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function InstagramFeed({ posts, columns = 3, className = '' }: InstagramFeedProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {posts.map((url, index) => (
        <InstagramEmbed key={index} postUrl={url} />
      ))}
    </div>
  );
}

interface InstagramProfileSectionProps {
  username: string;
  posts?: string[];
  instructorName: string;
  isPreviewLoading?: boolean;
  preview?: {
    profileImageUrl?: string | null;
    displayName?: string;
    ogDescription?: string;
    followers?: number;
    following?: number;
    posts?: number;
  } | null;
  className?: string;
}

export function InstagramProfileSection({ 
  username, 
  posts = [], 
  instructorName,
  isPreviewLoading = false,
  preview,
  className = '' 
}: InstagramProfileSectionProps) {
  const cleanUsername = normalizeInstagramUsername(username);
  if (!cleanUsername) return null;
  const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
  const hasPreview = Boolean(preview && (preview.profileImageUrl || preview.ogDescription || preview.displayName));

  const formatCount = (value?: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return value.toLocaleString();
  };

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-6 border-b border-[#2A2624]/10 pb-2">
        <h2 className="flex items-center gap-3 text-2xl font-serif italic text-[#2A2624]">
          <Instagram className="w-6 h-6 text-[#E4405F]" />
          Instagram
        </h2>
        <a 
          href={profileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-[#5D5550] hover:text-[#E4405F] transition-colors flex items-center gap-1"
        >
          @{cleanUsername}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {preview && (preview.profileImageUrl || preview.ogDescription || preview.displayName) && (
        <div className="mb-6 flex items-start gap-4 rounded-xl border border-[#2A2624]/10 bg-white p-5">
          {preview.profileImageUrl ? (
            <img
              src={preview.profileImageUrl}
              alt={preview.displayName ? `${preview.displayName} en Instagram` : `@${cleanUsername}`}
              className="h-16 w-16 rounded-full object-cover border border-[#2A2624]/10"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#EAE8E4] flex items-center justify-center border border-[#2A2624]/10">
              <Instagram className="w-7 h-7 text-[#E4405F]/70" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-[#2A2624] truncate">
                  {preview.displayName || `@${cleanUsername}`}
                </div>
                <div className="text-xs text-[#5D5550] truncate">@{cleanUsername}</div>
              </div>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 border-[#E4405F]/30 text-[#E4405F] hover:bg-[#E4405F]/5">
                  <Instagram className="w-4 h-4" />
                  Ver perfil
                </Button>
              </a>
            </div>

            {preview.ogDescription && (
              <p className="mt-3 text-sm text-[#5D5550] line-clamp-2">
                {preview.ogDescription}
              </p>
            )}

            {(preview.followers || preview.following || preview.posts) && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#5D5550]">
                {preview.followers ? (
                  <span><span className="font-medium text-[#2A2624]">{formatCount(preview.followers)}</span> seguidores</span>
                ) : null}
                {preview.following ? (
                  <span><span className="font-medium text-[#2A2624]">{formatCount(preview.following)}</span> seguidos</span>
                ) : null}
                {preview.posts ? (
                  <span><span className="font-medium text-[#2A2624]">{formatCount(preview.posts)}</span> publicaciones</span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="space-y-6">
          <InstagramFeed posts={posts.slice(0, 3)} columns={posts.length === 1 ? 1 : posts.length === 2 ? 2 : 3} />
          <div className="text-center pt-4">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-[#E4405F]/30 text-[#E4405F] hover:bg-[#E4405F]/5">
                <Instagram className="w-4 h-4" />
                Ver más en Instagram
              </Button>
            </a>
          </div>
        </div>
      ) : isPreviewLoading ? (
        <div className="rounded-xl p-8 text-center border border-[#2A2624]/10 bg-white">
          <div className="w-10 h-10 border-2 border-[#E4405F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5D5550] mb-4">Cargando vista previa de Instagram…</p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 border-[#E4405F]/30 text-[#E4405F] hover:bg-[#E4405F]/5">
              <Instagram className="w-4 h-4" />
              Abrir @{cleanUsername}
            </Button>
          </a>
        </div>
      ) : !hasPreview ? (
        <div className="bg-gradient-to-br from-[#833AB4]/5 via-[#E4405F]/5 to-[#FCAF45]/5 rounded-xl p-8 text-center border border-[#E4405F]/10">
          <Instagram className="w-12 h-12 text-[#E4405F]/60 mx-auto mb-4" />
          <p className="text-[#5D5550] mb-4">
            Descubre el trabajo de {instructorName} en Instagram
          </p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-gradient-to-r from-[#833AB4] via-[#E4405F] to-[#FCAF45] hover:opacity-90 text-white border-0">
              <Instagram className="w-4 h-4" />
              Seguir @{cleanUsername}
            </Button>
          </a>
        </div>
      ) : null}
    </section>
  );
}

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

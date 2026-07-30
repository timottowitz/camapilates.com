import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { hasConvex } from '@/lib/convexProvider';

type Aspect = '16:9' | '1:1' | '4:3' | 'portrait' | 'landscape' | string;

export interface ContextualImageProps {
  placeholderId: string;
  pageType: 'blog' | 'home' | 'shop' | 'studios' | 'about' | 'page' | string;
  pageSlug?: string;
  location?: string; // hero | section-1 | inline-2 | ...
  aspectRatio?: Aspect;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
}

function aspectToPadding(aspect?: Aspect) {
  const a = (aspect || '16:9').toLowerCase();
  if (a === '1:1') return '100%';
  if (a === '4:3') return `${(3 / 4) * 100}%`;
  if (a === '16:9' || a === 'landscape') return `${(9 / 16) * 100}%`;
  if (a === 'portrait') return `${(16 / 9) * 100}%`;
  // Try parse w:h
  const m = a.match(/^(\d+)\s*:\s*(\d+)$/);
  if (m) return `${(Number(m[2]) / Number(m[1])) * 100}%`;
  return '56.25%';
}

function getNearestHeading(el: Element | null): string | undefined {
  if (!el) return undefined;
  let cur: Element | null = el;
  while (cur && cur.previousElementSibling == null) cur = cur.parentElement;
  let p: Element | null = cur?.previousElementSibling || null;
  while (p) {
    if (/^H[1-6]$/.test(p.tagName)) return (p.textContent || '').trim().slice(0, 200) || undefined;
    p = p.previousElementSibling;
  }
  return undefined;
}

function collectTextAround(el: Element | null, before = 500, after = 500) {
  if (!el || typeof window === 'undefined') return { before: undefined, after: undefined };
  const textFrom = (node: Node | null): string => (node && (node as HTMLElement).innerText) || (node?.textContent || '') || '';
  const parent = el.parentElement;
  if (!parent) return { before: undefined, after: undefined };
  const all = Array.from(parent.childNodes);
  const idx = all.indexOf(el as any);
  const prev = all.slice(0, idx).map(textFrom).join(' ').slice(-before) || undefined;
  const next = all.slice(idx + 1).map(textFrom).join(' ').slice(0, after) || undefined;
  return { before: prev, after: next };
}

export const ContextualImage: React.FC<ContextualImageProps> = ({
  placeholderId,
  pageType,
  pageSlug,
  location = 'inline',
  aspectRatio = '16:9',
  alt,
  className,
  style,
  fallbackSrc,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [registered, setRegistered] = useState(false);
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';

  const register = useMutation(api.placeholders.register);
  const data = useQuery(
    api.placeholders.getById,
    hasConvex ? { placeholderId } : undefined
  ) as any;

  // Register placeholder on mount/update with local context if Convex available
  useEffect(() => {
    if (!hasConvex) return;
    if (!token) return;
    const el = ref.current;
    const { before, after } = collectTextAround(el, 500, 500);
    const headingAbove = getNearestHeading(el);
    const doRegister = async () => {
      try {
        await register({
          token,
          placeholderId,
          pageType,
          pageSlug,
          location,
          contextBefore: before,
          contextAfter: after,
          headingAbove,
          altText: alt,
          figCaption: undefined,
          preferredAspectRatio: aspectRatio,
          priority: location.includes('hero') ? 100 : 60,
        });
        setRegistered(true);
      } catch (e) {
        // no-op
      }
    };
    void doRegister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderId, pageType, pageSlug, location, aspectRatio, alt, token]);

  const paddingTop = useMemo(() => aspectToPadding(aspectRatio), [aspectRatio]);
  const url = data?.imageUrl || fallbackSrc;
  const isHero = location.includes('hero');

  // If no image yet and no fallback, register silently without visual placeholder
  if (!url) {
    return <div ref={ref} style={{ display: 'contents' }} />;
  }

  return (
    <div ref={ref} className={className} style={style}>
      <div style={{ position: 'relative', width: '100%', paddingTop }}>
        <img
          src={url}
          alt={alt || data?.headingAbove || ''}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
          loading={isHero ? 'eager' : 'lazy'}
          fetchPriority={isHero ? 'high' : undefined}
          decoding="async"
        />
      </div>
    </div>
  );
};

export default ContextualImage;

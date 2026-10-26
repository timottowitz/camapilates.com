import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Strip fenced code blocks and leading H1 before extracting headings
    const cleaned = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^\s*#\s+[^\n]+\n+/, '');
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(cleaned)) !== null) {
      const level = match[1].length;
      const rawTitle = match[2].trim();
      const title = rawTitle
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
      const id = title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();

      if (level <= 3 && title) {
        items.push({ id, title, level });
      }
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    const headingElements = tocItems.map(item => 
      document.getElementById(item.id)
    ).filter(Boolean);

    headingElements.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      headingElements.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Update URL with anchor for SEO and shareability
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${id}`);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#EAE8E4] border border-[#2A2624]/10 rounded-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2A2624]/10">
        <div className="flex items-center min-w-0">
          <List className="w-4 h-4 mr-2 text-[#2A2624] shrink-0" />
          <h3 className="font-serif italic text-lg text-[#2A2624] truncate">Contenido</h3>
        </div>
        <button 
          onClick={scrollToTop}
          className="text-xs uppercase tracking-wider text-[#5D5550] hover:text-[#2A2624] transition-colors shrink-0 whitespace-nowrap"
          aria-label="Ir al inicio"
        >
          ↑ Inicio
        </button>
      </div>
      
      <nav aria-label="Tabla de contenidos" className="max-h-[60vh] overflow-y-auto pr-1">
        <ul className="space-y-2">
          {/* Posts can repeat a heading, and the id is derived from the heading text,
              so item.id alone is not unique. React warns on the collision and is free
              to drop or duplicate the entries. */}
          {tocItems.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(item.id);
                }}
                className={cn(
                  "block text-left w-full text-xs leading-snug transition-colors hover:text-[#2A2624]",
                  item.level === 2 && "font-medium text-[#2A2624]/90 pt-1",
                  item.level === 3 && "pl-3 text-[#5D5550]",
                  activeId === item.id 
                    ? "text-[#3E2723] font-semibold border-l-2 border-[#3E2723] pl-2" 
                    : ""
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
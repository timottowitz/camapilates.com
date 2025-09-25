import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
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
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      if (level <= 3) { // Only show h1, h2, h3
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
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <EnhancedCard variant="glass" className="p-6">
      <div className="flex items-center mb-4">
        <List className="w-4 h-4 mr-2 text-bennett-navy" />
        <h3 className="font-semibold text-bennett-navy">Table of Contents</h3>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={cn(
                  "text-left w-full text-sm transition-colors hover:text-bennett-gold",
                  item.level === 1 && "font-medium",
                  item.level === 2 && "pl-3",
                  item.level === 3 && "pl-6",
                  activeId === item.id 
                    ? "text-bennett-gold font-medium" 
                    : "text-bennett-slate"
                )}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </EnhancedCard>
  );
};

export default TableOfContents;
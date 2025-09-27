import React from 'react';
import { Link } from 'react-router-dom';

type TagItem = { tag: string; count: number };

const TagCloud21: React.FC<{ tags: TagItem[] }> = ({ tags }) => {
  if (!tags?.length) return null;
  const max = Math.max(...tags.map(t => t.count));
  const min = Math.min(...tags.map(t => t.count));
  const scale = (c: number) => {
    if (max === min) return 1;
    return 0.8 + (c - min) / (max - min) * 0.7; // 0.8–1.5em
  };
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Link
          key={t.tag}
          to={`/blog/tag/${encodeURIComponent(t.tag)}`}
          style={{ fontSize: `${scale(t.count)}em` }}
          className="text-foreground/80 hover:text-primary"
          title={`${t.tag} (${t.count})`}
        >
          #{t.tag}
        </Link>
      ))}
    </div>
  );
};

export default TagCloud21;


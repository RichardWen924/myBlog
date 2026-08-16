import type { MouseEvent } from 'react';
import type { ArchivePost } from '../blogArchive';
import { withBasePath } from '../../../lib/sitePath';

interface ArchivePostRowProps {
  post: ArchivePost;
  selected?: boolean;
  compact?: boolean;
  onActivate?: () => void;
}

export default function ArchivePostRow({
  post,
  selected = false,
  compact = false,
  onActivate,
}: ArchivePostRowProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!event.defaultPrevented) onActivate?.();
  };

  return (
    <div
      className={`blog-archive-row${selected ? ' blog-archive-row--selected' : ''}${compact ? ' blog-archive-row--compact' : ''}`}
      data-selected={selected ? 'true' : undefined}
    >
      <a
        href={withBasePath(`/blog/${post.id}`)}
        className="blog-archive-row__link"
        onClick={handleClick}
      >
        <span className="blog-archive-row__main">
          <span className="blog-archive-row__title">{post.title}</span>
          {post.tags.length > 0 && (
            <span className="blog-archive-row__tags" aria-label="Tags">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          )}
        </span>
        <time className="blog-archive-row__date" dateTime={post.date}>
          {post.date.slice(0, 10)}
        </time>
        {post.image && (
          <span className="blog-archive-row__media">
            <img
              src={withBasePath(post.image)}
              alt={post.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
            />
          </span>
        )}
      </a>
    </div>
  );
}

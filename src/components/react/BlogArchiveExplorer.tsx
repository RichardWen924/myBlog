import { useCallback, useEffect, useMemo, useState } from 'react';
import AnimatedArchiveList from './AnimatedArchiveList';
import ArchivePostRow from './ArchivePostRow';
import {
  clampPage,
  getPageCount,
  getPagePosts,
  groupPostsByYear,
  type ArchivePost,
} from './blogArchive';

interface BlogArchiveExplorerProps {
  posts: ArchivePost[];
}

function getPageFromSearch(search: string, totalPosts: number): number {
  const rawPage = new URLSearchParams(search).get('page');
  const parsedPage = rawPage === null ? 1 : Number(rawPage);
  return clampPage(parsedPage, totalPosts);
}

function updatePageUrl(page: number, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', String(page));
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (replace) {
    window.history.replaceState({ page }, '', nextUrl);
  } else {
    window.history.pushState({ page }, '', nextUrl);
  }
}

export default function BlogArchiveExplorer({ posts }: BlogArchiveExplorerProps) {
  const totalPages = getPageCount(posts.length);
  const [page, setPage] = useState(1);
  const [quickMode, setQuickMode] = useState(false);

  const syncPageFromUrl = useCallback(() => {
    const nextPage = getPageFromSearch(window.location.search, posts.length);
    setPage(nextPage);

    if (posts.length > 0) {
      const currentPage = new URLSearchParams(window.location.search).get('page');
      if (currentPage !== String(nextPage)) updatePageUrl(nextPage, true);
    }
  }, [posts.length]);

  useEffect(() => {
    syncPageFromUrl();
    window.addEventListener('popstate', syncPageFromUrl);

    return () => window.removeEventListener('popstate', syncPageFromUrl);
  }, [syncPageFromUrl]);

  const pagePosts = useMemo(() => getPagePosts(posts, page), [page, posts]);
  const yearGroups = useMemo(() => groupPostsByYear(pagePosts), [pagePosts]);

  const changePage = useCallback(
    (nextPage: number) => {
      const safePage = clampPage(nextPage, posts.length);
      if (safePage === page || posts.length === 0) return;

      setPage(safePage);
      updatePageUrl(safePage);
    },
    [page, posts.length],
  );

  const handleQuickItemSelect = useCallback((_post: ArchivePost) => undefined, []);

  return (
    <div className="blog-archive__explorer">
      <div className="blog-archive__heading-row">
        <h2 id="archive-title" className="blog-archive__heading">
          Archive
        </h2>
        {posts.length > 0 && (
          <label className="blog-archive__mode-toggle">
            <span className="blog-archive__mode-label">Quick browse</span>
            <input
              className="blog-archive__mode-switch"
              type="checkbox"
              role="switch"
              aria-label="Quick browse mode"
              aria-checked={quickMode}
              checked={quickMode}
              onChange={(event) => setQuickMode(event.currentTarget.checked)}
            />
          </label>
        )}
      </div>

      {posts.length > 0 && (
        <p className="blog-archive__status" aria-live="polite">
          {quickMode
            ? `Quick browsing ${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`
            : `Page ${page} of ${totalPages}`}
        </p>
      )}

      {posts.length === 0 ? (
        <p className="blog-archive__empty">No posts yet.</p>
      ) : quickMode ? (
        <AnimatedArchiveList
          posts={posts}
          onItemSelect={handleQuickItemSelect}
          displayScrollbar
          showGradients
          enableArrowNavigation
        />
      ) : (
        <>
          <div className="blog-archive__page-content">
            {[...yearGroups.entries()].map(([year, yearPosts]) => (
              <section
                className="blog-archive__year-group"
                key={year}
                aria-labelledby={`archive-year-${year}`}
              >
                <h3 id={`archive-year-${year}`} className="blog-archive__year-heading">
                  {year}
                </h3>
                <ul className="blog-archive__posts">
                  {yearPosts.map((post) => (
                    <li key={post.id}>
                      <ArchivePostRow post={post} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="blog-pagination" aria-label="Archive pages">
              <button
                type="button"
                className="blog-pagination__control"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </button>
              <div className="blog-pagination__pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    type="button"
                    className="blog-pagination__page"
                    key={pageNumber}
                    aria-label={`Go to archive page ${pageNumber}`}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    onClick={() => changePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="blog-pagination__control"
                disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export interface ArchivePost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string | undefined;
  year: number;
}

export const PAGE_SIZE = 5;

export function getPageCount(totalPosts: number): number {
  return Math.ceil(Math.max(0, totalPosts) / PAGE_SIZE);
}

export function clampPage(page: number, totalPosts: number): number {
  const pageCount = getPageCount(totalPosts);

  if (pageCount === 0 || !Number.isInteger(page) || page < 1) return 1;

  return Math.min(page, pageCount);
}

export function getPagePosts(posts: ArchivePost[], page: number): ArchivePost[] {
  const safePage = clampPage(page, posts.length);
  const start = (safePage - 1) * PAGE_SIZE;

  return posts.slice(start, start + PAGE_SIZE);
}

export function getNextSelectionIndex(
  currentIndex: number,
  direction: number,
  totalPosts: number,
): number {
  const lastIndex = Math.max(totalPosts - 1, 0);
  return Math.min(Math.max(currentIndex + direction, 0), lastIndex);
}

export function groupPostsByYear(posts: ArchivePost[]): Map<number, ArchivePost[]> {
  const groups = new Map<number, ArchivePost[]>();

  for (const post of posts) {
    const yearPosts = groups.get(post.year);
    if (yearPosts) {
      yearPosts.push(post);
    } else {
      groups.set(post.year, [post]);
    }
  }

  return groups;
}

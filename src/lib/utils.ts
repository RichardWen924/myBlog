import type { CollectionEntry } from 'astro:content';

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function groupByYear(
  posts: CollectionEntry<'blog'>[],
): Map<number, CollectionEntry<'blog'>[]> {
  const groups = new Map<number, CollectionEntry<'blog'>[]>();
  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const arr = groups.get(year);
    if (arr) {
      arr.push(post);
    } else {
      groups.set(year, [post]);
    }
  }
  return groups;
}

import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * All published posts, newest first. Drafts are excluded.
 *
 * This is the single data-access entry point for pages. When the content
 * loader changes (glob → Obsidian vault → CMS), only this file and
 * `content.config.ts` need to change — page components are insulated.
 */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}

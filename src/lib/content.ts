import { getCollection, type CollectionEntry } from 'astro:content';
import projectsData from '../data/projects';
import type { Project } from '../data/projects';

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

export function getFeaturedPosts(
  posts: CollectionEntry<'blog'>[],
  count = 3,
): CollectionEntry<'blog'>[] {
  return posts.slice(0, count);
}

// --- Projects (data-driven, insulated from page components) ---

const projectsByYear = [...projectsData].sort((a, b) => b.year - a.year);

export function getProjects(): Project[] {
  return [...projectsByYear];
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

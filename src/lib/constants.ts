import profile from '../data/profile';
import type { Profile } from '../data/profile';

export const SITE_TITLE = profile.name;
export const SITE_DESCRIPTION = `${profile.title} — personal website and blog.`;
// Placeholder until the production domain is chosen. Used by astro.config.mjs,
// the RSS feed, sitemap, and all absolute URLs.
export const SITE_URL = 'https://blog.example.com';
export const SITE_AUTHOR = profile.name;
export const POSTS_PER_PAGE = 10;
export const PROFILE: Profile = profile;

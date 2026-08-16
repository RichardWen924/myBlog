import profile from '../data/profile';
import type { Profile } from '../data/profile';

export const SITE_TITLE = profile.name;
export const SITE_DESCRIPTION = `${profile.title} — personal website and blog.`;
export const SITE_URL = 'https://richardwen924.github.io/myBlog/';
export const SITE_AUTHOR = profile.name;
export const POSTS_PER_PAGE = 10;
export const PROFILE: Profile = profile;

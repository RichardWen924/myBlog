import { withBasePath } from '../lib/sitePath.ts';

export interface NavigationItem {
  label: string;
  href: string;
  active: boolean;
}

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

const normalizePathname = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
};

export const isNavigationItemActive = (pathname: string, href: string) => {
  const currentPath = normalizePathname(pathname);
  if (href === '/') return currentPath === '/';
  if (href === '/work') {
    return currentPath === '/work' || currentPath === '/projects' || currentPath.startsWith('/projects/');
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
};

export function getNavigationItems(
  pathname: string,
  base = import.meta.env?.BASE_URL ?? '/',
): NavigationItem[] {
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  const logicalPath = normalizedBase === '/'
    ? pathname
    : pathname.replace(new RegExp(`^${normalizedBase}(?=/|$)`), '') || '/';

  return navigationLinks.map((item) => ({
    ...item,
    href: withBasePath(item.href, base),
    active: isNavigationItemActive(logicalPath, item.href),
  }));
}

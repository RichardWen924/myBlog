const NON_SITE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

export function withBasePath(path: string, base = import.meta.env.BASE_URL): string {
  if (!path.startsWith('/') || NON_SITE_URL.test(path)) return path;

  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  if (normalizedBase === '/') return path;
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path;
  if (path === '/') return `${normalizedBase}/`;
  return `${normalizedBase}${path}`;
}

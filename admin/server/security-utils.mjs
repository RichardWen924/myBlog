const DEFAULT_ADMIN_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function isAllowedAdminOrigin(origin, configuredOrigin = process.env.ADMIN_ORIGIN) {
  if (!origin) return true;

  const allowedOrigins = new Set([
    ...DEFAULT_ADMIN_ORIGINS,
    ...(configuredOrigin ? [configuredOrigin] : []),
  ]);

  return allowedOrigins.has(origin);
}

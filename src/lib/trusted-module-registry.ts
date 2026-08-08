import type { TrustedModuleDefinition } from './module-types';

const modules = import.meta.glob('../modules/trusted/*.ts', {
  eager: true,
  import: 'default',
}) as Record<string, TrustedModuleDefinition>;

export function getTrustedModule(id: string): TrustedModuleDefinition | undefined {
  return Object.values(modules).find((module) => module.id === id);
}

const MODULE_TYPES = new Set([
  'hero',
  'profile',
  'skill',
  'project',
  'experience',
  'post',
  'trusted',
]);

export function sortModules(modules) {
  return [...modules].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function moveModule(modules, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= modules.length) return modules.map((module) => ({ ...module }));
  const next = modules.map((module) => ({ ...module }));
  const [moved] = next.splice(fromIndex, 1);
  const target = Math.max(0, Math.min(toIndex, next.length));
  next.splice(target, 0, moved);
  return next.map((module, index) => ({ ...module, order: index * 10 }));
}

export function validateModules(modules) {
  if (!Array.isArray(modules)) throw new Error('modules must be an array');

  const ids = new Set();
  for (const module of modules) {
    if (!module || typeof module !== 'object') throw new Error('module must be an object');
    if (typeof module.id !== 'string' || !/^[a-z0-9][a-z0-9-_]*$/.test(module.id)) {
      throw new Error(`invalid module id: ${module.id ?? '<missing>'}`);
    }
    if (ids.has(module.id)) throw new Error(`duplicate id: ${module.id}`);
    ids.add(module.id);
    if (!MODULE_TYPES.has(module.type)) throw new Error(`invalid module type for ${module.id}`);
    if (typeof module.group !== 'string' || !module.group) throw new Error(`group is required for ${module.id}`);
    if (typeof module.title !== 'string' || !module.title.trim()) throw new Error(`title is required for ${module.id}`);
    if (!Number.isInteger(module.order) || module.order < 0) throw new Error(`order is invalid for ${module.id}`);
    if (typeof module.visible !== 'boolean') throw new Error(`visible is invalid for ${module.id}`);
    if (module.data !== undefined && (!module.data || typeof module.data !== 'object' || Array.isArray(module.data))) {
      throw new Error(`data is invalid for ${module.id}`);
    }
  }

  return true;
}

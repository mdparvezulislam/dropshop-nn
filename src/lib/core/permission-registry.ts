/**
 * Permission Registry — Centralized permission definitions for the entire platform.
 *
 * Every module registers its own permissions here. Future modules require ZERO
 * authorization code changes — just register permissions and use them.
 *
 * Format: "module.resource.action" (e.g., "products.product.view")
 * Special: "*" means full access (Super Admin)
 */

export interface PermissionDefinition {
  module: string;
  resource: string;
  action: string;
  description: string;
}

export interface ModulePermissionGroup {
  module: string;
  description: string;
  permissions: PermissionDefinition[];
}

export interface PermissionRegistrySnapshot {
  modules: string[];
  permissions: PermissionDefinition[];
  permissionStrings: string[];
  moduleMap: Map<string, PermissionDefinition[]>;
}

const registry = new Map<string, PermissionDefinition[]>();
let frozen = false;
let snapshotCache: PermissionRegistrySnapshot | null = null;

export function registerModule(module: string, permissions: PermissionDefinition[]): void {
  if (frozen) {
    throw new Error(`Permission registry is frozen. Cannot register module: ${module}`);
  }
  const normalized = permissions.map((p) => ({
    ...p,
    module: p.module.toLowerCase(),
    resource: p.resource.toLowerCase(),
    action: p.action.toLowerCase(),
  }));
  registry.set(module.toLowerCase(), normalized);
  snapshotCache = null;
}

export function registerModules(groups: ModulePermissionGroup[]): void {
  for (const group of groups) {
    registerModule(group.module, group.permissions);
  }
}

export function freezeRegistry(): void {
  frozen = true;
  snapshotCache = null;
}

export function isRegistryFrozen(): boolean {
  return frozen;
}

export function getAllPermissions(): PermissionDefinition[] {
  const snapshot = getSnapshot();
  return snapshot.permissions;
}

export function getModulePermissions(module: string): PermissionDefinition[] {
  return registry.get(module.toLowerCase()) || [];
}

export function getModules(): string[] {
  return Array.from(registry.keys()).sort();
}

export function getModuleMap(): Map<string, PermissionDefinition[]> {
  return new Map(registry);
}

export function isValidPermission(permission: string): boolean {
  if (permission === "*") return true;
  const snapshot = getSnapshot();
  return snapshot.permissionStrings.includes(permission.toLowerCase());
}

export function buildPermission(module: string, resource: string, action: string): string {
  return `${module.toLowerCase()}.${resource.toLowerCase()}.${action.toLowerCase()}`;
}

export function parsePermission(permission: string): { module: string; resource: string; action: string } | null {
  if (permission === "*") return { module: "*", resource: "*", action: "*" };
  const parts = permission.split(".");
  if (parts.length !== 3) {
    if (parts.length === 2) {
      return { module: parts[0], resource: parts[0], action: parts[1] };
    }
    return null;
  }
  return { module: parts[0], resource: parts[1], action: parts[2] };
}

export function validatePermissions(permissions: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const p of permissions) {
    if (isValidPermission(p)) {
      valid.push(p);
    } else {
      invalid.push(p);
    }
  }
  return { valid, invalid };
}

export function getPermissionGroups(): ModulePermissionGroup[] {
  const groups: ModulePermissionGroup[] = [];
  for (const [module, permissions] of registry) {
    groups.push({
      module,
      description: `${module.charAt(0).toUpperCase() + module.slice(1)} module permissions`,
      permissions,
    });
  }
  return groups.sort((a, b) => a.module.localeCompare(b.module));
}

export function searchPermissions(query: string): PermissionDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllPermissions();
  return getAllPermissions().filter(
    (p) =>
      p.module.includes(q) ||
      p.resource.includes(q) ||
      p.action.includes(q) ||
      p.description.includes(q) ||
      `${p.module}.${p.resource}.${p.action}`.includes(q),
  );
}

function getSnapshot(): PermissionRegistrySnapshot {
  if (snapshotCache) return snapshotCache;
  const permissions: PermissionDefinition[] = [];
  const permissionStrings: string[] = [];
  const moduleMap = new Map<string, PermissionDefinition[]>();

  for (const [module, perms] of registry) {
    moduleMap.set(module, perms);
    for (const p of perms) {
      permissions.push(p);
      permissionStrings.push(`${p.module}.${p.resource}.${p.action}`);
    }
  }

  snapshotCache = {
    modules: Array.from(registry.keys()).sort(),
    permissions,
    permissionStrings,
    moduleMap,
  };
  return snapshotCache;
}

/**
 * Build the complete permission list for a given module from action lists.
 * Utility for module registration.
 */
export function buildModulePermissions(
  module: string,
  resources: string[],
  actions: string[],
  customActions?: { resource: string; actions: string[] }[],
): PermissionDefinition[] {
  const permissions: PermissionDefinition[] = [];

  for (const resource of resources) {
    for (const action of actions) {
      permissions.push({
        module,
        resource,
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
      });
    }
  }

  if (customActions) {
    for (const { resource, actions: custom } of customActions) {
      for (const action of custom) {
        permissions.push({
          module,
          resource,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
        });
      }
    }
  }

  return permissions;
}

export default {
  registerModule,
  registerModules,
  freezeRegistry,
  isRegistryFrozen,
  getAllPermissions,
  getModulePermissions,
  getModules,
  getModuleMap,
  isValidPermission,
  buildPermission,
  parsePermission,
  validatePermissions,
  getPermissionGroups,
  searchPermissions,
  buildModulePermissions,
};

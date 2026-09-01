/**
 * UI helpers for permission-based visibility in client components.
 *
 * These functions are safe to use in client components and don't import
 * any server-only code (like next/headers or database).
 */

/**
 * Check if a nav item should be shown based on user permissions.
 * For use in client-side sidebar components.
 *
 * @param permissions - Array of permission keys the user has (or undefined to show all)
 * @param requiredPermission - The permission key required to show the nav item
 * @returns true if the item should be shown
 */
export function canShowNav(permissions: string[] | undefined, requiredPermission: string): boolean {
  // If permissions not provided, assume all are allowed (for backward compatibility during migration)
  if (permissions === undefined) return true;
  return permissions.includes(requiredPermission);
}

/**
 * Check if a nav item should be shown based on having ANY of the required permissions.
 * For use in client-side sidebar components.
 *
 * @param permissions - Array of permission keys the user has (or undefined to show all)
 * @param requiredPermissions - Array of permission keys, user needs at least one
 * @returns true if the item should be shown
 */
export function canShowNavAny(permissions: string[] | undefined, requiredPermissions: string[]): boolean {
  if (permissions === undefined) return true;
  return requiredPermissions.some((p) => permissions.includes(p));
}

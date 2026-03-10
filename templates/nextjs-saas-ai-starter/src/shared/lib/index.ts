/**
 * Shared Library - Barrel Export
 *
 * Central export for all shared utilities.
 */

export * from './utils';
export * from './env';
export * from './tenant';
export * from './api-errors';
export * from './logger';
export * from './tenant-settings';
export * from './a11y';
export * from './dark-mode-utils';
export * from './component-enhancements';

// Auth exports (selective to avoid circular deps)
export { auth, signIn, signOut } from './auth';

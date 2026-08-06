/**
 * GitHub Integration Constants
 *
 * OAuth endpoints and configuration for GitHub OAuth App integration.
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */

// OAuth endpoints
export const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

// API base URL
export const GITHUB_API_BASE_URL = 'https://api.github.com';

// Provider ID for the accounts table
export const GITHUB_PROVIDER_ID = 'github';

/**
 * OAuth scopes required for our integration.
 * - read:user  → Read user profile info
 * - user:email → Access email addresses
 * - read:org   → Read org and team membership (for matching to app persons)
 * - repo       → Access private repos (needed for contribution stats on private repos)
 *
 * If you only want public repo access, remove 'repo' and use 'public_repo' instead.
 */
export const GITHUB_REQUIRED_SCOPES = ['read:user', 'user:email', 'read:org', 'repo'] as const;

/**
 * GitHub language → tag mapping.
 * Maps common GitHub repository languages to canonical skill names.
 */
export const GITHUB_LANGUAGE_SKILL_MAP: Record<string, string> = {
  TypeScript: 'TypeScript',
  JavaScript: 'JavaScript',
  Python: 'Python',
  Java: 'Java',
  Go: 'Go',
  Rust: 'Rust',
  'C#': 'C#',
  'C++': 'C++',
  C: 'C',
  Ruby: 'Ruby',
  PHP: 'PHP',
  Swift: 'Swift',
  Kotlin: 'Kotlin',
  Scala: 'Scala',
  Dart: 'Dart',
  Shell: 'Shell Scripting',
  HTML: 'HTML',
  CSS: 'CSS',
  SCSS: 'SCSS',
  Vue: 'Vue.js',
  Svelte: 'Svelte',
  Elixir: 'Elixir',
  Haskell: 'Haskell',
  Lua: 'Lua',
  R: 'R',
  MATLAB: 'MATLAB',
  'Objective-C': 'Objective-C',
  Perl: 'Perl',
  Clojure: 'Clojure',
  Dockerfile: 'Docker',
  HCL: 'Terraform',
  Nix: 'Nix',
} as const;

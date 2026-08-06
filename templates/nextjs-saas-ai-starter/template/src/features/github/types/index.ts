/**
 * GitHub Integration Types
 */

/** GitHub OAuth token response */
export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/** Simplified GitHub user profile */
export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
}

/** Simplified GitHub repository */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  archived: boolean;
  fork: boolean;
}

/** GitHub org membership */
export interface GitHubOrg {
  login: string;
  id: number;
  description: string | null;
  avatar_url: string;
}

/** Contribution stats for a user */
export interface GitHubContributionSummary {
  totalCommits: number;
  totalPRs: number;
  totalReviews: number;
  totalIssues: number;
  languages: Record<string, number>; // language -> byte count
  topRepos: Array<{
    name: string;
    fullName: string;
    language: string | null;
    commits: number;
    url: string;
  }>;
}

/** Sync result from GitHub */
export interface GitHubSyncResult {
  personUsername: string;
  reposScanned: number;
  languagesFound: string[];
  contributionsSynced: number;
  errors: string[];
}

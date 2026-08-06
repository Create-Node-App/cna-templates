/**
 * GitHub API Client using Octokit (official GitHub SDK).
 *
 * Provides typed access to GitHub's REST API for:
 * - User profiles and organizations
 * - Repositories and languages
 * - Contributions (commits, PRs, reviews)
 *
 * @see https://github.com/octokit/octokit.js
 */

import { Octokit } from 'octokit';

import type { GitHubContributionSummary, GitHubOrg, GitHubRepo, GitHubUser } from '../types';

export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  // ============================================================================
  // User & Auth
  // ============================================================================

  /**
   * Get the authenticated user's profile.
   */
  async getAuthenticatedUser(): Promise<GitHubUser> {
    const { data: user } = await this.octokit.rest.users.getAuthenticated();
    return {
      login: user.login,
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      bio: user.bio ?? null,
      company: user.company ?? null,
      location: user.location ?? null,
      blog: user.blog ?? null,
    };
  }

  /**
   * Test the connection by fetching the authenticated user.
   * Returns { success: true, user } or { success: false, error }.
   */
  async testConnection(): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
    try {
      const user = await this.getAuthenticatedUser();
      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a specific user's profile by username.
   */
  async getUserByUsername(username: string): Promise<GitHubUser> {
    const { data: user } = await this.octokit.rest.users.getByUsername({ username });
    return {
      login: user.login,
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      bio: user.bio ?? null,
      company: user.company ?? null,
      location: user.location ?? null,
      blog: user.blog ?? null,
    };
  }

  // ============================================================================
  // Organizations
  // ============================================================================

  /**
   * List organizations the authenticated user belongs to.
   */
  async listOrgs(): Promise<GitHubOrg[]> {
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser({ per_page: 100 });
    return data.map((org) => ({
      login: org.login,
      id: org.id,
      description: org.description ?? null,
      avatar_url: org.avatar_url,
    }));
  }

  /**
   * List members of an organization.
   */
  async listOrgMembers(org: string): Promise<Array<{ login: string; id: number; avatar_url: string }>> {
    const members: Array<{ login: string; id: number; avatar_url: string }> = [];

    for await (const response of this.octokit.paginate.iterator(this.octokit.rest.orgs.listMembers, {
      org,
      per_page: 100,
    })) {
      for (const member of response.data) {
        members.push({
          login: member.login,
          id: member.id,
          avatar_url: member.avatar_url,
        });
      }
    }

    return members;
  }

  // ============================================================================
  // Repositories
  // ============================================================================

  /**
   * List repositories for a given user (or the authenticated user).
   * Can filter by type (owner, member, all).
   */
  async listUserRepos(
    username?: string,
    options: { type?: 'owner' | 'member' | 'all'; sort?: 'pushed' | 'updated' | 'created'; perPage?: number } = {},
  ): Promise<GitHubRepo[]> {
    const { type = 'owner', sort = 'pushed', perPage = 100 } = options;

    if (!username) {
      // Authenticated user's repos
      const repos: GitHubRepo[] = [];
      for await (const response of this.octokit.paginate.iterator(this.octokit.rest.repos.listForAuthenticatedUser, {
        type,
        sort,
        per_page: perPage,
        direction: 'desc',
      })) {
        for (const repo of response.data) {
          repos.push(this.mapRepo(repo));
        }
        // Limit to 500 repos to avoid excessive API calls
        if (repos.length >= 500) break;
      }
      return repos;
    }

    // Specific user's repos
    const repos: GitHubRepo[] = [];
    for await (const response of this.octokit.paginate.iterator(this.octokit.rest.repos.listForUser, {
      username,
      sort,
      per_page: perPage,
      direction: 'desc',
    })) {
      for (const repo of response.data) {
        repos.push(this.mapRepo(repo));
      }
      if (repos.length >= 500) break;
    }
    return repos;
  }

  /**
   * List repositories in an organization.
   */
  async listOrgRepos(
    org: string,
    options: {
      type?: 'all' | 'public' | 'private' | 'forks' | 'sources';
      sort?: 'pushed' | 'updated' | 'created';
    } = {},
  ): Promise<GitHubRepo[]> {
    const { type = 'sources', sort = 'pushed' } = options;

    const repos: GitHubRepo[] = [];
    for await (const response of this.octokit.paginate.iterator(this.octokit.rest.repos.listForOrg, {
      org,
      type,
      sort,
      per_page: 100,
      direction: 'desc',
    })) {
      for (const repo of response.data) {
        repos.push(this.mapRepo(repo));
      }
      if (repos.length >= 500) break;
    }
    return repos;
  }

  /**
   * Get languages used in a repository.
   * Returns a map of language -> byte count.
   */
  async getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    const { data } = await this.octokit.rest.repos.listLanguages({ owner, repo });
    return data;
  }

  // ============================================================================
  // Contributions
  // ============================================================================

  /**
   * Get contribution summary for a user across their repos.
   * Scans recent repos and aggregates commits, PRs, reviews, and languages.
   */
  async getUserContributionSummary(
    username: string,
    options: { maxRepos?: number; sinceDays?: number } = {},
  ): Promise<GitHubContributionSummary> {
    const { maxRepos = 50, sinceDays = 365 } = options;
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    const sinceISO = since.toISOString();

    // Get repos the user has contributed to
    const repos = await this.listUserRepos(username, { type: 'owner', sort: 'pushed' });
    const recentRepos = repos.filter((r) => !r.archived && !r.fork).slice(0, maxRepos);

    const summary: GitHubContributionSummary = {
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
      totalIssues: 0,
      languages: {},
      topRepos: [],
    };

    // Process each repo
    for (const repo of recentRepos) {
      const [owner, repoName] = repo.full_name.split('/');

      try {
        // Get commit count for this user in this repo
        const commits = await this.getCommitCountForUser(owner, repoName, username, sinceISO);

        // Aggregate languages
        const languages = await this.getRepoLanguages(owner, repoName);
        for (const [lang, bytes] of Object.entries(languages)) {
          summary.languages[lang] = (summary.languages[lang] ?? 0) + bytes;
        }

        summary.totalCommits += commits;

        if (commits > 0) {
          summary.topRepos.push({
            name: repo.name,
            fullName: repo.full_name,
            language: repo.language,
            commits,
            url: repo.html_url,
          });
        }
      } catch {
        // Skip repos where we don't have access
        continue;
      }
    }

    // Sort top repos by commits
    summary.topRepos.sort((a, b) => b.commits - a.commits);
    summary.topRepos = summary.topRepos.slice(0, 20);

    // Get PR and issue counts via search API
    try {
      const { data: prSearch } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr created:>=${sinceISO.split('T')[0]}`,
        per_page: 1,
      });
      summary.totalPRs = prSearch.total_count;
    } catch {
      // Search API rate limit, skip
    }

    try {
      const { data: issueSearch } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue created:>=${sinceISO.split('T')[0]}`,
        per_page: 1,
      });
      summary.totalIssues = issueSearch.total_count;
    } catch {
      // Search API rate limit, skip
    }

    return summary;
  }

  /**
   * Get commit count for a specific user in a repo since a date.
   */
  private async getCommitCountForUser(owner: string, repo: string, author: string, since: string): Promise<number> {
    try {
      // Use the commits list endpoint with author filter
      const { data } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        author,
        since,
        per_page: 1,
      });

      // GitHub doesn't return total count in the response, but we can check the Link header
      // For simplicity, use the first page count. For accuracy on high-commit repos,
      // we'd need to follow pagination, but this is good enough for contribution summaries.
      if (data.length === 0) return 0;

      // Use a paginated approach to get actual count, limited to avoid excessive API usage
      let count = 0;
      for await (const response of this.octokit.paginate.iterator(this.octokit.rest.repos.listCommits, {
        owner,
        repo,
        author,
        since,
        per_page: 100,
      })) {
        count += response.data.length;
        // Cap at 1000 commits per repo to avoid excessive API calls
        if (count >= 1000) break;
      }

      return count;
    } catch {
      return 0;
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRepo(repo: any): GitHubRepo {
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description ?? null,
      language: repo.language ?? null,
      stargazers_count: repo.stargazers_count ?? 0,
      forks_count: repo.forks_count ?? 0,
      topics: repo.topics ?? [],
      pushed_at: repo.pushed_at ?? null,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      archived: repo.archived ?? false,
      fork: repo.fork ?? false,
    };
  }
}

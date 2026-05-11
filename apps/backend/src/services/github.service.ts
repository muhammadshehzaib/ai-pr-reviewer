import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Fetches the combined code diff between two commits or base/head of a PR.
   */
  async fetchDiff(owner: string, repo: string, base: string, head: string): Promise<string> {
    try {
      console.log(`📦 Fetching Diff: ${owner}/${repo} (Comparing ${base} -> ${head})`);

      const { data } = await this.octokit.repos.compareCommits({
        owner,
        repo,
        base,
        head,
        headers: {
          accept: 'application/vnd.github.v3.diff',
        },
      });

      return data as unknown as string;
    } catch (error) {
      console.error('🔴 GitHub Diff Fetch Failure:', error);
      throw new Error('Failed to extract diff from GitHub API');
    }
  }

  /**
   * Places persistent constructive criticism directly onto specific lines within a PR.
   */
  async createReviewComment(
    owner: string,
    repo: string,
    pullNumber: number,
    commitId: string,
    path: string,
    line: number,
    body: string,
  ) {
    try {
      await this.octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId,
        path,
        line,
        body,
        side: 'RIGHT',
      });
      console.log(`💬 Posted comment successfully to line ${line} of ${path}`);
    } catch (err) {
      console.warn(`⚠️ Ignored failed comment injection to line ${line}:`, (err as Error).message);
    }
  }

  /**
   * Registers a webhook on the repo pointing back at our ingestion endpoint.
   * Returns the GitHub-assigned hook id (as a string) so we can later delete it.
   */
  async createWebhook(
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string | undefined,
  ): Promise<string> {
    const { data } = await this.octokit.repos.createWebhook({
      owner,
      repo,
      events: ['pull_request', 'push'],
      active: true,
      config: {
        url: webhookUrl,
        content_type: 'json',
        ...(secret ? { secret } : {}),
        insecure_ssl: '0',
      },
    });
    return String(data.id);
  }

  async deleteWebhook(owner: string, repo: string, hookId: number) {
    await this.octokit.repos.deleteWebhook({ owner, repo, hook_id: hookId });
  }

  /**
   * Looks up basic repo metadata (used to capture the numeric github repo id at registration time).
   */
  async getRepo(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data;
  }

  /**
   * Resolves the head SHA for a pull request — used by the manual-trigger flow,
   * which doesn't have a webhook payload to read from.
   */
  async getPullRequest(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.get({ owner, repo, pull_number: pullNumber });
    return data;
  }
}

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
      
      // We fetch via the generic comparison endpoint
      const { data } = await this.octokit.repos.compareCommits({
        owner,
        repo,
        base,
        head,
        headers: {
          accept: 'application/vnd.github.v3.diff', // CRITICAL: Forces text diff response!
        },
      });

      // Because we changed headers to text/diff, octokit returns string
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
    body: string
  ) {
    try {
      await this.octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId, // Ensure comment aligns mathematically with correct git hash
        path,
        line,
        body,
        side: 'RIGHT', // Targets the 'New' changes side of the diff view
      });
      console.log(`💬 Posted comment successfully to line ${line} of ${path}`);
    } catch (err) {
      // Non-blocking fail: log, but don't crash the entire analysis fleet if one comment has bad coords.
      console.warn(`⚠️ Ignored failed comment injection to line ${line}:`, (err as Error).message);
    }
  }
}

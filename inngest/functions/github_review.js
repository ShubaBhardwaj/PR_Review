import { inngest } from '../client.js';
import { octokit } from '../../lib/github.js';
import { run } from '@openai/agents';
import { githubPRreviewAgent } from '../../agents/github-pr-review-agent.js';

export const pullRequestReviewed = inngest.createFunction(
  {
    id: 'github_pr_reviewed',
    triggers: [{ event: 'github/pullrequest.review' }],
  },
  async ({ event, step }) => {
    const { owner, repo, pull_number } = event.data;

    // 1st step: fetch the PR details from GitHub
    const pullRequestInfor = await step.run(
      'fetch-pull-request-information',
      async () => {
        try {
          const pullRequestObject = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number,
          });
          return {
            id: pullRequestObject.data.id,
            title: pullRequestObject.data.title,
            state: pullRequestObject.data.state,
            pull_number: pullRequestObject.data.number,
            comments: pullRequestObject.data.comments,
            url: pullRequestObject.data.url,
            diffURL: pullRequestObject.data.diff_url,
            commints: pullRequestObject.data.commits,
            changes: pullRequestObject.data.changed_files,
          };
        } catch (error) {
          return null;
        }
      }
    );

    if (!pullRequestInfor) {
      return { message: 'Pull request is not found', skipped: true };
    }

    if (pullRequestInfor.state !== 'open') {
      return {
        message: 'Pull request is not open, Skipping the review',
        skipped: true,
        completed: false,
      };
    }

    // 2nd step: fetch the changes

    const changes = await step.run('fetch-pull-request-changes', async () => {
      const changeReslult = await octokit.paginate(
        octokit.rest.pulls.listFiles,
        {
          owner,
          repo,
          pull_number,
          per_page: 100,
        }
      );

      return changeReslult.map((change) => ({
        fileName: change.filename,
        changeStatus: change.status,
        changes: change.changes,
        patch: change.patch,
        addition: change.additions,
        deletions: change.deletions,
        previous_filename: change.previous_filename,
      }));
    });

    if (!changes || changes.length === 0) {
      return { message: 'No changes found', skipped: true };
    }

    await step.run('ai-analysis', async () => {
      const llmResponse = await run(githubPRreviewAgent, `
        Pull Request information:
        ${JSON.stringify(pullRequestInfor, null, 2)}
        \n\n\n
        Change:
        ${JSON.stringify(changes, null, 2)}
        `);

        return {result: llmResponse.finalOutput}
    });
  }
);

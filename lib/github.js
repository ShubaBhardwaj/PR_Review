import { Octokit } from "octokit";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'pull-request-review-bot v1.0.0',
});

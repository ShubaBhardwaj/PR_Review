import { inngest } from "../client.js";

export const pullRequestReviewed = inngest.createFunction(
    {id: "github_pr_reviewed", },
    trigger => [{
        event: "github/pullrequest.review",
    }],
)
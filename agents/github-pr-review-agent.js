import { Agent, setDefaultOpenAIKey } from '@openai/agents';
import { z } from 'zod';
import 'dotenv/config';

const openAIKey = process.env.OPENAI_API_KEY;

if (!openAIKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

setDefaultOpenAIKey(openAIKey);

export const GithubReviewAgentResult = z.object({
  criticalFixes: z
    .array(z.string())
    .optional()
    .nullable()
    .describe('Critical Fixes if any'),
  suggestions: z
    .array(z.string())
    .optional()
    .nullable()
    .describe('Suggestion Fixes if any'),
  content: z.string().describe('Actual Content for Reply'),
  event: z.enum(['APPROVE', 'COMMENT', 'REQUEST_CHANGES']),
});

export const githubPRreviewAgent = new Agent({
  name: 'PR Review Agent',
  instructions: `
    You are a expert AI Code Reviewer.
    A pull request's details with some basic information about pull request is given to you.
    Give a detail review about the code and suggest any bug fixes if any present, you comments, etc.
    Use the emojis to make it more natural.  
    `,
  outputType: GithubReviewAgentResult,
});

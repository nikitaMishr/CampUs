'use server';
/**
 * @fileOverview An AI agent for triaging newly reported campus issues.
 *
 * - triageIssue - A function that handles the issue triage process, summarizing and categorizing issues.
 * - IssueTriageInput - The input type for the triageIssue function.
 * - IssueTriageOutput - The return type for the triageIssue function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IssueTriageInputSchema = z.object({
  issueDescription: z
    .string()
    .describe('A detailed description of the reported issue.'),
  issuePhotoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IssueTriageInput = z.infer<typeof IssueTriageInputSchema>;

const IssueTriageOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the reported issue.'),
  suggestedCategories: z
    .array(z.string())
    .describe('An array of 1-3 suggested categories for the issue.'),
});
export type IssueTriageOutput = z.infer<typeof IssueTriageOutputSchema>;

export async function triageIssue(
  input: IssueTriageInput
): Promise<IssueTriageOutput> {
  return issueTriageFlow(input);
}

const triageIssuePrompt = ai.definePrompt({
  name: 'triageIssuePrompt',
  input: { schema: IssueTriageInputSchema },
  output: { schema: IssueTriageOutputSchema },
  prompt: `You are an AI assistant tasked with triaging newly reported campus issues. Your goal is to provide a concise summary of the issue and suggest relevant categories to help administrators quickly understand and classify the problem.

Based on the following information, summarize the issue and provide a list of appropriate categories.

Issue Description: {{{issueDescription}}}
{{#if issuePhotoDataUri}}
Photo: {{media url=issuePhotoDataUri}}
{{/if}}

The suggested categories should be broad and relevant to campus maintenance or operations, such as 'Plumbing', 'Electrical', 'Structural', 'Network', 'Software', 'General Maintenance', 'Safety', 'Accessibility', 'Environmental', 'Furniture', 'HVAC', 'Cleaning', 'Security'. Choose 1-3 most relevant categories.

Please provide your response in a JSON object with the following structure:
{
  "summary": "A concise summary of the issue.",
  "suggestedCategories": ["Category1", "Category2"]
}`,
});

const issueTriageFlow = ai.defineFlow(
  {
    name: 'issueTriageFlow',
    inputSchema: IssueTriageInputSchema,
    outputSchema: IssueTriageOutputSchema,
  },
  async (input) => {
    const { output } = await triageIssuePrompt(input);
    return output!;
  }
);

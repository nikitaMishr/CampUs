'use server';
/**
 * @fileOverview A Genkit flow for matching lost and found items based on descriptions and images.
 *
 * - matchLostFoundItems - A function that handles the lost and found item matching process.
 * - LostFoundMatchInput - The input type for the matchLostFoundItems function.
 * - LostFoundMatchOutput - The return type for the matchLostFoundItems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LostFoundMatchInputSchema = z.object({
  lostItemDescription: z.string().describe('Description of the lost item.'),
  lostItemImageDataUri: z
    .string()
    .optional()
    .describe(
      "Data URI of the lost item's image. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  foundItemDescription: z.string().describe('Description of the found item.'),
  foundItemImageDataUri: z
    .string()
    .optional()
    .describe(
      "Data URI of the found item's image. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type LostFoundMatchInput = z.infer<typeof LostFoundMatchInputSchema>;

const LostFoundMatchOutputSchema = z.object({
  isMatch: z.boolean().describe('True if the items are considered a potential match, false otherwise.'),
  reasoning: z.string().describe('Explanation for why the items are or are not considered a match.'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the match, where 100 is highly confident.'),
});
export type LostFoundMatchOutput = z.infer<typeof LostFoundMatchOutputSchema>;

export async function matchLostFoundItems(input: LostFoundMatchInput): Promise<LostFoundMatchOutput> {
  return lostFoundMatcherFlow(input);
}

const lostFoundMatchPrompt = ai.definePrompt({
  name: 'lostFoundMatchPrompt',
  input: { schema: LostFoundMatchInputSchema },
  output: { schema: LostFoundMatchOutputSchema },
  prompt: `You are an expert in matching lost and found items. Your task is to determine if a lost item and a found item are potentially the same item, based on their descriptions and any provided images.

Lost Item Description: {{{lostItemDescription}}}
{{#if lostItemImageDataUri}}Lost Item Image: {{media url=lostItemImageDataUri}}{{/if}}

Found Item Description: {{{foundItemDescription}}}
{{#if foundItemImageDataUri}}Found Item Image: {{media url=foundItemImageDataUri}}{{/if}}

Based on the information above, carefully analyze both items. Consider all details from the descriptions and visual cues from the images to determine if they are a potential match. Provide your reasoning and a confidence score from 0 (no match) to 100 (definite match).`,
});

const lostFoundMatcherFlow = ai.defineFlow(
  {
    name: 'lostFoundMatcherFlow',
    inputSchema: LostFoundMatchInputSchema,
    outputSchema: LostFoundMatchOutputSchema,
  },
  async (input) => {
    const { output } = await lostFoundMatchPrompt(input);
    return output!;
  }
);

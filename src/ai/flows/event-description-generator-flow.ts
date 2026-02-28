'use server';
/**
 * @fileOverview A Genkit flow for generating compelling event descriptions based on provided details.
 *
 * - generateEventDescription - A function that handles the event description generation process.
 * - EventDescriptionGeneratorInput - The input type for the generateEventDescription function.
 * - EventDescriptionGeneratorOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventDescriptionGeneratorInputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  date: z
    .string()
    .describe('The date and time of the event (e.g., "October 26, 2024, 10:00 AM - 12:00 PM").'),
  venue: z.string().describe('The venue where the event will take place.'),
  departments:
    z.array(z.string()).describe('A list of departments for which the event is relevant.'),
});
export type EventDescriptionGeneratorInput =
  z.infer<typeof EventDescriptionGeneratorInputSchema>;

const EventDescriptionGeneratorOutputSchema = z.object({
  description:
    z.string().describe('A compelling and detailed description for the event.'),
});
export type EventDescriptionGeneratorOutput =
  z.infer<typeof EventDescriptionGeneratorOutputSchema>;

/**
 * Generates a compelling and detailed event description based on key event information.
 * @param input - The event details including title, date, venue, and target departments.
 * @returns A promise that resolves to an object containing the generated event description.
 */
export async function generateEventDescription(
  input: EventDescriptionGeneratorInput
): Promise<EventDescriptionGeneratorOutput> {
  return eventDescriptionGeneratorFlow(input);
}

const eventDescriptionPrompt = ai.definePrompt({
  name: 'eventDescriptionPrompt',
  input: {schema: EventDescriptionGeneratorInputSchema},
  output: {schema: EventDescriptionGeneratorOutputSchema},
  prompt: `You are an expert event planner and copywriter. Your task is to create a compelling and detailed event description based on the provided information. The description should be engaging, informative, and encourage participation. Aim for a tone that is both professional and exciting.

Here are the event details:

Event Title: {{{title}}}
Date and Time: {{{date}}}
Venue: {{{venue}}}
Target Departments: {{#each departments}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Craft a description that clearly highlights the event's purpose, what attendees can expect to gain, and why they should not miss this opportunity. Use persuasive language and include a strong call to action.`,
});

const eventDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'eventDescriptionGeneratorFlow',
    inputSchema: EventDescriptionGeneratorInputSchema,
    outputSchema: EventDescriptionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await eventDescriptionPrompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview An AI tool that derives themes from existing testimonials and crafts entirely new testimonials based on these themes.
 *
 * - craftNewTestimonialsFromThemes - A function that handles the creation of new testimonials based on themes derived from existing ones.
 * - CraftNewTestimonialsFromThemesInput - The input type for the craftNewTestimonialsFromThemes function.
 * - CraftNewTestimonialsFromThemesOutput - The return type for the craftNewTestimonialsFromThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CraftNewTestimonialsFromThemesInputSchema = z.object({
  existingTestimonials: z.array(z.string()).describe('An array of existing customer testimonials.'),
  numberOfNewTestimonials: z.number().describe('The number of new testimonials to generate.'),
});
export type CraftNewTestimonialsFromThemesInput = z.infer<
  typeof CraftNewTestimonialsFromThemesInputSchema
>;

const CraftNewTestimonialsFromThemesOutputSchema = z.object({
  newTestimonials: z.array(z.string()).describe('An array of new customer testimonials.'),
});
export type CraftNewTestimonialsFromThemesOutput = z.infer<
  typeof CraftNewTestimonialsFromThemesOutputSchema
>;

export async function craftNewTestimonialsFromThemes(
  input: CraftNewTestimonialsFromThemesInput
): Promise<CraftNewTestimonialsFromThemesOutput> {
  return craftNewTestimonialsFromThemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'craftNewTestimonialsFromThemesPrompt',
  input: {schema: CraftNewTestimonialsFromThemesInputSchema},
  output: {schema: CraftNewTestimonialsFromThemesOutputSchema},
  prompt: `You are a marketing expert tasked with crafting new customer testimonials based on common themes found in existing testimonials.

  Your goal is to generate {{numberOfNewTestimonials}} new testimonials that reflect the general sentiment and key themes present in the following existing testimonials:

  {{#each existingTestimonials}}
  - "{{this}}"
  {{/each}}

  Ensure that the new testimonials sound authentic and highlight different aspects of customer satisfaction. Each testimonial should be concise and impactful.

  Format your response as a JSON object with a single key called "newTestimonials" which contains an array of strings.
  `,
});

const craftNewTestimonialsFromThemesFlow = ai.defineFlow(
  {
    name: 'craftNewTestimonialsFromThemesFlow',
    inputSchema: CraftNewTestimonialsFromThemesInputSchema,
    outputSchema: CraftNewTestimonialsFromThemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

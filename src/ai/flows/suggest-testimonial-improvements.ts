'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting improvements to existing testimonials.
 *
 * It takes an existing testimonial as input and returns a suggestion for improvement using the LLM.
 * The flow uses a prompt that leverages the existing testimonials to create more impactful and persuasive versions.
 *
 * @exported
 * - `suggestTestimonialImprovement`: The main function to call for suggesting testimonial improvements.
 * - `SuggestTestimonialImprovementInput`: The input type for the suggestTestimonialImprovement function.
 * - `SuggestTestimonialImprovementOutput`: The output type for the suggestTestimonialImprovement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTestimonialImprovementInputSchema = z.object({
  existingTestimonial: z
    .string()
    .describe('The existing testimonial that needs improvement.'),
});
export type SuggestTestimonialImprovementInput = z.infer<
  typeof SuggestTestimonialImprovementInputSchema
>;

const SuggestTestimonialImprovementOutputSchema = z.object({
  improvedTestimonial: z
    .string()
    .describe('The improved testimonial suggestion.'),
});
export type SuggestTestimonialImprovementOutput = z.infer<
  typeof SuggestTestimonialImprovementOutputSchema
>;

export async function suggestTestimonialImprovement(
  input: SuggestTestimonialImprovementInput
): Promise<SuggestTestimonialImprovementOutput> {
  return suggestTestimonialImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTestimonialImprovementPrompt',
  input: {schema: SuggestTestimonialImprovementInputSchema},
  output: {schema: SuggestTestimonialImprovementOutputSchema},
  prompt: `You are an AI marketing assistant tasked with improving customer testimonials to make them more impactful and persuasive.\n\n  Here is the existing testimonial:\n  {{{existingTestimonial}}}
\n  Suggest an improved version of the testimonial that highlights the key benefits and is more compelling to potential customers. Focus on making the testimonial specific, believable, and emotionally resonant.\n\n  Improved Testimonial:`,
});

const suggestTestimonialImprovementFlow = ai.defineFlow(
  {
    name: 'suggestTestimonialImprovementFlow',
    inputSchema: SuggestTestimonialImprovementInputSchema,
    outputSchema: SuggestTestimonialImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

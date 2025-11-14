'use server';

/**
 * @fileOverview An AI tool that generates testimonial drafts based on specified topics.
 *
 * - generateTestimonialDrafts - A function that handles the generation of testimonial drafts.
 * - GenerateTestimonialDraftsInput - The input type for the generateTestimonialDrafts function.
 * - GenerateTestimonialDraftsOutput - The return type for the generateTestimonialDrafts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestimonialDraftsInputSchema = z.object({
  topic: z.string().describe('The topic or theme for the testimonial drafts.'),
  numberOfDrafts: z.number().describe('The number of testimonial drafts to generate.'),
});
export type GenerateTestimonialDraftsInput = z.infer<
  typeof GenerateTestimonialDraftsInputSchema
>;

const GenerateTestimonialDraftsOutputSchema = z.object({
  testimonialDrafts: z.array(z.string()).describe('An array of generated testimonial drafts.'),
});
export type GenerateTestimonialDraftsOutput = z.infer<
  typeof GenerateTestimonialDraftsOutputSchema
>;

export async function generateTestimonialDrafts(
  input: GenerateTestimonialDraftsInput
): Promise<GenerateTestimonialDraftsOutput> {
  return generateTestimonialDraftsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestimonialDraftsPrompt',
  input: {schema: GenerateTestimonialDraftsInputSchema},
  output: {schema: GenerateTestimonialDraftsOutputSchema},
  prompt: `You are a marketing expert tasked with generating customer testimonial drafts based on a specific topic.

  Your goal is to generate {{numberOfDrafts}} testimonial drafts that reflect the theme: {{topic}}.

  Ensure that the drafts sound authentic and highlight different aspects of customer satisfaction related to the specified topic. Each testimonial draft should be concise and impactful.

  Format your response as a JSON object with a single key called "testimonialDrafts" which contains an array of strings.
  `,
});

const generateTestimonialDraftsFlow = ai.defineFlow(
  {
    name: 'generateTestimonialDraftsFlow',
    inputSchema: GenerateTestimonialDraftsInputSchema,
    outputSchema: GenerateTestimonialDraftsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

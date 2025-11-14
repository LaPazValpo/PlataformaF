'use server';

/**
 * @fileOverview A testimonial generation AI agent.
 *
 * - generateTestimonialVariants - A function that handles the generation of testimonial variants.
 * - GenerateTestimonialVariantsInput - The input type for the generateTestimonialVariants function.
 * - GenerateTestimonialVariantsOutput - The return type for the generateTestimonialVariants function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestimonialVariantsInputSchema = z.object({
  existingTestimonial: z
    .string()
    .describe('The existing testimonial to generate variations from.'),
  numVariations: z
    .number()
    .default(3)
    .describe('The number of testimonial variations to generate.'),
});
export type GenerateTestimonialVariantsInput = z.infer<
  typeof GenerateTestimonialVariantsInputSchema
>;

const GenerateTestimonialVariantsOutputSchema = z.object({
  testimonialVariants: z
    .array(z.string())
    .describe('The generated testimonial variations.'),
});
export type GenerateTestimonialVariantsOutput = z.infer<
  typeof GenerateTestimonialVariantsOutputSchema
>;

export async function generateTestimonialVariants(
  input: GenerateTestimonialVariantsInput
): Promise<GenerateTestimonialVariantsOutput> {
  return generateTestimonialVariantsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestimonialVariantsPrompt',
  input: {schema: GenerateTestimonialVariantsInputSchema},
  output: {schema: GenerateTestimonialVariantsOutputSchema},
  prompt: `You are a marketing expert tasked with creating compelling customer testimonials.

  Generate {{numVariations}} variations of the following testimonial, keeping the same overall sentiment but rephrasing for variety and impact:

  Original Testimonial: {{{existingTestimonial}}}

  Ensure each variation is concise and highlights a key benefit or positive aspect of the product or service.
  Return the result as an array of strings.
  `,
});

const generateTestimonialVariantsFlow = ai.defineFlow(
  {
    name: 'generateTestimonialVariantsFlow',
    inputSchema: GenerateTestimonialVariantsInputSchema,
    outputSchema: GenerateTestimonialVariantsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

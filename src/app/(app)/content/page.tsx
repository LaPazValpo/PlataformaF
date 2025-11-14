'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { testimonials } from '@/lib/data';

import { suggestTestimonialImprovement } from '@/ai/flows/suggest-testimonial-improvements';
import { craftNewTestimonialsFromThemes } from '@/ai/flows/craft-new-testimonials-from-themes';
import { generateTestimonialVariants } from '@/ai/flows/generate-testimonial-variants';
import { generateTestimonialDrafts } from '@/ai/flows/generate-testimonial-drafts';

// --- Improve Testimonial Form ---
const improveFormSchema = z.object({
  existingTestimonial: z.string().min(10, {
    message: 'El testimonio debe tener al menos 10 caracteres.',
  }),
});

function ImproveTestimonialForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof improveFormSchema>>({
    resolver: zodResolver(improveFormSchema),
    defaultValues: { existingTestimonial: '' },
  });

  function onSubmit(values: z.infer<typeof improveFormSchema>) {
    startTransition(async () => {
      setResult(null);
      const { improvedTestimonial, error } = await suggestTestimonialImprovement(values);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo mejorar el testimonio.',
        });
        return;
      }
      setResult(improvedTestimonial);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mejorar un Testimonio Existente</CardTitle>
        <CardDescription>
          Pega un testimonio y la IA sugerirá una versión más impactante.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="existingTestimonial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonio a Mejorar</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: 'El servicio fue bueno, lo recomiendo.'" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2" />
              Sugerir Mejora
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && <div className="p-6"><Loader2 className="animate-spin text-muted-foreground" /></div>}
      {result && (
        <Card className="mt-4 border-dashed">
          <CardHeader>
            <CardTitle>Sugerencia de la IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="italic">"{result}"</p>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}

// --- Create From Themes Form ---
const createFromThemesFormSchema = z.object({
  existingTestimonials: z.string().min(10),
  numberOfNewTestimonials: z.coerce.number().min(1).max(5),
});

function CreateFromThemesForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<string[] | null>(null);
  
  const defaultTestimonials = testimonials.map(t => t.quote).join('\n\n');

  const form = useForm<z.infer<typeof createFromThemesFormSchema>>({
    resolver: zodResolver(createFromThemesFormSchema),
    defaultValues: {
      existingTestimonials: defaultTestimonials,
      numberOfNewTestimonials: 3,
    },
  });

  function onSubmit(values: z.infer<typeof createFromThemesFormSchema>) {
    startTransition(async () => {
      setResults(null);
      const { newTestimonials, error } = await craftNewTestimonialsFromThemes({
        existingTestimonials: values.existingTestimonials.split('\n\n').filter(Boolean),
        numberOfNewTestimonials: values.numberOfNewTestimonials,
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron crear los testimonios.' });
        return;
      }
      setResults(newTestimonials);
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevos Testimonios a Partir de Temas</CardTitle>
        <CardDescription>
          La IA analizará los testimonios existentes para encontrar temas comunes y redactará nuevos testimonios.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="existingTestimonials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonios Existentes (separados por doble salto de línea)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfNewTestimonials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Testimonios a Generar</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2" />
              Crear Nuevos Testimonios
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && <div className="p-6"><Loader2 className="animate-spin text-muted-foreground" /></div>}
      {results && (
         <Card className="mt-4 border-dashed">
         <CardHeader>
           <CardTitle>Testimonios Generados</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {results.map((res, index) => (
             <blockquote key={index} className="border-l-2 pl-4 italic">"{res}"</blockquote>
           ))}
         </CardContent>
       </Card>
      )}
    </Card>
  )
}

// --- Generate Variants Form ---
const generateVariantsFormSchema = z.object({
  existingTestimonial: z.string().min(10),
  numVariations: z.coerce.number().min(1).max(5),
});

function GenerateVariantsForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<string[] | null>(null);

  const form = useForm<z.infer<typeof generateVariantsFormSchema>>({
    resolver: zodResolver(generateVariantsFormSchema),
    defaultValues: { existingTestimonial: '', numVariations: 3 },
  });

  function onSubmit(values: z.infer<typeof generateVariantsFormSchema>) {
    startTransition(async () => {
      setResults(null);
      const { testimonialVariants, error } = await generateTestimonialVariants(values);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron generar las variantes.' });
        return;
      }
      setResults(testimonialVariants);
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Variantes de un Testimonio</CardTitle>
        <CardDescription>
          Crea múltiples versiones de un testimonio para usar en diferentes contextos.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="existingTestimonial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonio Original</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Ej: 'Muy profesionales y empáticos en un momento difícil.'"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numVariations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Variantes a Generar</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2" />
              Generar Variantes
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && <div className="p-6"><Loader2 className="animate-spin text-muted-foreground" /></div>}
      {results && (
        <Card className="mt-4 border-dashed">
          <CardHeader>
            <CardTitle>Variantes Generadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((res, index) => (
              <blockquote key={index} className="border-l-2 pl-4 italic">"{res}"</blockquote>
            ))}
          </CardContent>
        </Card>
      )}
    </Card>
  )
}

// --- Generate Drafts Form ---
const generateDraftsFormSchema = z.object({
  topic: z.string().min(3, { message: 'El tema debe tener al menos 3 caracteres.' }),
  numberOfDrafts: z.coerce.number().min(1).max(5),
});

function GenerateDraftsForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<string[] | null>(null);

  const form = useForm<z.infer<typeof generateDraftsFormSchema>>({
    resolver: zodResolver(generateDraftsFormSchema),
    defaultValues: { topic: '', numberOfDrafts: 3 },
  });

  function onSubmit(values: z.infer<typeof generateDraftsFormSchema>) {
    startTransition(async () => {
      setResults(null);
      const { testimonialDrafts, error } = await generateTestimonialDrafts(values);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron generar los borradores.' });
        return;
      }
      setResults(testimonialDrafts);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Borradores de Testimonios</CardTitle>
        <CardDescription>
          Crea borradores de testimonios basados en un tema específico que quieras resaltar.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema del Testimonio</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 'La amabilidad del personal', 'La belleza de la capilla virtual'" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfDrafts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Borradores a Generar</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2" />
              Generar Borradores
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && <div className="p-6"><Loader2 className="animate-spin text-muted-foreground" /></div>}
      {results && (
        <Card className="mt-4 border-dashed">
          <CardHeader>
            <CardTitle>Borradores Generados sobre "{form.getValues('topic')}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((res, index) => (
              <blockquote key={index} className="border-l-2 pl-4 italic">"{res}"</blockquote>
            ))}
          </CardContent>
        </Card>
      )}
    </Card>
  );
}


export default function ContentToolPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Herramienta de Contenido IA"
        description="Potencia tus materiales de marketing con testimonios generados por IA."
      />

      <Tabs defaultValue="improve" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="improve">Mejorar</TabsTrigger>
          <TabsTrigger value="themes">Crear desde Temas</TabsTrigger>
          <TabsTrigger value="variants">Crear Variantes</TabsTrigger>
          <TabsTrigger value="drafts">Crear Borradores</TabsTrigger>
        </TabsList>
        <TabsContent value="improve">
          <ImproveTestimonialForm />
        </TabsContent>
        <TabsContent value="themes">
          <CreateFromThemesForm />
        </TabsContent>
        <TabsContent value="variants">
          <GenerateVariantsForm />
        </TabsContent>
        <TabsContent value="drafts">
          <GenerateDraftsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

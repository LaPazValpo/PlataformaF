import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { testimonials, servicePacks } from '@/lib/data';
import { Check, Quote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === '17');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <svg
              className="h-5 w-5 text-accent-foreground"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="sr-only">Paz Final</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#servicios" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Servicios
          </Link>
          <Link href="#nosotros" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Nosotros
          </Link>
          <Link href="#testimonios" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Testimonios
          </Link>
        </nav>
        <Button asChild className="ml-4">
          <Link href="/intranet/dashboard">Intranet</Link>
        </Button>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {heroImage && (
                  <Image
                  src={heroImage.imageUrl}
                  alt="Hero"
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Dignidad y Respeto en el Último Adiós
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    En Paz Final, ofrecemos servicios funerarios integrales, diseñados para honrar la memoria de sus seres queridos con la compasión y profesionalismo que usted merece.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#servicios"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Ver Servicios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="servicios" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Nuestros Servicios</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Planes para Cada Necesidad</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Ofrecemos una variedad de paquetes para asegurar una despedida respetuosa y acorde a sus deseos, con la flexibilidad de personalizar cada detalle.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {servicePacks.slice(0,3).map((pack) => (
                <Card key={pack.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{pack.title}</CardTitle>
                    <CardDescription>{pack.idealFor}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-4xl font-bold">{pack.price}</div>
                    <ul className="mt-4 grid gap-2 text-muted-foreground">
                      {pack.features.map((feature) => (
                        <li key={feature.title} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {feature.title}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Contactar Asesor</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonios" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Lo que Nuestras Familias Dicen</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                El cuidado y la empatía son el centro de nuestro servicio.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                    <Card key={testimonial.id}>
                        <CardContent className="p-6">
                            <blockquote className="flex flex-col justify-between h-full">
                                <div>
                                    <Quote className="h-6 w-6 text-muted-foreground mb-2"/>
                                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                                </div>
                                <footer className="mt-4">
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.relation}</p>
                                </footer>
                            </blockquote>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </section>
        
        <section id="nosotros" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Nuestra Misión: Acompañar con Calidez y Profesionalismo</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Paz Final nace de la necesidad de brindar un servicio funerario que combine la eficiencia y el respeto con una profunda empatía hacia las familias en duelo. Nuestro equipo está comprometido a aliviar su carga en los momentos más difíciles.
                </p>
              </div>
              <div className="flex justify-center">
                 <Image
                  src="https://images.unsplash.com/photo-1549048050-479b76da4fdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Y2F0ZXJpbmclMjBmb29kfGVufDB8fHx8MTc2MzEzNjg1MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Nuestro Equipo"
                  width={550}
                  height={310}
                  className="rounded-xl object-cover"
                  data-ai-hint="team picture"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Paz Final. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HOME_SERVICES, TESTIMONIALS, HERO_IMAGES } from '@/lib/constants';
import {
  ArrowRight,
  Star,
  BookUser,
  Flower2,
} from 'lucide-react';
import { HeartHandshake, Leaf } from 'lucide-react';
import { CoffinIcon } from '@/components/icons';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import ScrollAnimator from '@/components/common/ScrollAnimator';


const iconMap: { [key: string]: React.ElementType } = {
  HeartHandshake,
  Leaf,
  Coffin: CoffinIcon,
  BookUser,
  Flower2,
};

const ProspectModal = ({ triggerButton }: { triggerButton: React.ReactNode }) => {
    const { toast } = useToast();
    const db = useFirestore();
    const [clientName, setClientName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const resetForm = () => {
        setClientName('');
        setContactNumber('');
        setEmail('');
    };

    const handleSubmit = async () => {
        if (!clientName || !contactNumber || !db) return;

        setIsLoading(true);

        const now = new Date().toISOString();

        const newProspect = {
            clientName,
            contactNumber,
            email,
            sellerId: null,
            sellerName: 'Sin Asignar',
            date: now,
            status: 'Nuevo',
            createdAt: now,
            updatedAt: now,
        };

        const newClient = {
            name: clientName,
            email,
            phone: contactNumber,
            seller: 'Sin Asignar',
            date: now,
            createdAt: now,
            updatedAt: now,
        };

        try {
            const batch = writeBatch(db);
            
            const prospectsCol = collection(db, 'prospects');
            const prospectRef = doc(prospectsCol);
            batch.set(prospectRef, newProspect);

            const clientsCol = collection(db, 'clients');
            const clientRef = doc(clientsCol);
            batch.set(clientRef, newClient);

            await batch.commit();
            
            toast({
                title: 'Solicitud Recibida con Éxito',
                description: `Gracias, ${clientName}. Un asesor se pondrá en contacto con usted a la brevedad.`,
            });
            setIsOpen(false);
            resetForm();

        } catch (serverError) {
             console.error("Error creating prospect and client:", serverError);
             const permissionError = new FirestorePermissionError({
                path: 'prospects or clients',
                operation: 'create',
                requestResourceData: { newProspect, newClient },
             });
             errorEmitter.emit('permission-error', permissionError);
             toast({
                variant: 'destructive',
                title: 'Error al enviar la solicitud',
                description: 'Hubo un problema al registrar su información. Por favor, intente más tarde.',
             });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Solicitar Información</DialogTitle>
                    <DialogDescription>
                        Complete el formulario y uno de nuestros asesores se comunicará con usted para brindarle una atención personalizada.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="prospect-client-name">Nombre Completo<span className='text-destructive'>*</span></Label>
                        <Input id="prospect-client-name" placeholder="Su nombre y apellido" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="prospect-contact-number">Teléfono<span className='text-destructive'>*</span></Label>
                        <Input id="prospect-contact-number" placeholder="Ej: +56 9 1234 5678" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required/>
                    </div>
                     <div>
                        <Label htmlFor="prospect-email">Correo Electrónico (Opcional)</Label>
                        <Input id="prospect-email" type="email" placeholder="su@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading || !clientName || !contactNumber}>
                        {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function Home() {
  const [heroImage, setHeroImage] = useState(HERO_IMAGES[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHeroImage(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
  }, []);
  
  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] min-h-[500px] w-full pt-16 overflow-hidden">
        {isClient && (
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image
                src={heroImage.src}
                alt={heroImage.hint}
                data-ai-hint={heroImage.hint}
                fill
                className="object-cover"
                priority
                key={heroImage.src}
              />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <ScrollAnimator>
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-6xl pt-20">
              Acompañamiento Digno y Respetuoso
            </h1>
          </ScrollAnimator>
          <ScrollAnimator style={{ animationDelay: '0.2s' }}>
            <p className="mt-4 max-w-2xl text-lg text-gray-200">
              En La Paz de Cristo, ofrecemos un apoyo cálido y profesional para
              honrar la memoria de sus seres queridos.
            </p>
          </ScrollAnimator>
          <ScrollAnimator style={{ animationDelay: '0.4s' }}>
            <div>
              <ProspectModal triggerButton={
                <Button className="mt-8" size="lg">Contáctenos</Button>
              } />
            </div>
          </ScrollAnimator>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-16 md:py-24" style={{ backgroundColor: 'hsl(240, 67%, 97%)' }}>
        <div className="container mx-auto px-4">
          <ScrollAnimator>
            <div className="mx-auto max-w-3xl text-left">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Servicios Pensados para Usted
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
               Ofrecemos servicios inmediatos y cremación. Para más detalles, planes de previsión y una atención personalizada, contáctenos.
              </p>
            </div>
          </ScrollAnimator>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {HOME_SERVICES.map((service, index) => {
              const Icon = iconMap[service.icon];
              return (
                <ScrollAnimator key={service.title} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card
                    className="flex flex-col overflow-hidden text-center h-full"
                  >
                    <CardHeader className="flex flex-col items-center gap-4">
                      {Icon && (
                        <div className="rounded-full bg-primary/10 p-3">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <CardTitle className="font-headline text-xl">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollAnimator>
              );
            })}
          </div>
           <ScrollAnimator className="text-center mt-12">
                <ProspectModal triggerButton={
                  <Button size="lg">Ver Catálogo Completo</Button>
                } />
            </ScrollAnimator>
        </div>
      </section>

      {/* TESTIMONIOS SECTION */}
      <section id="testimonios" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <ScrollAnimator>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                El Testimonio de Nuestras Familias
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                La confianza y la gratitud de las familias a las que hemos
                servido es nuestro mayor orgullo.
              </p>
            </div>
          </ScrollAnimator>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <ScrollAnimator key={testimonial.name} style={{ animationDelay: `${index * 0.1}s` }}>
                <Card className="flex flex-col h-full">
                  <CardContent className="pt-6 flex-grow">
                    <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                    </div>
                    <p className="text-muted-foreground italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {testimonial.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.relation}
                        </p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </ScrollAnimator>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="blog" className="py-16 md:py-24" style={{ backgroundColor: 'hsl(240, 67%, 97%)' }}>
        <div className="container mx-auto px-4">
          <ScrollAnimator>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Guías y Recursos de Apoyo
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Artículos para acompañarle y ofrecerle información útil en los
                momentos de duelo.
              </p>
            </div>
          </ScrollAnimator>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
             <ScrollAnimator>
               <Card
                    className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                  >
                    <Link href="/blog">
                      <div className="relative h-48 w-full">
                        <Image
                          src="https://picsum.photos/seed/blog1/600/400"
                          alt="Blog post 1"
                          data-ai-hint="grief support"
                          width={600}
                          height={400}
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <CardHeader>
                      <CardTitle className="font-headline text-xl">
                        <Link href="/blog">Cómo Afrontar el Duelo: Una Guía para Tiempos Difíciles</Link>
                      </CardTitle>
                      <CardDescription>15 de Julio, 2024</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">El duelo es un proceso personal y único. Aquí te ofrecemos algunos consejos para navegar estos momentos complicados y encontrar consuelo.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="link" asChild className="p-0">
                        <Link href="/blog">
                          Leer más <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
             </ScrollAnimator>
             <ScrollAnimator style={{ animationDelay: '0.1s' }}>
                <Card
                  className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <Link href="/blog">
                    <div className="relative h-48 w-full">
                      <Image
                        src="https://picsum.photos/seed/blog2/600/400"
                        alt="Blog post 2"
                        data-ai-hint="funeral ritual"
                        width={600}
                        height={400}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href="/blog">La Importancia de los Rituales Funerarios</Link>
                    </CardTitle>
                    <CardDescription>5 de Julio, 2024</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Los rituales nos ayudan a procesar la pérdida y a honrar la vida de nuestros seres queridos. Explora por qué son tan significativos.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="p-0">
                      <Link href="/blog">
                        Leer más <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
             </ScrollAnimator>
             <ScrollAnimator style={{ animationDelay: '0.2s' }}>
                <Card
                  className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                >
                  <Link href="/blog">
                    <div className="relative h-48 w-full">
                      <Image
                        src="https://picsum.photos/seed/blog3/600/400"
                        alt="Blog post 3"
                        data-ai-hint="virtual connection"
                        width={600}
                        height={400}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href="/blog">Capillas Virtuales: Conectando Corazones a la Distancia</Link>
                    </CardTitle>
                    <CardDescription>28 de Junio, 2024</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Descubre cómo la tecnología nos permite estar cerca de nuestros seres queridos, sin importar dónde se encuentren.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="p-0">
                      <Link href="/blog">
                        Leer más <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
             </ScrollAnimator>
          </div>
           <ScrollAnimator className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/blog">Visitar Nuestro Blog</Link>
                </Button>
            </ScrollAnimator>
        </div>
      </section>
    </div>
  );
}

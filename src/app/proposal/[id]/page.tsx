'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle, FileText, User, ShieldCheck, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { ServicePack, IndividualService, VirtualChapelPlan, Proposal, ImagePlaceholder } from '@/lib/types';
import { WhatsAppIcon } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import logo from '@/logo.png';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

type SelectableService = ServicePack | IndividualService | VirtualChapelPlan;

function ProposalPageSkeleton() {
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8 text-center">
                        <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-10 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Card className="bg-slate-50 border-primary border-2">
                             <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className='w-full space-y-2'>
                                      <Skeleton className="h-6 w-1/2" />
                                      <Skeleton className="h-4 w-3/4" />
                                    </div>
                                    <Skeleton className="h-10 w-[200px]" />
                                </div>
                             </CardHeader>
                             <CardContent>
                                <Skeleton className="h-[250px] w-full" />
                             </CardContent>
                             <CardFooter className="bg-slate-100 p-4 flex justify-end">
                                <Skeleton className="h-7 w-28" />
                             </CardFooter>
                        </Card>
                         <Separator className="my-8" />
                         <div className="text-right space-y-2">
                            <Skeleton className="h-4 w-32 ml-auto" />
                            <Skeleton className="h-10 w-48 ml-auto" />
                         </div>
                    </CardContent>
                     <CardFooter className="bg-slate-100 p-6 flex-col md:flex-row gap-4 justify-between items-center">
                         <div className='w-full space-y-1'>
                             <Skeleton className="h-4 w-40" />
                             <Skeleton className="h-3 w-56" />
                         </div>
                        <Skeleton className="h-12 w-64" />
                     </CardFooter>
                </Card>
            </div>
        </div>
    )
}


export default function ProposalPage({ params }: { params?: { id?: string } }) {
  const routerParams = useParams();
  const proposalId = params?.id || routerParams.id as string;

  const db = useFirestore();
  const { toast } = useToast();
  const { data: proposal, loading: loadingProposal } = useDoc<Proposal>('proposals', proposalId);
  const { data: servicePacks, loading: loadingPacks } = useCollection<ServicePack>('servicePacks');
  const { data: individualServices, loading: loadingIndividual } = useCollection<IndividualService>('individualServices');
  const { data: virtualChapelPlans, loading: loadingChapel } = useCollection<VirtualChapelPlan>('virtualChapelPlans');
  
  const [selectedServices, setSelectedServices] = useState<SelectableService[]>([]);
  const [isAccepted, setIsAccepted] = useState(proposal?.status === 'Propuesta Aceptada');
  const [modalImage, setModalImage] = useState<ImagePlaceholder | null>(null);

  const isLoading = loadingProposal || loadingPacks || loadingIndividual || loadingChapel;

  const servicePackTitles = useMemo(() => new Set(servicePacks.map(p => p.title)), [servicePacks]);

  useEffect(() => {
    if (proposal && !isLoading) {
      const allServices = [...servicePacks, ...individualServices, ...virtualChapelPlans];
      const initialServices = proposal.services
        .map(title => allServices.find(s => s.title === title))
        .filter((s): s is SelectableService => s !== undefined);
      
      setSelectedServices(initialServices);
      if (proposal.status === 'Propuesta Aceptada') {
        setIsAccepted(true);
      }
    }
  }, [proposal, isLoading, servicePacks, individualServices, virtualChapelPlans]);

  const handlePackChange = (newPackTitle: string) => {
    const newPack = servicePacks.find(p => p.title === newPackTitle);
    if (!newPack) return;

    setSelectedServices(prev => {
      const otherServices = prev.filter(s => !servicePackTitles.has(s.title));
      return [newPack, ...otherServices];
    });
  };

  const handleServiceToggle = (service: IndividualService | VirtualChapelPlan) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.title === service.title);
      if (isSelected) {
        return prev.filter(s => s.title !== service.title);
      } else {
        return [...prev, service];
      }
    });
  };

  const { totalAmount, mainPack } = useMemo(() => {
    const pack = selectedServices.find(s => 'idealFor' in s) as ServicePack | undefined;
    const total = selectedServices.reduce((acc, service) => {
      const price = typeof service.priceValue === 'number' ? service.priceValue : 0;
      return acc + price;
    }, 0);
    return { totalAmount: total, mainPack: pack };
  }, [selectedServices]);

  const handleAcceptProposal = async () => {
    if (!proposal || !db) return;

    const proposalRef = doc(db, 'proposals', proposal.id);
    const payload = {
        status: 'Propuesta Aceptada',
        services: selectedServices.map(s => s.title),
        totalAmount: totalAmount,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await updateDoc(proposalRef, payload);
        setIsAccepted(true);
    } catch(e) {
        const permissionError = new FirestorePermissionError({
          path: proposalRef.path,
          operation: 'update',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Error al aceptar",
            description: "No se pudo actualizar la propuesta. Por favor, contacte a su asesor."
        })
    }
  };
  
  if (isLoading) {
    return <ProposalPageSkeleton />;
  }
  
  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive">Propuesta no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El enlace de la propuesta no es válido o ha expirado. Por favor, contacte a su asesor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isAccepted) {
    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-4 w-fit mb-4">
                      <ShieldCheck className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-3xl">Propuesta Aceptada</CardTitle>
                    <CardDescription className="text-lg">
                        Gracias por su confianza, {proposal.clientName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Hemos recibido su aceptación. Su asesor, <span className="font-semibold text-primary">{proposal.sellerName}</span>, se pondrá en contacto con usted a la brevedad para coordinar los próximos pasos y formalizar el servicio.
                    </p>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                      <Button asChild className="w-full max-w-sm bg-green-500 hover:bg-green-600">
                        <a href={`https://wa.me/56992306884?text=Hola%2C%20he%20aceptado%20la%20propuesta%20para%20${encodeURIComponent(proposal.clientName)}.`} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="mr-2"/> Notificar a mi Asesor
                        </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">Será redirigido a WhatsApp.</p>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <>
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8 text-center">
                <Image
                    src={logo}
                    alt="La Paz de Cristo Logo"
                    width={150}
                    height={50}
                    className="mx-auto mb-4 object-contain brightness-0 invert"
                />
                <h1 className="font-headline text-4xl">Propuesta de Servicios Funerarios</h1>
                <p className="text-lg text-slate-300 mt-2">Preparada especialmente para: <span className="font-bold">{proposal.clientName}</span></p>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary"/>
                        <div>
                            <h3 className="font-semibold">ID de Propuesta</h3>
                            <p className="text-muted-foreground">{proposalId}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <User className="h-8 w-8 text-primary"/>
                        <div>
                            <h3 className="font-semibold">Asesor Asignado</h3>
                            <p className="text-muted-foreground">{proposal.sellerName}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="font-headline text-2xl mb-4">Servicios Cotizados</h2>
                    <div className="space-y-6">
                        
                        {mainPack && (
                            <Card className="bg-slate-50 border-primary border-2">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle>{mainPack.title}</CardTitle>
                                        <CardDescription>{mainPack.description}</CardDescription>
                                      </div>
                                       <Select onValueChange={handlePackChange} defaultValue={mainPack.title}>
                                          <SelectTrigger className="w-[200px]">
                                              <SelectValue placeholder="Cambiar Pack" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {servicePacks.map(pack => (
                                                  <SelectItem key={pack.id} value={pack.title}>{pack.title}</SelectItem>
                                              ))}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold text-sm mb-4">Galería de Servicios Incluidos</h4>
                                    <Carousel
                                        opts={{
                                            align: "start",
                                            loop: true,
                                        }}
                                        className="w-full group"
                                    >
                                        <CarouselContent>
                                            {mainPack.features.map((feature, index) => {
                                                if (feature.hideImage) return null;
                                                const image = PlaceHolderImages.find(p => p.id === feature.image);
                                                if (!image) return null;
                                                return (
                                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                                        <div className="p-1">
                                                            <Card className='overflow-hidden'>
                                                                <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                                                                    <button onClick={() => setModalImage(image)} className='w-full h-full'>
                                                                        <Image 
                                                                            src={image.imageUrl} 
                                                                            alt={feature.title} 
                                                                            width={600} 
                                                                            height={400} 
                                                                            className="object-cover w-full h-full"
                                                                            data-ai-hint={image.imageHint}
                                                                        />
                                                                    </button>
                                                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white p-2 text-center">
                                                                        <p className="text-sm font-semibold">{feature.title}</p>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </CarouselItem>
                                                )
                                            })}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Carousel>
                                    <Accordion type="single" collapsible className="w-full mt-4">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Ver todos los servicios incluidos</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 text-sm">
                                                    {mainPack.features.map(feature => (
                                                        <li key={feature.title} className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-primary" />
                                                            <span className="text-muted-foreground">{feature.title}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                                 <CardFooter className="bg-slate-100 p-4 flex justify-end">
                                    <p className="text-lg font-bold text-slate-800">{mainPack.price}</p>
                                 </CardFooter>
                            </Card>
                        )}
                        
                        <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-semibold">
                                    <div className='flex items-center gap-2'>
                                      <PlusCircle className='h-5 w-5' />
                                      Añadir Servicios Adicionales
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[...individualServices, ...virtualChapelPlans].map(service => {
                                            const isSelected = selectedServices.some(s => s.title === service.title);
                                            const priceText = typeof service.priceValue === 'number' && service.priceValue > 0 
                                                ? `(+${service.price})` 
                                                : '(Incluido)';

                                            return (
                                                <div key={service.id} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-md">
                                                    <Checkbox
                                                        id={service.id}
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleServiceToggle(service)}
                                                        disabled={!mainPack && service.priceValue === 0}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label htmlFor={service.id} className="font-medium cursor-pointer">
                                                          {service.title} {priceText}
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            {service.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
                
                <Separator className="my-8" />

                <div className="text-right">
                    <p className="text-muted-foreground">Monto Total (CLP)</p>
                    <p className="text-4xl font-bold text-primary">${totalAmount.toLocaleString('es-CL')}</p>
                    <p className="text-xs text-muted-foreground">(IVA incluido)</p>
                </div>

            </CardContent>
            <CardFooter className="bg-slate-100 p-6 flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                     <p className="text-sm text-muted-foreground">¿Listo para proceder?</p>
                     <p className="text-xs text-muted-foreground">Al aceptar, su asesor será notificado para continuar.</p>
                </div>

                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button size="lg">
                            <ShieldCheck className="mr-2" /> Aceptar Propuesta y Continuar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de que desea aceptar esta propuesta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción notificará a su asesor para que se ponga en contacto y formalice los servicios con la configuración que ha seleccionado.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Tengo dudas, necesito pensar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAcceptProposal}>Sí, acepto y deseo continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
      </div>
    </div>
    <Dialog open={!!modalImage} onOpenChange={(isOpen) => !isOpen && setModalImage(null)}>
        <DialogContent 
            className="w-screen h-screen max-w-full max-h-full bg-black/95 border-none p-4 flex items-center justify-center"
            hideCloseButton={true}
        >
            <DialogHeader>
                <DialogTitle className="sr-only">
                    {modalImage?.description || 'Vista Ampliada de la Imagen'}
                </DialogTitle>
            </DialogHeader>
            {modalImage && (
                 <DialogClose asChild>
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                        <Image
                            src={modalImage.imageUrl}
                            alt={modalImage.description}
                            fill
                            className="object-contain"
                        />
                    </div>
                 </DialogClose>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}


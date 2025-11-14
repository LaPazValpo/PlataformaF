'use client';

import * as React from 'react';
import Image from 'next/image';
import { Check, Star, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { servicePacks, individualServices, virtualChapelPlans } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ServicePack, ServicePackFeature, IndividualService, VirtualChapelPlan } from '@/lib/types';
import { useUser } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ServicePackForm from '@/components/intranet/services/ServicePackForm';
import IndividualServiceForm from '@/components/intranet/services/IndividualServiceForm';
import VirtualChapelPlanForm from '@/components/intranet/services/VirtualChapelPlanForm';

function FeatureImage({ feature }: { feature: ServicePackFeature }) {
  const placeholder = PlaceHolderImages.find(p => p.id === feature.image);
  if (!placeholder) return null;

  return (
    <Image
      src={placeholder.imageUrl}
      alt={feature.title}
      width={600}
      height={400}
      data-ai-hint={placeholder.imageHint}
      className="rounded-md object-cover"
    />
  );
}


function ServicePackCard({ pack }: { pack: ServicePack }) {
  const { userProfile } = useUser();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const isAdmin = userProfile?.role === 'Administrador';

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <Card className={`flex flex-col relative ${pack.recommended ? 'border-primary ring-2 ring-primary' : ''}`}>
        {isAdmin && (
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-7 w-7">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        )}
        {pack.recommended && (
          <Badge className="absolute -top-3 left-3 flex gap-1">
            <Star className="h-3 w-3" /> Recomendado
          </Badge>
        )}
        <CardHeader>
          <CardTitle>{pack.title}</CardTitle>
          <CardDescription>{pack.idealFor}</CardDescription>
          <div className="text-3xl font-bold pt-2">{pack.price}</div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm mb-4">{pack.description}</p>
          <Separator className="mb-4" />
          <ul className="space-y-2 text-sm text-muted-foreground">
            {pack.features.map(feature => (
              <li key={feature.title} className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{feature.title}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Seleccionar</Button>
        </CardFooter>
      </Card>
      {isAdmin && (
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Editar Pack de Servicio</DialogTitle>
            </DialogHeader>
            <ServicePackForm mode="edit" servicePackId={pack.id} initialData={pack} onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function IndividualServiceItem({ service }: { service: IndividualService }) {
    const { userProfile } = useUser();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const isAdmin = userProfile?.role === 'Administrador';

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
                <div className="text-right ml-4 flex items-center gap-2">
                    <div>
                      <p className="font-semibold">{service.price}</p>
                      <Button size="sm" variant="ghost" className="mt-1">Añadir</Button>
                    </div>
                    {isAdmin && (
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                    )}
                </div>
            </div>
            {isAdmin && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Servicio Individual</DialogTitle>
                    </DialogHeader>
                    <IndividualServiceForm mode="edit" serviceId={service.id} initialData={service} onSuccess={() => setIsFormOpen(false)} />
                </DialogContent>
            )}
        </Dialog>
    )
}

function VirtualChapelPlanCard({ plan }: { plan: VirtualChapelPlan }) {
    const { userProfile } = useUser();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const isAdmin = userProfile?.role === 'Administrador';

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Card className="flex flex-col relative">
                {isAdmin && (
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="absolute top-2 right-2 h-7 w-7">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                )}
                <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <div className="text-2xl font-bold pt-2">{plan.price}</div>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Seleccionar</Button>
                </CardFooter>
            </Card>
            {isAdmin && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Plan de Capilla Virtual</DialogTitle>
                    </DialogHeader>
                    <VirtualChapelPlanForm mode="edit" planId={plan.id} initialData={plan} onSuccess={() => setIsFormOpen(false)} />
                </DialogContent>
            )}
        </Dialog>
    )
}


export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Paquetes de Servicios"
        description="Explora y personaliza nuestros paquetes de servicios funerarios."
      />

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Packs Funerarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicePacks.map(pack => <ServicePackCard key={pack.id} pack={pack} />)}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Planes de Capilla Virtual</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {virtualChapelPlans.map(plan => <VirtualChapelPlanCard key={plan.id} plan={plan} />)}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Servicios Individuales</h2>
           <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {individualServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <IndividualServiceItem service={service} />
                      {index < individualServices.length - 1 && <Separator className="mt-4"/>}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
           </Card>
        </section>
      </div>
    </div>
  );
}
import Image from 'next/image';
import { Check, Star } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { servicePacks, individualServices, virtualChapelPlans } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ServicePackFeature } from '@/lib/types';

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
          {servicePacks.map(pack => (
            <Card key={pack.id} className={`flex flex-col ${pack.recommended ? 'border-primary ring-2 ring-primary' : ''}`}>
              {pack.recommended && (
                <Badge className="absolute -top-3 right-3 flex gap-1">
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
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Planes de Capilla Virtual</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {virtualChapelPlans.map(plan => (
              <Card key={plan.id} className="flex flex-col">
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
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Servicios Individuales</h2>
           <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {individualServices.map((service, index) => (
                    <div key={service.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold">{service.price}</p>
                          <Button size="sm" variant="ghost" className="mt-1">Añadir</Button>
                        </div>
                      </div>
                      {index < individualServices.length - 1 && <Separator className="mt-4"/>}
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>
        </section>
      </div>

    </div>
  );
}

'use client';

import * as React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCollection, useUser } from '@/firebase';
import type { VirtualTomb } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Quote, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import VirtualTombForm from '@/components/intranet/chapel/VirtualTombForm';

function TombDialog({ tomb }: { tomb: VirtualTomb }) {
  if (!tomb) {
    return null;
  }
  
  const mainImage = PlaceHolderImages.find(p => p.id === tomb.mainImage);
  const galleryImages = tomb.gallery.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);

  const birthDate = format(new Date(tomb.birthDate), 'd MMMM yyyy', { locale: es });
  const passingDate = format(new Date(tomb.passingDate), 'd MMMM yyyy', { locale: es });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Ver Homenaje</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{tomb.name}</DialogTitle>
          <DialogDescription>{birthDate} - {passingDate}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[70vh] overflow-y-auto pr-4">
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {mainImage && (
                    <CarouselItem>
                        <Image
                        src={mainImage.imageUrl}
                        alt={tomb.name}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover w-full aspect-video"
                        data-ai-hint={mainImage.imageHint}
                        />
                    </CarouselItem>
                )}
                {galleryImages.map((img, index) => img && (
                  <CarouselItem key={index}>
                    <Image
                      src={img.imageUrl}
                      alt={`${tomb.name} foto de galería ${index + 1}`}
                      width={600}
                      height={400}
                      className="rounded-lg object-cover w-full aspect-video"
                      data-ai-hint={img.imageHint}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-lg">Dedicaciones</h3>
            <div className="space-y-4">
              {tomb.dedications.map((dedication, index) => (
                <div key={index}>
                    <blockquote className="flex items-start gap-3">
                        <Quote className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                        <p className="italic text-muted-foreground">"{dedication.message}"</p>
                    </blockquote>
                    <p className="text-sm font-medium text-right mt-2">- {dedication.author}</p>
                    <p className="text-xs text-muted-foreground text-right">{format(new Date(dedication.date), 'PP', { locale: es })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChapelSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Capilla Virtual"
                description="Un espacio para recordar y honrar a nuestros seres queridos."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-0">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-10 w-full mt-2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ChapelPage() {
  const { data: virtualTombs, loading } = useCollection<VirtualTomb>('virtualTombs');
  const { userProfile } = useUser();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedTomb, setSelectedTomb] = React.useState<VirtualTomb | null>(null);
  const isAdmin = userProfile?.role === 'Administrador';

  const handleEditClick = (tomb: VirtualTomb) => {
    setSelectedTomb(tomb);
    setIsFormOpen(true);
  }
  
  if (loading) {
    return <ChapelSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Capilla Virtual"
          description="Un espacio para recordar y honrar a nuestros seres queridos."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {virtualTombs.map(tomb => {
            const image = PlaceHolderImages.find(p => p.id === tomb.mainImage);
            return (
              <Card key={tomb.id} className="overflow-hidden relative group">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditClick(tomb)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <CardContent className="p-0">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={tomb.name}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{tomb.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tomb.birthDate), 'yyyy')} - {format(new Date(tomb.passingDate), 'yyyy')}
                    </p>
                    <div className="mt-4">
                       <TombDialog tomb={tomb} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {isAdmin && selectedTomb && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Editar Homenaje Virtual</DialogTitle>
                </DialogHeader>
                <VirtualTombForm 
                    mode="edit"
                    tombId={selectedTomb.id}
                    initialData={selectedTomb}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        setSelectedTomb(null);
                    }}
                />
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}

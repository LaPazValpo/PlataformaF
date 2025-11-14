'use client';

import * as React from 'react';
import type { Prospect } from '@/lib/types';
import { useCollection, useUser } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hand, Mail, Phone } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const prospectStatuses: Prospect['status'][] = [
  'Nuevo',
  'Contactado',
  'En Seguimiento',
  'No Calificado',
  'Venta Ganada',
  'Venta Perdida',
];

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleTakeProspect = async () => {
    if (!user || !userProfile || !db) return;
    setIsUpdating(true);

    const prospectRef = doc(db, 'prospects', prospect.id);
    const updatedData = {
        sellerId: user.uid,
        sellerName: userProfile.name,
        status: 'Contactado' as Prospect['status'],
        updatedAt: new Date().toISOString()
    };

    updateDoc(prospectRef, updatedData)
      .then(() => {
        toast({
          title: 'Prospecto Asignado',
          description: `${prospect.clientName} ahora es tu prospecto.`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: prospectRef.path,
            operation: 'update',
            requestResourceData: updatedData,
         });
         errorEmitter.emit('permission-error', permissionError);
         toast({
            variant: 'destructive',
            title: 'Error al asignar prospecto',
            description: 'No tienes permisos para realizar esta acción.',
         });
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{prospect.clientName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{prospect.contactNumber}</span>
        </div>
        {prospect.email && (
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{prospect.email}</span>
            </div>
        )}
        {prospect.status !== 'Nuevo' && (
            <div className="text-xs pt-2">
                Asignado a: <span className="font-semibold">{prospect.sellerName}</span>
            </div>
        )}
      </CardContent>
      {prospect.status === 'Nuevo' && (
        <CardFooter>
          <Button onClick={handleTakeProspect} disabled={isUpdating} className="w-full">
            <Hand className="mr-2" />
            {isUpdating ? 'Asignando...' : 'Tomar Prospecto'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function ProspectsSkeleton() {
  return (
    <div className="w-full">
      <PageHeader
        title="Prospección de Ventas"
        description="Gestiona los potenciales clientes desde el primer contacto hasta el cierre."
      />
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {prospectStatuses.map(status => (
          <div key={status} className="flex-shrink-0 w-72">
            <h2 className="font-semibold px-2 mb-2">{status}</h2>
            <div className="space-y-4 p-2 rounded-lg bg-muted/50 h-full">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                             <Skeleton className="h-5 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProspectsPage() {
  const { data: prospects, loading } = useCollection<Prospect>('prospects');

  if (loading) {
    return <ProspectsSkeleton />;
  }

  const prospectsByStatus = prospectStatuses.reduce((acc, status) => {
    acc[status] = prospects.filter(p => p.status === status);
    return acc;
  }, {} as Record<Prospect['status'], Prospect[]>);

  return (
    <div className="w-full">
      <PageHeader
        title="Prospección de Ventas"
        description="Gestiona los potenciales clientes desde el primer contacto hasta el cierre."
      />
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {prospectStatuses.map(status => (
          <div key={status} className="flex-shrink-0 w-80">
            <h2 className="font-semibold px-2 mb-2 tracking-tight">{status} ({prospectsByStatus[status].length})</h2>
            <div className="space-y-3 p-2 rounded-lg bg-muted/50 h-full min-h-[200px]">
              {prospectsByStatus[status].map(prospect => (
                <ProspectCard key={prospect.id} prospect={prospect} />
              ))}
               {prospectsByStatus[status].length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No hay prospectos en este estado.
                </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { type Proposal } from '@/lib/types';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function ProposalSkeleton() {
  return (
    <main className="container mx-auto py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Separator className="my-6" />
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Separator className="my-6" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col items-end bg-muted/50 p-6 md:p-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-52 mt-2" />
        </CardFooter>
      </Card>
    </main>
  );
}

export default function PublicProposalPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: proposal, loading } = useDoc<Proposal>('proposals', id);

  if (loading) {
    return <ProposalSkeleton />;
  }

  if (!proposal) {
    return (
      <main className="container mx-auto py-8 text-center">
        <PageHeader title="Propuesta no encontrada" description="El enlace de la propuesta no es válido o ha sido eliminada." />
      </main>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <main className="container mx-auto py-8 md:py-12 bg-background">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-muted/30 p-6 md:p-8 rounded-t-lg">
            <div className="flex items-center gap-2.5 text-foreground justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-xl font-bold">Paz Final</span>
            </div>
          <CardTitle className="text-3xl font-bold mt-4">Propuesta de Servicios</CardTitle>
          <CardDescription className="text-md">ID Propuesta: {proposal.id}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
            <div>
              <p className="font-semibold text-muted-foreground">PARA</p>
              <p className="text-lg font-medium">{proposal.clientName}</p>
            </div>
            <div className="md:text-right">
              <p className="font-semibold text-muted-foreground">FECHA</p>
              <p className="text-lg font-medium">{format(new Date(proposal.date), 'd \'de\' MMMM, yyyy', { locale: es })}</p>
            </div>
          </div>
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios Incluidos</h3>
            <ul className="space-y-3">
              {proposal.services.map((service, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {proposal.notes && (
            <>
                <Separator className="my-6" />
                <div>
                    <h3 className="text-lg font-semibold mb-2">Notas Adicionales</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.notes}</p>
                </div>
            </>
          )}

        </CardContent>
        <CardFooter className="flex flex-col items-end bg-muted/30 p-6 md:p-8 rounded-b-lg">
            <div className="text-right">
                <p className="text-md text-muted-foreground">Monto Total</p>
                <p className="text-4xl font-bold text-primary">{proposal.totalAmount ? formatCurrency(proposal.totalAmount) : 'N/A'}</p>
            </div>
            <Separator className="my-4"/>
            <div className="text-xs text-muted-foreground text-center w-full">
                <p>Esta propuesta es válida por 30 días. Para confirmar los servicios o si tiene alguna consulta, por favor contacte a su asesor.</p>
                <p className="font-semibold mt-1">Asesor: {proposal.sellerName}</p>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
}
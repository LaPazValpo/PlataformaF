'use client';

import * as React from 'react';
import type { Prospect, Proposal, Sale } from '@/lib/types';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hand, Mail, Phone, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProposalForm from '@/components/intranet/proposals/ProposalForm';
import ProposalDetails from '@/components/intranet/proposals/ProposalDetails';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function ProspectCard({ prospect, proposals }: { prospect: Prospect, proposals: Proposal[] }) {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isCreateProposalOpen, setIsCreateProposalOpen] = React.useState(false);

  const hasProposal = React.useMemo(() => proposals.some(p => p.prospectId === prospect.id), [proposals, prospect.id]);

  const handleUpdateProspect = async (status: Prospect['status'], sellerId: string | null, sellerName: string) => {
    if (!db) return;
    setIsUpdating(true);

    const prospectRef = doc(db, 'prospects', prospect.id);
    const updatedData = {
        sellerId,
        sellerName,
        status,
        updatedAt: new Date().toISOString()
    };

    updateDoc(prospectRef, updatedData)
      .then(() => {
        toast({
          title: 'Prospecto Actualizado',
          description: `${prospect.clientName} ahora está en estado: ${status}.`,
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
            title: 'Error al actualizar prospecto',
            description: 'No tienes permisos para realizar esta acción.',
         });
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const handleTakeProspect = () => {
      if (!user || !userProfile) return;
      handleUpdateProspect('Contactado', user.uid, userProfile.name);
  }

  const handleCloseSale = async (status: 'Venta Ganada' | 'Venta Perdida') => {
      if (!user || !userProfile || !db) return;

      const now = new Date();
      const batch = writeBatch(db);

      // 1. Update prospect status
      const prospectRef = doc(db, 'prospects', prospect.id);
      batch.update(prospectRef, { status, updatedAt: now.toISOString() });

      // 2. If won, create a sale document
      if (status === 'Venta Ganada') {
          const proposal = proposals.find(p => p.prospectId === prospect.id);
          const newSale: Omit<Sale, 'id'> = {
              clientName: prospect.clientName,
              services: proposal?.services ?? [],
              seller: prospect.sellerName,
              date: now.toISOString(),
              status: 'Pendiente de Pago',
              totalAmount: proposal?.totalAmount ?? 0,
              contactNumber: prospect.contactNumber,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
          };
          const salesCol = doc(db, 'sales', `SALE-${now.getTime()}`);
          batch.set(salesCol, newSale);
      }

      setIsUpdating(true);
      try {
          await batch.commit();
          toast({
              title: 'Venta Cerrada',
              description: `El prospecto ${prospect.clientName} ha sido marcado como ${status}.`
          });
      } catch (serverError) {
          const permissionError = new FirestorePermissionError({
              path: `prospects/${prospect.id} or sales`,
              operation: 'update',
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({
              variant: 'destructive',
              title: 'Error al cerrar la venta.',
              description: 'No tienes los permisos necesarios.'
          });
      } finally {
          setIsUpdating(false);
      }
  }

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
      <CardFooter className="flex-col items-stretch gap-2">
          {prospect.status === 'Nuevo' && (
             <Button onClick={handleTakeProspect} disabled={isUpdating} className="w-full">
                <Hand className="mr-2" />
                {isUpdating ? 'Asignando...' : 'Tomar Venta'}
            </Button>
          )}

          {prospect.status === 'Contactado' && !hasProposal && (
             <Dialog open={isCreateProposalOpen} onOpenChange={setIsCreateProposalOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <FileText className="mr-2" />
                        Crear Propuesta
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nueva Propuesta para {prospect.clientName}</DialogTitle>
                    </DialogHeader>
                    <ProposalForm
                        mode="create"
                        prospectId={prospect.id}
                        initialData={{
                            clientName: prospect.clientName,
                            contactNumber: prospect.contactNumber,
                            email: prospect.email
                        }}
                        onSuccess={() => setIsCreateProposalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
          )}
          
          {(prospect.status === 'Contactado' || prospect.status === 'En Seguimiento') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">Cerrar Venta</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleCloseSale('Venta Ganada')}>
                  <CheckCircle className="mr-2 text-green-500" /> Venta Ganada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCloseSale('Venta Perdida')}>
                  <XCircle className="mr-2 text-red-500" /> Venta Perdida
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
      </CardFooter>
    </Card>
  );
}

function SalesSkeleton() {
  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Ventas"
        description="Unifica y visualiza todo el proceso de ventas, desde el prospecto hasta el cierre."
      />
      <div className="mt-8 space-y-8">
        {[...Array(2)].map((_, i) => (
          <section key={i}>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(3)].map((_, j) => (
                <Card key={j}>
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
          </section>
        ))}
      </div>
    </div>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};


export default function SalesPage() {
  const { data: prospects, loading: loadingProspects } = useCollection<Prospect>('prospects');
  const { data: proposals, loading: loadingProposals } = useCollection<Proposal>('proposals');
  const { data: sales, loading: loadingSales } = useCollection<Sale>('sales');
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const loading = loadingProspects || loadingProposals || loadingSales;

  const activeProspects = React.useMemo(() => 
      prospects.filter(p => p.status === 'Nuevo' || p.status === 'Contactado' || p.status === 'En Seguimiento'),
      [prospects]
  );
  
  if (loading) {
    return <SalesSkeleton />;
  }

  const openDetailsDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailsOpen(true);
  }
  
  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Ventas"
        description="Unifica y visualiza todo el proceso de ventas, desde el prospecto hasta el cierre."
      />
      <div className="mt-8 space-y-12">
        {/* PROSPECCIÓN */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Prospección ({activeProspects.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeProspects.map(prospect => (
              <ProspectCard key={prospect.id} prospect={prospect} proposals={proposals} />
            ))}
            {activeProspects.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-40 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                    No hay prospectos activos.
                </div>
            )}
          </div>
        </section>

        {/* PROPUESTAS */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Propuestas Enviadas ({proposals.length})</h2>
          <Card>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                        <tr className="border-b">
                        <th className="py-2 px-4 text-left">Fecha</th>
                        <th className="py-2 px-4 text-left">Cliente</th>
                        <th className="py-2 px-4 text-left">Vendedor</th>
                        <th className="py-2 px-4 text-left">Estado</th>
                        <th className="py-2 px-4 text-right">Monto</th>
                        <th className="py-2 px-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.map(p => (
                            <tr key={p.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-4">{p.date ? format(new Date(p.date), 'dd MMM yyyy', { locale: es }) : '-'}</td>
                                <td className="py-2 px-4">{p.clientName}</td>
                                <td className="py-2 px-4">{p.sellerName}</td>
                                <td className="py-2 px-4"><Badge variant={p.status === 'Propuesta Aceptada' ? 'default' : 'secondary'}>{p.status}</Badge></td>
                                <td className="py-2 px-4 text-right">{p.totalAmount ? formatCurrency(p.totalAmount) : '-'}</td>
                                <td className="py-2 px-4 text-center">
                                    <Button variant="ghost" size="icon" onClick={() => openDetailsDialog(p)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {proposals.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No hay propuestas.</td></tr>
                        )}
                    </tbody>
                </table>
               </div>
            </CardContent>
          </Card>
        </section>
        
        {/* VENTAS CERRADAS */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Ventas Cerradas ({sales.length})</h2>
          <Card>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                        <tr className="border-b">
                        <th className="py-2 px-4 text-left">Fecha Cierre</th>
                        <th className="py-2 px-4 text-left">Cliente</th>
                        <th className="py-2 px-4 text-left">Vendedor</th>
                        <th className="py-2 px-4 text-right">Monto Final</th>
                        <th className="py-2 px-4 text-left">Estado Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                         {sales.map(s => (
                            <tr key={s.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-4">{s.date ? format(new Date(s.date), 'dd MMM yyyy', { locale: es }) : '-'}</td>
                                <td className="py-2 px-4">{s.clientName}</td>
                                <td className="py-2 px-4">{s.seller}</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(s.totalAmount)}</td>
                                <td className="py-2 px-4"><Badge variant={s.status === 'Pagado' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                             <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay ventas cerradas.</td></tr>
                        )}
                    </tbody>
                </table>
               </div>
            </CardContent>
          </Card>
        </section>

      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Propuesta</DialogTitle>
          </DialogHeader>
          {selectedProposal && <ProposalDetails proposalId={selectedProposal.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

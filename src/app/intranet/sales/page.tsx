'use client';

import * as React from 'react';
import type { Prospect, Proposal, Sale } from '@/lib/types';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hand, Mail, Phone, FileText, CheckCircle, XCircle, Eye, MessageCircle, Trash2, Info } from 'lucide-react';
import { doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProposalForm from '@/components/intranet/proposals/ProposalForm';
import ProposalDetails from '@/components/intranet/proposals/ProposalDetails';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
} from '@/components/ui/alert-dialog';
import ProposalPage from '@/app/proposal/[id]/page';
import CloseSaleForm from '@/components/intranet/sales/CloseSaleForm';


function ProspectCard({ prospect, proposals }: { prospect: Prospect, proposals: Proposal[] }) {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isCreateProposalOpen, setIsCreateProposalOpen] = React.useState(false);
  const [isCloseSaleOpen, setIsCloseSaleOpen] = React.useState(false);

  const hasProposal = React.useMemo(() => proposals.some(p => p.prospectId === prospect.id), [proposals, prospect.id]);
  const existingProposal = React.useMemo(() => proposals.find(p => p.prospectId === prospect.id), [proposals, prospect.id]);

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

  const handleDeleteProspect = async () => {
      if (!db) return;
      
      setIsUpdating(true);
      const prospectRef = doc(db, 'prospects', prospect.id);
      
      deleteDoc(prospectRef)
          .then(() => {
              toast({
                  title: 'Prospecto Eliminado',
                  description: `El prospecto ${prospect.clientName} ha sido eliminado.`,
              });
          })
          .catch((serverError) => {
              const permissionError = new FirestorePermissionError({
                  path: prospectRef.path,
                  operation: 'delete',
              });
              errorEmitter.emit('permission-error', permissionError);
              toast({
                  variant: 'destructive',
                  title: 'Error al eliminar',
                  description: 'No tienes permisos para eliminar este prospecto.',
              });
          })
          .finally(() => {
              setIsUpdating(false);
          });
  };
  
  const handleProposalCreated = (newProposalId?: string) => {
    setIsCreateProposalOpen(false);
    if (!newProposalId) return;

    if (!prospect.contactNumber) {
        toast({
            variant: "destructive",
            title: "Número de contacto no disponible",
            description: "El prospecto no tiene un número de contacto para enviar por WhatsApp.",
        });
        return;
    }

    const cleanPhoneNumber = prospect.contactNumber.replace(/[^0-9]/g, '');
    const proposalUrl = `${window.location.origin}/proposal/${newProposalId}`;
    const message = encodeURIComponent(`Hola ${prospect.clientName},\n\nTe envío la propuesta de servicios funerarios que conversamos. Puedes revisarla en el siguiente enlace:\n\n${proposalUrl}\n\nQuedo a tu disposición para cualquier duda.\n\nSaludos,\n${userProfile?.name}`);
    window.open(`https://wa.me/${cleanPhoneNumber}?text=${message}`, '_blank');
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
      <CardFooter className="flex items-center gap-2">
          <div className="flex-grow space-y-2">
            {prospect.status === 'Nuevo' && (
              <Button onClick={handleTakeProspect} disabled={isUpdating} className="w-full">
                  <Hand className="mr-2" />
                  {isUpdating ? 'Asignando...' : 'Tomar Venta'}
              </Button>
            )}

            {(prospect.status === 'Contactado' || prospect.status === 'En Seguimiento') && !hasProposal && (
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
                          onSuccess={handleProposalCreated}
                      />
                  </DialogContent>
              </Dialog>
            )}
            
            {(prospect.status === 'Contactado' || prospect.status === 'En Seguimiento') && (
              <div className="space-y-2">
                 <Dialog open={isCloseSaleOpen} onOpenChange={setIsCloseSaleOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <CheckCircle className="mr-2" /> Cerrar Venta Ganada
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Cerrar Venta para {prospect.clientName}</DialogTitle>
                        </DialogHeader>
                        <CloseSaleForm 
                          prospect={prospect}
                          proposal={existingProposal}
                          onSuccess={() => setIsCloseSaleOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" disabled={isUpdating}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro de eliminar este prospecto?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Esta acción es irreversible y eliminará el prospecto de la lista, pero conservará el contacto en la base de datos de clientes.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteProspect}>Eliminar Prospecto</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
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
  const db = useFirestore();
  const { toast } = useToast();
  const { data: prospects, loading: loadingProspects } = useCollection<Prospect>('prospects');
  const { data: proposals, loading: loadingProposals } = useCollection<Proposal>('proposals');
  const { data: sales, loading: loadingSales } = useCollection<Sale>('sales');
  
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isPublicViewOpen, setIsPublicViewOpen] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState<Proposal | null>(null);

  const loading = loadingProspects || loadingProposals || loadingSales;

  const activeProspects = React.useMemo(() => 
      prospects.filter(p => p.status === 'Nuevo' || p.status === 'Contactado' || p.status === 'En Seguimiento'),
      [prospects]
  );
  
  if (loading) {
    return <SalesSkeleton />;
  }

  const handleSendWhatsApp = (proposal: Proposal) => {
    if (!proposal.contactNumber) {
        toast({
            variant: "destructive",
            title: "Número de contacto no disponible",
            description: "La propuesta no tiene un número de contacto para enviar por WhatsApp.",
        });
        return;
    }
    const cleanPhoneNumber = proposal.contactNumber.replace(/[^0-9]/g, '');
    const proposalUrl = `${window.location.origin}/proposal/${proposal.id}`;
    const message = encodeURIComponent(`Hola ${proposal.clientName},\n\nTe envío la propuesta de servicios funerarios que conversamos. Puedes revisarla en el siguiente enlace:\n\n${proposalUrl}\n\nQuedo a tu disposición para cualquier duda.\n\nSaludos,\n${proposal.sellerName}`);
    window.open(`https://wa.me/${cleanPhoneNumber}?text=${message}`, '_blank');
  };

  const handleOpenDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailsOpen(true);
  }
  
  const handleOpenPublicView = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsPublicViewOpen(true);
  }

  const handleDeleteProposal = async (proposalId: string) => {
    if (!db) return;
    const proposalRef = doc(db, 'proposals', proposalId);
    try {
      await deleteDoc(proposalRef);
      toast({ title: 'Propuesta eliminada' });
    } catch (e) {
      const permissionError = new FirestorePermissionError({ path: proposalRef.path, operation: 'delete' });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error al eliminar', description: 'No tienes permisos.' });
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!db) return;
    const saleRef = doc(db, 'sales', saleId);
    try {
      await deleteDoc(saleRef);
      toast({ title: 'Venta eliminada' });
    } catch (e) {
      const permissionError = new FirestorePermissionError({ path: saleRef.path, operation: 'delete' });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error al eliminar', description: 'No tienes permisos.' });
    }
  };
  
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
                                    <div className='flex items-center justify-center'>
                                        <Button variant="ghost" size="icon" onClick={() => handleSendWhatsApp(p)} title="Enviar por WhatsApp">
                                            <MessageCircle className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenPublicView(p)} title="Ver Propuesta Pública">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(p)} title="Ver Detalles Internos">
                                            <Info className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button variant="ghost" size="icon" title="Eliminar Propuesta">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar esta propuesta?</AlertDialogTitle>
                                                    <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProposal(p.id)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
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
                        <th className="py-2 px-4 text-center">Acciones</th>
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
                                <td className="py-2 px-4 text-center">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" title="Eliminar Venta">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar esta venta?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta acción no se puede deshacer y eliminará el registro de la venta permanentemente.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSale(s.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                             <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No hay ventas cerradas.</td></tr>
                        )}
                    </tbody>
                </table>
               </div>
            </CardContent>
          </Card>
        </section>
      </div>

       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalles de la Propuesta</DialogTitle>
                </DialogHeader>
                {selectedProposal && <ProposalDetails proposalId={selectedProposal.id} />}
            </DialogContent>
        </Dialog>

       <Dialog open={isPublicViewOpen} onOpenChange={setIsPublicViewOpen}>
            <DialogContent className="max-w-4xl p-0">
                 <DialogHeader>
                    <DialogTitle className='sr-only'>Vista Previa de la Propuesta</DialogTitle>
                 </DialogHeader>
                 {selectedProposal && (
                    <div className='max-h-[90vh] overflow-y-auto'>
                         <ProposalPage params={{ id: selectedProposal.id }} />
                    </div>
                 )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

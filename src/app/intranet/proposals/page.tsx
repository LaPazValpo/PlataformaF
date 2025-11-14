'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProposalForm from '@/components/intranet/proposals/ProposalForm';
import ProposalDetails from '@/components/intranet/proposals/ProposalDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Proposal } from '@/lib/types';
import { PageHeader } from '@/components/common/page-header';

export default function PropuestasPage() {
  const firestore = useFirestore();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'proposals'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: Proposal[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<Proposal, 'id'>) }));
      setProposals(items);
    }, (error) => {
      const permissionError = new FirestorePermissionError({ path: 'proposals', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
    });
    return () => unsub();
  }, [firestore]);

  const total = useMemo(() => proposals.length, [proposals]);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) return;
    
    const docRef = doc(firestore, 'proposals', id);
    deleteDoc(docRef)
        .then(() => {
            toast({ title: 'Propuesta eliminada' });
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Error al eliminar',
                description: 'No tienes permisos para eliminar esta propuesta.',
            });
        });
  };

  return (
    <div className="container mx-auto p-0">
      <PageHeader
        title="Propuestas"
        description="Gestiona cotizaciones y su estado."
        className="mb-6"
      />
      
      <div className="mb-6 flex items-center justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Propuesta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Propuesta</DialogTitle>
            </DialogHeader>
            <ProposalForm
              mode="create"
              onSuccess={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Listado de Propuestas ({total})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left">Fecha</th>
                  <th className="py-2 text-left">Cliente</th>
                  <th className="py-2 text-left">Vendedor</th>
                  <th className="py-2 text-left">Estado</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/50">
                    <td className="py-2">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="py-2">{p.clientName}</td>
                    <td className="py-2">{p.sellerName}</td>
                    <td className="py-2">{p.status}</td>
                    <td className="py-2 text-right">{p.totalAmount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) ?? '-'}</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={isDetailsOpen && selected?.id === p.id} onOpenChange={(o) => { if (!o) setSelected(null); setIsDetailsOpen(o); }}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { setSelected(p); setIsDetailsOpen(true); }}
                              title="Ver"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalle Propuesta</DialogTitle>
                            </DialogHeader>
                            {selected && <ProposalDetails proposalId={selected.id} />}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isEditOpen && selected?.id === p.id} onOpenChange={(o) => { if (!o) setSelected(null); setIsEditOpen(o); }}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { setSelected(p); setIsEditOpen(true); }}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Propuesta</DialogTitle>
                            </DialogHeader>
                            {selected && (
                              <ProposalForm
                                mode="edit"
                                proposalId={selected.id}
                                initialData={selected}
                                onSuccess={() => setIsEditOpen(false)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(p.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No hay propuestas todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useFirestore, useUser, useCollection } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Proposal, ServicePack } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type FormMode = 'create' | 'edit';

type ProposalInput = {
  clientName: string;
  sellerId?: string | null;
  sellerName: string;
  date: string; // ISO
  status:
    | 'Borrador'
    | 'Propuesta Enviada'
    | 'Propuesta Aceptada'
    | 'Propuesta Rechazada';
  contactNumber?: string;
  email?: string;
  notes?: string;
  selectedPackTitle: string; // To control the select component
};

export default function ProposalForm({
  mode,
  proposalId,
  prospectId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  proposalId?: string;
  prospectId?: string;
  initialData?: any;
  onSuccess?: (newProposalId?: string) => void;
}) {
  const db = useFirestore();
  const { user, userProfile } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: servicePacks, loading: loadingPacks } = useCollection<ServicePack>('servicePacks');

  const [form, setForm] = useState<ProposalInput>(() => ({
    clientName: initialData?.clientName ?? '',
    sellerId: initialData?.sellerId ?? null,
    sellerName: initialData?.sellerName ?? '',
    date: initialData?.date ?? new Date().toISOString(),
    status: initialData?.status ?? 'Propuesta Enviada',
    contactNumber: initialData?.contactNumber ?? '',
    email: initialData?.email ?? '',
    notes: initialData?.notes ?? '',
    selectedPackTitle: (initialData?.services?.[0] ?? ''),
  }));

  useEffect(() => {
    // Auto-fill seller info on create mode
    if (mode === 'create' && user && userProfile) {
      setForm((p) => ({
        ...p,
        sellerId: user.uid,
        sellerName: userProfile.name,
      }));
    }
  }, [mode, user, userProfile]);
  
  useEffect(() => {
      // Set a default pack if none is selected and packs are loaded
      if (mode === 'create' && !form.selectedPackTitle && servicePacks.length > 0) {
          const recommendedPack = servicePacks.find(p => p.recommended) || servicePacks[0];
          setForm(p => ({ ...p, selectedPackTitle: recommendedPack.title }));
      }
  }, [servicePacks, form.selectedPackTitle, mode]);


  const handleChange = (key: keyof ProposalInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db) return;
    if (!form.selectedPackTitle) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, selecciona un pack de servicios.',
      });
      return;
    }
    setLoading(true);

    const selectedPack = servicePacks.find(p => p.title === form.selectedPackTitle);
    
    if (!selectedPack) {
        toast({ variant: 'destructive', title: 'Error', description: 'El pack seleccionado no es válido.' });
        setLoading(false);
        return;
    }

    const now = new Date();
    const newProposalId = mode === 'create' ? `PROP-${now.getTime()}` : proposalId;

    const payload: Omit<Proposal, 'id'> & { id: string } = {
      id: newProposalId!,
      prospectId: prospectId ?? initialData?.prospectId ?? null,
      clientName: form.clientName.trim(),
      services: [selectedPack.title], // Initially just the selected pack
      sellerId: form.sellerId ?? null,
      sellerName: form.sellerName.trim(),
      date: form.date,
      status: form.status,
      totalAmount: selectedPack.priceValue,
      contactNumber: form.contactNumber?.trim() || '',
      email: form.email?.trim() || '',
      notes: form.notes?.trim() || '',
      createdAt:
        mode === 'create'
          ? now.toISOString()
          : initialData?.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      const docRef = doc(db, 'proposals', newProposalId!);
      await setDoc(docRef, payload); // Use setDoc for both create and edit to ensure consistency
      
      toast({ title: `Propuesta ${mode === 'create' ? 'creada' : 'actualizada'} con éxito` });
      
      onSuccess?.(newProposalId);

    } catch (e: any) {
      const isPermissionError = e.code === 'permission-denied';
      if (isPermissionError) {
        const permissionError = new FirestorePermissionError({
          path: `proposals/${newProposalId}`,
          operation: mode === 'create' ? 'create' : 'update',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error de Permiso',
          description: 'No tienes permisos para realizar esta acción.',
        });
      } else {
        console.error('Error submitting form: ', e);
        toast({
          variant: 'destructive',
          title: 'Error inesperado',
          description: 'Hubo un problema al guardar los datos.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingPacks) {
    return <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
        </div>
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Cliente</Label>
          <Input
            value={form.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="Nombre del cliente"
            disabled
          />
        </div>
        <div>
          <Label>Vendedor</Label>
          <Input
            value={form.sellerName}
            onChange={(e) => handleChange('sellerName', e.target.value)}
            placeholder="Nombre del vendedor"
            disabled // Auto-filled
          />
        </div>
        <div className="md:col-span-2">
          <Label>Pack de Servicio a Ofrecer</Label>
          <Select
            value={form.selectedPackTitle}
            onValueChange={(v: any) => handleChange('selectedPackTitle', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un pack..." />
            </SelectTrigger>
            <SelectContent>
              {servicePacks.map(pack => (
                <SelectItem key={pack.id} value={pack.title}>
                  {pack.title} ({new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(pack.priceValue)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Notas Adicionales</Label>
          <Textarea
            value={form.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Condiciones, observaciones, etc."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={() => onSuccess?.()}>Cancelar</Button>
        <Button variant="default" onClick={handleSubmit} disabled={loading || !form.selectedPackTitle}>
          {loading
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear y Enviar Propuesta'
            : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}

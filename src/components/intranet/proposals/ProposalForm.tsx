'use client';

import { useFirestore, useUser } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Proposal } from '@/lib/types';


type FormMode = 'create' | 'edit';

type ProposalInput = {
  clientName: string;
  servicesCsv: string; // "Pack Standard, Capilla Virtual"
  sellerId?: string | null;
  sellerName: string;
  date: string; // ISO
  status: 'Borrador' | 'Propuesta Enviada' | 'Propuesta Aceptada' | 'Propuesta Rechazada';
  totalAmount?: number;
  contactNumber?: string;
  email?: string;
  notes?: string;
};

export default function ProposalForm({
  mode,
  proposalId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  proposalId?: string;
  initialData?: any;
  onSuccess?: () => void;
}) {
  const { firestore } = useFirestore();
  const { user, userProfile } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProposalInput>(() => ({
    clientName: initialData?.clientName ?? '',
    servicesCsv: (initialData?.services ?? []).join(', '),
    sellerId: initialData?.sellerId ?? null,
    sellerName: initialData?.sellerName ?? '',
    date: initialData?.date ?? new Date().toISOString(),
    status: initialData?.status ?? 'Borrador',
    totalAmount: initialData?.totalAmount ?? undefined,
    contactNumber: initialData?.contactNumber ?? '',
    email: initialData?.email ?? '',
    notes: initialData?.notes ?? '',
  }));

  useEffect(() => {
    // Auto-fill seller info on create mode
    if (mode === 'create' && user && userProfile) {
        setForm(p => ({
            ...p,
            sellerId: user.uid,
            sellerName: userProfile.name,
        }));
    }
  }, [mode, user, userProfile]);

  const handleChange = (key: keyof ProposalInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!firestore) return;
    setLoading(true);
    
    const payload: Omit<Proposal, 'id'> = {
        prospectId: initialData?.prospectId ?? null,
        clientName: form.clientName.trim(),
        services: form.servicesCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        sellerId: form.sellerId ?? null,
        sellerName: form.sellerName.trim(),
        date: form.date,
        status: form.status,
        totalAmount: form.totalAmount ? Number(form.totalAmount) : 0,
        contactNumber: form.contactNumber?.trim() || '',
        email: form.email?.trim() || '',
        notes: form.notes?.trim() || '',
        createdAt: mode === 'create' ? new Date().toISOString() : initialData?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    try {
      if (mode === 'create') {
        const collectionRef = collection(firestore, 'proposals');
        addDoc(collectionRef, payload)
          .then(() => {
            toast({ title: 'Propuesta creada con éxito' });
            onSuccess?.();
          })
          .catch((serverError) => {
             const permissionError = new FirestorePermissionError({ path: 'proposals', operation: 'create', requestResourceData: payload });
             errorEmitter.emit('permission-error', permissionError);
          });
      } else {
        if (!proposalId) throw new Error('proposalId requerido para editar');
        const docRef = doc(firestore, 'proposals', proposalId);
        updateDoc(docRef, payload)
          .then(() => {
             toast({ title: 'Propuesta actualizada con éxito' });
             onSuccess?.();
          })
          .catch((serverError) => {
             const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload });
             errorEmitter.emit('permission-error', permissionError);
          });
      }
    } catch (e) {
       console.error("Error submitting form: ", e);
       toast({ variant: 'destructive', title: 'Error inesperado', description: 'Hubo un problema al guardar los datos.'})
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Cliente</Label>
          <Input
            value={form.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="Nombre del cliente"
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
          <Label>Servicios (separados por coma)</Label>
          <Input
            value={form.servicesCsv}
            onChange={(e) => handleChange('servicesCsv', e.target.value)}
            placeholder="Pack Standard, Capilla Virtual"
          />
        </div>
        <div>
          <Label>Fecha</Label>
          <Input
            type="datetime-local"
            value={toLocalInput(form.date)}
            onChange={(e) =>
              handleChange('date', new Date(e.target.value).toISOString())
            }
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Select
            value={form.status}
            onValueChange={(v: any) => handleChange('status', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Borrador">Borrador</SelectItem>
              <SelectItem value="Propuesta Enviada">Propuesta Enviada</SelectItem>
              <SelectItem value="Propuesta Aceptada">Propuesta Aceptada</SelectItem>
              <SelectItem value="Propuesta Rechazada">Propuesta Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Total (CLP)</Label>
          <Input
            type="number"
            value={form.totalAmount ?? ''}
            onChange={(e) => handleChange('totalAmount', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="1450000"
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            value={form.contactNumber ?? ''}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="cliente@mail.com"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Notas</Label>
          <Textarea
            value={form.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Condiciones, observaciones, etc."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="default" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Propuesta' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return '';
  }
}

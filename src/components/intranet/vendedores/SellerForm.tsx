'use client';

import { useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Seller } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormMode = 'create' | 'edit';

type SellerFormInput = Omit<Seller, 'id' | 'createdAt' | 'updatedAt' | 'avatar' | 'sales' | 'conversionRate' | 'pass' | 'user'>;

export default function SellerForm({
  mode,
  sellerId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  sellerId?: string;
  initialData?: Partial<Seller>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SellerFormInput>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    initials: initialData?.initials ?? '',
    status: initialData?.status ?? 'Activo',
    commission: initialData?.commission ?? 0,
    role: initialData?.role ?? 'Vendedor',
  });

  const handleChange = (key: keyof SellerFormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db) return;
    if (mode === 'edit' && !sellerId) return;

    setLoading(true);

    const now = new Date().toISOString();
    
    try {
        if (mode === 'create') {
            const newId = `VEND-${Date.now()}`;
            const newSeller: Seller = {
                id: newId,
                ...form,
                commission: Number(form.commission),
                sales: 0,
                conversionRate: 0,
                avatar: '',
                user: '', // These should be handled by a more secure auth flow
                pass: '', // These should be handled by a more secure auth flow
                createdAt: now,
                updatedAt: now,
            };
            const docRef = doc(db, 'sellers', newId);
            await setDoc(docRef, newSeller);
            toast({ title: 'Vendedor creado con éxito' });
        } else { // edit mode
            const payload = {
                ...form,
                commission: Number(form.commission),
                updatedAt: now,
            };
            const docRef = doc(db, 'sellers', sellerId!);
            await updateDoc(docRef, payload);
            toast({ title: 'Vendedor actualizado con éxito' });
        }
        onSuccess?.();
    } catch (e: any) {
      console.error('Error submitting form: ', e);
       const permissionError = new FirestorePermissionError({
          path: mode === 'create' ? `sellers/NEW_SELLER` : `sellers/${sellerId}`,
          operation: mode === 'create' ? 'create' : 'update',
          requestResourceData: form,
        });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: 'No tienes permisos para realizar esta acción.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
        <div>
          <Label>Iniciales</Label>
          <Input value={form.initials} onChange={(e) => handleChange('initials', e.target.value)} />
        </div>
        <div>
          <Label>Comisión (%)</Label>
          <Input type="number" value={form.commission} onChange={(e) => handleChange('commission', e.target.value)} />
        </div>
        <div>
            <Label>Rol</Label>
            <Select value={form.role} onValueChange={(v: any) => handleChange('role', v)}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Vendedor Senior">Vendedor Senior</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v: any) => handleChange('status', v)}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Vendedor' : 'Guardar Cambios')}
        </Button>
      </div>
    </div>
  );
}

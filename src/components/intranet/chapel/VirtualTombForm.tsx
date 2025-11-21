'use client';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { VirtualTomb, Dedication } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type FormMode = 'create' | 'edit';
type FormInput = Omit<VirtualTomb, 'id' | 'createdAt' | 'updatedAt'>;

function dedicationsReducer(state: Dedication[], action: any): Dedication[] {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return state.map((d, i) => i === action.index ? { ...d, [action.field]: action.value } : d);
        case 'ADD':
            return [...state, { author: '', message: '', date: new Date().toISOString() }];
        case 'REMOVE':
            return state.filter((_, i) => i !== action.index);
        default:
            return state;
    }
}


export default function VirtualTombForm({
  mode,
  tombId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  tombId?: string;
  initialData?: Partial<VirtualTomb>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<Partial<FormInput>>({
    name: initialData?.name ?? '',
    birthDate: initialData?.birthDate ? format(new Date(initialData.birthDate), 'yyyy-MM-dd') : '',
    passingDate: initialData?.passingDate ? format(new Date(initialData.passingDate), 'yyyy-MM-dd') : '',
    mainImage: initialData?.mainImage ?? '',
    gallery: initialData?.gallery ?? [],
  });

  const [dedications, dispatchDedications] = useReducer(dedicationsReducer, initialData?.dedications ?? []);
  
  const handleChange = (key: keyof FormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !tombId)) return;
    setLoading(true);

    const payload = {
      ...form,
      birthDate: new Date(form.birthDate!).toISOString(),
      passingDate: new Date(form.passingDate!).toISOString(),
      dedications: dedications,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'edit') {
        const docRef = doc(db, 'virtualTombs', tombId!);
        await updateDoc(docRef, payload);
        toast({ title: 'Homenaje actualizado con éxito' });
      }
      onSuccess?.();
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: `virtualTombs/${tombId}`,
        operation: 'update',
        requestResourceData: payload,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error de Permiso', description: 'No tienes permisos para editar homenajes.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nombre del Homenajeado</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label>Fecha de Nacimiento</Label>
          <Input type="date" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} />
        </div>
        <div>
          <Label>Fecha de Fallecimiento</Label>
          <Input type="date" value={form.passingDate} onChange={(e) => handleChange('passingDate', e.target.value)} />
        </div>
         <div className="col-span-2">
            <Label>Imagen Principal</Label>
            <Select value={form.mainImage} onValueChange={(v) => handleChange('mainImage', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar imagen..." /></SelectTrigger>
                <SelectContent>
                    {PlaceHolderImages.map((img) => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}
                </SelectContent>
            </Select>
         </div>
         <div className="col-span-2">
            <Label>Galería de Imágenes</Label>
            <div className="grid grid-cols-3 gap-2">
                 {form.gallery?.map((imgId, index) => (
                    <Select key={index} value={imgId} onValueChange={(v) => {
                        const newGallery = [...form.gallery!];
                        newGallery[index] = v;
                        handleChange('gallery', newGallery);
                    }}>
                        <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                        <SelectContent>
                            {PlaceHolderImages.map((img) => <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 ))}
                 <Button variant="outline" onClick={() => handleChange('gallery', [...form.gallery!, ''])}>Añadir</Button>
            </div>
         </div>

        <div className="col-span-2 space-y-4">
            <div className='flex justify-between items-center'>
                <Label>Dedicaciones</Label>
                <Button variant="outline" size="sm" onClick={() => dispatchDedications({ type: 'ADD' })}>
                    <Plus className="mr-2 h-4 w-4" /> Añadir Dedicatoria
                </Button>
            </div>
            <Card className="p-4 space-y-4">
                <CardContent className="p-0 space-y-4">
                    {dedications.map((dedication, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded-md">
                            <div className="flex-grow space-y-2">
                                <Input 
                                    placeholder="Autor" 
                                    value={dedication.author}
                                    onChange={(e) => dispatchDedications({ type: 'UPDATE_FIELD', index, field: 'author', value: e.target.value })}
                                />
                                <Textarea 
                                    placeholder="Mensaje de la dedicación"
                                    value={dedication.message}
                                    onChange={(e) => dispatchDedications({ type: 'UPDATE_FIELD', index, field: 'message', value: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => dispatchDedications({ type: 'REMOVE', index })}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {dedications.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay dedicatorias.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}

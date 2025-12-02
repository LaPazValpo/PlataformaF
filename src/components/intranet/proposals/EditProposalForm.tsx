'use client';
import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { Proposal, ServicePack, IndividualService, VirtualChapelPlan } from '@/lib/types';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type SelectableService = ServicePack | IndividualService | VirtualChapelPlan;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
};
  

export default function EditProposalForm({
  proposal,
  onSuccess,
}: {
  proposal: Proposal;
  onSuccess: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  
  const { data: servicePacks, loading: loadingPacks } = useCollection<ServicePack>('servicePacks');
  const { data: individualServices, loading: loadingIndividual } = useCollection<IndividualService>('individualServices');
  const { data: virtualChapelPlans, loading: loadingChapel } = useCollection<VirtualChapelPlan>('virtualChapelPlans');

  const [selectedServices, setSelectedServices] = useState<SelectableService[]>([]);
  const [finalAmount, setFinalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = loadingPacks || loadingIndividual || loadingChapel;
  const allServices = useMemo(() => [...servicePacks, ...individualServices, ...virtualChapelPlans], [servicePacks, individualServices, virtualChapelPlans]);
  const servicePackTitles = useMemo(() => new Set(servicePacks.map(p => p.title)), [servicePacks]);

  useEffect(() => {
    if (isLoading || allServices.length === 0) return;

    let initialServices: SelectableService[] = [];
    if (proposal.services?.length) {
        initialServices = proposal.services
            .map(title => allServices.find(s => s.title === title))
            .filter((s): s is SelectableService => s !== undefined);
    } else {
        const recommendedPack = servicePacks.find(p => p.recommended) || servicePacks[0];
        if (recommendedPack) initialServices.push(recommendedPack);
    }

    setSelectedServices(initialServices);

    const calculatedTotal = initialServices.reduce((acc, service) => acc + (service.priceValue ?? 0), 0);
    setFinalAmount(proposal.totalAmount ?? calculatedTotal);

  }, [proposal, isLoading, allServices, servicePacks]);

  const { calculatedTotal, mainPack } = useMemo(() => {
    const pack = selectedServices.find(s => servicePackTitles.has(s.title)) as ServicePack | undefined;
    const total = selectedServices.reduce((acc, service) => acc + (service.priceValue ?? 0), 0);
    return { calculatedTotal: total, mainPack: pack };
  }, [selectedServices, servicePackTitles]);
  
  useEffect(() => {
    // This effect should only run when the calculatedTotal changes,
    // to avoid overriding manual input.
    setFinalAmount(calculatedTotal);
  }, [calculatedTotal]);

  const handlePackChange = (newPackTitle: string) => {
    const newPack = servicePacks.find(p => p.title === newPackTitle);
    if (!newPack) return;

    setSelectedServices(prev => {
      const otherServices = prev.filter(s => !servicePackTitles.has(s.title));
      return [newPack, ...otherServices];
    });
  };
  
  const handleServiceToggle = (service: IndividualService | VirtualChapelPlan) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleUpdateProposal = async () => {
    if (!db || !proposal) return;
    setIsSubmitting(true);

    const proposalRef = doc(db, 'proposals', proposal.id);
    const updatedPayload = {
        services: selectedServices.map(s => s.title),
        totalAmount: finalAmount,
        updatedAt: new Date().toISOString(),
    };

    try {
        await updateDoc(proposalRef, updatedPayload);
        toast({
            title: '¡Propuesta Actualizada!',
            description: `La propuesta para ${proposal.clientName} ha sido guardada con los nuevos cambios.`
        });
        onSuccess();
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: proposalRef.path,
            operation: 'update',
            requestResourceData: updatedPayload
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: 'Error al actualizar la propuesta',
            description: 'No tienes los permisos necesarios para realizar esta acción.'
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="space-y-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        <Skeleton className="h-20 w-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
        <div className="space-y-4">
            <div>
                <Label>Pack Principal</Label>
                <Select onValueChange={handlePackChange} defaultValue={mainPack?.title}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar un pack..." /></SelectTrigger>
                    <SelectContent>
                        {servicePacks.map(pack => (
                            <SelectItem key={pack.id} value={pack.title}>
                                {pack.title} - {formatCurrency(pack.priceValue)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label>Servicios Adicionales</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                    {[...individualServices, ...virtualChapelPlans].map(service => (
                        <div key={service.id} className="flex items-center gap-2">
                             <Checkbox
                                id={`edit-check-${service.id}`}
                                checked={selectedServices.some(s => s.id === service.id)}
                                onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <Label htmlFor={`edit-check-${service.id}`} className="font-normal cursor-pointer">
                                {service.title} (+{formatCurrency(service.priceValue)})
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal (calculado):</span>
                <span className="font-medium">{formatCurrency(calculatedTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
                <Label htmlFor="finalAmount" className="text-lg font-bold">Monto Final (editable)</Label>
                <Input
                    id="finalAmount"
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(Number(e.target.value))}
                    className="w-40 text-right text-lg font-bold"
                />
            </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onSuccess} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleUpdateProposal} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios en Propuesta'}
            </Button>
        </div>
    </div>
  )
}

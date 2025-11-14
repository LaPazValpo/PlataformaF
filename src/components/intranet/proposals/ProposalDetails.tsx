'use client';

import { useDoc } from '@/firebase';
import type { Proposal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProposalDetails({ proposalId }: { proposalId: string }) {
  const { data, loading } = useDoc<Proposal>('proposals', proposalId);

  if (loading) {
      return (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
          </div>
      )
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Propuesta no encontrada.</div>;
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <Info label="Fecha" value={new Date(data.date).toLocaleString()} />
        <Info label="Estado" value={data.status} />
        <Info label="Cliente" value={data.clientName} />
        <Info label="Vendedor" value={data.sellerName ?? '-'} />
        <Info
          label="Total"
          value={data.totalAmount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) ?? '-'}
        />
        <Info label="Teléfono" value={data.contactNumber ?? '-'} />
        <Info label="Email" value={data.email ?? '-'} />
      </div>
      <div>
        <div className="font-medium">Servicios</div>
        <ul className="list-disc pl-5 mt-1 text-muted-foreground">
          {(data.services ?? []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      {data.notes && (
        <div>
          <div className="font-medium">Notas</div>
          <p className="whitespace-pre-wrap text-muted-foreground">{data.notes}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t text-xs text-muted-foreground">
        <Info label="Creado" value={data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'} />
        <Info label="Actualizado" value={data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

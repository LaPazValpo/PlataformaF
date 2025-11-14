'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Proposal } from '@/lib/types';
import { useCollection } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown } from 'lucide-react';

const getStatusVariant = (status: Proposal['status']) => {
  switch (status) {
    case 'Propuesta Enviada':
      return 'secondary';
    case 'En Negociación':
      return 'default';
    case 'Aceptada':
      return 'default'; // Success
    case 'Rechazada':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const columns: ColumnDef<Proposal>[] = [
    {
        accessorKey: 'clientName',
        header: 'Cliente',
    },
    {
        accessorKey: 'date',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Fecha de Envío
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>{format(new Date(row.getValue('date')), 'dd MMM yyyy', { locale: es })}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => (
            <Badge variant={getStatusVariant(row.getValue('status'))}>
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'seller',
        header: 'Vendedor',
    },
    {
        accessorKey: 'services',
        header: 'Servicios Cotizados',
        cell: ({ row }) => (row.getValue('services') as string[]).join(', '),
    },
];

function ProposalsSkeleton() {
    return (
        <div className="w-full">
            <PageHeader
                title="Propuestas Comerciales"
                description="Revisa el estado de las propuestas enviadas a los clientes."
            />
            <div className="flex items-center py-4">
                <Skeleton className="h-10 w-full max-w-sm" />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(5)].map((_, i) => (
                                <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(5)].map((_, j) => (
                                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default function ProposalsPage() {
    const { data: proposals, loading } = useCollection<Proposal>('proposals');
    
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data: proposals,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    if (loading) {
        return <ProposalsSkeleton />;
    }

    return (
        <div className="w-full">
            <PageHeader
                title="Propuestas Comerciales"
                description="Revisa el estado de las propuestas enviadas a los clientes."
            />
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por cliente..."
                    value={(table.getColumn('clientName')?.getFilterValue() as string) ?? ''}
                    onChange={event => table.getColumn('clientName')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        No hay propuestas.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
    );
}

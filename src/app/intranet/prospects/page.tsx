'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Prospect } from '@/lib/types';
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

const getStatusVariant = (status: Prospect['status']) => {
  switch (status) {
    case 'Nuevo':
      return 'default';
    case 'Contactado':
    case 'En Seguimiento':
      return 'secondary';
    case 'Venta Ganada':
      return 'default'; // Success variant could be green
    case 'Venta Perdida':
    case 'No Calificado':
      return 'destructive';
    default:
      return 'outline';
  }
};


export const columns: ColumnDef<Prospect>[] = [
    {
        accessorKey: 'clientName',
        header: 'Cliente',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('clientName')}</div>
        ),
    },
    {
        accessorKey: 'contactNumber',
        header: 'Contacto',
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                <div>{row.original.contactNumber}</div>
                <div className="text-xs">{row.original.email}</div>
            </div>
        )
    },
    {
        accessorKey: 'date',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Fecha de Ingreso
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>{format(new Date(row.getValue('date')), 'dd MMM yyyy, HH:mm', { locale: es })}</div>
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
        accessorKey: 'sellerName',
        header: 'Vendedor Asignado',
    },
];

function ProspectsSkeleton() {
    return (
        <div className="w-full">
            <PageHeader
                title="Prospección de Ventas"
                description="Gestiona los potenciales clientes desde el primer contacto hasta el cierre."
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

export default function ProspectsPage() {
    const { data: prospects, loading } = useCollection<Prospect>('prospects');
    
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data: prospects,
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
        return <ProspectsSkeleton />;
    }

    return (
        <div className="w-full">
            <PageHeader
                title="Prospección de Ventas"
                description="Gestiona los potenciales clientes desde el primer contacto hasta el cierre."
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
                        No hay prospectos.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
    );
}

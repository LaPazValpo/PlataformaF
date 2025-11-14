'use client';

import * as React from 'react';
import {
  CaretSortIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
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

import { sellers, sales } from '@/lib/data';
import type { Seller } from '@/lib/types';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type SellerPerformance = Seller & {
  totalSalesValue: number;
  commissionEarned: number;
};

const sellerPerformanceData: SellerPerformance[] = sellers.map(seller => {
  const sellerSales = sales.filter(sale => sale.seller === seller.name);
  const totalSalesValue = sellerSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const commissionEarned = totalSalesValue * (seller.commission / 100);

  return {
    ...seller,
    totalSalesValue,
    commissionEarned,
  };
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

export const columns: ColumnDef<SellerPerformance>[] = [
  {
    accessorKey: 'name',
    header: 'Vendedor',
    cell: ({ row }) => {
      const seller = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://picsum.photos/seed/${seller.id}/40/40`} />
            <AvatarFallback>{seller.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{seller.name}</span>
            <span className="text-sm text-muted-foreground">{seller.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'sales',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Ventas (Unidades)
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('sales')}</div>,
  },
  {
    accessorKey: 'totalSalesValue',
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full"
        >
          Ventas (Valor)
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('totalSalesValue'))}</div>,
  },
  {
    accessorKey: 'conversionRate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Tasa de Conversión
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('conversionRate')}%</div>,
  },
  {
    accessorKey: 'commissionEarned',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Comisión Ganada
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('commissionEarned'))}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <div className="capitalize">
        <Badge variant={row.getValue('status') === 'Activo' ? 'default' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      </div>
    ),
  },
];

export default function SalesPerformancePage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: sellerPerformanceData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <PageHeader
        title="Rendimiento de Ventas"
        description="Analiza el rendimiento de cada vendedor."
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por vendedor..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id === 'name' ? 'Vendedor' :
                   column.id === 'sales' ? 'Ventas (Unidades)' :
                   column.id === 'totalSalesValue' ? 'Ventas (Valor)' :
                   column.id === 'conversionRate' ? 'Tasa de Conversión' :
                   column.id === 'commissionEarned' ? 'Comisión Ganada' :
                   column.id === 'status' ? 'Estado' : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

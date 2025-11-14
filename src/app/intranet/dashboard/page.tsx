'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { PageHeader } from '@/components/common/page-header';
import { prospects, sales, sellers } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, Briefcase, Users, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalProspects = prospects.length;
  const conversionRate = totalProspects > 0 ? (sales.length / totalProspects) * 100 : 0;
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  const salesByMonth = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += sale.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesByMonth).map(([name, total]) => ({ name, total, pv: total, uv: total })).slice(-6);

  const chartConfig = {
    total: {
      label: 'Ventas',
      color: 'hsl(var(--chart-1))',
    },
  };
  
  const recentSales = sales.slice(-5).reverse();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Bienvenido al centro de control de Paz Final."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">+5.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospectos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalProspects}</div>
            <p className="text-xs text-muted-foreground">+12.2% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+2.5% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(averageSale)}
            </div>
            <p className="text-xs text-muted-foreground">-1.2% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableBody>
                    {recentSales.map((sale) => {
                        const seller = sellers.find(s => s.name === sale.seller);
                        return (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="hidden h-9 w-9 sm:flex">
                                            <AvatarImage src={`https://picsum.photos/seed/${seller?.id}/100/100`} alt="Avatar" />
                                            <AvatarFallback>{seller?.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid gap-0.5">
                                            <p className="font-medium">{sale.clientName}</p>
                                            <p className="text-xs text-muted-foreground">{sale.seller}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">
                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(sale.totalAmount)}
                                    </div>
                                    <Badge className="text-xs" variant="outline">
                                        {sale.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

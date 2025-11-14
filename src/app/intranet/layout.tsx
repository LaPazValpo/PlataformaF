'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Church,
  HandCoins,
  LayoutDashboard,
  Package,
  PanelLeft,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/intranet/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/intranet/sales', icon: HandCoins, label: 'Rendimiento' },
  { href: '/intranet/services', icon: Package, label: 'Servicios' },
  { href: '/intranet/inventory', icon: Warehouse, label: 'Inventario' },
  { href: '/intranet/content', icon: Sparkles, label: 'Contenido IA' },
  { href: '/intranet/chapel', icon: Church, label: 'Capilla Virtual' },
];

function PazFinalLogo() {
  return (
    <div className="flex items-center gap-2.5 text-sidebar-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <svg
          className="h-5 w-5 text-accent-foreground"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-lg font-bold">Paz Final</span>
    </div>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <PazFinalLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{
                      children: item.label,
                      side: 'right',
                      className: 'bg-sidebar-background text-sidebar-foreground',
                    }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-2 bg-sidebar-border" />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/admin/100/100`} />
            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
             <span className="text-sm font-medium text-sidebar-foreground">{user?.displayName ?? 'Admin'}</span>
             <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function IntranetLayoutSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <PazFinalLogo />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // Solo toma una decisión cuando la carga haya finalizado
    if (!loading) {
      // Si después de cargar, no hay usuario o el usuario no tiene un rol,
      // entonces redirige al login.
      if (!user || !userProfile?.role) {
        router.replace('/login');
      }
    }
  }, [user, userProfile, loading, router]);
  
  // Mientras el hook `useUser` está cargando la autenticación Y el perfil de Firestore,
  // muestra el esqueleto de carga.
  if (loading) {
    return <IntranetLayoutSkeleton />;
  }
  
  // Si la carga finalizó y tenemos un usuario con un perfil y rol válidos,
  // muestra el contenido de la intranet.
  if (user && userProfile?.role) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
              <SidebarTrigger className="md:hidden"/>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Si la carga ha finalizado pero el usuario no está autorizado (el useEffect se encargará
  // de la redirección), muestra el esqueleto para evitar un parpadeo de contenido no deseado.
  return <IntranetLayoutSkeleton />;
}

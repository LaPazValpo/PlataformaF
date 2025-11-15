'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Church,
  FileText,
  HandCoins,
  LayoutDashboard,
  Package,
  PanelLeft,
  Sparkles,
  Users,
  Warehouse,
  Briefcase,
  LogOut,
  ImageIcon,
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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import logo from '@/logo.png';

const navItems = [
  { href: '/intranet/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { type: 'divider', label: 'Gestión de Ventas' },
  { href: '/intranet/sales', icon: HandCoins, label: 'Ventas' },
  { href: '/intranet/clients', icon: Users, label: 'Clientes' },
  { href: '/intranet/vendedores', icon: Briefcase, label: 'Vendedores' },
  { type: 'divider', label: 'Catálogo' },
  { href: '/intranet/services', icon: Package, label: 'Servicios' },
  { href: '/intranet/inventory', icon: Warehouse, label: 'Inventario' },
  { href: '/intranet/chapel', icon: Church, label: 'Capilla Virtual' },
  { href: '/intranet/gallery', icon: ImageIcon, label: 'Galería' },
  { type: 'divider', label: 'Herramientas' },
  { href: '/intranet/content', icon: Sparkles, label: 'Contenido IA' },
];

function PazFinalLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 text-sidebar-foreground p-2">
      <Image 
        src={logo} 
        alt="Paz Final Logo" 
        width={245} 
        height={81} 
        className="invert brightness-100"
      />
    </div>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { user, userProfile } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <PazFinalLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item, index) => {
            if (item.type === 'divider') {
              return <Separator key={`divider-${index}`} className="my-2 bg-sidebar-border" />;
            }
             return (
               <SidebarMenuItem key={item.href}>
                  <Link href={item.href!}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href!)}
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
             )
          })}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-2 bg-sidebar-border" />
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/admin/100/100`} />
                <AvatarFallback>{user?.email?.[0].toUpperCase() ?? 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-sm font-medium text-sidebar-foreground">{userProfile?.name ?? 'Admin'}</span>
                <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
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
    // Only check after the initial loading is complete
    if (!loading) {
      // If there's no user or the user doesn't have a role, redirect to login
      if (!user || !userProfile?.role) {
        router.replace('/login');
      }
    }
  }, [user, userProfile, loading, router]);
  
  // While loading, or if the user is not yet available, show the skeleton.
  // This prevents the brief flash of content before the redirection check.
  if (loading || !user || !userProfile?.role) {
    return <IntranetLayoutSkeleton />;
  }
  
  // If loading is complete and user has a role, show the content.
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

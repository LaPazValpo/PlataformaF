'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'Cómo Afrontar el Duelo: Una Guía para Tiempos Difíciles',
    description: 'El duelo es un proceso personal y único. Aquí te ofrecemos algunos consejos para navegar estos momentos complicados y encontrar consuelo.',
    imageUrl: 'https://picsum.photos/seed/blog1/600/400',
    imageHint: 'grief support',
    date: '15 de Julio, 2024',
    author: 'Equipo Paz Final',
  },
  {
    id: 2,
    title: 'La Importancia de los Rituales Funerarios',
    description: 'Los rituales nos ayudan a procesar la pérdida y a honrar la vida de nuestros seres queridos. Explora por qué son tan significativos.',
    imageUrl: 'https://picsum.photos/seed/blog2/600/400',
    imageHint: 'funeral ritual',
    date: '5 de Julio, 2024',
    author: 'Equipo Paz Final',
  },
  {
    id: 3,
    title: 'Capillas Virtuales: Conectando Corazones a la Distancia',
    description: 'Descubre cómo la tecnología nos permite estar cerca de nuestros seres queridos, sin importar dónde se encuentren.',
    imageUrl: 'https://picsum.photos/seed/blog3/600/400',
    imageHint: 'virtual connection',
    date: '28 de Junio, 2024',
    author: 'Equipo Paz Final',
  },
];


export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
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
          <span className="sr-only">Paz Final</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Inicio
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Blog
          </Link>
          <Link href="/contacto" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contacto
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Intranet
          </Link>
        </nav>
      </header>
      <main className="flex-1 container py-8">
        <PageHeader
          title="Blog de Paz Final"
          description="Un espacio de reflexión, apoyo y acompañamiento."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint={post.imageHint}
                />
                <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.date} por {post.author}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{post.description}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

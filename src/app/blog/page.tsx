'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Cómo Afrontar el Duelo: Una Guía para Tiempos Difíciles',
    description: 'El duelo es un proceso personal y único. Aquí te ofrecemos algunos consejos para navegar estos momentos complicados y encontrar consuelo.',
    imageUrl: 'https://picsum.photos/seed/blog1/600/400',
    imageHint: 'grief support',
    date: '15 de Julio, 2024',
    author: 'Equipo Paz Final',
    slug: 'como-afrontar-el-duelo',
  },
  {
    id: 2,
    title: 'La Importancia de los Rituales Funerarios',
    description: 'Los rituales nos ayudan a procesar la pérdida y a honrar la vida de nuestros seres queridos. Explora por qué son tan significativos.',
    imageUrl: 'https://picsum.photos/seed/blog2/600/400',
    imageHint: 'funeral ritual',
    date: '5 de Julio, 2024',
    author: 'Equipo Paz Final',
    slug: 'importancia-rituales-funerarios',
  },
  {
    id: 3,
    title: 'Capillas Virtuales: Conectando Corazones a la Distancia',
    description: 'Descubre cómo la tecnología nos permite estar cerca de nuestros seres queridos, sin importar dónde se encuentren.',
    imageUrl: 'https://picsum.photos/seed/blog3/600/400',
    imageHint: 'virtual connection',
    date: '28 de Junio, 2024',
    author: 'Equipo Paz Final',
    slug: 'capillas-virtuales',
  },
];


export default function BlogPage() {
  return (
      <main className="flex-1 container py-8">
        <PageHeader
          title="Blog de Paz Final"
          description="Un espacio de reflexión, apoyo y acompañamiento."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <Link href={`/blog`}>
                    <div className="relative h-48 w-full">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            width={600}
                            height={400}
                            className="object-cover"
                            data-ai-hint={post.imageHint}
                        />
                    </div>
                </Link>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">
                        <Link href={`/blog`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription>{post.date} por {post.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.description}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="link" asChild className="p-0">
                      <Link href={`/blog`}>
                        Leer más <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
            </Card>
          ))}
        </div>
      </main>
  );
}

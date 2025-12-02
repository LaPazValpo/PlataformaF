'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import logo from '@/logo.png';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAdminRole = (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const adminData = {
        role: 'Administrador',
        email: user.email,
        name: 'Admin Principal',
        id: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Intenta crear el documento. Si falla porque ya existe, intenta actualizarlo.
    // Esto es más seguro que `update` primero si el documento podría no existir.
    setDoc(userRef, adminData, { merge: true })
        .catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: { role: 'Administrador' },
             });
             errorEmitter.emit('permission-error', permissionError);
             toast({
                variant: 'destructive',
                title: 'Error de permisos',
                description: 'No se pudo asignar el rol de administrador.',
             });
        });
  };

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    if (!auth || !db) {
        toast({
            variant: 'destructive',
            title: 'Error de Inicialización',
            description: 'Los servicios de Firebase no están disponibles. Intenta recargar la página.',
        });
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (values.email === 'lapazdecristovalpo@gmail.com') {
        handleAdminRole(user);
      }

      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Redirigiendo al dashboard...',
      });
      router.push('/intranet/dashboard');

    } catch (error: any) {
      console.error("Login Error:", error);
      let description = 'Ocurrió un error inesperado.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'El correo electrónico o la contraseña son incorrectos.';
            break;
          case 'auth/network-request-failed':
            description = 'Error de red. Por favor, revisa tu conexión a internet.';
            break;
          case 'auth/too-many-requests':
            description = 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.';
            break;
          case 'auth/permission-denied':
             description = 'Permiso denegado por la configuración de Firebase Auth. Revisa las restricciones de tu API Key en Google Cloud.';
             break;
          default:
            description = `Error de autenticación: ${error.message}`;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: description,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
          <Image 
            src={logo} 
            alt="Paz Final Logo"
            width={200}
            height={66}
            className="mx-auto"
          />
          <CardDescription>
            Introduce tus credenciales para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@pazfinal.cl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Accediendo...' : 'Acceder'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

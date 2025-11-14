'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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

      // Asignar rol de Administrador si es el superusuario
      if (values.email === 'lapazdecristovalpo@gmail.com') {
        const userRef = doc(db, 'users', user.uid);
        
        try {
          // Primero, intenta actualizar el rol. Esto es eficiente si el documento ya existe.
          await updateDoc(userRef, {
             role: 'Administrador',
             updatedAt: new Date().toISOString() 
          });
        } catch (error: any) {
          // Si el documento no existe ('not-found'), lo creamos.
          if (error.code === 'not-found') {
            const adminData = {
              role: 'Administrador',
              email: user.email,
              name: 'Admin Principal',
              id: user.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            // Usamos setDoc para crear el documento por primera vez.
            await setDoc(userRef, adminData);
          } else {
            // Si es otro tipo de error (ej. de permisos), lo lanzamos para que sea capturado por el catch principal.
            throw error;
          }
        }
      }

      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Redirigiendo al dashboard...',
      });
      router.push('/intranet/dashboard');

    } catch (error: any) {
      console.error("Login Error:", error);
      let description = 'Ocurrió un error inesperado.';

      // Manejo de errores de Firestore (permisos al intentar asignar rol)
      if (error instanceof FirestorePermissionError || error.name === 'FirestorePermissionError' || (error.code && error.code.startsWith('permission-denied'))) {
         description = "No se pudo asignar el rol de administrador. Revisa las reglas de seguridad de la colección 'users'.";
         const permissionError = new FirestorePermissionError({
            path: `users/${auth.currentUser?.uid}`,
            operation: 'update', // o 'create'
            requestResourceData: { role: 'Administrador' },
         });
         errorEmitter.emit('permission-error', permissionError);
      }
      // Manejo de errores de Auth
      else if (error.code) {
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Intranet Paz Final</CardTitle>
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

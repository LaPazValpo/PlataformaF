'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('lapazdecristovalpo@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!auth) {
        setError("Error: El servicio de autenticación de Firebase no está disponible. Revisa la inicialización.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessUser(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccessUser(userCredential.user);
    } catch (err: any) {
      console.error("Auth Test Error:", err);
      setError(`[${err.code}]: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Página de Prueba de Autenticación</CardTitle>
          <CardDescription>
            Esta página prueba únicamente la función de `signInWithEmailAndPassword` de Firebase para aislar problemas de conexión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email del Superadministrador</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce la contraseña"
              autoFocus
            />
          </div>
          <Button onClick={handleLogin} disabled={isLoading || !password} className="w-full">
            {isLoading ? 'Probando...' : 'Probar Inicio de Sesión'}
          </Button>

          {successUser && (
            <div className="mt-4 rounded-md border border-green-500 bg-green-50 p-4 text-green-800">
              <h3 className="font-bold">¡Éxito!</h3>
              <p className="text-sm">Usuario autenticado correctamente.</p>
              <p className="mt-2 text-xs">Email: {successUser.email}</p>
              <p className="text-xs">UID: {successUser.uid}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
              <h3 className="font-bold">Error de Autenticación</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

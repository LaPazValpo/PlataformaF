# Manual de Desarrollo: Aplicación Funeraria La Paz de Cristo

## 1. Introducción

Este documento sirve como guía técnica para el desarrollo y mantenimiento de la aplicación. Contiene información sobre la arquitectura, el stack tecnológico, las convenciones de código y las directrices para trabajar con los distintos módulos del sistema.

## 2. Stack Tecnológico

- **Framework Frontend:** [Next.js](https://nextjs.org/) (con App Router)
- **Lenguaje:** TypeScript
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [ShadCN UI](https://ui.shadcn.com/)
- **Base de Datos:** [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Autenticación:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación.
- **Funcionalidad IA:** [Genkit](https://firebase.google.com/docs/genkit) (con modelos de Google AI)
- **Hosting:** Firebase App Hosting

## 3. Estructura del Proyecto

A continuación, se describe la estructura de las carpetas principales del proyecto:

```
/
├── src/
│   ├── app/                # Rutas de la aplicación (App Router de Next.js)
│   │   ├── (public)/       # Rutas públicas (home, blog, etc.)
│   │   ├── intranet/       # Rutas privadas del panel de administración
│   │   ├── proposal/[id]/  # Ruta pública dinámica para propuestas
│   │   ├── layout.tsx      # Layout principal
│   │   └── globals.css     # Estilos globales y variables de tema
│   │
│   ├── components/         # Componentes de React reutilizables
│   │   ├── common/         # Componentes genéricos (PageHeader)
│   │   ├── intranet/       # Componentes específicos de la intranet
│   │   ├── layout/         # Componentes de la estructura (Header, Footer)
│   │   └── ui/             # Componentes de ShadCN (Button, Card, etc.)
│   │
│   ├── firebase/           # Configuración y hooks de Firebase
│   │   ├── auth/           # Hooks y lógica de autenticación
│   │   ├── firestore/      # Hooks para interactuar con Firestore
│   │   ├── config.ts       # Configuración del proyecto Firebase
│   │   ├── index.ts        # Punto de entrada principal para utilidades de Firebase
│   │   └── provider.tsx    # Provider de React para el contexto de Firebase
│   │
│   ├── lib/                # Librerías, tipos y constantes
│   │   ├── data.ts         # Datos de ejemplo para poblar la base de datos
│   │   ├── types.ts        # Definiciones de tipos de TypeScript para la app
│   │   └── utils.ts        # Funciones de utilidad (ej. cn para clases)
│   │
│   └── ai/                 # Lógica de Inteligencia Artificial con Genkit
│       ├── flows/          # Flujos de Genkit para interactuar con LLMs
│       └── genkit.ts       # Configuración e inicialización de Genkit
│
├── docs/                   # Documentación del proyecto
│   ├── backend.json        # "Plano" de la estructura de la base de datos
│   └── *.md                # Manuales de marca y desarrollo
│
├── firestore.rules         # Reglas de Seguridad de Cloud Firestore
└── next.config.ts          # Configuración de Next.js
```

## 4. Trabajo con Firebase

Toda la interacción con Firebase se realiza del lado del cliente (`'use client'`).

### 4.1. Configuración e Inicialización

- **Configuración:** Las credenciales del proyecto Firebase se encuentran en `src/firebase/config.ts`.
- **Inicialización:** Firebase se inicializa una sola vez en `src/firebase/client-provider.tsx`, que envuelve toda la aplicación.
- **Acceso a Servicios:** Para acceder a `auth` o `firestore` dentro de un componente, utiliza los hooks `useAuth()` y `useFirestore()` exportados desde `src/firebase/index.ts`.

### 4.2. Lectura de Datos

Usa los hooks personalizados para leer datos en tiempo real:
- **`useCollection<T>(path)`:** Para leer una colección completa.
  - *Ejemplo:* `const { data: prospects, loading } = useCollection<Prospect>('prospects');`
- **`useDoc<T>(path, id)`:** Para leer un documento específico.
  - *Ejemplo:* `const { data: proposal, loading } = useDoc<Proposal>('proposals', proposalId);`

### 4.3. Escritura y Modificación de Datos

- Utiliza las funciones estándar del SDK de Firebase v9 (`setDoc`, `updateDoc`, `deleteDoc`, `writeBatch`).
- **Manejo de Errores de Permisos:** Envuelve las operaciones de escritura en un `.catch()` para emitir un `FirestorePermissionError`. Esto es crucial para depurar las reglas de seguridad. **No uses `try/catch` con `await` para esto.**

```typescript
// Ejemplo de actualización segura
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// ... dentro de una función
const docRef = doc(db, 'prospects', prospect.id);
updateDoc(docRef, updatedData)
  .catch((serverError) => {
    const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updatedData,
     });
     errorEmitter.emit('permission-error', permissionError);
     // Muestra un toast al usuario
  });
```

### 4.4. Reglas de Seguridad (`firestore.rules`)

- Este archivo define quién puede leer, escribir o eliminar datos en Firestore.
- Antes de implementar una nueva funcionalidad que acceda a la base de datos, **siempre** revisa y ajusta las reglas de seguridad para permitir esa operación de forma segura.
- Utiliza las funciones de ayuda como `isSignedIn()`, `isOwner()` y `isOneOfRoles()` para mantener las reglas limpias.

## 5. Desarrollo de Componentes

- **Ubicación:** Los nuevos componentes deben ubicarse en la carpeta `src/components/` dentro de la subcarpeta más apropiada.
- **Reutilización:** Prioriza la creación de componentes genéricos y reutilizables.
- **Estilos:** Usa clases de **Tailwind CSS**. Evita CSS en línea. Apóyate en las variables de color definidas en `globals.css` (ej. `bg-primary`, `text-accent`).
- **Estado:** Para el estado local, utiliza `useState` y `useEffect` de React. Para el estado global relacionado con Firebase, usa los hooks de Firebase.
- **Formularios:** Utiliza `react-hook-form` para la gestión de formularios y `zod` para la validación de esquemas, como se muestra en `src/app/contacto/page.tsx`.

## 6. Flujos de Trabajo Comunes

### Añadir una nueva página a la Intranet

1.  Crea una nueva carpeta en `src/app/intranet/mi-nueva-pagina/`.
2.  Dentro, crea un archivo `page.tsx`. Asegúrate de que comience con `'use client';`.
3.  Añade la nueva ruta al array `navItems` en `src/app/intranet/layout.tsx` para que aparezca en el menú lateral.
4.  Si la página necesita acceder a datos, usa los hooks `useCollection` o `useDoc`.
5.  Recuerda verificar `firestore.rules` para asegurar que los roles correctos tengan acceso a los datos necesarios.

### Modificar una Entidad de Datos

1.  **Actualiza el Tipo:** Modifica la interfaz correspondiente en `src/lib/types.ts`.
2.  **Actualiza el "Plano":** Refleja el cambio en `docs/backend.json`. Esto es crucial para mantener la documentación de la arquitectura de datos.
3.  **Ajusta el Código:** Modifica los componentes y formularios que usan esta entidad para reflejar los nuevos campos.
4.  **Revisa las Reglas de Seguridad:** Si has añadido campos que deben ser protegidos, actualiza `firestore.rules`.
5.  **Actualiza los Datos de Ejemplo:** Si aplica, modifica los datos en `src/lib/data.ts`.

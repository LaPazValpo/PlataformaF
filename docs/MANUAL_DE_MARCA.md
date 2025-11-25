# Manual de Marca: Funeraria La Paz de Cristo

## 1. Introducción

Este manual establece las directrices para la identidad visual de la aplicación de la Funeraria La Paz de Cristo. Su propósito es asegurar una comunicación consistente, coherente y profesional en todos los puntos de contacto digitales.

## 2. Logotipo

El logotipo es el pilar de nuestra identidad. Se debe utilizar de manera consistente y sin alteraciones.

- **Logo Principal:** El logo oficial se encuentra en `/src/logo.png`.
- **Uso:** Debe usarse sobre fondos claros. Para fondos oscuros, como en la barra lateral de la intranet, se utiliza una versión invertida (blanca).
- **Espacio de Respeto:** Mantener siempre un espacio libre alrededor del logo, equivalente a la altura de la letra "P" de "Paz".
- **Alteraciones Prohibidas:** No se debe estirar, comprimir, cambiar de color, añadir sombras o modificar el logotipo de ninguna manera.

## 3. Paleta de Colores

Nuestra paleta de colores está diseñada para transmitir serenidad, profesionalismo y calidez. Se basa en variables CSS HSL definidas en `src/app/globals.css`.

### Colores Principales

| Color | Variable CSS | HSL (Light/Dark) | Propósito |
| :--- | :--- | :--- | :--- |
| **Fondo (Background)** | `--background` | `210 33% 98%` / `225 29% 10%` | Color de fondo principal de la aplicación. |
| **Texto (Foreground)** | `--foreground` | `225 29% 10%` / `210 40% 98%` | Color principal para textos. |
| **Primario (Primary)** | `--primary` | `225 29% 26%` | **Azul Marino Profundo**. Usado para botones principales, enlaces y elementos destacados. |
| **Acento (Accent)** | `--accent` | `30 26% 55%` | **Dorado Suave**. Usado para detalles sutiles, estados de `hover` y elementos que necesitan un toque de elegancia. |
| **Tarjeta (Card)** | `--card` | `210 33% 100%` / `225 29% 14%` | Fondo para componentes como tarjetas y diálogos. |
| **Destructivo (Destructive)** | `--destructive` | `0 84.2% 60.2%` | Color rojo para acciones peligrosas como eliminar. |

### Paleta de la Intranet (Sidebar)

| Color | Variable CSS | HSL (Light/Dark) | Propósito |
| :--- | :--- | :--- | :--- |
| **Fondo Sidebar** | `--sidebar-background` | `225 29% 20%` / `225 29% 10%` | Fondo de la barra lateral. |
| **Texto Sidebar** | `--sidebar-foreground` | `210 40% 92%` | Texto dentro de la barra lateral. |
| **Primario Sidebar** | `--sidebar-primary` | `30 26% 55%` | **Dorado Suave**. Usado para el ícono/texto activo en el menú. |

## 4. Tipografía

La tipografía ha sido seleccionada para garantizar legibilidad y transmitir un tono formal pero cercano.

- **Fuente Principal:** **Poppins** (importada desde Google Fonts).
  - **Uso:** Se utiliza tanto para titulares (`font-headline`) como para el cuerpo del texto (`font-body`).
  - **Pesos:** Regular (400) y Bold (700).

- **Fuente de Código:** `monospace`
  - **Uso:** Exclusivamente para mostrar fragmentos de código o datos técnicos si fuera necesario.

## 5. Componentes Visuales

- **Estilo General:** Moderno, limpio y minimalista. Se utilizan esquinas redondeadas (`--radius: 0.5rem;`), sombras sutiles en las tarjetas y un espaciado generoso para una apariencia ordenada y fácil de navegar.
- **Frameworks:** La interfaz se construye con **ShadCN UI** sobre **Tailwind CSS**. Esto asegura consistencia en todos los componentes como botones, formularios, tarjetas y diálogos.
- **Iconografía:** Se utiliza la librería `lucide-react` para una iconografía coherente, minimalista y legible.

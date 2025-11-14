import type { Seller, Prospect, Proposal, Sale, InventoryItem, ServicePack, VirtualTomb, Testimonial, VirtualChapelPlan, IndividualService } from './types';

export const sellers: Seller[] = [
  {
    "id": "AV",
    "name": "Asesor de Ventas",
    "email": "asesor@pazfinal.cl",
    "initials": "AV",
    "sales": 15,
    "status": "Activo",
    "commission": 10,
    "conversionRate": 65,
    "avatar": "/avatars/av.png",
    "role": "Vendedor",
    "user": "asesor",
    "pass": "password123",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "JG",
    "name": "Juan García",
    "email": "juan.garcia@pazfinal.cl",
    "initials": "JG",
    "sales": 22,
    "status": "Activo",
    "commission": 12,
    "conversionRate": 72,
    "avatar": "/avatars/jg.png",
    "role": "Vendedor Senior",
    "user": "jgarcia",
    "pass": "password123",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "MP",
    "name": "María Pérez",
    "email": "maria.perez@pazfinal.cl",
    "initials": "MP",
    "sales": 18,
    "status": "Activo",
    "commission": 11,
    "conversionRate": 68,
    "avatar": "/avatars/mp.png",
    "role": "Vendedor",
    "user": "mperez",
    "pass": "password123",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "LC",
    "name": "Luis Castro",
    "email": "luis.castro@pazfinal.cl",
    "initials": "LC",
    "sales": 12,
    "status": "Activo",
    "commission": 10,
    "conversionRate": 60,
    "avatar": "/avatars/lc.png",
    "role": "Vendedor",
    "user": "lcastro",
    "pass": "password123",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
];

export const prospects: Prospect[] = [
  {
    "id": "prospect001",
    "prospectId": "PROSP-001",
    "clientName": "Juan Pérez",
    "contactNumber": "+56912345678",
    "email": "juan.perez@email.com",
    "sellerId": "AV",
    "sellerName": "Asesor de Ventas",
    "date": "2024-11-14T10:00:00.000Z",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "prospect002",
    "prospectId": "PROSP-002",
    "clientName": "Alicia Soto",
    "contactNumber": "+56923456789",
    "email": "alicia.soto@email.com",
    "sellerId": "JG",
    "sellerName": "Juan García",
    "date": "2024-11-15T11:00:00.000Z",
    "createdAt": "2024-11-15T11:00:00.000Z",
    "updatedAt": "2024-11-15T11:00:00.000Z"
  },
    {
    "id": "prospect003",
    "prospectId": "PROSP-003",
    "clientName": "Mario Bros",
    "contactNumber": "+56934567890",
    "email": "mario.bros@email.com",
    "sellerId": "MP",
    "sellerName": "María Pérez",
    "date": "2024-11-16T12:00:00.000Z",
    "createdAt": "2024-11-16T12:00:00.000Z",
    "updatedAt": "2024-11-16T12:00:00.000Z"
  }
];

export const proposals: Proposal[] = [
    {
        "id": "PROP-001",
        "clientName": "María González",
        "services": ["Pack Standard", "Capilla Virtual Básica"],
        "seller": "Asesor de Ventas",
        "date": "2024-11-14T10:00:00.000Z",
        "status": "Propuesta Enviada",
        "contactNumber": "+56987654321",
        "email": "maria.gonzalez@email.com",
        "createdAt": "2024-11-14T10:00:00.000Z",
        "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
        "id": "PROP-002",
        "clientName": "Juan Pérez",
        "services": ["Pack Intermezzo"],
        "seller": "Juan García",
        "date": "2024-11-15T14:00:00.000Z",
        "status": "Aceptada",
        "contactNumber": "+56912345678",
        "email": "juan.perez@email.com",
        "createdAt": "2024-11-15T14:00:00.000Z",
        "updatedAt": "2024-11-15T14:00:00.000Z"
    }
];

export const sales: Sale[] = [
  {
    "id": "VENTA-001",
    "clientName": "Pedro Silva",
    "services": ["Pack Premium", "Capilla Virtual Premium"],
    "seller": "Asesor de Ventas",
    "date": "2024-11-14T10:00:00.000Z",
    "status": "Pagado",
    "totalAmount": 2200000,
    "contactNumber": "+56911223344",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "VENTA-002",
    "clientName": "Luisa Torres",
    "services": ["Pack Intermezzo"],
    "seller": "Juan García",
    "date": "2024-11-16T18:00:00.000Z",
    "status": "Pagado",
    "totalAmount": 1450000,
    "contactNumber": "+56944556677",
    "createdAt": "2024-11-16T18:00:00.000Z",
    "updatedAt": "2024-11-16T18:00:00.000Z"
  },
  {
    "id": "VENTA-003",
    "clientName": "Carmen Ruiz",
    "services": ["Pack Standard"],
    "seller": "María Pérez",
    "date": "2024-11-17T18:00:00.000Z",
    "status": "Pagado",
    "totalAmount": 950000,
    "contactNumber": "+56933445566",
    "createdAt": "2024-11-17T18:00:00.000Z",
    "updatedAt": "2024-11-17T18:00:00.000Z"
  }
];

export const inventory: InventoryItem[] = [
  {
    "id": "inv-001",
    "name": "Urna de Pino Barnizado",
    "category": "Urnas",
    "quantity": 15,
    "description": "Urna elegante de madera de pino con acabado barnizado",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "inv-002",
    "name": "Arreglo Floral Básico",
    "category": "Flores",
    "quantity": 25,
    "description": "Arreglo floral con flores frescas de temporada",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "inv-003",
    "name": "Libro de Condolencias",
    "category": "Libros",
    "quantity": 30,
    "description": "Libro físico para mensajes de familiares y amigos",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "inv-004",
    "name": "Velas Decorativas",
    "category": "Accesorios",
    "quantity": 50,
    "description": "Velas blancas decorativas para ceremonias",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "inv-005",
    "name": "Marcos para Fotos",
    "category": "Accesorios",
    "quantity": 20,
    "description": "Marcos elegantes para fotografías del difunto",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
];

export const servicePacks: ServicePack[] = [
  {
    "id": "pack-standard",
    "title": "Pack Standard",
    "price": "$950.000",
    "priceValue": 950000,
    "description": "Servicio completo básico para despedidas dignas",
    "idealFor": "Familias que buscan un servicio completo y accesible",
    "features": [
      { "title": "Urna de Pino Barnizado", "description": "Urna elegante de madera de pino con acabado barnizado", "image": "1" },
      { "title": "Arreglo Floral Básico", "description": "Arreglo floral con flores frescas de temporada", "image": "2" },
      { "title": "Libro de Condolencias", "description": "Libro físico para mensajes de familiares y amigos", "image": "3" }
    ],
    "recommended": false,
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "pack-intermezzo",
    "title": "Pack Intermezzo",
    "price": "$1.450.000",
    "priceValue": 1450000,
    "description": "Servicio intermedio con detalles especiales",
    "idealFor": "Familias que desean un servicio más personalizado",
    "features": [
      { "title": "Urna de Roble", "description": "Urna de madera de roble con detalles tallados", "image": "4" },
      { "title": "Arreglo Floral Premium", "description": "Arreglo floral elaborado con flores selectas", "image": "5" },
      { "title": "Libro de Condolencias Premium", "description": "Libro con tapa de cuero y páginas especiales", "image": "6" },
      { "title": "Servicio de Café", "description": "Servicio de café y té para los asistentes", "image": "7" }
    ],
    "recommended": true,
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "pack-premium",
    "title": "Pack Premium",
    "price": "$1.950.000",
    "priceValue": 1950000,
    "description": "Servicio premium con atención personalizada",
    "idealFor": "Familias que buscan un servicio de alta calidad",
    "features": [
      { "title": "Urna de Caoba", "description": "Urna de madera de caoba con acabado de lujo", "image": "8" },
      { "title": "Arreglo Floral de Lujo", "description": "Arreglo floral exclusivo con flores importadas", "image": "9" },
      { "title": "Libro de Condolencias de Lujo", "description": "Libro artesanal con encuadernación especial", "image": "10" },
      { "title": "Servicio de Catering", "description": "Catering completo para los asistentes", "image": "11" },
      { "title": "Música en Vivo", "description": "Músicos profesionales durante la ceremonia", "image": "12" }
    ],
    "recommended": false,
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "pack-exclusivo",
    "title": "Pack Exclusivo",
    "price": "$2.950.000",
    "priceValue": 2950000,
    "description": "Servicio exclusivo con todos los detalles",
    "idealFor": "Familias que desean un servicio sin límites",
    "features": [
      { "title": "Urna Personalizada", "description": "Urna diseñada a medida según preferencias", "image": "21" },
      { "title": "Arreglo Floral Exclusivo", "description": "Diseño floral único y personalizado", "image": "22" },
      { "title": "Libro de Condolencias Artesanal", "description": "Libro único hecho a mano", "image": "23" },
      { "title": "Catering Gourmet", "description": "Menú gourmet preparado por chef", "image": "24" },
      { "title": "Orquesta en Vivo", "description": "Orquesta completa durante la ceremonia", "image": "25" },
      { "title": "Video Conmemorativo", "description": "Video profesional con fotos y música", "image": "26" }
    ],
    "recommended": false,
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
];

export const virtualChapelPlans: VirtualChapelPlan[] = [
    {
      "id": "plan-basic",
      "title": "Plan Básico",
      "price": "$150.000",
      "priceValue": 150000,
      "description": "Capilla virtual por 3 meses",
      "features": [
        "Galería de fotos (hasta 20)",
        "Libro de condolencias digital",
        "Velas virtuales ilimitadas",
        "Compartir en redes sociales",
        "Acceso por 3 meses"
      ],
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "plan-premium",
      "title": "Plan Premium",
      "price": "$250.000",
      "priceValue": 250000,
      "description": "Capilla virtual por 6 meses con funciones avanzadas",
      "features": [
        "Galería de fotos ilimitada",
        "Libro de condolencias digital",
        "Velas virtuales ilimitadas",
        "Video conmemorativo",
        "Música de fondo personalizada",
        "Compartir en redes sociales",
        "Acceso por 6 meses",
        "Diseño personalizado"
      ],
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    }
];

export const individualServices: IndividualService[] = [
    {
      "id": "service-urna-pino",
      "title": "Urna de Pino Barnizado",
      "description": "Urna elegante de madera de pino con acabado barnizado",
      "price": "$180.000",
      "priceValue": 180000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-urna-roble",
      "title": "Urna de Roble",
      "description": "Urna de madera de roble con detalles tallados",
      "price": "$280.000",
      "priceValue": 280000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-urna-caoba",
      "title": "Urna de Caoba",
      "description": "Urna de madera de caoba con acabado de lujo",
      "price": "$450.000",
      "priceValue": 450000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-flores-basico",
      "title": "Arreglo Floral Básico",
      "description": "Arreglo floral con flores frescas de temporada",
      "price": "$45.000",
      "priceValue": 45000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-flores-premium",
      "title": "Arreglo Floral Premium",
      "description": "Arreglo floral elaborado con flores selectas",
      "price": "$85.000",
      "priceValue": 85000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-flores-lujo",
      "title": "Arreglo Floral de Lujo",
      "description": "Arreglo floral exclusivo con flores importadas",
      "price": "$150.000",
      "priceValue": 150000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-libro",
      "title": "Libro de Condolencias",
      "description": "Libro físico para mensajes de familiares y amigos",
      "price": "$25.000",
      "priceValue": 25000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-cafe",
      "title": "Servicio de Café",
      "description": "Servicio de café y té para los asistentes",
      "price": "$120.000",
      "priceValue": 120000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    },
    {
      "id": "service-musica",
      "title": "Música en Vivo",
      "description": "Músicos profesionales durante la ceremonia",
      "price": "$200.000",
      "priceValue": 200000,
      "createdAt": "2024-11-14T10:00:00.000Z",
      "updatedAt": "2024-11-14T10:00:00.000Z"
    }
];

export const virtualTombs: VirtualTomb[] = [
  {
    "id": "tomb-001",
    "name": "Roberto Martínez Silva",
    "birthDate": "1945-03-15",
    "passingDate": "2024-10-20",
    "mainImage": "13",
    "gallery": ["14", "15", "16"],
    "dedications": [
      { "author": "María Martínez", "message": "Siempre en nuestros corazones, papá. Tu amor y sabiduría nos guían cada día.", "date": "2024-10-21T10:00:00.000Z" },
      { "author": "Carlos Martínez", "message": "Gracias por todo lo que nos enseñaste. Te extrañamos mucho.", "date": "2024-10-22T15:30:00.000Z" }
    ],
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "tomb-002",
    "name": "Elena Rodriguez Perez",
    "birthDate": "1952-07-21",
    "passingDate": "2023-12-01",
    "mainImage": "17",
    "gallery": ["18", "19", "20"],
    "dedications": [
      { "author": "Familia Rodriguez", "message": "Tu sonrisa ilumina nuestros recuerdos. Descansa en paz, mamá.", "date": "2023-12-02T10:00:00.000Z" }
    ],
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
];

export const testimonials: Testimonial[] = [
  {
    "id": "test-001",
    "name": "María González",
    "relation": "Hija",
    "quote": "El servicio fue excepcional. Nos ayudaron en cada momento y todo salió perfecto. Muy agradecida.",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "test-002",
    "name": "Carlos Ramírez",
    "relation": "Esposo",
    "quote": "Profesionales, empáticos y dedicados. Hicieron que un momento difícil fuera más llevadero.",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  },
  {
    "id": "test-003",
    "name": "Ana Torres",
    "relation": "Nieta",
    "quote": "La capilla virtual fue un detalle hermoso. Permitió que familiares de lejos pudieran estar presentes de alguna forma.",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
];

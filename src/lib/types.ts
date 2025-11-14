export interface UserProfile {
  id: string;
  role: 'Administrador' | 'Vendedor' | 'Vendedor Senior';
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  prospectId?: string; // Es opcional ahora
  clientName: string;
  contactNumber: string;
  email: string;
  sellerId: string | null;
  sellerName: string;
  date: string;
  status: 'Nuevo' | 'Contactado' | 'En Seguimiento' | 'No Calificado' | 'Venta Ganada' | 'Venta Perdida';
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  prospectId?: string | null;
  clientName: string;
  services: string[];
  sellerId?: string | null;
  sellerName: string;
  date: string; // ISO
  status: 'Borrador' | 'Propuesta Enviada' | 'Propuesta Aceptada' | 'Propuesta Rechazada';
  totalAmount?: number;
  contactNumber?: string;
  email?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  clientName: string;
  services: string[];
  seller: string;
  date: string;
  status: 'Pagado' | 'Pendiente de Pago';
  totalAmount: number;
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  seller: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  initials: string;
  sales: number;
  status: 'Activo' | 'Inactivo';
  commission: number;
  conversionRate: number;
  avatar: string;
  role: 'Vendedor' | 'Vendedor Senior' | 'Administrador';
  user: string;
  pass: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackFeature {
  title: string;
  description: string;
  image: string;
}

export interface ServicePack {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  description: string;
  idealFor: string;
  features: ServicePackFeature[];
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualChapelPlan {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IndividualService {
  id: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Dedication {
  author: string;
  message: string;
  date: string;
}

export interface VirtualTomb {
  id: string;
  name: string;
  birthDate: string;
  passingDate: string;
  mainImage: string;
  gallery: string[];
  dedications: Dedication[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  relation: string;
  quote: string;
  createdAt: string;
  updatedAt: string;
}

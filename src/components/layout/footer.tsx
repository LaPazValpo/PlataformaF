import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-2xl font-bold">
              La Paz de Cristo
            </h3>
            <p className="mt-2 max-w-xs text-muted-foreground">
              Un refugio de paz y respeto en los momentos más difíciles.
            </p>
          </div>

          <div>
            <h4 className="font-headline text-lg font-semibold">
              Información de Contacto
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-center md:justify-start">
                <Phone className="h-4 w-4" />
                <a href="tel:+56992306884" className="ml-2 text-muted-foreground hover:text-primary">
                  +56 9 9230 6884
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:lapazdecristovalpo@gmail.com"
                  className="ml-2 text-muted-foreground hover:text-primary"
                >
                  lapazdecristovalpo@gmail.com
                </a>
              </li>
              <li className="flex items-start justify-center md:justify-start">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                <span className="ml-2 text-muted-foreground">
                  San Ignacio 646, Valparaíso
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-lg font-semibold">
              Horario de Atención
            </h4>
            <p className="mt-4 text-muted-foreground">
              Atención telefónica 24 horas.
            </p>
            <p className="text-muted-foreground">
              Oficina: Lunes a Viernes de 9:00 a 18:00 hrs.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} Funeraria La Paz de Cristo. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

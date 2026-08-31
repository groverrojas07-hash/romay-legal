import { Scale, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                G
              </span>
              <span className="font-heading text-base font-bold text-foreground">
                Firma Jurídica & Forense
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Especialistas en derecho penal, laboral y criminología. Comprometidos con la defensa de tus derechos.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">Áreas de práctica</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-primary" />
                Derecho penal
              </li>
              <li className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-primary" />
                Derecho laboral
              </li>
              <li className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-primary" />
                Criminología y criminalística
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                groverrojas07@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <a href="https://wa.me/51922252724" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                  +51 922 252 724
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 text-primary" />
                Tacna — Perú
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
          © {currentYear} Abog. Grover Rojas Mayta. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

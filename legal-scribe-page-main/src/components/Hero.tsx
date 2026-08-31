import { ArrowDown, Scale } from "lucide-react";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32"
    >
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Scale className="h-4 w-4" />
            Penal · Laboral · Criminología · Criminalística
          </div>

          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Firma Jurídica & <span className="text-primary">Forense</span>
          </h1>

          <p className="mt-2 text-lg font-medium text-foreground">
            Por el Abog. Grover Rojas Mayta
          </p>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Asesoría jurídica con compromiso, claridad y experiencia. Defendemos tus derechos en derecho penal, laboral y criminalística, y compartimos análisis actualizados sobre temas jurídicos relevantes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Agendar consulta
            </a>
            <a
              href="#articulos"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ver artículos
              <ArrowDown className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

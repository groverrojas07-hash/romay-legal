import { Scale, Briefcase, Search, FileText, Shield, Users } from "lucide-react";

const services = [
  {
    icon: Scale,
    title: "Derecho penal",
    description: "Defensa en procesos penales, asesoría en denuncias, flagrancia, prisión preventiva y recursos.",
  },
  {
    icon: Briefcase,
    title: "Derecho laboral",
    description: "Despidos arbitrarios, reclamos de beneficios sociales, hostigamiento laboral y negociaciones colectivas.",
  },
  {
    icon: Search,
    title: "Criminología y criminalística",
    description: "Análisis de evidencias, peritajes, escena del crimen y estrategias de defensa técnica.",
  },
  {
    icon: FileText,
    title: "Asesoría jurídica integral",
    description: "Opiniones legales, redacción de contratos, cartas notariales y mediación de conflictos.",
  },
  {
    icon: Shield,
    title: "Defensa de derechos",
    description: "Protección de tus derechos fundamentales ante instituciones públicas y privadas.",
  },
  {
    icon: Users,
    title: "Consultas personalizadas",
    description: "Atención directa, explicación clara de tu caso y acompañamiento en cada etapa del proceso.",
  },
];

export function Services() {
  return (
    <section id="servicios" className="bg-secondary py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Servicios jurídicos
          </h2>
          <p className="mt-4 text-muted-foreground">
            Asesoría especializada para personas y empresas, con enfoque práctico y resultados claros.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl border border-border/60 bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <service.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

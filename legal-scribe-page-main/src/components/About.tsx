import { Award, BookOpen, Scale } from "lucide-react";

export function About() {
  return (
    <section id="sobre-mi" className="bg-secondary py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-lg">
              <div className="gradient-guinda flex h-full w-full items-center justify-center">
                <span className="font-heading text-8xl font-bold text-primary-foreground/30">
                  GRM
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden rounded-xl border border-border/60 bg-background p-4 shadow-lg lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">Abogado colegiado</p>
                  <p className="text-xs text-muted-foreground">Perú</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Sobre mí
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Soy el <strong className="text-foreground">Abog. Grover Rojas Mayta</strong>, titular de la Firma Jurídica & Forense, con experiencia en derecho penal, laboral y criminología/criminalística.
            </p>
            <p className="mt-4 text-muted-foreground">
              Mi trabajo se basa en la preparación constante, el análisis riguroso de cada caso y la comunicación clara con mis clientes. Creo que un buen abogado no solo conoce la ley, sino que también sabe explicarla y aplicarla de manera estratégica.
            </p>
            <p className="mt-4 text-muted-foreground">
              A través de este espacio comparto artículos, noticias y reflexiones sobre temas jurídicos de interés público, con el objetivo de acercar el derecho a quienes lo necesiten.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground">Especialización</h3>
                  <p className="text-sm text-muted-foreground">Penal, laboral y criminalística</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground">Formación continua</h3>
                  <p className="text-sm text-muted-foreground">Actualización permanente en derecho</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      setSubmitted(true);
      form.reset();
    } catch {
      // fallback: let Netlify handle it natively on submit
      form.submit();
    }
  };
  return (
    <section id="contacto" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Contacto
          </h2>
          <p className="mt-4 text-muted-foreground">
            ¿Necesitas asesoría jurídica? Escríbeme y responderé a la brevedad.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Info column */}
          <div className="rounded-2xl border border-border/60 bg-secondary p-8">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Información de contacto
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Puedes comunicarte conmigo por cualquiera de estos medios.
            </p>

            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Correo electrónico</p>
                  <a href="mailto:groverrojas07@gmail.com" className="text-sm text-primary hover:underline">
                    groverrojas07@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Teléfono / WhatsApp</p>
                  <a href="https://wa.me/51922252724" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    +51 922 252 724
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ubicación</p>
                  <p className="text-sm text-muted-foreground">Tacna — Perú</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Horario de atención</p>
                  <p className="text-sm text-muted-foreground">Lunes a sábado, 8:00 a.m. — 6:00 p.m.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Form column */}
          <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Consulta gratis
            </h3>

            {submitted ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-4 py-10 text-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="font-heading text-lg font-semibold text-foreground">
                  ¡Mensaje enviado!
                </p>
                <p className="text-sm text-muted-foreground">
                  Gracias por escribirme. Responderé a la brevedad posible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              /* Netlify Forms: name attribute on form + hidden input + honeypot */
              <form
                name="consulta-gratis"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                {/* Required hidden fields for Netlify */}
                <input type="hidden" name="form-name" value="consulta-gratis" />

                {/* Honeypot — bots fill this, humans don't */}
                <p className="hidden">
                  <label>
                    No completar si eres humano:{" "}
                    <input name="bot-field" />
                  </label>
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-foreground">
                      Nombre completo <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="+51 9XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
                    Correo electrónico <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="tu@correo.com"
                  />
                </div>

                <div>
                  <label htmlFor="contact-area" className="block text-sm font-medium text-foreground">
                    Área de consulta
                  </label>
                  <select
                    id="contact-area"
                    name="area"
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Selecciona un área</option>
                    <option value="penal">Derecho penal</option>
                    <option value="laboral">Derecho laboral</option>
                    <option value="criminologia">Criminología</option>
                    <option value="criminalistica">Criminalística</option>
                    <option value="otro">Otro / Consulta general</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
                    Descripción del caso <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Cuéntame brevemente sobre tu caso..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                  Enviar consulta gratuita
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  * Campos obligatorios. Tu información es confidencial.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

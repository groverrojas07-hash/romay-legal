import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState, type ElementType } from "react";
import { listPublicRecursos } from "@/lib/recursos.functions";
import {
  BookOpen, FileText, Gavel, ScrollText, BookMarked,
  ShoppingCart, Download, Loader2, Star, Filter,
} from "lucide-react";

// ── query ─────────────────────────────────────────────────────────────────────

const recursosQueryOptions = queryOptions({
  queryKey: ["public-recursos", 50],
  queryFn: () => listPublicRecursos({ data: { limit: 50 } }),
  staleTime: 1000 * 60 * 5,
});

// ── route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/recursos")({
  head: () => ({
    meta: [
      { title: "Biblioteca Jurídica — Romay Legal · Recursos y materiales" },
      {
        name: "description",
        content:
          "Descarga libros, guías, minutas, modelos de demandas y recursos jurídicos especializados en derecho penal, laboral y criminalística.",
      },
      { property: "og:title", content: "Biblioteca Jurídica — Romay Legal" },
      {
        property: "og:description",
        content:
          "Libros, guías, minutas y modelos jurídicos especializados por el Abog. Grover Rojas Mayta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recursosQueryOptions),
  component: RecursosPage,
});

// ── helpers ───────────────────────────────────────────────────────────────────

type ResourceType = "libro" | "pdf" | "minuta" | "demanda" | "guia" | "otro";

const TYPE_META: Record<ResourceType, { label: string; Icon: ElementType; color: string }> = {
  libro:    { label: "Libro",   Icon: BookOpen,   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  pdf:      { label: "PDF",     Icon: FileText,   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  minuta:   { label: "Minuta",  Icon: ScrollText, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  demanda:  { label: "Demanda", Icon: Gavel,      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  guia:     { label: "Guía",    Icon: BookMarked, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  otro:     { label: "Recurso", Icon: FileText,   color: "bg-secondary text-muted-foreground" },
};

const FILTER_TYPES: Array<ResourceType | "todos"> = ["todos", "libro", "pdf", "minuta", "demanda", "guia"];

interface Recurso {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  resource_type: string;
  price: number;
  currency: string;
  payment_url: string | null;
  is_free: boolean;
  created_at: string;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency ?? "PEN",
    minimumFractionDigits: 2,
  }).format(price);
}

// ── resource card ─────────────────────────────────────────────────────────────

function RecursoCard({ recurso }: { recurso: Recurso }) {
  const type = (recurso.resource_type as ResourceType) ?? "otro";
  const meta = TYPE_META[type] ?? TYPE_META.otro;
  const { Icon } = meta;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Cover */}
      {recurso.cover_image_url ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={recurso.cover_image_url}
            alt={recurso.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {recurso.is_free && (
            <span className="absolute left-3 top-3 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
              GRATIS
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex aspect-[4/3] items-center justify-center bg-primary/5">
          <Icon className="h-16 w-16 text-primary/25" />
          {recurso.is_free && (
            <span className="absolute left-3 top-3 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
              GRATIS
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Type badge */}
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>

        <h2 className="mt-2.5 font-heading text-base font-bold leading-snug text-foreground line-clamp-2">
          {recurso.title}
        </h2>

        {recurso.description && (
          <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
            {recurso.description}
          </p>
        )}

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            {recurso.is_free ? (
              <span className="text-base font-bold text-green-600">Gratuito</span>
            ) : (
              <span className="text-base font-bold text-primary">
                {formatPrice(recurso.price, recurso.currency)}
              </span>
            )}
          </div>

          {recurso.payment_url ? (
            <a
              href={recurso.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
            >
              {recurso.is_free ? (
                <><Download className="h-4 w-4" /> Descargar</>
              ) : (
                <><ShoppingCart className="h-4 w-4" /> Adquirir</>
              )}
            </a>
          ) : (
            <span className="rounded-lg bg-secondary px-4 py-2 text-sm text-muted-foreground">
              Próximamente
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ total, free }: { total: number; free: number }) {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm shadow-sm">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-semibold text-foreground">{total}</span>
        <span className="text-muted-foreground">recursos disponibles</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm shadow-sm">
        <Star className="h-4 w-4 text-green-600" />
        <span className="font-semibold text-foreground">{free}</span>
        <span className="text-muted-foreground">recursos gratuitos</span>
      </div>
    </div>
  );
}

// ── content ───────────────────────────────────────────────────────────────────

function RecursosContent() {
  const { data: recursos } = useSuspenseQuery(recursosQueryOptions);
  const [activeType, setActiveType] = useState<ResourceType | "todos">("todos");

  const filtered = activeType === "todos"
    ? recursos
    : recursos.filter((r) => r.resource_type === activeType);

  const freeCount = recursos.filter((r) => r.is_free).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <StatsBar total={recursos.length} free={freeCount} />

      {/* Filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {FILTER_TYPES.map((t) => {
          const label = t === "todos" ? "Todos" : TYPE_META[t as ResourceType].label + "s";
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((recurso) => (
            <RecursoCard key={recurso.id} recurso={recurso} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            Próximamente se publicarán recursos en esta categoría.
          </p>
        </div>
      )}

      {/* Trust notice */}
      <div className="mt-14 rounded-2xl border border-border/60 bg-primary/5 p-6 text-center sm:p-8">
        <h3 className="font-heading text-lg font-bold text-foreground">
          Compra segura y acceso inmediato
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          Todos los recursos son elaborados por el Abog. Grover Rojas Mayta.
          Los pagos se procesan a través de pasarelas certificadas (Mercado Pago / Stripe).
          Recibirás el enlace de descarga al completar la compra.
        </p>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function RecursosPage() {
  return (
    <div className="bg-background pb-20">
      {/* Hero header */}
      <div className="border-b border-border/60 bg-secondary py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Tienda jurídica
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Biblioteca &amp; Recursos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Libros, guías, minutas y modelos jurídicos especializados en
            derecho penal, laboral y criminalística por el{" "}
            <span className="font-semibold text-foreground">Abog. Grover Rojas Mayta</span>.
          </p>
        </div>
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RecursosContent />
      </Suspense>
    </div>
  );
}

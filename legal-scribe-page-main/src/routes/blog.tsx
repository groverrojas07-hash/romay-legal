import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { listPublicArticles } from "@/lib/articles.functions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Tag, ArrowRight, Loader2, FileText, Share2 } from "lucide-react";

// ── query ─────────────────────────────────────────────────────────────────────

const blogQueryOptions = queryOptions({
  queryKey: ["blog-articles", 50],
  queryFn: () => listPublicArticles({ data: { limit: 50 } }),
  staleTime: 1000 * 60 * 5,
});

// ── route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog jurídico — Romay Legal · Abog. Grover Rojas Mayta" },
      {
        name: "description",
        content:
          "Artículos, análisis y noticias sobre derecho penal, laboral, criminología y criminalística por el Abog. Grover Rojas Mayta.",
      },
      { property: "og:title", content: "Blog jurídico — Romay Legal" },
      {
        property: "og:description",
        content:
          "Artículos, análisis y noticias sobre derecho penal, laboral, criminología y criminalística.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Structured data for SEO
      {
        name: "application-name",
        content: "Romay Legal Blog",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(blogQueryOptions),
  component: BlogPage,
});

// ── share helpers ─────────────────────────────────────────────────────────────

function getShareUrls(slug: string, title: string) {
  const url = encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : ""}/articulos/${slug}`);
  const text = encodeURIComponent(title);
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  };
}

// ── category badge ────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  "Derecho penal":    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Derecho laboral":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Criminología":     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Criminalística":   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  const cls = categoryColors[category] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Tag className="h-3 w-3" />
      {category}
    </span>
  );
}

// ── article card ──────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  cover_image_url: string | null;
  created_at: string;
}

function BlogCard({ article }: { article: Article }) {
  const share = getShareUrls(article.slug, article.title);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      {article.cover_image_url ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-primary/5">
          <FileText className="h-12 w-12 text-primary/30" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <CategoryBadge category={article.category} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(article.created_at), "d MMM yyyy", { locale: es })}
          </span>
        </div>

        <h2 className="mt-3 font-heading text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Link
            to="/articulos/$slug"
            params={{ slug: article.slug }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Leer artículo <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              <Share2 className="inline h-3 w-3 mr-0.5" />
              Compartir:
            </span>
            <a
              href={share.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en WhatsApp"
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              {/* WhatsApp icon via SVG */}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <a
              href={share.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartir en Facebook"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-colors hover:bg-[#1877F2] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── filter bar ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Todos", "Derecho penal", "Derecho laboral", "Criminología", "Criminalística"];

// ── main content ──────────────────────────────────────────────────────────────

function BlogContent() {
  const { data: articles } = useSuspenseQuery(blogQueryOptions);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = activeCategory === "Todos"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Filter bar */}
      <div className="mt-10 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">
            No hay artículos en esta categoría todavía.
          </p>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function BlogPage() {
  return (
    <div className="bg-background pb-20">
      {/* Hero header */}
      <div className="border-b border-border/60 bg-secondary py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Portal Jurídico
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Blog jurídico
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Análisis, comentarios y actualidad del derecho penal, laboral,
            criminología y criminalística por el{" "}
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
        <BlogContent />
      </Suspense>
    </div>
  );
}

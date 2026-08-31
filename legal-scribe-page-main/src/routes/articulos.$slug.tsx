import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { getPublicArticleBySlug } from "@/lib/articles.functions";

const articleQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getPublicArticleBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/articulos/$slug")({
  head: () => ({
    meta: [
      { title: "Artículo — Firma Jurídica & Forense" },
      { name: "description", content: "Artículos y noticias jurídicas de la Firma Jurídica & Forense." },
      { property: "og:title", content: "Artículo — Firma Jurídica & Forense" },
      { property: "og:description", content: "Artículos y noticias jurídicas de la Firma Jurídica & Forense." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ params, context }) => {
    const article = await context.queryClient.ensureQueryData(articleQueryOptions(params.slug));
    if (!article) throw notFound();
    return article;
  },
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(articleQueryOptions(slug));

  if (!article) return <ArticleNotFound />;

  return (
    <article className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          hash="articulos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a artículos
        </Link>

        <header className="mt-6">
          {article.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Tag className="h-3.5 w-3.5" />
              {article.category}
            </span>
          )}
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.created_at}>
              {format(new Date(article.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </time>
          </div>
        </header>

        {article.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {article.excerpt && (
          <p className="mt-8 text-lg font-medium leading-relaxed text-foreground/90">
            {article.excerpt}
          </p>
        )}

        <div className="prose prose-lg mt-8 max-w-none text-foreground/90">
          {article.content.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ) : null,
          )}
        </div>
      </div>
    </article>
  );
}

function ArticleNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-4xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Artículo no encontrado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El artículo que buscas no existe o ha sido movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            hash="articulos"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ver artículos
          </Link>
        </div>
      </div>
    </div>
  );
}

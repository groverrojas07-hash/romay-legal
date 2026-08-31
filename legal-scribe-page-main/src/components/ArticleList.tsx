import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { listPublicArticles } from "@/lib/articles.functions";
import { ArticleCard } from "./ArticleCard";
import { FileText } from "lucide-react";

const articlesQueryOptions = queryOptions({
  queryKey: ["public-articles", 6],
  queryFn: () => listPublicArticles({ data: { limit: 6 } }),
});

export function ArticleList() {
  const { data: articles } = useSuspenseQuery(articlesQueryOptions);

  return (
    <section id="articulos" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Artículos y noticias jurídicas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Análisis, comentarios y actualidad del derecho penal, laboral y criminalística.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-4 text-muted-foreground">
              Próximamente se publicarán los primeros artículos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

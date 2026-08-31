import { Link } from "@tanstack/react-router";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    cover_image_url: string | null;
    created_at: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="gradient-guinda flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl font-bold text-primary-foreground/80">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
            {article.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(article.created_at), "d 'de' MMMM, yyyy", { locale: es })}
        </div>

        <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <Link
          to="/articulos/$slug"
          params={{ slug: article.slug }}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Leer más
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

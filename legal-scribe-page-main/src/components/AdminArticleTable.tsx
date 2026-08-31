import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminArticleTableProps {
  articles: Article[];
  onTogglePublished: (id: string, published: boolean) => void;
  onDelete: (id: string) => void;
  pendingId?: string | null;
}

export function AdminArticleTable({
  articles,
  onTogglePublished,
  onDelete,
  pendingId,
}: AdminArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary py-12 text-center">
        <p className="text-muted-foreground">Aún no has creado artículos.</p>
        <Link
          to="/admin/new"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Crear el primer artículo
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Artículo</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Categoría</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Estado</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Fecha</th>
              <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{article.title}</p>
                  <p className="text-xs text-muted-foreground">/{article.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {article.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.published
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {article.published ? "Publicado" : "Borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(article.created_at), "dd/MM/yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onTogglePublished(article.id, !article.published)}
                      disabled={pendingId === article.id}
                      className="inline-flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                      title={article.published ? "Convertir en borrador" : "Publicar"}
                    >
                      {pendingId === article.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : article.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      to="/admin/$id/edit"
                      params={{ id: article.id }}
                      className="inline-flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(article.id)}
                      disabled={pendingId === article.id}
                      className="inline-flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

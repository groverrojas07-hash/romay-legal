import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useState } from "react";
import { Plus, Loader2, ShieldAlert, BookOpen } from "lucide-react";
import { listMyArticles, deleteArticle, toggleArticlePublished } from "@/lib/admin.functions";
import { checkIsAdmin } from "@/lib/admin-role.functions";
import { AdminArticleTable } from "@/components/AdminArticleTable";

const adminQueryOptions = queryOptions({
  queryKey: ["admin-check"],
  queryFn: () => checkIsAdmin({ data: undefined }),
});

const articlesQueryOptions = queryOptions({
  queryKey: ["my-articles"],
  queryFn: () => listMyArticles({ data: undefined }),
});

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel de administración — Firma Jurídica & Forense" },
      { name: "description", content: "Gestiona los artículos y noticias jurídicas." },
      { property: "og:title", content: "Panel de administración — Firma Jurídica & Forense" },
      { property: "og:description", content: "Gestiona los artículos y noticias jurídicas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    const { isAdmin } = await context.queryClient.ensureQueryData(adminQueryOptions);
    if (!isAdmin) throw redirect({ to: "/" });
    await context.queryClient.ensureQueryData(articlesQueryOptions);
    return { isAdmin };
  },
  component: AdminPage,
});

function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const queryClient = useQueryClient();
  const { data: adminCheck } = useSuspenseQuery(adminQueryOptions);
  const { data: articles } = useSuspenseQuery(articlesQueryOptions);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const doDelete = useServerFn(deleteArticle);
  const doToggle = useServerFn(toggleArticlePublished);

  if (!adminCheck?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">No tienes permisos para acceder al panel de administración.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.")) return;
    setPendingId(id);
    try {
      await doDelete({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["public-articles"] });
    } finally {
      setPendingId(null);
    }
  };

  const handleToggle = async (id: string, published: boolean) => {
    setPendingId(id);
    try {
      await doToggle({ data: { id, published } });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["public-articles"] });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Panel de administración</h1>
            <p className="mt-1 text-muted-foreground">Gestiona tus artículos y noticias jurídicas.</p>
          </div>
          <Link
            to="/admin/recursos"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <BookOpen className="h-4 w-4" />
            Biblioteca
          </Link>
          <Link
            to="/admin/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nuevo artículo
          </Link>
        </div>

        <div className="mt-8">
          <AdminArticleTable
            articles={articles ?? []}
            pendingId={pendingId}
            onDelete={handleDelete}
            onTogglePublished={handleToggle}
          />
        </div>
      </div>
    </div>
  );
}

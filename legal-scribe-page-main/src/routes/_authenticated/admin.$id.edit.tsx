import { createFileRoute, Link, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { ArticleEditor, type ArticleFormData } from "@/components/ArticleEditor";
import { getMyArticle, updateArticle } from "@/lib/admin.functions";
import { checkIsAdmin } from "@/lib/admin-role.functions";

const adminQueryOptions = queryOptions({
  queryKey: ["admin-check"],
  queryFn: () => checkIsAdmin({ data: undefined }),
});

const articleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["my-article", id],
    queryFn: () => getMyArticle({ data: { id } }),
  });

export const Route = createFileRoute("/_authenticated/admin/$id/edit")({
  head: () => ({
    meta: [
      { title: "Editar artículo — Firma Jurídica & Forense" },
      { name: "description", content: "Edita un artículo existente." },
      { property: "og:title", content: "Editar artículo — Firma Jurídica & Forense" },
      { property: "og:description", content: "Edita un artículo existente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context, params }) => {
    const { isAdmin } = await context.queryClient.ensureQueryData(adminQueryOptions);
    if (!isAdmin) throw redirect({ to: "/" });
    const article = await context.queryClient.ensureQueryData(articleQueryOptions(params.id));
    if (!article) throw redirect({ to: "/admin" });
    return { article };
  },
  component: EditArticlePage,
});

function EditArticlePage() {
  const { id } = useParams({ from: "/_authenticated/admin/$id/edit" });

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditArticleContent id={id} />
    </Suspense>
  );
}

function EditArticleContent({ id }: { id: string }) {
  const { data: adminCheck } = useSuspenseQuery(adminQueryOptions);
  const { data: article } = useSuspenseQuery(articleQueryOptions(id));
  const navigate = useNavigate();
  const doUpdate = useServerFn(updateArticle);

  if (!adminCheck?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">No tienes permisos para editar artículos.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-xl font-bold text-foreground">Artículo no encontrado</h1>
        <Link
          to="/admin"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al panel
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: ArticleFormData) => {
    await doUpdate({
      data: {
        id,
        title: data.title,
        excerpt: data.excerpt || undefined,
        content: data.content,
        category: data.category || undefined,
        cover_image_url: data.cover_image_url || undefined,
        published: data.published,
      },
    });
    navigate({ to: "/admin" });
  };

  return (
    <div className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">Editar artículo</h1>
        <p className="mt-1 text-muted-foreground">Actualiza el contenido y estado del artículo.</p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <ArticleEditor
            defaultValues={{
              title: article.title,
              excerpt: article.excerpt ?? undefined,
              content: article.content,
              category: article.category ?? undefined,
              cover_image_url: article.cover_image_url ?? undefined,
              published: article.published,
            }}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { ArticleEditor, type ArticleFormData } from "@/components/ArticleEditor";
import { createArticle } from "@/lib/admin.functions";
import { checkIsAdmin } from "@/lib/admin-role.functions";

const adminQueryOptions = queryOptions({
  queryKey: ["admin-check"],
  queryFn: () => checkIsAdmin({ data: undefined }),
});

export const Route = createFileRoute("/_authenticated/admin/new")({
  head: () => ({
    meta: [
      { title: "Nuevo artículo — Firma Jurídica & Forense" },
      { name: "description", content: "Crea un nuevo artículo o noticia jurídica." },
      { property: "og:title", content: "Nuevo artículo — Firma Jurídica & Forense" },
      { property: "og:description", content: "Crea un nuevo artículo o noticia jurídica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    const { isAdmin } = await context.queryClient.ensureQueryData(adminQueryOptions);
    if (!isAdmin) throw redirect({ to: "/" });
    return { isAdmin };
  },
  component: NewArticlePage,
});

function NewArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewArticleContent />
    </Suspense>
  );
}

function NewArticleContent() {
  const { data: adminCheck } = useSuspenseQuery(adminQueryOptions);
  const navigate = useNavigate();
  const doCreate = useServerFn(createArticle);

  if (!adminCheck?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">No tienes permisos para crear artículos.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: ArticleFormData) => {
    await doCreate({
      data: {
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

        <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">Nuevo artículo</h1>
        <p className="mt-1 text-muted-foreground">Completa la información para publicar o guardar un borrador.</p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <ArticleEditor onSubmit={handleSubmit} submitLabel="Crear artículo" />
        </div>
      </div>
    </div>
  );
}

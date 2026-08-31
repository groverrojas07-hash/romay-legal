import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { ArticleList } from "@/components/ArticleList";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { listPublicArticles } from "@/lib/articles.functions";
import { Loader2 } from "lucide-react";

const articlesQueryOptions = queryOptions({
  queryKey: ["public-articles", 6],
  queryFn: () => listPublicArticles({ data: { limit: 6 } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Firma Jurídica & Forense · Derecho penal, laboral y criminología" },
      {
        name: "description",
        content:
          "Firma Jurídica & Forense por el Abog. Grover Rojas Mayta. Especialistas en derecho penal, laboral y criminología. Artículos, noticias y asesoría jurídica en Perú.",
      },
      {
        property: "og:title",
        content: "Firma Jurídica & Forense · Derecho penal, laboral y criminología",
      },
      {
        property: "og:description",
        content:
          "Firma Jurídica & Forense por el Abog. Grover Rojas Mayta. Especialistas en derecho penal, laboral y criminología. Artículos, noticias y asesoría jurídica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQueryOptions),
  component: IndexPage,
});

function IndexPage() {
  return (
    <>
      <Hero />
      <Services />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ArticleList />
      </Suspense>
      <About />
      <Contact />
    </>
  );
}

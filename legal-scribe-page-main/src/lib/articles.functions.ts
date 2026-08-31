import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const articleListSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  category: z.string().optional(),
});

const articleSlugSchema = z.object({
  slug: z.string().min(1),
});

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export const listPublicArticles = createServerFn({ method: "GET" })
  .validator((input) => articleListSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, category, cover_image_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.category) {
      query.eq("category", data.category);
    }

    const { data: articles, error } = await query;
    if (error) throw new Error(error.message);
    return articles ?? [];
  });

export const getPublicArticleBySlug = createServerFn({ method: "GET" })
  .validator((input) => articleSlugSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: article, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, content, category, cover_image_url, published, created_at, updated_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return article;
  });

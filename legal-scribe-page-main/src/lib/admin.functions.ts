import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);

const articleIdSchema = z.object({
  id: z.string().uuid(),
});

const createArticleSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  category: z.string().max(100).optional(),
  cover_image_url: z.string().url().max(1000).optional(),
  published: z.boolean().default(false),
});

const updateArticleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10).optional(),
  category: z.string().max(100).optional(),
  cover_image_url: z.string().url().max(1000).optional().nullable(),
  published: z.boolean().optional(),
});

const togglePublishedSchema = z.object({
  id: z.string().uuid(),
  published: z.boolean(),
});

export const listMyArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: articles, error } = await context.supabase
      .from("articles")
      .select("id, title, slug, excerpt, category, cover_image_url, published, created_at, updated_at")
      .eq("author_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return articles ?? [];
  });

export const getMyArticle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => articleIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: article, error } = await context.supabase
      .from("articles")
      .select("*")
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return article;
  });

export const createArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => createArticleSchema.parse(input))
  .handler(async ({ context, data }) => {
    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data: article, error } = await context.supabase
      .from("articles")
      .insert({
        author_id: context.userId,
        title: data.title,
        slug,
        excerpt: data.excerpt ?? null,
        content: data.content,
        category: data.category ?? null,
        cover_image_url: data.cover_image_url ?? null,
        published: data.published,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return article;
  });

export const updateArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => updateArticleSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { id, ...updates } = data;

    const { data: article, error } = await context.supabase
      .from("articles")
      .update(updates)
      .eq("id", id)
      .eq("author_id", context.userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return article;
  });

export const toggleArticlePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => togglePublishedSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: article, error } = await context.supabase
      .from("articles")
      .update({ published: data.published })
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return article;
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => articleIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("articles")
      .delete()
      .eq("id", data.id)
      .eq("author_id", context.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

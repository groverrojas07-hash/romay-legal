import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);

function createPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// ── schemas ───────────────────────────────────────────────────────────────────

const resourceTypeEnum = z.enum(["libro", "pdf", "minuta", "demanda", "guia", "otro"]);

const listPublicResourcesSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  resource_type: resourceTypeEnum.optional(),
});

const resourceIdSchema = z.object({ id: z.string().uuid() });

const createRecursoSchema = z.object({
  title:           z.string().min(3).max(200),
  description:     z.string().max(1000).optional(),
  cover_image_url: z.string().url().max(1000).optional(),
  file_url:        z.string().url().max(1000).optional(),
  resource_type:   resourceTypeEnum.default("pdf"),
  price:           z.number().min(0).default(0),
  currency:        z.string().length(3).default("PEN"),
  payment_url:     z.string().url().max(1000).optional(),
  is_free:         z.boolean().default(false),
  published:       z.boolean().default(false),
});

const updateRecursoSchema = createRecursoSchema.partial().extend({
  id: z.string().uuid(),
});

const togglePublishedSchema = z.object({
  id:        z.string().uuid(),
  published: z.boolean(),
});

// ── public server functions ───────────────────────────────────────────────────

export const listPublicRecursos = createServerFn({ method: "GET" })
  .validator((input) => listPublicResourcesSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    let query = supabase
      .from("recursos")
      .select("id, title, slug, description, cover_image_url, resource_type, price, currency, payment_url, is_free, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.resource_type) {
      query = query.eq("resource_type", data.resource_type);
    }

    const { data: recursos, error } = await query;
    if (error) throw new Error(error.message);
    return recursos ?? [];
  });

export const getPublicRecursoBySlug = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: recurso, error } = await supabase
      .from("recursos")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return recurso;
  });

// ── admin server functions ────────────────────────────────────────────────────

export const listMyRecursos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: recursos, error } = await context.supabase
      .from("recursos")
      .select("id, title, slug, description, resource_type, price, currency, is_free, published, created_at, updated_at")
      .eq("author_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return recursos ?? [];
  });

export const getMyRecurso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => resourceIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: recurso, error } = await context.supabase
      .from("recursos")
      .select("*")
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return recurso;
  });

export const createRecurso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => createRecursoSchema.parse(input))
  .handler(async ({ context, data }) => {
    const slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    const { data: recurso, error } = await context.supabase
      .from("recursos")
      .insert({
        author_id:       context.userId,
        title:           data.title,
        slug,
        description:     data.description ?? null,
        cover_image_url: data.cover_image_url ?? null,
        file_url:        data.file_url ?? null,
        resource_type:   data.resource_type,
        price:           data.price,
        currency:        data.currency,
        payment_url:     data.payment_url ?? null,
        is_free:         data.is_free,
        published:       data.published,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return recurso;
  });

export const updateRecurso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => updateRecursoSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { id, ...updates } = data;
    const { data: recurso, error } = await context.supabase
      .from("recursos")
      .update(updates)
      .eq("id", id)
      .eq("author_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return recurso;
  });

export const toggleRecursoPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => togglePublishedSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: recurso, error } = await context.supabase
      .from("recursos")
      .update({ published: data.published })
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return recurso;
  });

export const deleteRecurso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => resourceIdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("recursos")
      .delete()
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

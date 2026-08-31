import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Eye, EyeOff, Save } from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200, "Máximo 200 caracteres"),
  excerpt: z.string().max(500, "Máximo 500 caracteres").optional(),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  category: z.string().max(100, "Máximo 100 caracteres").optional(),
  cover_image_url: z.union([z.string().url("Debe ser una URL válida").max(1000), z.literal("")]).optional(),
  published: z.boolean(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  defaultValues?: Partial<ArticleFormData>;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  submitLabel?: string;
}

export function ArticleEditor({ defaultValues, onSubmit, submitLabel = "Guardar" }: ArticleEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      excerpt: defaultValues?.excerpt ?? "",
      content: defaultValues?.content ?? "",
      category: defaultValues?.category ?? "",
      cover_image_url: defaultValues?.cover_image_url ?? "",
      published: defaultValues?.published ?? false,
    },
  });

  const published = watch("published");

  const handleFormSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Título <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            {...register("title")}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Título del artículo"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Categoría
          </label>
          <input
            id="category"
            {...register("category")}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ej: Derecho penal"
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="excerpt" className="text-sm font-medium text-foreground">
          Extracto
        </label>
        <textarea
          id="excerpt"
          {...register("excerpt")}
          rows={2}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Breve resumen del artículo (aparece en el listado)"
        />
        {errors.excerpt && (
          <p className="text-xs text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="cover_image_url" className="text-sm font-medium text-foreground">
          URL de imagen de portada
        </label>
        <input
          id="cover_image_url"
          type="url"
          {...register("cover_image_url")}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="https://..."
        />
        {errors.cover_image_url && (
          <p className="text-xs text-destructive">{errors.cover_image_url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Contenido <span className="text-destructive">*</span>
        </label>
        <textarea
          id="content"
          {...register("content")}
          rows={12}
          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Escribe el contenido completo del artículo..."
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary p-4">
        <input
          id="published"
          type="checkbox"
          {...register("published")}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="published" className="flex flex-1 items-center gap-2 text-sm font-medium text-foreground">
          {published ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
          {published ? "Publicado (visible para todos)" : "Borrador (solo visible en el panel)"}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

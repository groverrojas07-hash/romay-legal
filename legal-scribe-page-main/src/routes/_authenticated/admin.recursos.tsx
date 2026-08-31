import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense, useState } from "react";
import {
  Plus, Loader2, ShieldAlert, Trash2, Eye, EyeOff,
  Save, X, BookOpen, ShoppingCart, ExternalLink,
} from "lucide-react";
import {
  listMyRecursos,
  createRecurso,
  deleteRecurso,
  toggleRecursoPublished,
} from "@/lib/recursos.functions";
import { checkIsAdmin } from "@/lib/admin-role.functions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── queries ───────────────────────────────────────────────────────────────────

const adminQueryOptions = queryOptions({
  queryKey: ["admin-check"],
  queryFn: () => checkIsAdmin({ data: undefined }),
});

const recursosAdminQueryOptions = queryOptions({
  queryKey: ["my-recursos"],
  queryFn: () => listMyRecursos({ data: undefined }),
});

// ── route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/admin/recursos")({
  head: () => ({
    meta: [{ title: "Gestionar recursos — Panel de administración" }],
  }),
  loader: async ({ context }) => {
    const { isAdmin } = await context.queryClient.ensureQueryData(adminQueryOptions);
    if (!isAdmin) throw redirect({ to: "/" });
    await context.queryClient.ensureQueryData(recursosAdminQueryOptions);
  },
  component: AdminRecursosPage,
});

// ── form schema ───────────────────────────────────────────────────────────────

const recursoFormSchema = z.object({
  title:           z.string().min(3, "Mínimo 3 caracteres").max(200),
  description:     z.string().max(1000).optional(),
  cover_image_url: z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
  file_url:        z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
  resource_type:   z.enum(["libro", "pdf", "minuta", "demanda", "guia", "otro"]),
  price:           z.coerce.number().min(0, "El precio no puede ser negativo"),
  currency:        z.string().length(3),
  payment_url:     z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
  is_free:         z.boolean(),
  published:       z.boolean(),
});

type RecursoFormData = z.infer<typeof recursoFormSchema>;

const RESOURCE_TYPE_LABELS = {
  libro: "Libro",
  pdf: "PDF",
  minuta: "Minuta",
  demanda: "Demanda",
  guia: "Guía",
  otro: "Otro",
};

// ── create form modal ─────────────────────────────────────────────────────────

function CreateRecursoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const doCreate = useServerFn(createRecurso);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecursoFormData>({
    resolver: zodResolver(recursoFormSchema),
    defaultValues: {
      resource_type: "pdf",
      price: 0,
      currency: "PEN",
      is_free: false,
      published: false,
    },
  });

  const isFree = watch("is_free");
  const isPublished = watch("published");

  const onSubmit = async (data: RecursoFormData) => {
    setIsSubmitting(true);
    try {
      await doCreate({
        data: {
          title:           data.title,
          description:     data.description || undefined,
          cover_image_url: data.cover_image_url || undefined,
          file_url:        data.file_url || undefined,
          resource_type:   data.resource_type,
          price:           data.price,
          currency:        data.currency,
          payment_url:     data.payment_url || undefined,
          is_free:         data.is_free,
          published:       data.published,
        },
      });
      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Nuevo recurso
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title + type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Título <span className="text-destructive">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="Nombre del recurso"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <select
                {...register("resource_type")}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.entries(RESOURCE_TYPE_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe brevemente el contenido del recurso"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Cover + file URL */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL de portada</label>
              <input
                {...register("cover_image_url")}
                type="url"
                placeholder="https://..."
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.cover_image_url && <p className="text-xs text-destructive">{errors.cover_image_url.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL del archivo</label>
              <input
                {...register("file_url")}
                type="url"
                placeholder="https://..."
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.file_url && <p className="text-xs text-destructive">{errors.file_url.message}</p>}
            </div>
          </div>

          {/* Price + currency + payment URL */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Precio</label>
              <input
                {...register("price")}
                type="number"
                min="0"
                step="0.01"
                disabled={isFree}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Moneda</label>
              <select
                {...register("currency")}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PEN">PEN (Sol)</option>
                <option value="USD">USD (Dólar)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL de pago</label>
              <input
                {...register("payment_url")}
                type="url"
                placeholder="Stripe / Mercado Pago"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.payment_url && <p className="text-xs text-destructive">{errors.payment_url.message}</p>}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 bg-secondary px-4 py-2.5 text-sm font-medium">
              <input type="checkbox" {...register("is_free")} className="h-4 w-4 rounded accent-primary" />
              Recurso gratuito
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/60 bg-secondary px-4 py-2.5 text-sm font-medium">
              {isPublished ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <input type="checkbox" {...register("published")} className="h-4 w-4 rounded accent-primary" />
              {isPublished ? "Publicado" : "Borrador"}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSubmitting ? "Guardando..." : "Guardar recurso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── resources table ───────────────────────────────────────────────────────────

interface Recurso {
  id: string;
  title: string;
  slug: string;
  resource_type: string;
  price: number;
  currency: string;
  is_free: boolean;
  published: boolean;
  created_at: string;
}

function RecursosTable({
  recursos,
  pendingId,
  onToggle,
  onDelete,
}: {
  recursos: Recurso[];
  pendingId: string | null;
  onToggle: (id: string, published: boolean) => void;
  onDelete: (id: string) => void;
}) {
  if (recursos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary py-12 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-muted-foreground">Aún no has añadido recursos.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Recurso</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Tipo</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Precio</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Estado</th>
              <th className="px-4 py-3 font-heading font-semibold text-foreground">Fecha</th>
              <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {recursos.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{r.title}</p>
                  <a
                    href={`/recursos`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Ver en tienda <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{r.resource_type}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.is_free ? (
                    <span className="text-green-600 font-semibold">Gratis</span>
                  ) : (
                    `${r.currency} ${Number(r.price).toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.published
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {r.published ? "Publicado" : "Borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(r.created_at), "dd/MM/yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggle(r.id, !r.published)}
                      disabled={pendingId === r.id}
                      title={r.published ? "Convertir en borrador" : "Publicar"}
                      className="inline-flex items-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      {pendingId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : r.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      disabled={pendingId === r.id}
                      title="Eliminar"
                      className="inline-flex items-center rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
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

// ── page content ──────────────────────────────────────────────────────────────

function AdminRecursosContent() {
  const queryClient = useQueryClient();
  const { data: adminCheck } = useSuspenseQuery(adminQueryOptions);
  const { data: recursos } = useSuspenseQuery(recursosAdminQueryOptions);
  const [showModal, setShowModal] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const doToggle = useServerFn(toggleRecursoPublished);
  const doDelete = useServerFn(deleteRecurso);

  if (!adminCheck?.isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-heading text-xl font-bold text-foreground">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">No tienes permisos de administrador.</p>
        <Link to="/" className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const handleToggle = async (id: string, published: boolean) => {
    setPendingId(id);
    try {
      await doToggle({ data: { id, published } });
      queryClient.invalidateQueries({ queryKey: ["my-recursos"] });
      queryClient.invalidateQueries({ queryKey: ["public-recursos"] });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este recurso? Esta acción no se puede deshacer.")) return;
    setPendingId(id);
    try {
      await doDelete({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["my-recursos"] });
      queryClient.invalidateQueries({ queryKey: ["public-recursos"] });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Biblioteca / Recursos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona tus libros, PDFs, minutas y materiales descargables.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              ← Artículos
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Nuevo recurso
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: recursos.length, icon: BookOpen },
            { label: "Publicados", value: recursos.filter((r) => r.published).length, icon: Eye },
            { label: "Borradores", value: recursos.filter((r) => !r.published).length, icon: EyeOff },
            { label: "Gratuitos", value: recursos.filter((r) => r.is_free).length, icon: ShoppingCart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8">
          <RecursosTable
            recursos={recursos ?? []}
            pendingId={pendingId}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showModal && (
        <CreateRecursoModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            queryClient.invalidateQueries({ queryKey: ["my-recursos"] });
            queryClient.invalidateQueries({ queryKey: ["public-recursos"] });
          }}
        />
      )}
    </div>
  );
}

function AdminRecursosPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminRecursosContent />
    </Suspense>
  );
}

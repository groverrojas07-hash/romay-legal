import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Mail, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — Firma Jurídica & Forense" },
      { name: "description", content: "Restablece tu contraseña de acceso." },
      { property: "og:title", content: "Restablecer contraseña — Firma Jurídica & Forense" },
      { property: "og:description", content: "Restablece tu contraseña de acceso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setRecoveryMode(true);
    }
  }, []);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/admin" });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a acceder
        </Link>

        <div className="mt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
            {recoveryMode ? "Crear nueva contraseña" : "Restablecer contraseña"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {recoveryMode
              ? "Ingresa tu nueva contraseña para continuar."
              : "Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña."}
          </p>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900/30 dark:bg-green-900/20">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
            <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-300">
              Contraseña actualizada
            </p>
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              Redirigiendo al panel de administración...
            </p>
          </div>
        ) : sent ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900/30 dark:bg-green-900/20">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
            <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-300">
              Revisa tu correo electrónico
            </p>
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              Hemos enviado las instrucciones para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <form onSubmit={recoveryMode ? handleUpdatePassword : handleSendReset} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {recoveryMode ? (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Nueva contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block w-full rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : recoveryMode ? (
                "Guardar contraseña"
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

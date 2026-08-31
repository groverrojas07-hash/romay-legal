import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Verificar si ya tiene rol admin
    const { data: hasAdmin, error: checkError } = await context.supabase.rpc(
      "has_role",
      { _user_id: context.userId, _role: "admin" },
    );

    if (checkError) throw new Error(checkError.message);
    if (hasAdmin) return { success: true, alreadyAdmin: true };

    // Solo se permite auto-asignar admin si aún no existe ningún admin
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error("Ya existe un administrador. No puedes auto-asignar este rol.");
    }

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (insertError) throw new Error(insertError.message);
    return { success: true, alreadyAdmin: false };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (error) throw new Error(error.message);
    return { isAdmin: !!isAdmin };
  });

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

const ADMINISTRATIVE_ROLES: AppRole[] = ["admin", "editor", "gerente"];

export const hasAdministrativeAccess = (roles: AppRole[]) =>
  roles.some((role) => ADMINISTRATIVE_ROLES.includes(role));

export const getAdministrativeRoles = async (userId: string): Promise<AppRole[]> => {
  const [{ data: roleRows }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
  ]);

  const roles = new Set<AppRole>();
  (roleRows || []).forEach((row) => roles.add(row.role));

  // Fallback for legacy admins that still exist only in profiles.role.
  if (profile?.role === "admin") roles.add("admin");

  return Array.from(roles);
};

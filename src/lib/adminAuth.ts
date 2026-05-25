import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

const ADMINISTRATIVE_ROLES: AppRole[] = ["admin", "editor", "gerente"];

export const hasAdministrativeAccess = (roles: AppRole[]) =>
  roles.some((role) => ADMINISTRATIVE_ROLES.includes(role));

export const getAdministrativeRoles = async (userId: string): Promise<AppRole[]> => {
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roles = new Set<AppRole>();
  (roleRows || []).forEach((row) => roles.add(row.role));

  return Array.from(roles);
};

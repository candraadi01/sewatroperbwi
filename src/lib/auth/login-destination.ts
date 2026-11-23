import { safeRedirectPath } from "@/lib/security/redirect";

export function loginDestination(next: string | null, roles: readonly string[]) {
  const target = safeRedirectPath(next);
  if (target !== "/") return target;
  if (roles.includes("admin")) return "/admin";
  return roles.includes("owner") ? "/owner" : "/buyer";
}

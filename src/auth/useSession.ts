import { useAuthStore } from "./authStore";

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const siteId = useAuthStore((state) => state.siteId);
  return { user, organizationId: user?.organizationId ?? null, siteId };
}

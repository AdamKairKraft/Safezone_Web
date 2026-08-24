import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore";
import { refresh as apiRefresh } from "@/api/auth";

/**
 * On a fresh page load with only a refresh token persisted (no access token in memory),
 * silently exchange it before deciding whether the user is logged in - otherwise every
 * reload would bounce a genuinely logged-in user back to /login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setSession = useAuthStore((state) => state.setSession);
  const clear = useAuthStore((state) => state.clear);
  const [checking, setChecking] = useState(() => !accessToken && !!refreshToken);

  useEffect(() => {
    if (!accessToken && refreshToken) {
      apiRefresh(refreshToken)
        .then(setSession)
        .catch(() => clear())
        .finally(() => setChecking(false));
    }
    // Intentionally only on mount: this is a one-time "am I still logged in" check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="flex h-screen items-center justify-center text-sm text-sub">Loading…</div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

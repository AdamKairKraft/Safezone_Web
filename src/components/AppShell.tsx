import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/authStore";
import { listSitesByOrganization } from "@/api/sites";
import { logout as apiLogout } from "@/api/auth";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/roles", label: "Roles & Responsibilities" },
  { to: "/reports", label: "Reporting" },
  { to: "/she-files", label: "SHE Files" },
  { to: "/compliance", label: "Compliance Tracker" },
  { to: "/settings", label: "Settings" },
];

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell() {
  const { user, siteId, setSiteId, refreshToken, clear } = useAuthStore();

  const sitesQuery = useQuery({
    queryKey: ["sites", user?.organizationId],
    queryFn: () => listSitesByOrganization(user!.organizationId),
    enabled: !!user,
  });

  const sites = sitesQuery.data ?? [];
  useEffect(() => {
    if (!siteId && sites.length > 0) {
      setSiteId(sites[0].id);
    }
  }, [siteId, sites, setSiteId]);

  async function handleLogout() {
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch {
        // Best-effort: clear local session regardless of whether the server call succeeds.
      }
    }
    clear();
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-[210px] shrink-0 flex-col bg-navy px-3.5 py-4.5 text-[#c4c9d4]">
        <div className="flex items-center gap-2 px-1.5 pb-4.5 text-[15px] font-bold text-white">
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-blue text-[12px] font-bold text-white">
            SZ
          </span>
          SafeZone
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-2.5 py-2 text-[13px] ${
                  isActive ? "bg-blue font-semibold text-white" : "text-[#c4c9d4] hover:bg-navy-hover"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="mt-2.5 flex items-center gap-2 border-t border-[#333c4d] pt-2.5 text-xs">
            <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#4b5568] text-[10px] font-semibold text-white">
              {initials(user.fullName)}
            </span>
            <span className="flex-1 truncate">{user.fullName}</span>
            <button onClick={handleLogout} className="text-[11px] text-[#c4c9d4] underline hover:text-white">
              Log out
            </button>
          </div>
        )}
      </aside>

      <main className="min-w-0 flex-1 bg-white px-6.5 py-5.5">
        {sites.length > 1 && (
          <div className="mb-3 flex justify-end">
            <label className="flex items-center gap-2 text-xs text-sub">
              Site
              <select
                value={siteId ?? ""}
                onChange={(event) => setSiteId(event.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

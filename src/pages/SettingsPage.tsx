import { useSession } from "@/auth/useSession";
import { Panel } from "@/components/Card";
import { ROLE_LABELS } from "@/types/api";

export function SettingsPage() {
  const { user } = useSession();
  if (!user) return null;

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-[19px] font-semibold">Settings</h2>
      </div>
      <div className="max-w-md">
        <Panel title="Your profile">
          <dl className="text-xs">
            <div className="flex justify-between border-b border-grey-bg py-2">
              <dt className="text-sub">Name</dt>
              <dd className="font-medium">{user.fullName}</dd>
            </div>
            <div className="flex justify-between border-b border-grey-bg py-2">
              <dt className="text-sub">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-sub">Roles</dt>
              <dd className="font-medium">{user.roles.map((r) => ROLE_LABELS[r]).join(", ")}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}

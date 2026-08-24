import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/api/auth";
import { useAuthStore } from "@/auth/authStore";
import { Button } from "@/components/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const DEMO_EMAILS = [
  "jane.smith@acme-construction.test",
  "tom.reid@acme-construction.test",
  "priya.naidoo@skylinefoods.test",
];

export function LoginPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  if (accessToken) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const auth = await login(values.email, values.password);
      setSession(auth);
      navigate("/", { replace: true });
    } catch {
      setServerError("Invalid email or password.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue text-xs font-bold text-white">
            SZ
          </span>
          <span className="text-base font-bold">SafeZone</span>
        </div>

        <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
        <p className="mb-5 text-xs text-sub">Site safety & compliance tracking.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold tracking-wide text-gray-700">EMAIL</label>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="rounded-md border border-gray-300 px-2.5 py-2 text-xs outline-blue"
            />
            {errors.email && <span className="text-[11px] text-red">{errors.email.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold tracking-wide text-gray-700">PASSWORD</label>
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="rounded-md border border-gray-300 px-2.5 py-2 text-xs outline-blue"
            />
            {errors.password && <span className="text-[11px] text-red">{errors.password.message}</span>}
          </div>

          {serverError && <div className="rounded-md bg-red-bg px-2.5 py-2 text-[11.5px] text-red">{serverError}</div>}

          <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 rounded-md bg-[#fef9c3] px-2.5 py-2 text-[11px] text-[#713f12]">
          <div className="mb-1 font-semibold">Demo credentials</div>
          <div>Password for every demo user: <span className="font-mono">SafeZone123!</span></div>
          <ul className="mt-1 list-disc pl-4">
            {DEMO_EMAILS.map((email) => (
              <li key={email} className="font-mono">
                {email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

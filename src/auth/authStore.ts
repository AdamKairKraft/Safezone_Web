import { create } from "zustand";
import type { UserResponse } from "@/types/api";

interface PersistedAuth {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  siteId: string | null;
}

interface AuthState extends PersistedAuth {
  setSession: (session: { accessToken: string; refreshToken: string; user: UserResponse }) => void;
  setSiteId: (siteId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "safezone.auth";
const EMPTY: PersistedAuth = { accessToken: null, refreshToken: null, user: null, siteId: null };

function loadPersisted(): PersistedAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist(state: PersistedAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Refresh token in localStorage (vs. an httpOnly cookie) is a deliberate simplification:
// this backend issues tokens directly rather than setting cookies, so there's nowhere
// else for a same-origin SPA to durably keep it. Worth revisiting if this ever needs to
// defend against XSS more strictly.
export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadPersisted(),
  setSession: ({ accessToken, refreshToken, user }) => {
    const next = { accessToken, refreshToken, user, siteId: get().siteId };
    persist(next);
    set(next);
  },
  setSiteId: (siteId) => {
    const next = { accessToken: get().accessToken, refreshToken: get().refreshToken, user: get().user, siteId };
    persist(next);
    set({ siteId });
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(EMPTY);
  },
}));

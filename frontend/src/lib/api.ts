import type {
  AnalyticsSummary,
  OverviewPayload,
  Person,
  AttendanceRecord,
  User,
} from "@/lib/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const WS_ROOT = import.meta.env.VITE_WS_URL ?? API_URL.replace(/\/api$/, "").replace("http", "ws");
const TOKEN_KEY = "facenova.token";
const USER_KEY = "facenova.user";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token: string, user: User) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(error.message ?? "Request failed", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User; defaults: { frameIntervalMs: number } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),
  overview: () => request<OverviewPayload>("/system/overview"),
  persons: () => request<{ items: Person[] }>("/persons"),
  createPerson: (payload: { name: string; employeeCode: string; department?: string }) =>
    request<{ item: Person }>("/persons", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadImages: (personId: string, images: string[]) =>
    request<{ saved: number; imageCount: number; files: string[]; person: Person }>(`/persons/${personId}/images`, {
      method: "POST",
      body: JSON.stringify({ images }),
    }),
  rebuildEncodings: () => request<{ peopleProcessed: number; imagesProcessed: number; encodings: number }>("/encodings/rebuild", { method: "POST" }),
  attendanceToday: () => request<{ items: AttendanceRecord[] }>("/attendance/today"),
  attendanceHistory: (limit = 100) => request<{ items: AttendanceRecord[] }>(`/attendance/history?limit=${limit}`),
  analytics: (days = 7) => request<AnalyticsSummary>(`/analytics/summary?days=${days}`),
};

export function wsUrl(path: string, token: string) {
  const root = WS_ROOT.endsWith("/") ? WS_ROOT.slice(0, -1) : WS_ROOT;
  return `${root}${path}?token=${encodeURIComponent(token)}`;
}


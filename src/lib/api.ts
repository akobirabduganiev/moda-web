import { CountryDto, LiveStatsDto, ShareTodayResponse, MoodTypeDto, TokenPair, RegisterResponse, SubmitMoodRequest, SubmitMoodResponse } from "./types";
import { buildAcceptLanguage } from "./locale";

const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8010";
const IS_SERVER = typeof window === "undefined";

export function apiBase() {
  return DEFAULT_BASE.replace(/\/$/, "");
}

function acceptLanguageHeader(locale?: string | null): HeadersInit | undefined {
  // Accept-Language is a forbidden header in browsers; set it only on the server.
  if (!locale) return undefined;
  return IS_SERVER ? { "Accept-Language": buildAcceptLanguage(locale) } : undefined;
}

// Token accessor to be provided by lib/auth at runtime (lazy import-safe)
let accessTokenGetter: (() => string | null) | null = null;
export function __setAccessTokenGetter(fn: () => string | null) {
  accessTokenGetter = fn;
}

function authHeaders(locale?: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const lang = acceptLanguageHeader(locale);
  if (lang) Object.assign(headers, lang);
  const token = accessTokenGetter?.();
  if (token) (headers as any)["Authorization"] = `Bearer ${token}`;
  return headers;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  title?: string;
  detail?: string;
  raw?: any;
  constructor(opts: { status: number; code?: string; title?: string; detail?: string; message?: string; raw?: any }) {
    super(opts.message || opts.detail || opts.title || `Request failed: ${opts.status}`);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.title = opts.title;
    this.detail = opts.detail;
    this.raw = opts.raw;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    const code = body?.code || body?.error || undefined;
    const title = body?.title || undefined;
    const detail = body?.detail || body?.message || undefined;
    return new ApiError({ status: res.status, code, title, detail, raw: body });
  } catch {
    const text = await res.text().catch(() => res.statusText);
    return new ApiError({ status: res.status, detail: text, message: text });
  }
}

async function postJSON<T>(path: string, body: any, locale?: string | null): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: authHeaders(locale),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json();
}

export async function fetchLive(country?: string | null, locale?: string | null): Promise<LiveStatsDto> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (locale) params.set("locale", locale);
  const res = await fetch(`${apiBase()}/api/v1/stats/live?${params.toString()}`, {
    headers: acceptLanguageHeader(locale),
    next: { revalidate: 1 },
  });
  if (!res.ok) throw new Error(`Failed to fetch live stats: ${res.status}`);
  return res.json();
}

export async function fetchCountries(locale?: string | null): Promise<CountryDto[]> {
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const res = await fetch(`${apiBase()}/api/v1/types/countries?${params.toString()}`, {
    headers: acceptLanguageHeader(locale),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
  return res.json();
}

export async function fetchMoodTypes(locale?: string | null): Promise<MoodTypeDto[]> {
  const params = new URLSearchParams();
  if (locale) params.set("locale", locale);
  const res = await fetch(`${apiBase()}/api/v1/moods/types?${params.toString()}`, {
    headers: acceptLanguageHeader(locale),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch mood types: ${res.status}`);
  return res.json();
}

export async function fetchShareToday(country?: string | null, locale?: string | null): Promise<ShareTodayResponse> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (locale) params.set("locale", locale);
  const res = await fetch(`${apiBase()}/api/v1/share/today?${params.toString()}`, {
    headers: acceptLanguageHeader(locale),
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Failed to fetch share today: ${res.status}`);
  return res.json();
}

export async function fetchMoodStatus(locale?: string | null): Promise<{ submittedToday: boolean; moodType?: string | null }> {
  const res = await fetch(`${apiBase()}/api/v1/mood/status`, {
    headers: acceptLanguageHeader(locale),
    cache: "no-store",
  });
  if (res.status === 404) {
    // backend may not have this endpoint; treat as no submission info
    return { submittedToday: false };
  }
  if (!res.ok) throw new Error(`Failed to fetch mood status: ${res.status}`);
  return res.json();
}

export function buildShareSvgUrl(country?: string | null, locale?: string | null): string {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (locale) params.set("locale", locale);
  return `${apiBase()}/api/v1/share/today.svg?${params.toString()}`;
}

// Auth endpoints
export function login(email: string, password: string, locale?: string | null): Promise<TokenPair> {
  return postJSON<TokenPair>(`/api/v1/auth/login`, { email, password }, locale);
}

export function register(country: string, email: string, password: string, locale?: string | null): Promise<RegisterResponse> {
  return postJSON<RegisterResponse>(`/api/v1/auth/register`, { country, email, password }, locale);
}

export function refresh(refreshToken: string, locale?: string | null): Promise<TokenPair> {
  return postJSON<TokenPair>(`/api/v1/auth/refresh`, { refreshToken }, locale);
}

export function submitMood(payload: SubmitMoodRequest, locale?: string | null): Promise<SubmitMoodResponse> {
  return postJSON<SubmitMoodResponse>(`/api/v1/mood`, payload, locale);
}

export function sseUrl(token?: string | null): string {
  if (token) {
    // Authenticated stream
    return `${apiBase()}/api/v1/sse/live?token=${encodeURIComponent(token)}`;
  }
  return `${apiBase()}/api/v1/sse/public`;
}

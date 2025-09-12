"use client";

import { FormEvent, useState } from "react";
import { login as apiLogin, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorNotice from "@/components/ErrorNotice";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState(() => search.get("email") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title?: string; message?: string; code?: string } | null>(null);
  const { setTokens } = useAuth();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const pair = await apiLogin(email, password);
      setTokens(pair);
      // subtle success animation by delaying navigation slightly
      setTimeout(() => router.replace(next), 200);
    } catch (e: any) {
      if (e instanceof ApiError) {
        const isUnauthorized = e.status === 401 || e.code === "unauthorized";
        setError({ title: isUnauthorized ? "Invalid credentials" : e.title || "Login failed", message: e.detail || e.message, code: e.code });
      } else {
        setError({ title: "Login failed", message: e?.message || "Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back! Enter your credentials.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${error ? "border-red-300 focus:ring-red-400/40" : "focus:ring-blue-500/40"}`}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${error ? "border-red-300 focus:ring-red-400/40" : "focus:ring-blue-500/40"}`}
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        {error && (
          <ErrorNotice title={error.title} message={error.message} code={error.code} />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-md px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-transform ${loading ? "opacity-70" : "active:scale-[0.98]"}`}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a></p>
    </div>
  );
}

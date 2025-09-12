"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { register as apiRegister, ApiError } from "@/lib/api";
import { fetchCountries } from "@/lib/api";
import type { CountryDto } from "@/lib/types";
import ErrorNotice from "@/components/ErrorNotice";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title?: string; message?: string; code?: string; actionHref?: string; actionLabel?: string } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await apiRegister(country, email, password);
      if (res.sent) {
        setSuccess("Verification email sent. Please check your inbox.");
      } else if (res.verificationToken) {
        setSuccess("Registered. Use the received token to verify your email.");
      } else {
        setSuccess("Registered successfully.");
      }
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.code === "email_already_exists" || e.detail === "email_already_exists") {
          setError({
            title: "Email already registered",
            message: "Looks like this email is already in use. Try signing in instead.",
            code: e.code,
            actionLabel: "Go to login",
            actionHref: `/auth/login?email=${encodeURIComponent(email)}`,
          });
        } else {
          setError({ title: e.title || "Registration failed", message: e.detail || e.message, code: e.code });
        }
      } else {
        setError({ title: "Registration failed", message: e?.message || "Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Register</h1>
      <p className="text-sm text-gray-500 mb-6">Create your account to submit moods.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Country</label>
          <select
            value={country}
            required
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
          >
            <option value="" disabled>Select country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${error?.code === "email_already_exists" ? "border-red-400 focus:ring-red-400/40" : "focus:ring-blue-500/40"}`}
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
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
            placeholder="••••••••"
            minLength={8}
          />
        </div>

        {error && (
          <ErrorNotice
            title={error.title}
            message={error.message}
            code={error.code}
            actionLabel={error.actionLabel}
            href={error.actionHref}
          />
        )}
        {success && <div className="text-sm text-green-600 animate-in fade-in slide-in-from-top-1 duration-200">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-md px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-transform ${loading ? "opacity-70" : "active:scale-[0.98]"}`}
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Login</a></p>
    </div>
  );
}

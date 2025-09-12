"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function NavBar() {
  const { accessToken, logout } = useAuth();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="border-b border-gray-200 sticky top-0 backdrop-blur bg-white/70 dark:bg-black/40 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Mooda</Link>
          <span className="text-sm text-gray-500">Live</span>
        </div>
        <div className="flex items-center gap-3">
          {accessToken ? (
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
            >Logout</button>
          ) : (
            <>
              <Link href="/auth/login" className={`text-sm ${isActive("/auth/login") ? "text-foreground" : "text-gray-600 hover:text-foreground"}`}>Login</Link>
              <Link href="/auth/register" className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

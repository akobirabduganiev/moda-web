import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mooda — Live Mood of the World",
  description: "Global mood stats in real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-100 text-center text-xs text-gray-500 py-6">
              Built with Next.js. Data by Mooda API.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

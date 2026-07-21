// app/(admin)/layout.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser); // Make sure this query returns your user document
  const router = useRouter();

  const isLoading = user === undefined;

  useEffect(() => {
    // Wait until Convex finishes checking authentication state
    if (isLoading) return;

    // If no user exists, or their role string is not "admin", kick them to homepage
    if (!user || user.role !== "admin") {
      router.replace("/"); 
    }
  }, [user, isLoading, router]);

  // 1. Loading State: Display a secure screen while processing
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-blue-500" />
          <p className="text-sm font-medium tracking-wide">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Failure State: Render absolutely nothing if they fail the check
  if (!user || user.role !== "admin") {
    return null;
  }

  // 3. Success State: Pass down access to nested sub-routes like /admin/products
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN</h2>
        {/* Navigation links go here */}
      </aside>
      <main className="flex-1 p-10">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
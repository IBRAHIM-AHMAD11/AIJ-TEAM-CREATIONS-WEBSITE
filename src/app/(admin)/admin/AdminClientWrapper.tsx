"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.getCurrentUser);
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

  // Loading State (Optional but recommended so the screen isn't blank while fetching)
  // if (isLoading) return <div>Loading...</div>;

  // Failure State: Render absolutely nothing if they fail the check
  if (!user || user.role !== "admin") {
    return null;
  }

  // Success State: Render the admin UI
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
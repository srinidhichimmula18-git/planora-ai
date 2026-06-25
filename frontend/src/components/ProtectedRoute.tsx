"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping h-12 w-12" />
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-wider uppercase text-muted-foreground animate-pulse">
          Syncing Planora Session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

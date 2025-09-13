"use client";

import LoadingState from "@/components/shared/LoadingState";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardContent } from "@/components/dashboard";

export const HomeView = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState
          title="Loading"
          description="Please wait a moment while we load your data..."
        />
      </div>
    );
  }

  if (!session) {
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your healthcare network.
          </p>
        </div>
      </div>
      {/* Dashboard Content */}
      <DashboardContent />
    </div>
  );
};

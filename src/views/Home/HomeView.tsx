"use client";

import LoadingState from "@/components/shared/LoadingState";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  return <div>HomeView</div>;
};

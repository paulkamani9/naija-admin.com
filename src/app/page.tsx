"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const { signOut } = authClient;
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <button
        onClick={() =>
          signOut({
            fetchOptions: {
              onSuccess: () => router.push("/sign-in"),
            },
          })
        }
      >
        Sign Out
      </button>
    </div>
  );
}

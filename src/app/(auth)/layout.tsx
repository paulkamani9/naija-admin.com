import { AuthHero } from "@/components/Auth/AuthHero";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-full min-h-screen grid md:grid-cols-2">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white/75 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      <AuthHero />
      <div className="flex flex-col gap-2 items-center justify-center p-6 pb-10">
        <div className="w-full max-w-md">{children}</div>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a>Terms and Conditions</a> and{" "}
          <a>Privacy Policy</a>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;

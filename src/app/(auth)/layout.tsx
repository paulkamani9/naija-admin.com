"use client";
import { AuthHero } from "@/components/Auth/AuthHero";
import { motion } from "framer-motion";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-full min-h-screen grid md:grid-cols-2 bg-background">
      {/* Modern background pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-green-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,219,226,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,219,226,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05)_0%,transparent_50%)]" />
      </div>
      
      <AuthHero />
      
      <div className="flex flex-col gap-6 items-center justify-center p-6 pb-10 md:p-8 relative">
        {/* Content container with animation */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
        
        {/* Footer links */}
        <motion.div 
          className="text-muted-foreground text-center text-xs text-balance max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>
            By continuing, you agree to our{" "}
            <a 
              href="/terms" 
              className="underline underline-offset-4 hover:text-primary transition-colors duration-200 font-medium"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a 
              href="/privacy" 
              className="underline underline-offset-4 hover:text-primary transition-colors duration-200 font-medium"
            >
              Privacy Policy
            </a>
          </p>
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs opacity-75">
              Naija.com Admin Portal • Secure Healthcare Management
            </p>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-green-500/10 rounded-full blur-xl opacity-50 dark:opacity-30" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-tl from-green-400/10 to-primary/10 rounded-full blur-lg opacity-40 dark:opacity-20" />
      </div>
    </main>
  );
};

export default AuthLayout;

"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

interface SocialButtonsProps {
  isLoading: boolean;
}

const SocialButtons = ({ isLoading }: SocialButtonsProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Button
        disabled={isLoading}
        variant="outline"
        type="button"
        className="w-full h-11 bg-background/50 border-border/70 hover:bg-background hover:border-primary/30 transition-all duration-200 text-foreground font-medium"
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
          })
        }
      >
        <FaGoogle className="w-4 h-4 text-red-500" />
        Continue with Google
      </Button>
    </motion.div>
  );
};

export default SocialButtons;

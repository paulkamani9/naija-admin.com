import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FaGoogle } from "react-icons/fa";

interface SocialButtonsProps {
  isLoading: boolean;
}

const SocialButtons = ({ isLoading }: SocialButtonsProps) => {
  return (
    <Button
      disabled={isLoading}
      variant={"outline"}
      type="button"
      className="w-full"
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
        })
      }
    >
      <FaGoogle />
      Google
    </Button>
  );
};

export default SocialButtons;

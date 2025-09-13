"use client";

import React from "react";
import {
  BuildingIcon,
  CreditCardIcon,
  HeartHandshakeIcon,
  ChevronDownIcon,
  Sun,
  Moon,
  Grid2X2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { GeneratedAvatars } from "@/components/shared/GeneratedAvatar";
import { authClient } from "@/lib/auth-client";

// Mode Toggle Component with single-click behavior
const ModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover:bg-accent hover:text-accent-foreground"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// Navigation Icons Component
const NavigationIcons = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 hover:bg-accent hover:text-accent-foreground"
      >
        <Grid2X2Icon className="h-4 w-4" />
        <span className="sr-only">Quick Navigation</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/hmos" className="flex items-center gap-2">
          <HeartHandshakeIcon className="h-4 w-4" />
          HMO Management
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/hospitals" className="flex items-center gap-2">
          <BuildingIcon className="h-4 w-4" />
          Hospitals
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/plans" className="flex items-center gap-2">
          <CreditCardIcon className="h-4 w-4" />
          Insurance Plans
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// User Menu Component with authentication integration
const UserMenu = () => {
  const { data, isPending } = authClient.useSession();

  if (isPending || !data?.user) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground gap-2"
        >
          {data.user.image ? (
            <Avatar className="h-7 w-7">
              <AvatarImage src={data.user.image} alt={data.user.name} />
              <AvatarFallback className="text-xs">
                {data.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <GeneratedAvatars
              seed={data.user.name || "User"}
              variants="initials"
              className="h-7 w-7"
            />
          )}
          <ChevronDownIcon className="h-3 w-3 hidden sm:block" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{data.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {data.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile Settings</DropdownMenuItem>
        <DropdownMenuItem>Account Preferences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/sign-in";
                },
              },
            });
          }}
          className="text-destructive focus:text-destructive"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Main Admin Navbar Component
interface AdminNavbarProps {
  className?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Left side - Sidebar Trigger and Logo */}
        <div className="flex items-center gap-3 flex-1">
          <SidebarTrigger className="h-9 w-9" />
          <Link
            href="/"
            className="flex-1 flex flex-col items-center md:hidden"
          >
            <Logo variant="symbol" size="sm" showAdmin={false} />
          </Link>
        </div>

        {/* Right side - Navigation and User Controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Quick Navigation Icons - Hidden on mobile */}
          <div className="block md:hidden">
            <NavigationIcons />
          </div>

          {/* Mode Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

"use client";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  BuildingIcon,
  HeartHandshakeIcon,
  CreditCardIcon,
  BarChart3Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarUserButton } from "./SidebarUserButton";
import Logo from "@/components/shared/Logo";

const mainSection = [
  {
    icon: HeartHandshakeIcon,
    label: "HMO Management",
    href: "/hmos",
  },
  {
    icon: BuildingIcon,
    label: "Hospitals",
    href: "/hospitals",
  },
  {
    icon: CreditCardIcon,
    label: "Insurance Plans",
    href: "/plans",
  },
];
const secondSection = [
  {
    icon: BarChart3Icon,
    label: "Analytics",
    href: "/analytics",
  },
  {
    icon: UsersIcon,
    label: "Users",
    href: "/users",
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2">
          <Logo variant="symbol" size="sm" showAdmin={false} />
          <div className="flex flex-col">
            <p className="text-lg font-bold">Naija.com</p>
            <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wide">
              Admin Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="opacity-20" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSection.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 hover:bg-sidebar-accent/50 border border-transparent hover:border-green-500/20 transition-all duration-200",
                      pathname === item.href &&
                        "bg-sidebar-accent border-green-500/30 text-sidebar-accent-foreground"
                    )}
                    isActive={pathname == item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator className="opacity-20" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 hover:bg-sidebar-accent/50 border border-transparent hover:border-green-500/20 transition-all duration-200",
                      pathname === item.href &&
                        "bg-sidebar-accent border-green-500/30 text-sidebar-accent-foreground"
                    )}
                    isActive={pathname == item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-white">
        <SidebarUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};

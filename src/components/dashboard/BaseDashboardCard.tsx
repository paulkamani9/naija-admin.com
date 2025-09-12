"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseDashboardCardProps {
  title: string;
  description?: string;
  count?: number;
  icon?: React.ElementType;
  children: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
  viewAllHref?: string;
  className?: string;
  headerActions?: React.ReactNode;
  variant?: "default" | "compact";
  isLoading?: boolean;
}

export function BaseDashboardCard({
  title,
  description,
  count,
  icon: Icon,
  children,
  onAddNew,
  addNewLabel = "Add New",
  viewAllHref,
  className,
  headerActions,
  variant = "default",
  isLoading = false,
}: BaseDashboardCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20",
        "bg-gradient-to-br from-card to-card/50 backdrop-blur-sm",
        variant === "compact" && "h-fit",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                {typeof count === "number" && (
                  <Badge
                    variant="secondary"
                    className="bg-muted/50 text-muted-foreground font-medium px-2 py-0.5 text-xs"
                  >
                    {count.toLocaleString()}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            {onAddNew && (
              <Button
                onClick={onAddNew}
                size="sm"
                className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                disabled={isLoading}
              >
                <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                {addNewLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", variant === "compact" && "pb-4")}>
        {children}
      </CardContent>

      {viewAllHref && (
        <CardContent className="pt-0 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground hover:text-foreground group/button"
            asChild
          >
            <a href={viewAllHref}>
              <span>View all {title.toLowerCase()}</span>
              <ArrowRightIcon className="w-4 h-4 group-hover/button:translate-x-0.5 transition-transform" />
            </a>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

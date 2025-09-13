"use client";

import "client-only";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCardIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { InsurancePlan, PlanWithRelations } from "@/db/types";

interface PlanCardProps {
  plans: (InsurancePlan | PlanWithRelations)[];
  onAddNew?: () => void;
  isLoading?: boolean;
  customAddButton?: React.ReactNode;
}

const planTypeColors = {
  family: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  individual: "bg-green-500/10 text-green-600 border-green-500/20",
  enterprise: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const planTypeLabels = {
  family: "Family",
  individual: "Individual",
  enterprise: "Enterprise",
};

export function PlanCard({ plans, onAddNew, isLoading, customAddButton }: PlanCardProps) {
  const activePlans = plans.filter((plan) => plan.isActive);

  return (
    <BaseDashboardCard
      title="Insurance Plans"
      description="Available insurance packages across your network"
      count={activePlans.length}
      icon={CreditCardIcon}
      onAddNew={onAddNew}
      addNewLabel="Add Plan"
      viewAllHref="/plans"
      isLoading={isLoading}
      headerActions={
        plans.length > activePlans.length && (
          <Badge variant="outline" className="text-xs">
            {plans.length - activePlans.length} inactive
          </Badge>
        )
      }
      customAddButton={customAddButton}
    >
      <div className="space-y-3">
        {activePlans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCardIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No active plans found</p>
            <p className="text-xs">Create your first insurance plan</p>
          </div>
        ) : (
          <>
            {activePlans.slice(0, 3).map((plan, index) => (
              <div key={plan.id}>
                <div className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary/15 transition-colors">
                    <CreditCardIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {plan.name}
                        </h4>
                        <Badge
                          className={`text-xs px-2 py-0.5 ${
                            planTypeColors[plan.planType]
                          }`}
                          variant="outline"
                        >
                          {planTypeLabels[plan.planType]}
                        </Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-primary">
                          {formatCurrency(plan.monthlyCostCents)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per month
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {"hmo" in plan && plan.hmo && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">{plan.hmo.name}</span>
                          {plan.hmo.code && (
                            <span className="text-muted-foreground/70 font-mono">
                              • {plan.hmo.code}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>
                            {plan.durationYears} year
                            {plan.durationYears !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSignIcon className="w-3 h-3" />
                          <span>
                            Max: {formatCurrency(plan.annualMaxBenefitCents)}
                          </span>
                        </div>
                      </div>

                      {plan.description && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-1">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {index < Math.min(activePlans.length, 3) - 1 && (
                  <Separator className="my-2 opacity-30" />
                )}
              </div>
            ))}

            {activePlans.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  +{activePlans.length - 3} more active plans
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BaseDashboardCard>
  );
}

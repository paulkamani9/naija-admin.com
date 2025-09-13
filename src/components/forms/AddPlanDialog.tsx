"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { PlanForm } from "@/components/forms/PlanForm";
import type { InsurancePlan, Hospital, Hmo } from "@/db/types";

interface AddPlanDialogProps {
  onSuccess?: (plan: InsurancePlan) => void;
  trigger?: React.ReactNode;
  className?: string;
  hospitals?: Hospital[];
  hmos?: Hmo[];
}

export function AddPlanDialog({
  onSuccess,
  trigger,
  className,
  hospitals,
  hmos,
}: AddPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (plan: InsurancePlan) => {
    setIsOpen(false);
    onSuccess?.(plan);
  };

  const handleCancel = () => setIsOpen(false);

  const defaultTrigger = (
    <Button
      size="sm"
      className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="w-3.5 h-3.5 mr-1.5" />
      Add Plan
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className={className}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <ResponsiveDialog
        title="Add New Insurance Plan"
        description="Create a new insurance plan by selecting an HMO and hospital, then configuring the plan details and coverage."
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PlanForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          hospitalsProp={hospitals}
          hmosProp={hmos}
        />
      </ResponsiveDialog>
    </>
  );
}

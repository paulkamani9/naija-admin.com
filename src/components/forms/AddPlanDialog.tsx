"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { PlanForm } from "@/components/forms/PlanForm";
import type { InsurancePlan, Hospital, Hmo } from "@/db/types";

interface AddPlanDialogProps {
  plan?: InsurancePlan; // For editing mode
  open?: boolean; // For controlled open state
  onOpenChange?: (open: boolean) => void; // For controlled open state
  onSuccess?: (plan: InsurancePlan) => void;
  trigger?: React.ReactNode;
  className?: string;
  hospitals?: Hospital[];
  hmos?: Hmo[];
}

export function AddPlanDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
  trigger,
  className,
  hospitals,
  hmos,
}: AddPlanDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const isEditing = !!plan;

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
        title={isEditing ? "Edit Insurance Plan" : "Add New Insurance Plan"}
        description={
          isEditing
            ? "Update the insurance plan information. Make your changes and save to update the plan details."
            : "Create a new insurance plan by selecting an HMO and hospital, then configuring the plan details and coverage."
        }
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PlanForm
          plan={plan}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          hospitalsProp={hospitals}
          hmosProp={hmos}
        />
      </ResponsiveDialog>
    </>
  );
}

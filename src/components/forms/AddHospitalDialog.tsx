"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { HospitalForm } from "@/components/forms/HospitalForm";

import type { Hospital } from "@/db/types";

interface AddHospitalDialogProps {
  hospital?: Hospital; // For editing mode
  open?: boolean; // For controlled open state
  onOpenChange?: (open: boolean) => void; // For controlled open state
  onSuccess?: (hospital: Hospital) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function AddHospitalDialog({
  hospital,
  open,
  onOpenChange,
  onSuccess,
  trigger,
  className,
}: AddHospitalDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const isEditing = !!hospital;

  const handleSuccess = (hospital: Hospital) => {
    setIsOpen(false);
    onSuccess?.(hospital);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button
      size="sm"
      className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="w-3.5 h-3.5 mr-1.5" />
      Add Hospital
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
        title={isEditing ? "Edit Hospital" : "Add New Hospital"}
        description={
          isEditing
            ? "Update the hospital information. Make your changes and save to update the hospital details."
            : "Create a new hospital entry in the system. Fill in the required fields to get started."
        }
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <HospitalForm
          hospital={hospital}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ResponsiveDialog>
    </>
  );
}

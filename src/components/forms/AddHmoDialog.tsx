"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { HmoForm } from "@/components/forms/HmoForm";
import type { Hmo, Hospital } from "@/db/types";

interface AddHmoDialogProps {
  hmo?: Hmo; // For editing mode
  open?: boolean; // For controlled open state
  onOpenChange?: (open: boolean) => void; // For controlled open state
  onSuccess?: (hmo: Hmo) => void;
  trigger?: React.ReactNode;
  className?: string;
  hospitals?: Hospital[];
}

export function AddHmoDialog({
  hmo,
  open,
  onOpenChange,
  onSuccess,
  trigger,
  className,
  hospitals,
}: AddHmoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const isEditing = !!hmo;

  const handleSuccess = (hmo: Hmo) => {
    setIsOpen(false);
    onSuccess?.(hmo);
  };

  const handleCancel = () => setIsOpen(false);

  const defaultTrigger = (
    <Button
      size="sm"
      className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
      onClick={() => setIsOpen(true)}
    >
      <Plus className="w-3.5 h-3.5 mr-1.5" />
      Add HMO
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
        title={isEditing ? "Edit HMO" : "Add New HMO"}
        description={
          isEditing
            ? "Update the HMO information. Make your changes and save to update the HMO details."
            : "Create a new HMO. Optionally associate a default hospital and upload a logo."
        }
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <HmoForm
          hmo={hmo}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          hospitalsProp={hospitals}
        />
      </ResponsiveDialog>
    </>
  );
}

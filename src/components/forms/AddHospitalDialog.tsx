"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { HospitalForm } from "@/components/forms/HospitalForm";

import type { Hospital } from "@/db/types";

interface AddHospitalDialogProps {
  onSuccess?: (hospital: Hospital) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function AddHospitalDialog({
  onSuccess,
  trigger,
  className,
}: AddHospitalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        title="Add New Hospital"
        description="Create a new hospital entry in the system. Fill in the required fields to get started."
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <HospitalForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </ResponsiveDialog>
    </>
  );
}

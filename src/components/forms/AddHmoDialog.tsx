"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { HmoForm } from "@/components/forms/HmoForm";
import type { Hmo, Hospital } from "@/db/types";

interface AddHmoDialogProps {
  onSuccess?: (hmo: Hmo) => void;
  trigger?: React.ReactNode;
  className?: string;
  hospitals?: Hospital[];
}

export function AddHmoDialog({
  onSuccess,
  trigger,
  className,
  hospitals,
}: AddHmoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        title="Add New HMO"
        description="Create a new HMO. Optionally associate a default hospital and upload a logo."
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <HmoForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          hospitalsProp={hospitals}
        />
      </ResponsiveDialog>
    </>
  );
}

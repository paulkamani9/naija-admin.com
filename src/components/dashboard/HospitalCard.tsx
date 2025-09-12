"use client";

import "client-only";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BuildingIcon, MapPinIcon, PhoneIcon, MailIcon } from "lucide-react";
import type { Hospital, HospitalWithAdmin } from "@/db/types";

interface HospitalCardProps {
  hospitals: (Hospital | HospitalWithAdmin)[];
  onAddNew?: () => void;
  isLoading?: boolean;
  customAddButton?: React.ReactNode;
}

export function HospitalCard({
  hospitals,
  onAddNew,
  isLoading,
  customAddButton,
}: HospitalCardProps) {
  return (
    <BaseDashboardCard
      title="Hospitals"
      description="Healthcare facilities in your network"
      count={hospitals.length}
      icon={BuildingIcon}
      onAddNew={onAddNew}
      addNewLabel="Add Hospital"
      viewAllHref="/hospitals"
      isLoading={isLoading}
      customAddButton={customAddButton}
    >
      <div className="space-y-3">
        {hospitals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BuildingIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hospitals found</p>
            <p className="text-xs">Add your first hospital to get started</p>
          </div>
        ) : (
          <>
            {hospitals.slice(0, 3).map((hospital, index) => (
              <div key={hospital.id}>
                <div className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary/15 transition-colors">
                    <BuildingIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {hospital.name}
                      </h4>
                      {"admin" in hospital && hospital.admin && (
                        <Badge variant="outline" className="text-xs">
                          {hospital.admin.name}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {hospital.state && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="truncate">{hospital.state}</span>
                          {hospital.localGovernment && (
                            <span className="text-muted-foreground/70">
                              • {hospital.localGovernment}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {hospital.phone && (
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{hospital.phone}</span>
                          </div>
                        )}
                        {hospital.email && (
                          <div className="flex items-center gap-1">
                            <MailIcon className="w-3 h-3" />
                            <span className="truncate">{hospital.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < Math.min(hospitals.length, 3) - 1 && (
                  <Separator className="my-2 opacity-30" />
                )}
              </div>
            ))}

            {hospitals.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  +{hospitals.length - 3} more hospitals
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BaseDashboardCard>
  );
}

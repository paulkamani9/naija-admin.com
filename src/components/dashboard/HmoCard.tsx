"use client";

import "client-only";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HeartHandshakeIcon, BuildingIcon } from "lucide-react";
// Using a standard img tag to avoid Next.js remote image domain config requirements
import type { Hmo, HmoWithRelations } from "@/db/types";

interface HmoCardProps {
  hmos: (Hmo | HmoWithRelations)[];
  onAddNew?: () => void;
  isLoading?: boolean;
}

export function HmoCard({ hmos, onAddNew, isLoading }: HmoCardProps) {
  return (
    <BaseDashboardCard
      title="HMOs"
      description="Health maintenance organizations managing your plans"
      count={hmos.length}
      icon={HeartHandshakeIcon}
      onAddNew={onAddNew}
      addNewLabel="Add HMO"
      viewAllHref="/hmo"
      isLoading={isLoading}
    >
      <div className="space-y-3">
        {hmos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HeartHandshakeIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No HMOs found</p>
            <p className="text-xs">Add your first HMO to get started</p>
          </div>
        ) : (
          <>
            {hmos.slice(0, 3).map((hmo, index) => (
              <div key={hmo.id}>
                <div className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 overflow-hidden group-hover/item:bg-green-500/15 transition-colors">
                    {"logoUrl" in hmo && hmo.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hmo.logoUrl}
                        alt={`${hmo.name} logo`}
                        width={24}
                        height={24}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== "/hmo-placeholder.svg") {
                            target.src = "/hmo-placeholder.svg";
                          }
                        }}
                      />
                    ) : (
                      <HeartHandshakeIcon className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {hmo.name}
                      </h4>
                      {hmo.code && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {hmo.code}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {"hospital" in hmo && hmo.hospital && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BuildingIcon className="w-3 h-3" />
                          <span className="truncate">{hmo.hospital.name}</span>
                          {hmo.hospital.state && (
                            <span className="text-muted-foreground/70">
                              • {hmo.hospital.state}
                            </span>
                          )}
                        </div>
                      )}

                      {"creator" in hmo && hmo.creator && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Created by {hmo.creator.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < Math.min(hmos.length, 3) - 1 && (
                  <Separator className="my-2 opacity-30" />
                )}
              </div>
            ))}

            {hmos.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  +{hmos.length - 3} more HMOs
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BaseDashboardCard>
  );
}

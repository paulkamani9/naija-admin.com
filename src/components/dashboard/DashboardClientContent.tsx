"use client";

import "client-only";
import { HospitalCard } from "./HospitalCard";
import { HmoCard } from "./HmoCard";
import { PlanCard } from "./PlanCard";
import type { Hospital, Hmo, InsurancePlan } from "@/db/types";

interface DashboardClientContentProps {
  hospitals: Hospital[];
  hmos: Hmo[];
  plans: InsurancePlan[];
}

export function DashboardClientContent({
  hospitals,
  hmos,
  plans,
}: DashboardClientContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <HospitalCard
        hospitals={hospitals}
        onAddNew={() => {
          // TODO: Implement add new hospital modal/form
          console.log("Add new hospital");
        }}
      />

      <HmoCard
        hmos={hmos}
        onAddNew={() => {
          // TODO: Implement add new HMO modal/form
          console.log("Add new HMO");
        }}
      />

      <PlanCard
        plans={plans}
        onAddNew={() => {
          // TODO: Implement add new plan modal/form
          console.log("Add new plan");
        }}
      />
    </div>
  );
}

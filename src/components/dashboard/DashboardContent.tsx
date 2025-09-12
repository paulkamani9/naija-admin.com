"use client";

import { useTransition, useOptimistic, useEffect, useState } from "react";
import { getHospitalsAction, getHmosAction, getPlansAction } from "@/actions";
import { HospitalCard } from "./HospitalCard";
import { HmoCard } from "./HmoCard";
import { PlanCard } from "./PlanCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import type { Hospital, Hmo, InsurancePlan } from "@/db/types";

interface DashboardData {
  hospitals: Hospital[];
  hmos: Hmo[];
  plans: InsurancePlan[];
}

export function DashboardContent() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<DashboardData>({
    hospitals: [],
    hmos: [],
    plans: [],
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Use optimistic updates for smooth user experience
  const [optimisticData, updateOptimisticData] = useOptimistic(
    data,
    (state, updatedData: Partial<DashboardData>) => ({
      ...state,
      ...updatedData,
    })
  );

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospitalsResult, hmosResult, plansResult] = await Promise.all([
          getHospitalsAction({}, { limit: 6 }),
          getHmosAction({}, { limit: 6 }),
          getPlansAction({ isActive: true }, { limit: 6 }),
        ]);

        const newData = {
          hospitals: hospitalsResult.success
            ? hospitalsResult.data?.hospitals || []
            : [],
          hmos: hmosResult.success ? hmosResult.data?.hmos || [] : [],
          plans: plansResult.success ? plansResult.data?.plans || [] : [],
        };

        setData(newData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data function with optimistic updates
  const refreshData = () => {
    startTransition(async () => {
      try {
        const [hospitalsResult, hmosResult, plansResult] = await Promise.all([
          getHospitalsAction({}, { limit: 6 }),
          getHmosAction({}, { limit: 6 }),
          getPlansAction({ isActive: true }, { limit: 6 }),
        ]);

        const newData = {
          hospitals: hospitalsResult.success
            ? hospitalsResult.data?.hospitals || []
            : [],
          hmos: hmosResult.success ? hmosResult.data?.hmos || [] : [],
          plans: plansResult.success ? plansResult.data?.plans || [] : [],
        };

        setData(newData);
      } catch (error) {
        console.error("Failed to refresh dashboard data:", error);
      }
    });
  };

  // Optimistic add functions (for future use when forms are implemented)
  const handleAddHospital = () => {
    // For now just log, but this would show a modal/form
    console.log("Add new hospital");
    // Example of optimistic update:
    // updateOptimisticData({
    //   hospitals: [...optimisticData.hospitals, newHospital]
    // });
  };

  const handleAddHmo = () => {
    console.log("Add new HMO");
  };

  const handleAddPlan = () => {
    console.log("Add new plan");
  };

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <HospitalCard
          hospitals={optimisticData.hospitals}
          onAddNew={handleAddHospital}
          isLoading={isPending}
        />

        <HmoCard
          hmos={optimisticData.hmos}
          onAddNew={handleAddHmo}
          isLoading={isPending}
        />

        <PlanCard
          plans={optimisticData.plans}
          onAddNew={handleAddPlan}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}

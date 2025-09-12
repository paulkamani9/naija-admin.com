"use client";

import { useTransition, useOptimistic, useEffect, useState } from "react";
import { getHospitalsAction, getHmosAction, getPlansAction } from "@/actions";
import { HospitalCard } from "./HospitalCard";
import { HmoCard } from "./HmoCard";
import { PlanCard } from "./PlanCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AddHospitalDialog } from "@/components/forms/AddHospitalDialog";
import { useOptimisticUpdates } from "@/hooks/use-optimistic-updates";
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

  // Use optimistic updates for hospitals
  const {
    data: optimisticHospitals,
    addOptimistic: addOptimisticHospital,
    setData: setHospitalsData,
  } = useOptimisticUpdates({
    initialData: data.hospitals,
    onError: (error) =>
      console.error("Hospital optimistic update error:", error),
  });

  // Update optimistic hospitals when data changes
  useEffect(() => {
    // Only sync when the references differ to avoid update loops
    if (optimisticHospitals !== data.hospitals) {
      setHospitalsData(data.hospitals);
    }
  }, [data.hospitals, optimisticHospitals, setHospitalsData]);

  // Use optimistic updates for smooth user experience
  const [optimisticData] = useOptimistic(
    { ...data, hospitals: optimisticHospitals },
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

  // Handle adding new hospital with optimistic updates
  const handleAddHospital = async (hospitalData: Hospital) => {
    // Create a temporary ID for optimistic update
    const optimisticHospital: Hospital = {
      id: `temp-${Date.now()}`,
      name: hospitalData.name,
      address: hospitalData.address || null,
      phone: hospitalData.phone || null,
      email: hospitalData.email || null,
      state: hospitalData.state || null,
      localGovernment: hospitalData.localGovernment || null,
      adminId: "current-user", // This would be replaced with actual admin ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addOptimisticHospital(optimisticHospital, async () => {
      // The actual server action call happens in the form
      // We just need to refresh the data here
      const result = await getHospitalsAction({}, { limit: 6 });
      if (result.success && result.data?.hospitals) {
        setData((prev) => ({
          ...prev,
          hospitals: result.data!.hospitals,
        }));
        return { success: true, data: hospitalData };
      }
      return {
        success: false,
        errors: [{ message: "Failed to refresh data" }],
      };
    });
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
          onAddNew={() => {}}
          isLoading={isPending}
          customAddButton={<AddHospitalDialog onSuccess={handleAddHospital} />}
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

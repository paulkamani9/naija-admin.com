"use client";

import { useTransition, useOptimistic, useEffect, useState } from "react";
import { getHospitalsAction, getHmosAction, getPlansAction } from "@/actions";
import { HospitalCard } from "./HospitalCard";
import { HmoCard } from "./HmoCard";
import { PlanCard } from "./PlanCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { AddHospitalDialog } from "@/components/forms/AddHospitalDialog";
import { AddHmoDialog } from "@/components/forms/AddHmoDialog";
import { AddPlanDialog } from "@/components/forms/AddPlanDialog";
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

  // Use optimistic updates for HMOs
  const {
    data: optimisticHmos,
    addOptimistic: addOptimisticHmo,
    setData: setHmosData,
  } = useOptimisticUpdates({
    initialData: data.hmos,
    onError: (error) => console.error("HMO optimistic update error:", error),
  });

  // Use optimistic updates for Plans
  const {
    data: optimisticPlans,
    addOptimistic: addOptimisticPlan,
    setData: setPlansData,
  } = useOptimisticUpdates({
    initialData: data.plans,
    onError: (error) => console.error("Plan optimistic update error:", error),
  });

  // Update optimistic hospitals when data changes
  useEffect(() => {
    // Only sync when the references differ to avoid update loops
    if (optimisticHospitals !== data.hospitals) {
      setHospitalsData(data.hospitals);
    }
  }, [data.hospitals, optimisticHospitals, setHospitalsData]);

  // Update optimistic HMOs when data changes
  useEffect(() => {
    if (optimisticHmos !== data.hmos) {
      setHmosData(data.hmos);
    }
  }, [data.hmos, optimisticHmos, setHmosData]);

  // Update optimistic Plans when data changes
  useEffect(() => {
    if (optimisticPlans !== data.plans) {
      setPlansData(data.plans);
    }
  }, [data.plans, optimisticPlans, setPlansData]);

  // Use optimistic updates for smooth user experience
  const [optimisticData] = useOptimistic(
    { ...data, hospitals: optimisticHospitals, hmos: optimisticHmos, plans: optimisticPlans },
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

  const handleAddHmo = async (hmoData: Hmo) => {
    const optimistic: Hmo = {
      id: `temp-${Date.now()}`,
      name: hmoData.name,
      code: hmoData.code || null,
      logoUrl: hmoData.logoUrl || null,
      hospitalId: hmoData.hospitalId || null,
      createdBy: "current-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Hmo;

    await addOptimisticHmo(optimistic, async () => {
      const result = await getHmosAction({}, { limit: 6 });
      if (result.success && result.data?.hmos) {
        setData((prev) => ({ ...prev, hmos: result.data!.hmos }));
        return { success: true, data: hmoData } as {
          success: boolean;
          data: Hmo;
          errors?: Array<{ field?: string; message: string }>;
        };
      }
      return {
        success: false,
        errors: [{ message: "Failed to refresh data" }],
      } as {
        success: boolean;
        data?: Hmo;
        errors?: Array<{ field?: string; message: string }>;
      };
    });
  };

  const handleAddPlan = async (planData: InsurancePlan) => {
    const optimistic = {
      id: `temp-${Date.now()}`,
      name: planData.name,
      hmoId: planData.hmoId,
      hospitalId: planData.hospitalId,
      planType: planData.planType,
      durationYears: planData.durationYears,
      monthlyCostCents: planData.monthlyCostCents || 0,
      yearlyCostCents: planData.yearlyCostCents || 0,
      deductibleCents: planData.deductibleCents || 0,
      annualOutOfPocketLimitCents: planData.annualOutOfPocketLimitCents || 0,
      annualMaxBenefitCents: planData.annualMaxBenefitCents || 0,
      description: planData.description || null,
      isActive: planData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as InsurancePlan;

    await addOptimisticPlan(optimistic, async () => {
      const result = await getPlansAction({ isActive: true }, { limit: 6 });
      if (result.success && result.data?.plans) {
        setData((prev) => ({ ...prev, plans: result.data!.plans }));
        return { success: true, data: planData } as {
          success: boolean;
          data: InsurancePlan;
          errors?: Array<{ field?: string; message: string }>;
        };
      }
      return {
        success: false,
        errors: [{ message: "Failed to refresh data" }],
      } as {
        success: boolean;
        errors?: Array<{ field?: string; message: string }>;
      };
    });
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
          isLoading={isPending}
          customAddButton={
            <AddHmoDialog
              onSuccess={handleAddHmo}
              hospitals={optimisticData.hospitals}
            />
          }
        />

        <PlanCard
          plans={optimisticData.plans}
          isLoading={isPending}
          customAddButton={
            <AddPlanDialog
              onSuccess={handleAddPlan}
              hospitals={optimisticData.hospitals}
              hmos={optimisticData.hmos}
            />
          }
        />
      </div>
    </div>
  );
}

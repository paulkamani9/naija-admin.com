"use client";

import { useState, useEffect } from "react";
import { getHospitalsAction, getHmosAction, getPlansAction } from "@/server";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { HospitalCard } from "./HospitalCard";
import { HmoCard } from "./HmoCard";
import { PlanCard } from "./PlanCard";
import type { Hospital, Hmo, InsurancePlan } from "@/db/types";

export function DashboardServerContent() {
  const [data, setData] = useState<{
    hospitals: Hospital[];
    hmos: Hmo[];
    plans: InsurancePlan[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data in parallel for better performance
        const [hospitalsResult, hmosResult, plansResult] = await Promise.all([
          getHospitalsAction({}, { limit: 6 }),
          getHmosAction({}, { limit: 6 }),
          getPlansAction({ isActive: true }, { limit: 6 }),
        ]);

        const hospitals = hospitalsResult.success
          ? hospitalsResult.data?.hospitals || []
          : [];
        const hmos = hmosResult.success ? hmosResult.data?.hmos || [] : [];
        const plans = plansResult.success ? plansResult.data?.plans || [] : [];

        setData({ hospitals, hmos, plans });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <HospitalCard
        hospitals={data.hospitals}
        onAddNew={() => {
          // TODO: Implement add new hospital modal/form
          console.log("Add new hospital");
        }}
      />

      <HmoCard
        hmos={data.hmos}
        onAddNew={() => {
          // TODO: Implement add new HMO modal/form
          console.log("Add new HMO");
        }}
      />

      <PlanCard
        plans={data.plans}
        onAddNew={() => {
          // TODO: Implement add new plan modal/form
          console.log("Add new plan");
        }}
      />
    </div>
  );
}

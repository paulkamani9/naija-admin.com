"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  SearchIcon,
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  DollarSignIcon,
} from "lucide-react";
import {
  getPlansAction,
  deletePlanAction,
  togglePlanActiveAction,
} from "@/server";
import { formatCurrency } from "@/lib/currency";
import type {
  InsurancePlan,
  PlanWithRelations,
  ServerActionResult,
} from "@/db/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AddPlanDialog } from "@/components/forms/AddPlanDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PlanWithDetails extends InsurancePlan {
  hmo?: {
    id: string;
    name: string;
    code?: string;
    logoUrl?: string;
  };
  hospital?: {
    id: string;
    name: string;
    state?: string;
  };
}

const planTypeLabels = {
  family: "Family",
  individual: "Individual",
  enterprise: "Enterprise",
};

const planTypeColors = {
  family: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  individual: "bg-green-500/10 text-green-600 border-green-500/20",
  enterprise: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export const PlansView = () => {
  const [plans, setPlans] = useState<PlanWithDetails[]>([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [planTypeFilter, setPlanTypeFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanWithDetails | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanWithDetails | null>(
    null
  );
  const itemsPerPage = 9;

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};

      if (planTypeFilter) {
        filters.planType = planTypeFilter as
          | "family"
          | "individual"
          | "enterprise";
      }

      if (!showInactive) {
        filters.isActive = true;
      }

      const result = await getPlansAction(filters, {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      });

      if (result.success && result.data) {
        // For each plan, get the detailed information
        const detailedPlans = await Promise.all(
          result.data.plans.map(async (plan) => {
            try {
              const planDetails = await getPlanAction(plan.id);
              if (planDetails.success && planDetails.data) {
                return {
                  ...plan,
                  hmo: planDetails.data.hmo,
                  hospital: planDetails.data.hospital,
                } as PlanWithDetails;
              }
            } catch (e) {
              console.error(`Failed to fetch details for plan ${plan.id}:`, e);
            }
            return plan as PlanWithDetails;
          })
        );

        setPlans(detailedPlans);
        setTotalPlans(result.data.total);
      } else {
        console.error("Failed to load plans:", result.errors);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [currentPage, planTypeFilter, showInactive]);

  const handleAddSuccess = (newPlan: InsurancePlan) => {
    setPlans((prev) => [newPlan as PlanWithDetails, ...prev]);
    setTotalPlans((prev) => prev + 1);
  };

  const handleEditSuccess = (updatedPlan: InsurancePlan) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === updatedPlan.id ? { ...plan, ...updatedPlan } : plan
      )
    );
    setEditingPlan(null);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      const result = await deletePlanAction(planToDelete.id);
      if (result.success) {
        setPlans((prev) => prev.filter((plan) => plan.id !== planToDelete.id));
        setTotalPlans((prev) => prev - 1);
        setPlanToDelete(null);
      } else {
        console.error("Failed to delete plan:", result.errors);
        alert("Failed to delete plan. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("An error occurred while deleting the plan.");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const result = await togglePlanActiveAction(id);
      if (result.success && result.data) {
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === id ? { ...plan, isActive: result.data!.isActive } : plan
          )
        );
      } else {
        console.error("Failed to toggle plan status:", result.errors);
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
    }
  };

  const totalPages = Math.ceil(totalPlans / itemsPerPage);

  // Filter plans based on search query
  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.hmo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.hmo?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.hospital?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to simulate API calls that aren't actually implemented in this example
  const getPlanAction = async (id: string) => {
    // This would typically call the real API, but for this demo,
    // we'll just find the plan in our existing data if possible
    const existingPlan = plans.find((p) => p.id === id);
    if (existingPlan?.hmo) {
      return { success: true, data: existingPlan };
    }

    // Otherwise return a placeholder or the actual API call
    return {
      success: true,
      data: {
        ...plans.find((p) => p.id === id)!,
        hmo: { id: "placeholder", name: "HMO Name" },
        hospital: { id: "placeholder", name: "Hospital Name" },
      },
    } as ServerActionResult<PlanWithRelations>;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Insurance Plans
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage insurance plans across your healthcare network
            </p>
          </div>
          <AddPlanDialog onSuccess={handleAddSuccess} />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={planTypeFilter || "all"}
              onValueChange={(value) =>
                setPlanTypeFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Show Inactive</Label>
            </div>
          </div>
        </div>

        {/* Plans grid/list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="h-24 bg-muted/30" />
                <CardContent className="h-32 mt-2">
                  <div className="h-4 bg-muted rounded mb-2 w-2/3" />
                  <div className="h-4 bg-muted rounded mb-2 w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card className="w-full py-16 flex flex-col items-center justify-center text-center">
            <CreditCardIcon className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <CardTitle className="text-xl">No insurance plans found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
              {searchQuery || planTypeFilter || showInactive
                ? "No plans match your search criteria. Try adjusting your filters."
                : "Get started by adding your first insurance plan."}
            </CardDescription>
            {!searchQuery && !planTypeFilter && (
              <Button
                className="mt-6"
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>('[aria-label="Add Plan"]')
                    ?.click()
                }
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Insurance Plan
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${
                  !plan.isActive ? "opacity-70" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCardIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {plan.name}
                        </CardTitle>
                        {plan.hmo && (
                          <p className="text-sm text-muted-foreground">
                            {plan.hmo.name}
                            {plan.hmo.code && ` (${plan.hmo.code})`}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer"
                          onClick={() => handleToggleActive(plan.id)}
                        >
                          <Switch className="mr-2" checked={plan.isActive} />
                          {plan.isActive ? "Deactivate Plan" : "Activate Plan"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setPlanToDelete(plan)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <Badge
                      className={`text-xs px-2 py-0.5 ${
                        planTypeColors[plan.planType]
                      }`}
                      variant="outline"
                    >
                      {planTypeLabels[plan.planType]}
                    </Badge>
                    {!plan.isActive && (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground text-xs"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(plan.monthlyCostCents)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          /month
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(plan.yearlyCostCents)}/year
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>
                          {plan.durationYears}{" "}
                          {plan.durationYears === 1 ? "year" : "years"}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <DollarSignIcon className="h-3 w-3 mr-1" />
                        <span>
                          Max: {formatCurrency(plan.annualMaxBenefitCents)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-1">
                      {plan.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/20 pt-3 pb-3 px-4">
                  {plan.hospital && (
                    <p className="text-xs text-muted-foreground">
                      Hospital: {plan.hospital.name}
                      {plan.hospital.state && ` • ${plan.hospital.state}`}
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit Plan Dialog */}
      {editingPlan && (
        <AddPlanDialog
          plan={editingPlan}
          open={!!editingPlan}
          onOpenChange={(open: boolean) => !open && setEditingPlan(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insurance Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

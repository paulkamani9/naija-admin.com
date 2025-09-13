"use server";

import { auth } from "@/lib/auth";
import { PlanQueries, HmoQueries, HospitalQueries } from "@/db/queries";
import { createPlanSchema, updatePlanSchema } from "@/db/validation";
import type {
  ServerActionResult,
  InsurancePlan,
  CreatePlanInput,
  UpdatePlanInput,
  PlanWithRelations,
} from "@/db/types";
import { headers } from "next/headers";

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Helper function to check if user has permission to manage a plan
 * User can manage if they created the HMO or are the hospital admin
 */
async function canManagePlan(
  userId: string,
  hmoId: string,
  hospitalId: string
): Promise<boolean> {
  // Check if user created the HMO
  const hmo = await HmoQueries.findById(hmoId);
  if (hmo?.createdBy === userId) {
    return true;
  }

  // Check if user is the hospital admin
  const hospital = await HospitalQueries.findById(hospitalId);
  if (hospital?.adminId === userId) {
    return true;
  }

  return false;
}

/**
 * Create a new insurance plan
 */
export async function createPlanAction(
  input: CreatePlanInput
): Promise<ServerActionResult<InsurancePlan>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Validate input
    const validatedInput = createPlanSchema.parse(input);

    // Check if user has permission to create plan for this HMO/Hospital
    const hasPermission = await canManagePlan(
      user.id,
      validatedInput.hmoId,
      validatedInput.hospitalId
    );
    if (!hasPermission) {
      return {
        success: false,
        errors: [
          {
            message:
              "You don't have permission to create plans for this HMO/Hospital combination",
          },
        ],
      };
    }

    // Create insurance plan
    const plan = await PlanQueries.create(validatedInput);

    return {
      success: true,
      data: plan,
    };
  } catch (error: any) {
    console.error("Create insurance plan error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [
          { message: "You must be logged in to create insurance plans" },
        ],
      };
    }

    // Handle database errors (foreign key constraints)
    if (error.code === "23503") {
      return {
        success: false,
        errors: [{ message: "Invalid HMO or Hospital ID provided" }],
      };
    }

    return {
      success: false,
      errors: [
        { message: "Failed to create insurance plan. Please try again." },
      ],
    };
  }
}

/**
 * Get insurance plan by ID with relations
 */
export async function getPlanAction(
  id: string
): Promise<ServerActionResult<PlanWithRelations>> {
  try {
    // Validate authentication
    await getCurrentUser();

    const plan = await PlanQueries.findByIdWithRelations(id);

    if (!plan) {
      return {
        success: false,
        errors: [{ message: "Insurance plan not found" }],
      };
    }

    return {
      success: true,
      data: plan,
    };
  } catch (error: any) {
    console.error("Get insurance plan error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [
          { message: "You must be logged in to view insurance plan details" },
        ],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch insurance plan details" }],
    };
  }
}

/**
 * Get insurance plans list with filtering and pagination
 */
export async function getPlansAction(
  filters: {
    hmoId?: string;
    hospitalId?: string;
    planType?: "family" | "individual" | "enterprise";
    isActive?: boolean;
  } = {},
  pagination: { limit?: number; offset?: number } = {}
): Promise<ServerActionResult<{ plans: InsurancePlan[]; total: number }>> {
  try {
    // Validate authentication
    await getCurrentUser();

    const { data: plans, total } = await PlanQueries.findMany(filters, {
      limit: pagination.limit || 10,
      offset: pagination.offset || 0,
    });

    return {
      success: true,
      data: { plans, total },
    };
  } catch (error: any) {
    console.error("Get insurance plans error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view insurance plans" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch insurance plans" }],
    };
  }
}

/**
 * Update an insurance plan
 * Only users who can manage the HMO/Hospital can update
 */
export async function updatePlanAction(
  id: string,
  input: UpdatePlanInput
): Promise<ServerActionResult<InsurancePlan>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if plan exists
    const existingPlan = await PlanQueries.findById(id);
    if (!existingPlan) {
      return {
        success: false,
        errors: [{ message: "Insurance plan not found" }],
      };
    }

    // Check permissions
    const hasPermission = await canManagePlan(
      user.id,
      existingPlan.hmoId,
      existingPlan.hospitalId
    );
    if (!hasPermission) {
      return {
        success: false,
        errors: [
          {
            message: "You don't have permission to update this insurance plan",
          },
        ],
      };
    }

    // Validate input
    const validatedInput = updatePlanSchema.parse(input);

    // Update plan
    const updatedPlan = await PlanQueries.update(id, validatedInput);

    if (!updatedPlan) {
      return {
        success: false,
        errors: [{ message: "Failed to update insurance plan" }],
      };
    }

    return {
      success: true,
      data: updatedPlan,
    };
  } catch (error: any) {
    console.error("Update insurance plan error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [
          { message: "You must be logged in to update insurance plans" },
        ],
      };
    }

    return {
      success: false,
      errors: [
        { message: "Failed to update insurance plan. Please try again." },
      ],
    };
  }
}

/**
 * Delete an insurance plan
 * Only users who can manage the HMO/Hospital can delete
 */
export async function deletePlanAction(
  id: string
): Promise<ServerActionResult<void>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if plan exists
    const existingPlan = await PlanQueries.findById(id);
    if (!existingPlan) {
      return {
        success: false,
        errors: [{ message: "Insurance plan not found" }],
      };
    }

    // Check permissions
    const hasPermission = await canManagePlan(
      user.id,
      existingPlan.hmoId,
      existingPlan.hospitalId
    );
    if (!hasPermission) {
      return {
        success: false,
        errors: [
          {
            message: "You don't have permission to delete this insurance plan",
          },
        ],
      };
    }

    // Delete plan
    const success = await PlanQueries.delete(id);

    if (!success) {
      return {
        success: false,
        errors: [{ message: "Failed to delete insurance plan" }],
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete insurance plan error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [
          { message: "You must be logged in to delete insurance plans" },
        ],
      };
    }

    return {
      success: false,
      errors: [
        { message: "Failed to delete insurance plan. Please try again." },
      ],
    };
  }
}

/**
 * Toggle active status of an insurance plan
 */
export async function togglePlanActiveAction(
  id: string
): Promise<ServerActionResult<InsurancePlan>> {
  try {
    // Validate authentication
    const user = await getCurrentUser();

    // Check if plan exists
    const existingPlan = await PlanQueries.findById(id);
    if (!existingPlan) {
      return {
        success: false,
        errors: [{ message: "Insurance plan not found" }],
      };
    }

    // Check permissions
    const hasPermission = await canManagePlan(
      user.id,
      existingPlan.hmoId,
      existingPlan.hospitalId
    );
    if (!hasPermission) {
      return {
        success: false,
        errors: [
          {
            message: "You don't have permission to modify this insurance plan",
          },
        ],
      };
    }

    // Toggle active status
    const updatedPlan = await PlanQueries.toggleActive(id);

    if (!updatedPlan) {
      return {
        success: false,
        errors: [{ message: "Failed to update plan status" }],
      };
    }

    return {
      success: true,
      data: updatedPlan,
    };
  } catch (error: any) {
    console.error("Toggle plan active error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [
          { message: "You must be logged in to modify insurance plans" },
        ],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to update plan status. Please try again." }],
    };
  }
}

/**
 * Get plans by HMO
 */
export async function getPlansByHmoAction(
  hmoId: string
): Promise<ServerActionResult<InsurancePlan[]>> {
  try {
    await getCurrentUser();

    const plans = await PlanQueries.findByHmo(hmoId);

    return {
      success: true,
      data: plans,
    };
  } catch (error: any) {
    console.error("Get plans by HMO error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view insurance plans" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch insurance plans" }],
    };
  }
}

/**
 * Get plans by Hospital
 */
export async function getPlansByHospitalAction(
  hospitalId: string
): Promise<ServerActionResult<InsurancePlan[]>> {
  try {
    await getCurrentUser();

    const plans = await PlanQueries.findByHospital(hospitalId);

    return {
      success: true,
      data: plans,
    };
  } catch (error: any) {
    console.error("Get plans by hospital error:", error);

    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: [{ message: "You must be logged in to view insurance plans" }],
      };
    }

    return {
      success: false,
      errors: [{ message: "Failed to fetch insurance plans" }],
    };
  }
}
